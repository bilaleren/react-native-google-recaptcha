import * as React from 'react'
import {
  View,
  Modal,
  StyleSheet,
  ModalProps,
  ActivityIndicator
} from 'react-native'
import WebView, {
  WebViewProps,
  WebViewMessageEvent
} from 'react-native-webview'
import getRecaptchaTemplate from './getRecaptchaTemplate'
import type { GoogleRecaptchaToken, GoogleRecaptchaBaseProps } from './types'
import type { OnShouldStartLoadWithRequest } from 'react-native-webview/lib/WebViewTypes'

const ORIGIN_WHITELIST = ['*']

const BASE_URL_PATTERN =
  /^http(s)?:\/\/(\w+:?\w*)?(\S+)(:\d+)?(\/|\/([\w#!:.?+=&%\-\/]))?$/

export interface GoogleRecaptchaRefAttributes {
  /**
   * Open modal.
   */
  open(): void

  /**
   * Close modal.
   */
  close(): void

  /**
   * Receive the reCaptcha response async.
   * @see GoogleRecaptchaProps.onVerify
   */
  getToken(): Promise<GoogleRecaptchaToken>
}

interface GoogleRecaptchaPostMessageData {
  load?: undefined
  close?: undefined
  error?: [unknown]
  expire?: undefined
  verify?: [string | null]
}

export interface GoogleRecaptchaProps extends GoogleRecaptchaBaseProps {
  /**
   * The URL (domain) configured in the reCAPTCHA setup.
   * @example http(s)://domain.com
   */
  baseUrl: string

  /**
   * A callback function, executed when the reCAPTCHA is ready to use.
   */
  onLoad?(): void

  /**
   * A callback function, executed when the user submits a successful response. The reCAPTCHA response token is passed to your callback.
   * @see GoogleRecaptchaRefAttributes.getToken
   */
  onVerify?(token: GoogleRecaptchaToken): void

  /**
   * A callback function, executed when reCAPTCHA encounters an error (usually network connectivity) and cannot continue until connectivity is restored. If you specify a function here, you are responsible for informing the user that they should retry.
   */
  onError?(error: unknown): void

  /**
   * A callback function, executed when the Modal is closed.
   */
  onClose?(): void

  /**
   * A callback function, executed when the reCAPTCHA response expires and the user needs to re-verify. Only works if the webview still open after onVerify has been called for a long time.
   */
  onExpire?(): void

  /**
   * Close the Modal when it expires.
   * @default false
   * @see GoogleRecaptchaProps.onExpire
   */
  closeOnExpire?: boolean

  /**
   * Override the Modal props.
   */
  modalProps?: Partial<Omit<ModalProps, 'visible' | 'onRequestClose'>>

  /**
   * 	Override the WebView props.
   */
  webViewProps?: Partial<
    Omit<
      WebViewProps,
      | 'source'
      | 'onMessage'
      | 'onNavigationStateChange'
      | 'onShouldStartLoadWithRequest'
    >
  >

  /**
   * A component to render on top of Modal.
   */
  headerComponent?: React.ReactNode

  /**
   * A component to render on bottom of Modal.
   */
  footerComponent?: React.ReactNode

  /**
   * A custom loading component.
   */
  loadingComponent?: React.ReactNode
}

const GoogleRecaptcha = React.forwardRef<
  GoogleRecaptchaRefAttributes,
  GoogleRecaptchaProps
>((props, ref) => {
  const {
    theme,
    size,
    lang,
    action,
    baseUrl,
    siteKey,
    onLoad,
    onClose,
    onError,
    onVerify,
    onExpire,
    hideBadge,
    enterprise,
    modalProps,
    webViewProps = {},
    gstaticDomain,
    headerComponent,
    recaptchaDomain,
    footerComponent,
    loadingComponent,
    closeOnExpire = false
  } = props
  const webViewRef = React.useRef<WebView>(null)
  const isClosedRef = React.useRef<boolean>(true)
  const [visible, setVisible] = React.useState(false)
  const [loading, setLoading] = React.useState(true)
  const tokenRef = React.useRef<{
    resolve: (
      value: GoogleRecaptchaToken | PromiseLike<GoogleRecaptchaToken>
    ) => void
    reject: (reason?: any) => void
  } | null>()

  const invisible = size === 'invisible'
  const { style: webViewStyle, ...webViewOtherProps } = webViewProps

  if (!BASE_URL_PATTERN.test(baseUrl)) {
    throw new Error('Invalid baseUrl value. baseUrl must be url.')
  }

  const html = React.useMemo(() => {
    return getRecaptchaTemplate({
      siteKey,
      size,
      theme,
      lang,
      action,
      hideBadge,
      enterprise,
      gstaticDomain,
      recaptchaDomain
    })
  }, [
    size,
    theme,
    lang,
    action,
    siteKey,
    hideBadge,
    enterprise,
    gstaticDomain,
    recaptchaDomain
  ])

  React.useEffect(() => {
    return () => {
      tokenRef.current = null
    }
  }, [])

  const openModal = React.useCallback(() => {
    setVisible(true)
    setLoading(true)
    isClosedRef.current = false
  }, [])

  const closeModal = React.useCallback(() => {
    if (isClosedRef.current) {
      return
    }

    isClosedRef.current = true
    setVisible(false)
    onClose?.()
  }, [onClose])

  React.useImperativeHandle(
    ref,
    () => ({
      open: openModal,
      close: closeModal,
      getToken(): Promise<GoogleRecaptchaToken> {
        openModal()
        return new Promise<GoogleRecaptchaToken>((resolve, reject) => {
          tokenRef.current = { resolve, reject }
        })
      }
    }),
    [openModal, closeModal]
  )

  const handleLoad = React.useCallback(() => {
    onLoad?.()

    const webview = webViewRef.current

    if (webview && invisible) {
      webview.injectJavaScript('window.rnRecaptcha.execute();')
    }

    setLoading(false)
  }, [onLoad, invisible])

  const handleMessage = React.useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const payload = JSON.parse(
          event.nativeEvent.data
        ) as GoogleRecaptchaPostMessageData

        if (payload.close && invisible) {
          closeModal()
        }

        if (payload.load) {
          handleLoad()
        }

        if (payload.expire) {
          onExpire?.()

          if (closeOnExpire) {
            closeModal()
          }
        }

        if (payload.error) {
          const error = payload.error?.[0]

          onError?.(error)
          tokenRef.current?.reject?.(error)
          closeModal()
        }

        if (payload.verify) {
          const token = payload.verify?.[0] || null

          onVerify?.(token)
          tokenRef.current?.resolve?.(token)
          closeModal()
        }
      } catch (err) {
        tokenRef.current?.reject?.(err)

        if (__DEV__) {
          console.error('Recaptcha Error:', err)
        }
      }
    },
    [
      onError,
      onVerify,
      onExpire,
      invisible,
      handleLoad,
      closeModal,
      closeOnExpire
    ]
  )

  const source = React.useMemo(
    () => ({
      html,
      baseUrl
    }),
    [html, baseUrl]
  )

  const handleNavigationStateChange = React.useCallback(() => {
    const webview = webViewRef.current

    // prevent navigation on Android
    if (!loading && webview) {
      webview.stopLoading()
    }
  }, [loading])

  const handleShouldStartLoadWithRequest: OnShouldStartLoadWithRequest =
    React.useCallback((event) => {
      // prevent navigation on iOS
      return event.navigationType === 'other'
    }, [])

  const webViewStyles = React.useMemo(
    () => [styles.webView, webViewStyle],
    [webViewStyle]
  )

  return (
    <Modal
      transparent={true}
      {...modalProps}
      testID="recaptcha-modal"
      visible={visible}
      onRequestClose={closeModal}
    >
      {headerComponent}
      <WebView
        ref={webViewRef}
        bounces={false}
        originWhitelist={ORIGIN_WHITELIST}
        allowsBackForwardNavigationGestures={false}
        {...webViewOtherProps}
        source={source}
        style={webViewStyles}
        onMessage={handleMessage}
        testID="recaptcha-webview"
        onNavigationStateChange={handleNavigationStateChange}
        onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
      />
      {footerComponent}
      {loading && (
        <View style={styles.loadingContainer} testID="loading-component">
          {loadingComponent || <ActivityIndicator size="large" />}
        </View>
      )}
    </Modal>
  )
})

const styles = StyleSheet.create({
  webView: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center'
  }
})

export default GoogleRecaptcha

import * as React from 'react'
import {
  View,
  Modal,
  ModalProps,
  StyleSheet,
  ActivityIndicator
} from 'react-native'
import WebView, {
  WebViewProps,
  WebViewMessageEvent
} from 'react-native-webview'
import useLatestCallback from 'use-latest-callback'
import { GoogleRecaptchaSize } from './constants'
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

interface GoogleRecaptchaPostMessagePayload {
  load?: unknown
  close?: unknown
  error?: [unknown]
  expire?: unknown
  verify?: [GoogleRecaptchaToken]
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

  const invisible = size === GoogleRecaptchaSize.INVISIBLE
  const { style: webViewStyle, ...webViewOtherProps } = webViewProps

  if (!BASE_URL_PATTERN.test(baseUrl)) {
    throw new TypeError('Invalid baseUrl value. baseUrl must be url.')
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

  const openModal = useLatestCallback(() => {
    setVisible(true)
    setLoading(true)
    isClosedRef.current = false
  })

  const closeModal = useLatestCallback(() => {
    if (isClosedRef.current) {
      return
    }

    isClosedRef.current = true
    setVisible(false)
    onClose?.()
  })

  const getToken = useLatestCallback((): Promise<GoogleRecaptchaToken> => {
    openModal()
    return new Promise<GoogleRecaptchaToken>((resolve, reject) => {
      tokenRef.current = { resolve, reject }
    })
  })

  React.useImperativeHandle(
    ref,
    () => ({
      open: openModal,
      close: closeModal,
      getToken: getToken
    }),
    [openModal, closeModal, getToken]
  )

  const handleLoad = useLatestCallback(() => {
    const webview = webViewRef.current

    onLoad?.()

    if (webview && invisible) {
      webview.injectJavaScript('window.rnRecaptcha.execute();')
    }

    setLoading(false)
  })

  const handleMessage = useLatestCallback((event: WebViewMessageEvent) => {
    try {
      const payload = JSON.parse(
        event.nativeEvent.data
      ) as GoogleRecaptchaPostMessagePayload

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
        const token = payload.verify?.[0]

        onVerify?.(token)
        tokenRef.current?.resolve?.(token)
        closeModal()
      }
    } catch (err) {
      onError?.(err)
      tokenRef.current?.reject?.(err)
    }
  })

  const source = React.useMemo(
    () => ({
      html,
      baseUrl
    }),
    [html, baseUrl]
  )

  const handleNavigationStateChange = useLatestCallback(() => {
    const webview = webViewRef.current

    // prevent navigation on Android
    if (!loading && webview) {
      webview.stopLoading()
    }
  })

  const handleShouldStartLoadWithRequest: OnShouldStartLoadWithRequest =
    useLatestCallback((event) => {
      // prevent navigation on iOS
      return event.navigationType === 'other'
    })

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

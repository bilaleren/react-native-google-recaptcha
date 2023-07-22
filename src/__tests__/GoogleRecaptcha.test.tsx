import React from 'react'
import GoogleRecaptcha, {
  GoogleRecaptchaProps,
  GoogleRecaptchaRefAttributes
} from '../GoogleRecaptcha'
import { Text, View, ViewStyle, StyleSheet } from 'react-native'
import getRecaptchaTemplate from '../getRecaptchaTemplate'
import type { ReactTestInstance } from 'react-test-renderer'
import { render, waitFor, fireEvent } from '@testing-library/react-native'
import {
  TEST_SITE_KEY,
  VISIBLE_SIZES,
  INVISIBLE_SIZES,
  VALID_BASE_URLS,
  RECAPTCHA_SIZES,
  INVALID_DOMAINS,
  VALID_LANG_CODES,
  RECAPTCHA_THEMES,
  INVALID_SITE_KEYS,
  RECAPTCHA_ACTIONS,
  INVALID_LANG_CODES,
  BADGE_HIDDEN_STYLE,
  ENTERPRISE_MATCHERS,
  CUSTOM_GSTATIC_DOMAIN,
  CUSTOM_RECAPTCHA_DOMAIN
} from './test.constants'

const createNativeEvent = (data: any) => ({
  nativeEvent: {
    data: JSON.stringify(data)
  }
})

interface RecaptchaRendererOptions extends GoogleRecaptchaProps {
  autoOpen?: boolean
}

type RecaptchaRendererResult = ReturnType<typeof render> & {
  ref: React.RefObject<GoogleRecaptchaRefAttributes>
  modal: ReactTestInstance
  webview: ReactTestInstance | undefined
  expectModalVisible(): void
  expectModalInVisible(): void
}

async function createRecaptchaRenderer(
  options?: Partial<RecaptchaRendererOptions>
): Promise<RecaptchaRendererResult> {
  let webview: ReactTestInstance | undefined
  const { autoOpen = true, ...otherOptions } = options || {}

  const ref = React.createRef<GoogleRecaptchaRefAttributes>()

  const { findByTestId, ...otherRenderResult } = render(
    <GoogleRecaptcha
      ref={ref}
      siteKey={TEST_SITE_KEY}
      baseUrl="http://localhost:3000"
      {...otherOptions}
    />
  )

  await waitFor(() => {
    expect(ref.current).toBeTruthy()
  })

  const modal = await findByTestId('recaptcha-modal')

  const expectModalVisible = () => {
    expect(modal.props).toHaveProperty('visible', true)
  }

  const expectModalInVisible = () => {
    expect(modal.props).toHaveProperty('visible', false)
  }

  if (autoOpen) {
    expectModalInVisible()

    await waitFor(() => {
      ref.current?.open()
    })

    expectModalVisible()

    webview = await findByTestId('recaptcha-webview')
  }

  return {
    ...otherRenderResult,
    ref,
    modal,
    webview,
    findByTestId,
    expectModalVisible,
    expectModalInVisible
  }
}

describe('<GoogleRecaptcha />', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  describe('prop: ref', () => {
    it('should be able to access open function', async () => {
      const { ref } = await createRecaptchaRenderer({
        autoOpen: false
      })

      expect(typeof ref.current?.open).toBe('function')
    })

    describe('prop: ref.close', () => {
      it('should be able to access close function', async () => {
        const { ref } = await createRecaptchaRenderer({
          autoOpen: false
        })

        expect(typeof ref.current?.close).toBe('function')
      })

      it('must be close manually', async () => {
        const handleClose = jest.fn()
        const { ref, expectModalVisible, expectModalInVisible } =
          await createRecaptchaRenderer({
            onClose: handleClose
          })

        expectModalVisible()
        expect(handleClose).not.toBeCalled()

        await waitFor(() => {
          ref.current?.close()
        })

        expectModalInVisible()
        expect(handleClose).toBeCalledTimes(1)
      })
    })

    describe('prop: ref.getToken', () => {
      it('the response should be receive with the async getToken function', async () => {
        const handleToken = jest.fn()
        const handleTokenError = jest.fn()

        const { ref, findByTestId } = await createRecaptchaRenderer({
          autoOpen: false
        })

        await waitFor(() => {
          expect(ref.current?.getToken()).toBeInstanceOf(Promise)

          ref.current?.getToken().then(handleToken).catch(handleTokenError)
        })

        const webview = await findByTestId('recaptcha-webview')

        await waitFor(() => {
          fireEvent(
            webview,
            'message',
            createNativeEvent({
              verify: ['recaptcha-token']
            })
          )
        })

        expect(handleToken).toBeCalledTimes(1)
        expect(handleToken).toBeCalledWith('recaptcha-token')
        expect(handleTokenError).not.toBeCalled()
      })

      it('the error(s) that occurred during the response must be caught', async () => {
        const handleToken = jest.fn()
        const handleTokenError = jest.fn()

        const { ref, findByTestId } = await createRecaptchaRenderer({
          autoOpen: false
        })

        await waitFor(() => {
          expect(ref.current?.getToken()).toBeInstanceOf(Promise)

          ref.current?.getToken().then(handleToken).catch(handleTokenError)
        })

        const webview = await findByTestId('recaptcha-webview')

        await waitFor(() => {
          fireEvent(
            webview,
            'message',
            createNativeEvent({
              error: ['Recaptcha error']
            })
          )
        })

        expect(handleToken).not.toBeCalled()
        expect(handleTokenError).toBeCalledTimes(1)
        expect(handleTokenError).toBeCalledWith('Recaptcha error')
      })
    })
  })

  describe('prop: lang', () => {
    it('the default lang should be "en"', async () => {
      const { webview } = await createRecaptchaRenderer()
      const html = webview?.props?.source?.html

      expect(html).toBeTruthy()
      expect(html).toContain('.js?hl=en')
      expect(html).toContain('<html lang="en">')
    })
    
    it.each(VALID_LANG_CODES)('lang="%s" must be valid', async (lang: string) => {
      const { webview } = await createRecaptchaRenderer({ lang })
      const html = webview?.props?.source?.html
      const htmlLang = lang.split('-')[0]

      expect(html).toBeTruthy()
      expect(html).toContain(`.js?hl=${lang}`)
      expect(html).toContain(`<html lang="${htmlLang}">`)
    })

    it.each(INVALID_LANG_CODES)('lang="%s" should cause an error', async (lang: string) => {
      const renderer = async () => {
        await createRecaptchaRenderer({ lang })
      }

      await expect(renderer()).rejects.toThrow('Invalid lang value')
    })
  })

  describe('prop: size', () => {
    it('the default size should be "normal"', async () => {
      const { webview } = await createRecaptchaRenderer()
      const html = webview?.props?.source?.html

      expect(html).toBeTruthy()
      expect(html).toContain("const size = 'normal'")
    })

    it.each(RECAPTCHA_SIZES)('size should be replaced with "%s"', async (size) => {
      const { webview } = await createRecaptchaRenderer({ size })
      const html = webview?.props?.source?.html

      expect(html).toBeTruthy()
      expect(html).toContain(`const size = '${size}'`)
    })
  })

  describe('prop: theme', () => {
    it('the default theme should be "light"', async () => {
      const { webview } = await createRecaptchaRenderer()
      const html = webview?.props?.source?.html

      expect(html).toBeTruthy()
      expect(html).toContain("const theme = 'light'")
    })
    
    it.each(RECAPTCHA_THEMES)('theme should be replaced with "%s"', async (theme) => {
      const { webview } = await createRecaptchaRenderer({ theme })
      const html = webview?.props?.source?.html

      expect(html).toBeTruthy()
      expect(html).toContain(`const theme = '${theme}'`)
    })
  })

  describe('prop: action', () => {
    it('the default action must be empty', async () => {
      const { webview } = await createRecaptchaRenderer()
      const html = webview?.props?.source?.html

      expect(html).toBeTruthy()
      expect(html).toContain("const action = ''")
    })
    
    it.each(RECAPTCHA_ACTIONS)('action should be replaced with "%s"', async (action: string) => {
      const { webview } = await createRecaptchaRenderer({ action })
      const html = webview?.props?.source?.html

      expect(html).toBeTruthy()
      expect(html).toContain(`const action = '${action}'`)
    })
  })

  describe('prop: hideBadge', () => {
    it('the badge must be visible', async () => {
      const { webview } = await createRecaptchaRenderer()
      const html = webview?.props?.source?.html

      expect(html).toBeTruthy()
      expect(html).not.toContain(BADGE_HIDDEN_STYLE)
    })

    it('the badge must be invisible', async () => {
      const { webview } = await createRecaptchaRenderer({
        hideBadge: true
      })
      const html = webview?.props?.source?.html

      expect(html).toBeTruthy()
      expect(html).toContain(BADGE_HIDDEN_STYLE)
    })
  })

  describe('prop: enterprise', () => {
    it('enterprise qualifications should not be applied', async () => {
      const { webview } = await createRecaptchaRenderer()
      const html = webview?.props?.source?.html

      expect(html).toBeTruthy()
      expect(html).toContain('recaptcha/api.js')

      ENTERPRISE_MATCHERS.forEach((value) => {
        expect(html).not.toContain(value)
      })
    })

    it('enterprise qualifications should be applied', async () => {
      const { webview } = await createRecaptchaRenderer({
        enterprise: true
      })
      const html = webview?.props?.source?.html

      expect(html).toBeTruthy()
      expect(html).not.toContain('recaptcha/api.js')

      ENTERPRISE_MATCHERS.forEach((value) => {
        expect(html).toContain(value)
      })
    })
  })

  describe('prop: gstaticDomain', () => {
    it('the default gstaticDomain must be "www.gstatic.com"', async () => {
      const { webview } = await createRecaptchaRenderer()
      const html = webview?.props?.source?.html

      expect(html).toBeTruthy()
      expect(html).toContain('https://www.gstatic.com')
    })

    it(`gstaticDomain should be replaced with "${CUSTOM_GSTATIC_DOMAIN}"`, async () => {
      const { webview } = await createRecaptchaRenderer({
        gstaticDomain: CUSTOM_GSTATIC_DOMAIN
      })
      const html = webview?.props?.source?.html

      expect(html).toBeTruthy()
      expect(html).toContain(`https://${CUSTOM_GSTATIC_DOMAIN}`)
    })
    
    it.each(INVALID_DOMAINS)('gstaticDomain="%s" should cause an error', async (domain) => {
      const renderer = async () => {
        await createRecaptchaRenderer({ gstaticDomain: domain })
      }

      await expect(renderer()).rejects.toThrow('Invalid gstaticDomain value')
    })
  })

  describe('prop: recaptchaDomain', () => {
    it('the default recaptchaDomain must be "www.google.com"', async () => {
      const { webview } = await createRecaptchaRenderer()
      const html = webview?.props?.source?.html

      expect(html).toBeTruthy()
      expect(html).toContain('https://www.google.com/recaptcha')
    })

    it(`recaptchaDomain should be replaced with "${CUSTOM_RECAPTCHA_DOMAIN}"`, async () => {
      const { webview } = await createRecaptchaRenderer({
        recaptchaDomain: CUSTOM_RECAPTCHA_DOMAIN
      })
      const html = webview?.props?.source?.html

      expect(html).toBeTruthy()
      expect(html).toContain(`https://${CUSTOM_RECAPTCHA_DOMAIN}/recaptcha`)
    })
    
    it.each(INVALID_DOMAINS)('recaptchaDomain="%s" should cause an error', async (domain) => {
      const renderer = async () => {
        await createRecaptchaRenderer({ recaptchaDomain: domain })
      }

      await expect(renderer()).rejects.toThrow(
        'Invalid recaptchaDomain value'
      )
    })
  })

  describe('prop: baseUrl', () => {
    it('baseUrl should be applied to the webview', async () => {
      const baseUrl = 'http://localhost:3000'
      const { webview } = await createRecaptchaRenderer({
        baseUrl
      })

      expect(webview?.props).toHaveProperty('source.baseUrl', baseUrl)
    })
    
    it.each(VALID_BASE_URLS)('baseUrl="%s" must be valid', async (baseUrl) => {
      const { container } = await createRecaptchaRenderer({ baseUrl })
      expect(container).toBeTruthy()
    })
  })

  describe('prop: siteKey', () => {
    it('siteKey should be applied to the webview', async () => {
      const { webview } = await createRecaptchaRenderer({
        siteKey: TEST_SITE_KEY
      })

      expect(webview?.props).toHaveProperty(
        'source.html',
        getRecaptchaTemplate({
          siteKey: TEST_SITE_KEY
        })
      )
    })
    
    it.each(INVALID_SITE_KEYS)('siteKey="%S" should cause an error', async (siteKey) => {
      const renderer = async () => {
        await createRecaptchaRenderer({ siteKey })
      }

      await expect(renderer()).rejects.toThrow('Invalid siteKey value')
    })
  })

  describe('prop: modalProps', () => {
    it('the modal style prop should be override', async () => {
      const modalStyle: ViewStyle = {
        width: 300,
        height: 300,
        backgroundColor: 'red'
      }

      const { modal } = await createRecaptchaRenderer({
        autoOpen: false,
        modalProps: {
          style: modalStyle
        }
      })

      expect(modal.props.style).toMatchObject(modalStyle)
    })
  })

  describe('prop: webViewProps', () => {
    it('the webview style prop should be override', async () => {
      const webViewStyle: ViewStyle = {
        width: 200,
        height: 300,
        backgroundColor: 'red'
      }

      const { webview } = await createRecaptchaRenderer({
        webViewProps: {
          style: webViewStyle
        }
      })

      const style = (webview?.props.style as ViewStyle[]).flat(3).reduce(
        (previousValue, currentValue) => ({
          ...previousValue,
          ...currentValue
        }),
        {}
      )

      expect(style).toMatchObject(webViewStyle)
    })

    it('the webview injectedJavaScript prop should be override', async () => {
      const { webview } = await createRecaptchaRenderer({
        webViewProps: {
          injectedJavaScript: "console.log('injected javascript')"
        }
      })

      expect(webview?.props).toHaveProperty(
        'injectedJavaScript',
        "console.log('injected javascript')"
      )
    })

    it('the webview allowsBackForwardNavigationGestures prop should be override', async () => {
      const { webview } = await createRecaptchaRenderer({
        webViewProps: {
          allowsBackForwardNavigationGestures: true
        }
      })

      expect(webview?.props).toHaveProperty(
        'allowsBackForwardNavigationGestures',
        true
      )
    })
  })

  describe('prop: headerComponent', () => {
    it('the headerComponent prop should be override', async () => {
      const { findByTestId } = await createRecaptchaRenderer({
        headerComponent: (
          <View testID="header-component">
            <Text>Custom header component</Text>
          </View>
        )
      })

      const header = await findByTestId('header-component')

      expect(header).toBeTruthy()
      expect(header.type).toBe('View')
      expect(header.children).toHaveLength(1)
    })
  })

  describe('prop: footerComponent', () => {
    it('the footerComponent prop should be override', async () => {
      const { findByTestId } = await createRecaptchaRenderer({
        footerComponent: (
          <View testID="footer-component">
            <Text>Custom footer component</Text>
          </View>
        )
      })

      const footer = await findByTestId('footer-component')

      expect(footer).toBeTruthy()
      expect(footer.type).toBe('View')
      expect(footer.children).toHaveLength(1)
    })
  })

  describe('prop: loadingComponent', () => {
    it('the loadingComponent prop should be override', async () => {
      const { findByText, findByTestId } = await createRecaptchaRenderer({
        loadingComponent: <Text>Custom loading component</Text>
      })

      const loading = await findByTestId('loading-component')
      const loadingText = await findByText(/Custom loading/)

      expect(loading).toBeTruthy()
      expect(loadingText).toBeTruthy()
      expect(loading.props?.style).toEqual({
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center'
      } as ViewStyle)
      expect(loading.type).toBe('View')
      expect(loading.children).toHaveLength(1)
    })
  })

  describe('prop: onClose', () => {
    it.each(VISIBLE_SIZES)('should not fire onClose event when size="%s"', async (size) => {
      const handleClose = jest.fn()
      const { webview } = await createRecaptchaRenderer({
        size,
        onClose: handleClose
      })

      await waitFor(() => {
        fireEvent(
          webview!,
          'message',
          createNativeEvent({
            close: []
          })
        )
      })

      expect(handleClose).not.toBeCalled()
    })
    
    it.each(INVISIBLE_SIZES)('should fire onClose event when size="%s"', async (size) => {
      const handleClose = jest.fn()
      const { webview } = await createRecaptchaRenderer({
        size,
        onClose: handleClose
      })

      await waitFor(() => {
        fireEvent(
          webview!,
          'message',
          createNativeEvent({
            close: []
          })
        )
      })

      expect(handleClose).toBeCalledTimes(1)
    })
  })

  describe('prop: onLoad', () => {
    it('should fire onLoad event', async () => {
      const handleLoad = jest.fn()
      const handleClose = jest.fn()
      const { webview, expectModalVisible } = await createRecaptchaRenderer({
        onLoad: handleLoad,
        onClose: handleClose
      })

      await waitFor(() => {
        fireEvent(
          webview!,
          'message',
          createNativeEvent({
            load: []
          })
        )
      })

      expectModalVisible()
      expect(handleLoad).toBeCalledTimes(1)
      expect(handleClose).toBeCalledTimes(0)
    })
  })

  describe('prop: onExpire', () => {
    it('should fire onExpire event', async () => {
      const handleExpire = jest.fn()
      const { webview, expectModalVisible } = await createRecaptchaRenderer({
        onExpire: handleExpire
      })

      await waitFor(() => {
        fireEvent(
          webview!,
          'message',
          createNativeEvent({
            expire: []
          })
        )
      })

      expectModalVisible()
      expect(handleExpire).toBeCalledTimes(1)
    })

    it('the modal should be hidden when closeOnExpire="true"', async () => {
      const handleClose = jest.fn()
      const handleExpire = jest.fn()
      const { webview, expectModalInVisible } = await createRecaptchaRenderer({
        onClose: handleClose,
        onExpire: handleExpire,
        closeOnExpire: true
      })

      await waitFor(() => {
        fireEvent(
          webview!,
          'message',
          createNativeEvent({
            expire: []
          })
        )
      })

      expectModalInVisible()
      expect(handleClose).toBeCalledTimes(1)
      expect(handleExpire).toBeCalledTimes(1)
    })

    it('the modal should not be hidden when closeOnExpire="false"', async () => {
      const handleClose = jest.fn()
      const handleExpire = jest.fn()
      const { webview, expectModalVisible } = await createRecaptchaRenderer({
        onClose: handleClose,
        onExpire: handleExpire,
        closeOnExpire: false
      })

      await waitFor(() => {
        fireEvent(
          webview!,
          'message',
          createNativeEvent({
            expire: []
          })
        )
      })

      expectModalVisible()
      expect(handleClose).not.toBeCalled()
      expect(handleExpire).toBeCalledTimes(1)
    })
  })

  describe('prop: onVerify', () => {
    it('should fire onVerify event', async () => {
      const handleVerify = jest.fn()
      const { webview } = await createRecaptchaRenderer({
        onVerify: handleVerify
      })

      await waitFor(() => {
        fireEvent(
          webview!,
          'message',
          createNativeEvent({
            verify: ['recaptcha-token']
          })
        )
      })

      expect(handleVerify).toBeCalledTimes(1)
      expect(handleVerify).toBeCalledWith('recaptcha-token')
    })
  })

  describe('prop: onError', () => {
    it('should fire onError event', async () => {
      const handleError = jest.fn()
      const { webview } = await createRecaptchaRenderer({
        onError: handleError
      })

      await waitFor(() => {
        fireEvent(
          webview!,
          'message',
          createNativeEvent({
            error: ['recaptcha-error']
          })
        )
      })

      expect(handleError).toBeCalledTimes(1)
      expect(handleError).toBeCalledWith('recaptcha-error')
    })
  })
})

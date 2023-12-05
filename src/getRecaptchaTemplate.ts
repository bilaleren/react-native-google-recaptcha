import type { GoogleRecaptchaBaseProps } from './types'
import {
  GoogleRecaptchaSize,
  GoogleRecaptchaTheme,
  DEFAULT_GSTATIC_DOMAIN,
  DEFAULT_RECAPTCHA_DOMAIN
} from './constants'

const SITE_KEY_PATTERN = /^6[a-zA-Z0-9-_]{39}$/
const LANG_PATTERN = /^([a-z]{2})(-(?!UK)[A-Z0-9]{2,3})?$/
const DOMAIN_PATTERN = /^([a-z0-9-_]+\.)+([a-z0-9]{2,})(:[0-9]{2,})?$/i

function getRecaptchaTemplate(props: GoogleRecaptchaBaseProps): string {
  const {
    lang = 'en',
    siteKey,
    size = GoogleRecaptchaSize.NORMAL,
    theme = GoogleRecaptchaTheme.LIGHT,
    action = '',
    hideBadge = false,
    enterprise = false,
    gstaticDomain = DEFAULT_GSTATIC_DOMAIN,
    recaptchaDomain = DEFAULT_RECAPTCHA_DOMAIN
  } = props

  let htmlLang = lang
  const langMatches = LANG_PATTERN.exec(lang)

  if (!langMatches || langMatches.length < 2) {
    throw new TypeError(`Invalid lang value. Validity pattern: ${LANG_PATTERN}`)
  }

  htmlLang = langMatches[1]

  if (!SITE_KEY_PATTERN.test(siteKey)) {
    throw new TypeError(
      `Invalid siteKey value. Validity pattern: ${SITE_KEY_PATTERN}`
    )
  }

  if (!DOMAIN_PATTERN.test(gstaticDomain)) {
    throw new TypeError(
      `Invalid gstaticDomain value. Validity pattern: ${DOMAIN_PATTERN}`
    )
  }

  if (!DOMAIN_PATTERN.test(recaptchaDomain)) {
    throw new TypeError(
      `Invalid recaptchaDomain value. Validity pattern: ${DOMAIN_PATTERN}`
    )
  }

  const grecaptcha = enterprise
    ? 'window.grecaptcha.enterprise'
    : 'window.grecaptcha'

  const scriptUrl = enterprise
    ? `https://${recaptchaDomain}/recaptcha/enterprise.js?hl=${lang}`
    : `https://${recaptchaDomain}/recaptcha/api.js?hl=${lang}`

  const jsScript = `<script src="${scriptUrl}" async defer></script>`

  return `
    <!DOCTYPE html>
    <html lang="${htmlLang}">

    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title></title>
        <link rel="preconnect" href="https://${recaptchaDomain}">
        <link rel="preconnect" href="https://${gstaticDomain}" crossorigin>
        ${jsScript}
        <script>
            const siteKey = '${siteKey}';
            const theme = '${theme}';
            const size = '${size}';
            const action = '${action}';

            let readyInterval;
            let onCloseInterval;
            let widget;
            let onCloseObserver;

            const onClose = () => {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    close: []
                }));
            }

            const onLoad = () => {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    load: []
                }));
            }

            const onExpire = () => {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    expire: []
                }));
            }

            const onError = (error) => {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    error: [error]
                }));
            }

            const onVerify = (token) => {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    verify: [token]
                }));
            }

            const isReady = () => Boolean(typeof window === 'object' && window.grecaptcha && ${grecaptcha}.render);

            const registerOnCloseListener = () => {
                if (onCloseObserver) {
                    onCloseObserver.disconnect();
                }

                const iframes = document.getElementsByTagName('iframe');

                const recaptchaFrame = Array.prototype.find
                    .call(iframes, e => e.src.includes('google.com/recaptcha/api2/bframe'));
                const recaptchaElement = recaptchaFrame.parentNode.parentNode;

                clearInterval(onCloseInterval);

                let lastOpacity = recaptchaElement.style.opacity;
                onCloseObserver = new MutationObserver(mutations => {
                    if (lastOpacity !== recaptchaElement.style.opacity
                        && recaptchaElement.style.opacity == 0) {
                        onClose();
                    }
                    lastOpacity = recaptchaElement.style.opacity;
                });
                onCloseObserver.observe(recaptchaElement, {
                    attributes: true,
                    attributeFilter: ['style'],
                });
            }

            const isRendered = () => {
                return typeof widget === 'number';
            }

            const renderRecaptcha = () => {
                const recaptchaParams = {
                    sitekey: siteKey,
                    size,
                    theme,
                    callback: onVerify,
                    'error-callback': onError,
                    'expired-callback': onExpire,
                }
                if (action) {
                    recaptchaParams.action = action;
                }
                widget = ${grecaptcha}.render('recaptcha-container', recaptchaParams);
                if (onLoad) {
                    onLoad();
                }
                onCloseInterval = setInterval(registerOnCloseListener, 1000);
            }

            const updateReadyState = () => {
                if (isReady()) {
                    clearInterval(readyInterval);
                    renderRecaptcha()
                }
            }

            if (isReady()) {
                renderRecaptcha();
            } else {
                readyInterval = setInterval(updateReadyState, 1000);
            }

            window.rnRecaptcha = {
                execute: () => {
                    ${grecaptcha}.execute(widget);
                },
                reset: () => {
                    ${grecaptcha}.reset(widget);
                },
            }
        </script>

        <style>
            html,
            body,
            .container {
                height: 100%;
                width: 100%;
                margin: 0;
                padding: 0;
                background-color: transparent;
            }

            .container {
                display: flex;
                justify-content: center;
                align-items: center;
            }
            ${hideBadge ? '.grecaptcha-badge { visibility: hidden; }' : ''}
        </style>
    </head>

    <body>
      <div class="container">
        <span id="recaptcha-container"></span>
      </div>
    </body>
</html>`.trim()
}

export default getRecaptchaTemplate

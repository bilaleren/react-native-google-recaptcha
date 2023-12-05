import type {
  GoogleRecaptchaSize,
  GoogleRecaptchaTheme,
  GoogleRecaptchaActionName
} from './constants'

export type GoogleRecaptchaToken = string | null | undefined

export interface GoogleRecaptchaBaseProps {
  /**
   * reCAPTCHA language code.
   * @default en
   * @see https://developers.google.com/recaptcha/docs/language
   */
  lang?: string

  /**
   * reCAPTCHA your siteKey.
   * @see https://developers.google.com/recaptcha/intro#recaptcha-overview
   */
  siteKey: string

  /**
   * The size of the widget.
   * @default normal
   * @see https://developers.google.com/recaptcha/docs/display#render_param
   * @see https://developers.google.com/recaptcha/docs/invisible#render_param
   */
  size?: GoogleRecaptchaSize

  /**
   * The color theme of the widget.
   * @default light
   * @see https://developers.google.com/recaptcha/docs/faq#can-i-customize-the-recaptcha-widget-or-badge
   */
  theme?: GoogleRecaptchaTheme

  /**
   * An additional parameter for specifying the action name associated with the protected element for reCAPTCHA Enterprise API.
   * @default ''
   * @see https://cloud.google.com/recaptcha-enterprise/docs/actions
   */
  action?: GoogleRecaptchaActionName | string

  /**
   * When size = 'invisible', you are allowed to hide the badge as long as you include the reCAPTCHA branding visibly in the user flow.
   * @default false
   * @see https://developers.google.com/recaptcha/docs/faq#id-like-to-hide-the-recaptcha-badge.-what-is-allowed
   */
  hideBadge?: boolean

  /**
   * Use the reCAPTCHA Enterprise API.
   * @default false
   * @see https://cloud.google.com/recaptcha-enterprise/docs/using-features
   */
  enterprise?: boolean

  /**
   * Customize reCAPTCHA gstatic host.
   * @default www.gstatic.com
   */
  gstaticDomain?: string

  /**
   * The host name of the reCAPTCHA valid api.
   * @default www.google.com
   * @see https://developers.google.com/recaptcha/docs/faq#can-i-use-recaptcha-globally
   */
  recaptchaDomain?: string
}

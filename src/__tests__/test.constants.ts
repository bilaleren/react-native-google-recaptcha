import {
  GoogleRecaptchaSize,
  GoogleRecaptchaTheme,
  GoogleRecaptchaActionName
} from '../constants'

export const TEST_SITE_KEY = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'

export const RECAPTCHA_SIZES: GoogleRecaptchaSize[] =
  Object.values(GoogleRecaptchaSize)

export const RECAPTCHA_THEMES: GoogleRecaptchaTheme[] =
  Object.values(GoogleRecaptchaTheme)

export const BADGE_HIDDEN_STYLE = '.grecaptcha-badge { visibility: hidden; }'

export const RECAPTCHA_ACTIONS: GoogleRecaptchaActionName[] = Object.values(
  GoogleRecaptchaActionName
)

export const ENTERPRISE_MATCHERS = [
  'window.grecaptcha.enterprise',
  'recaptcha/enterprise.js'
]

export const INVALID_SITE_KEYS = [
  '',
  '1',
  'invalid',
  '.',
  TEST_SITE_KEY.slice(0, -1)
]

export const VALID_LANG_CODES = ['en', 'en-GB', 'es-419']

export const INVALID_LANG_CODES = [
  '',
  'enn',
  'enn-UK',
  'en-UK',
  'es-4192',
  'en-g',
  'en-G',
  'en-Gb',
  'en-'
]

export const INVALID_DOMAINS = ['', 'www', 'w', 'x.c']

export const VISIBLE_SIZES: GoogleRecaptchaSize[] = [
  GoogleRecaptchaSize.NORMAL,
  GoogleRecaptchaSize.COMPACT
]

export const INVISIBLE_SIZES: GoogleRecaptchaSize[] = [
  GoogleRecaptchaSize.INVISIBLE
]

export const VALID_BASE_URLS = [
  // Localhost
  'http://localhost:3000',
  'http://localhost:3000/path',
  'http://localhost:3000/path?q=x',
  // With http
  'http://site.com',
  'http://www.site.com',
  'http://sub.site.com',
  'http://sub.site.com/path',
  'http://site.com/path',
  'http://site.com/path?q=x',
  // With https
  'https://site.com',
  'https://www.site.com',
  'https://sub.site.com',
  'https://sub.site.com/path',
  'https://site.com/path',
  'https://site.com/path?q=x'
]

export const CUSTOM_GSTATIC_DOMAIN = 'www.custom-gstatic.com'

export const CUSTOM_RECAPTCHA_DOMAIN = 'www.custom-recaptcha.com'

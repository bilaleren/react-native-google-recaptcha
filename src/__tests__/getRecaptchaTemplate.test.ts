import getRecaptchaTemplate from '../getRecaptchaTemplate'
import {
  TEST_SITE_KEY,
  INVALID_DOMAINS,
  RECAPTCHA_SIZES,
  RECAPTCHA_THEMES,
  VALID_LANG_CODES,
  INVALID_SITE_KEYS,
  RECAPTCHA_ACTIONS,
  INVALID_LANG_CODES,
  BADGE_HIDDEN_STYLE,
  ENTERPRISE_MATCHERS,
  CUSTOM_GSTATIC_DOMAIN,
  CUSTOM_RECAPTCHA_DOMAIN
} from './test.constants'

describe('getRecaptchaTemplate()', () => {
  describe('prop: siteKey', () => {
    test('the siteKey must be applied', () => {
      const template = getRecaptchaTemplate({
        siteKey: TEST_SITE_KEY
      })

      expect(template).toContain(`const siteKey = '${TEST_SITE_KEY}'`)
    })

    INVALID_SITE_KEYS.forEach((siteKey) => {
      test(`siteKey="${siteKey}" should cause an error`, () => {
        expect(() => {
          getRecaptchaTemplate({
            siteKey
          })
        }).toThrow('Invalid siteKey value')
      })
    })
  })

  describe('prop: lang', () => {
    VALID_LANG_CODES.forEach((lang) => {
      test(`lang="${lang}" must be valid`, () => {
        const template = getRecaptchaTemplate({
          lang,
          siteKey: TEST_SITE_KEY
        })
        const htmlLang = lang.split('-')[0]

        expect(template).toContain(`.js?hl=${lang}`)
        expect(template).toContain(`<html lang="${htmlLang}">`)
      })
    })

    INVALID_LANG_CODES.forEach((lang) => {
      test(`lang="${lang}" should cause an error`, () => {
        expect(() => {
          getRecaptchaTemplate({
            lang,
            siteKey: TEST_SITE_KEY
          })
        }).toThrow('Invalid lang value')
      })
    })

    test('the default lang should be "en"', () => {
      const template = getRecaptchaTemplate({
        siteKey: TEST_SITE_KEY
      })

      expect(template).toContain('.js?hl=en')
      expect(template).toContain('<html lang="en">')
    })
  })

  describe('prop: size', () => {
    test('the default size should be "normal"', () => {
      const template = getRecaptchaTemplate({
        siteKey: TEST_SITE_KEY
      })

      expect(template).toContain("const size = 'normal'")
    })

    RECAPTCHA_SIZES.forEach((size) => {
      test(`size should be replaced with "${size}"`, () => {
        const template = getRecaptchaTemplate({
          size,
          siteKey: TEST_SITE_KEY
        })

        expect(template).toContain(`const size = '${size}'`)
      })
    })
  })

  describe('prop: theme', () => {
    test('the default theme should be "light"', () => {
      const template = getRecaptchaTemplate({
        siteKey: TEST_SITE_KEY
      })

      expect(template).toContain("const theme = 'light'")
    })

    RECAPTCHA_THEMES.forEach((theme) => {
      test(`theme should be replaced with "${theme}"`, () => {
        const template = getRecaptchaTemplate({
          theme,
          siteKey: TEST_SITE_KEY
        })

        expect(template).toContain(`const theme = '${theme}'`)
      })
    })
  })

  describe('prop: action', () => {
    test('the default action must be empty', () => {
      const template = getRecaptchaTemplate({
        siteKey: TEST_SITE_KEY
      })

      expect(template).toContain("const action = ''")
    })

    RECAPTCHA_ACTIONS.forEach((action) => {
      test(`action should be replaced with "${action}"`, () => {
        const template = getRecaptchaTemplate({
          action,
          siteKey: TEST_SITE_KEY
        })

        expect(template).toContain(`const action = '${action}'`)
      })
    })
  })

  describe('prop: hideBadge', () => {
    test('the badge must be visible', () => {
      const template = getRecaptchaTemplate({
        siteKey: TEST_SITE_KEY
      })

      expect(template).not.toContain(BADGE_HIDDEN_STYLE)
    })

    test('the badge must be invisible', () => {
      const template = getRecaptchaTemplate({
        siteKey: TEST_SITE_KEY,
        hideBadge: true
      })

      expect(template).toContain(BADGE_HIDDEN_STYLE)
    })
  })

  describe('prop: enterprise', () => {
    test('enterprise qualifications should not be applied', () => {
      const template = getRecaptchaTemplate({
        siteKey: TEST_SITE_KEY
      })

      expect(template).toContain('recaptcha/api.js')

      ENTERPRISE_MATCHERS.forEach((value) => {
        expect(template).not.toContain(value)
      })
    })

    test('enterprise qualifications should be applied', () => {
      const template = getRecaptchaTemplate({
        siteKey: TEST_SITE_KEY,
        enterprise: true
      })

      expect(template).not.toContain('recaptcha/api.js')

      ENTERPRISE_MATCHERS.forEach((value) => {
        expect(template).toContain(value)
      })
    })
  })

  describe('prop: gstaticDomain', () => {
    INVALID_DOMAINS.forEach((domain) => {
      test(`gstaticDomain="${domain}" should cause an error`, () => {
        expect(() => {
          getRecaptchaTemplate({
            siteKey: TEST_SITE_KEY,
            gstaticDomain: domain
          })
        }).toThrow('Invalid gstaticDomain value.')
      })
    })

    test('the default gstaticDomain must be "www.gstatic.com"', () => {
      const template = getRecaptchaTemplate({
        siteKey: TEST_SITE_KEY
      })

      expect(template).toContain('https://www.gstatic.com')
    })

    test(`gstaticDomain should be replaced with "${CUSTOM_GSTATIC_DOMAIN}"`, () => {
      const template = getRecaptchaTemplate({
        siteKey: TEST_SITE_KEY,
        gstaticDomain: CUSTOM_GSTATIC_DOMAIN
      })

      expect(template).toContain(`https://${CUSTOM_GSTATIC_DOMAIN}`)
    })
  })

  describe('prop: recaptchaDomain', () => {
    INVALID_DOMAINS.forEach((domain) => {
      test(`recaptchaDomain="${domain}" should cause an error`, () => {
        expect(() => {
          getRecaptchaTemplate({
            siteKey: TEST_SITE_KEY,
            recaptchaDomain: domain
          })
        }).toThrow('Invalid recaptchaDomain value.')
      })
    })

    test('the default recaptchaDomain must be "www.google.com"', () => {
      const template = getRecaptchaTemplate({
        siteKey: TEST_SITE_KEY
      })

      expect(template).toContain('https://www.google.com/recaptcha')
    })

    test(`recaptchaDomain should be replaced with "${CUSTOM_RECAPTCHA_DOMAIN}"`, () => {
      const template = getRecaptchaTemplate({
        siteKey: TEST_SITE_KEY,
        recaptchaDomain: CUSTOM_RECAPTCHA_DOMAIN
      })

      expect(template).toContain(`https://${CUSTOM_RECAPTCHA_DOMAIN}/recaptcha`)
    })
  })
})

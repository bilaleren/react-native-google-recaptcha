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
    it('the siteKey must be applied', () => {
      const template = getRecaptchaTemplate({
        siteKey: TEST_SITE_KEY
      })

      expect(template).toContain(`const siteKey = '${TEST_SITE_KEY}'`)
    })

    it.each(INVALID_SITE_KEYS)('siteKey="%s" should cause an error', (siteKey) => {
      expect(() => {
        getRecaptchaTemplate({
          siteKey
        })
      }).toThrow('Invalid siteKey value')
    })
  })

  describe('prop: lang', () => {
    it('the default lang should be "en"', () => {
      const template = getRecaptchaTemplate({
        siteKey: TEST_SITE_KEY
      })

      expect(template).toContain('.js?hl=en')
      expect(template).toContain('<html lang="en">')
    })
    
    it.each(VALID_LANG_CODES)('lang="%s" must be valid', (lang) => {
      const template = getRecaptchaTemplate({
        lang,
        siteKey: TEST_SITE_KEY
      })
      const htmlLang = lang.split('-')[0]

      expect(template).toContain(`.js?hl=${lang}`)
      expect(template).toContain(`<html lang="${htmlLang}">`)
    })
    
    it.each(INVALID_LANG_CODES)('lang="%s" should cause an error', (lang) => {
      expect(() => {
        getRecaptchaTemplate({
          lang,
          siteKey: TEST_SITE_KEY
        })
      }).toThrow('Invalid lang value')
    })
  })

  describe('prop: size', () => {
    it('the default size should be "normal"', () => {
      const template = getRecaptchaTemplate({
        siteKey: TEST_SITE_KEY
      })

      expect(template).toContain("const size = 'normal'")
    })

    it.each(RECAPTCHA_SIZES)('size should be replaced with "%s"', (size) => {
      const template = getRecaptchaTemplate({
        size,
        siteKey: TEST_SITE_KEY
      })

      expect(template).toContain(`const size = '${size}'`)
    })
  })

  describe('prop: theme', () => {
    it('the default theme should be "light"', () => {
      const template = getRecaptchaTemplate({
        siteKey: TEST_SITE_KEY
      })

      expect(template).toContain("const theme = 'light'")
    })
    
    it.each(RECAPTCHA_THEMES)('theme should be replaced with "%s"', (theme) => {
      const template = getRecaptchaTemplate({
        theme,
        siteKey: TEST_SITE_KEY
      })

      expect(template).toContain(`const theme = '${theme}'`)
    })
  })

  describe('prop: action', () => {
    it('the default action must be empty', () => {
      const template = getRecaptchaTemplate({
        siteKey: TEST_SITE_KEY
      })

      expect(template).toContain("const action = ''")
    })
    
    it.each(RECAPTCHA_ACTIONS)('action should be replaced with "%s"', (action) => {
      const template = getRecaptchaTemplate({
        action,
        siteKey: TEST_SITE_KEY
      })

      expect(template).toContain(`const action = '${action}'`)
    })
  })

  describe('prop: hideBadge', () => {
    it('the badge must be visible', () => {
      const template = getRecaptchaTemplate({
        siteKey: TEST_SITE_KEY
      })

      expect(template).not.toContain(BADGE_HIDDEN_STYLE)
    })

    it('the badge must be invisible', () => {
      const template = getRecaptchaTemplate({
        siteKey: TEST_SITE_KEY,
        hideBadge: true
      })

      expect(template).toContain(BADGE_HIDDEN_STYLE)
    })
  })

  describe('prop: enterprise', () => {
    it('enterprise qualifications should not be applied', () => {
      const template = getRecaptchaTemplate({
        siteKey: TEST_SITE_KEY
      })

      expect(template).toContain('recaptcha/api.js')

      ENTERPRISE_MATCHERS.forEach((value) => {
        expect(template).not.toContain(value)
      })
    })

    it('enterprise qualifications should be applied', () => {
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
    it('the default gstaticDomain must be "www.gstatic.com"', () => {
      const template = getRecaptchaTemplate({
        siteKey: TEST_SITE_KEY
      })

      expect(template).toContain('https://www.gstatic.com')
    })

    it(`gstaticDomain should be replaced with "${CUSTOM_GSTATIC_DOMAIN}"`, () => {
      const template = getRecaptchaTemplate({
        siteKey: TEST_SITE_KEY,
        gstaticDomain: CUSTOM_GSTATIC_DOMAIN
      })

      expect(template).toContain(`https://${CUSTOM_GSTATIC_DOMAIN}`)
    })
    
    it.each(INVALID_DOMAINS)('gstaticDomain="%s" should cause an error', (domain) => {
      expect(() => {
        getRecaptchaTemplate({
          siteKey: TEST_SITE_KEY,
          gstaticDomain: domain
        })
      }).toThrow('Invalid gstaticDomain value.')
    })
  })

  describe('prop: recaptchaDomain', () => {
    it('the default recaptchaDomain must be "www.google.com"', () => {
      const template = getRecaptchaTemplate({
        siteKey: TEST_SITE_KEY
      })

      expect(template).toContain('https://www.google.com/recaptcha')
    })

    it(`recaptchaDomain should be replaced with "${CUSTOM_RECAPTCHA_DOMAIN}"`, () => {
      const template = getRecaptchaTemplate({
        siteKey: TEST_SITE_KEY,
        recaptchaDomain: CUSTOM_RECAPTCHA_DOMAIN
      })

      expect(template).toContain(`https://${CUSTOM_RECAPTCHA_DOMAIN}/recaptcha`)
    })
    
    it.each(INVALID_DOMAINS)('recaptchaDomain="%s" should cause an error', (domain) => {
      expect(() => {
        getRecaptchaTemplate({
          siteKey: TEST_SITE_KEY,
          recaptchaDomain: domain
        })
      }).toThrow('Invalid recaptchaDomain value.')
    })
  })
})

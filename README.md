# reCAPTCHA for React Native (Android and iOS)

![](https://badgen.net/npm/license/react-native-google-recaptcha)
[![](https://img.shields.io/npm/v/react-native-google-recaptcha.svg)](https://www.npmjs.com/package/react-native-google-recaptcha)
![](https://badgen.net/packagephobia/install/react-native-google-recaptcha)
![](https://badgen.net/bundlephobia/min/react-native-google-recaptcha)
![](https://badgen.net/bundlephobia/minzip/react-native-google-recaptcha)
![](https://badgen.net/npm/dw/react-native-google-recaptcha)
![](https://badgen.net/npm/dm/react-native-google-recaptcha)

A reCAPTCHA library for React Native (Android and iOS). Fully tested.

---

A normal widget.

<details open>
  <summary>
    <b>Normal</b>
  </summary>
  <br />
  <img
    alt="Normal"
    width="320"
    height="540"
    src="https://raw.githubusercontent.com/bilaleren/react-native-google-recaptcha/master/screenshots/normal.gif"
  />
</details>

---

A invisible widget.

<details>
  <summary>
    <b>Invisible</b>
  </summary>
  <br />
  <img
    alt="Normal"
    width="320"
    height="540"
    src="https://raw.githubusercontent.com/bilaleren/react-native-google-recaptcha/master/screenshots/invisible.gif"
  />
</details>

---

A compact widget.

<details>
  <summary>
    <b>Compact</b>
  </summary>
  <br />
  <img
    alt="Normal"
    width="320"
    height="540"
    src="https://raw.githubusercontent.com/bilaleren/react-native-google-recaptcha/master/screenshots/compact.gif"
  />
</details>

---

## Install

### Install the module

```bash
yarn add react-native-webview react-native-google-recaptcha
```

Or

```bash
npm i react-native-webview react-native-google-recaptcha
```

See the [`react-native-webview` Getting Started Guide](https://github.com/react-native-community/react-native-webview/blob/master/docs/Getting-Started.md).

## Import structure

```typescript
import GoogleRecaptcha, {
  // Enums
  GoogleRecaptchaSize, // Size enum: such GoogleRecaptchaSize.INVISIBLE
  GoogleRecaptchaTheme, // Theme enum: such GoogleRecaptchaTheme.DARK
  GoogleRecaptchaActionName, // Action name enum: such GoogleRecaptchaActionName.LOGIN
  DEFAULT_GSTATIC_DOMAIN,
  DEFAULT_RECAPTCHA_DOMAIN,
  // Types (only typescript)
  GoogleRecaptchaToken,
  GoogleRecaptchaProps,
  GoogleRecaptchaBaseProps,
  GoogleRecaptchaRefAttributes
} from 'react-native-google-recaptcha'
```

## Usage

With callback `onVerify()` method:

```tsx
import React from 'react'
import { View, Button } from 'react-native'

import GoogleRecaptcha, {
  GoogleRecaptchaToken,
  GoogleRecaptchaRefAttributes
} from 'react-native-google-recaptcha'

const App: React.FC = () => {
  const recaptchaRef = React.useRef<GoogleRecaptchaRefAttributes>(null)

  const handleSend = () => {
    recaptchaRef.current?.open()
  }

  const handleVerify = (token: GoogleRecaptchaToken) => {
    console.log('Recaptcha Token:', token)
  }

  const handleError = (error: unknown) => {
    console.error('Recaptcha Error:', error)
  }

  return (
    <View>
      <GoogleRecaptcha
        ref={recaptchaRef}
        baseUrl="http://localhost:3000"
        onError={handleError}
        onVerify={handleVerify}
        siteKey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
      />

      <Button title="Send" onPress={handleSend} />
    </View>
  )
}
```

With async `getToken()` method:

```tsx
import React from 'react'
import { View, Button } from 'react-native'

import GoogleRecaptcha, {
  GoogleRecaptchaSize,
  GoogleRecaptchaToken,
  GoogleRecaptchaRefAttributes
} from 'react-native-google-recaptcha'

const App: React.FC = () => {
  const recaptchaRef = React.useRef<GoogleRecaptchaRefAttributes>(null)

  const handleSend = async () => {
    try {
      const token = await recaptchaRef.current?.getToken()

      console.log('Recaptcha Token:', token)
    } catch (e) {
      console.error('Recaptcha Error:', e)
    }
  }

  return (
    <View>
      <GoogleRecaptcha
        ref={recaptchaRef}
        // size={GoogleRecaptchaSize.INVISIBLE}
        baseUrl="http://localhost:3000"
        siteKey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
      />

      <Button title="Send" onPress={handleSend} />
    </View>
  )
}
```

For more details, see the [Sample Project](https://github.com/bilaleren/react-native-google-recaptcha/blob/master/Example/App.tsx).

## Test

**Clone**

```shell
git clone https://github.com/bilaleren/react-native-google-recaptcha.git
```

**Then**

```shell
cd react-native-google-recaptcha && yarn install && yarn lint && yarn test
```

## Props

See prop types [GoogleRecaptchaProps](https://github.com/bilaleren/react-native-google-recaptcha/blob/master/src/GoogleRecaptcha.tsx#L48)

## Methods

See method types [GoogleRecaptchaRefAttributes](https://github.com/bilaleren/react-native-google-recaptcha/blob/master/src/GoogleRecaptcha.tsx#L22)

Note: If using `size="invisible"`, then challenge run automatically when `open` is called.

## reCAPTCHA v2 docs

- [I'm not a robot](https://developers.google.com/recaptcha/docs/display)
- [Invisible](https://developers.google.com/recaptcha/docs/invisible)

## reCAPTCHA Enterprise docs

- [Overview](https://cloud.google.com/recaptcha-enterprise/docs/)
- [Using features](https://cloud.google.com/recaptcha-enterprise/docs/using-features)

## License

This project is licensed under the terms of the
[MIT license](https://github.com/bilaleren/react-native-google-recaptcha/blob/master/LICENCE).

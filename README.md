# reCAPTCHA for React Native (Android and iOS)

[![License MIT](https://img.shields.io/badge/licence-MIT-blue.svg)](https://github.com/bilaleren/react-native-google-recaptcha/blob/master/LICENSE)
[![npm version](https://img.shields.io/npm/v/react-native-google-recaptcha.svg)](https://www.npmjs.com/package/react-native-google-recaptcha)
[![npm downloads](https://img.shields.io/npm/dt/react-native-google-recaptcha.svg)](#install)

A reCAPTCHA library for React Native (Android and iOS). Fully tested.

| **Normal** | **Invisible** | **Compact** |
|-----------------|---------------|-------------|
|<img src="https://raw.githubusercontent.com/bilaleren/react-native-google-recaptcha/master/screenshots/normal.gif" width="320" height="520">|<img src="https://raw.githubusercontent.com/bilaleren/react-native-google-recaptcha/master/screenshots/invisible.gif" width="320" height="520">|<img src="https://raw.githubusercontent.com/bilaleren/react-native-google-recaptcha/master/screenshots/compact.gif" width="320" height="520">|

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
  // Types (only typescript)
  GoogleRecaptchaToken,
  GoogleRecaptchaProps,
  GoogleRecaptchaBaseProps,
  GoogleRecaptchaRefAttributes
} from 'react-native-google-recaptcha'
```

## Usage

With sync onVerify:

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

With async getToken():

```tsx
import React from 'react'
import { View, Button } from 'react-native'

import GoogleRecaptcha, {
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
yarn install && yarn lint && yarn test
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

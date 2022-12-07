import React from 'react'
import {
  View,
  Text,
  Alert,
  Button,
  StyleSheet,
  SafeAreaView
} from 'react-native'
import GoogleRecaptcha, {
  GoogleRecaptchaSize,
  GoogleRecaptchaToken,
  GoogleRecaptchaProps,
  GoogleRecaptchaRefAttributes
} from 'react-native-google-recaptcha'

const BASE_URL = 'http://localhost:3000'
const SITE_KEY = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'

type ExampleProps = Partial<GoogleRecaptchaProps> & { title: string }

const Example: React.FC<ExampleProps> = (props: ExampleProps) => {
  const { title, ...recaptchaProps } = props
  const recaptchaRef = React.useRef<GoogleRecaptchaRefAttributes>(null)

  const handleSendForm = () => {
    recaptchaRef.current?.open()
  }

  const handleVerify = (token: GoogleRecaptchaToken) => {
    Alert.alert(title, `${token}`)
  }

  const handleError = (error: unknown) => {
    Alert.alert('Recaptcha Error', JSON.stringify(error))
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      <GoogleRecaptcha
        ref={recaptchaRef}
        baseUrl={BASE_URL}
        siteKey={SITE_KEY}
        onError={handleError}
        onVerify={handleVerify}
        {...recaptchaProps}
      />

      <Button title="Send Form" onPress={handleSendForm} />
    </View>
  )
}

const App = () => (
  <SafeAreaView style={{ flex: 1 }}>
    <Example title="Size: normal" />
    <View style={styles.bottomDivider} />
    <Example title="Size: invisible" size={GoogleRecaptchaSize.INVISIBLE} />
    <View style={styles.bottomDivider} />
    <Example title="Size: compact" size={GoogleRecaptchaSize.COMPACT} />
  </SafeAreaView>
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#292524'
  },
  title: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 10
  },
  bottomDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#DDDDDD'
  }
})

export default App

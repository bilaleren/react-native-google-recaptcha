module.exports = {
  preset: 'react-native',
  testRegex: '/src/__tests__/.*(test|spec)\\.tsx?$',
  moduleFileExtensions: [
    'ts',
    'tsx',
    'js',
    'jsx'
  ],
  setupFilesAfterEnv: [
    '@testing-library/jest-native/extend-expect'
  ],
  transformIgnorePatterns: ["node_modules/(?!((jest-)?react-native|react-native-webview|@react-native(-community)?)/)"],
}

module.exports = {
  root: true,
  extends: '@react-native-community',
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  ignorePatterns: ['*.js'],
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        semi: 'off',
        '@typescript-eslint/no-shadow': ['off'],
        'no-void': 'off',
        'no-shadow': 'off',
        'no-undef': 'off',
        'comma-dangle': 'off',
        '(no-spaced-func': 'off',
        'react/react-in-jsx-scope': 'off',
        '@typescript-eslint/no-unused-vars': 'warn',
        'react-native/no-inline-styles': 'off'
      },
    },
  ],
};

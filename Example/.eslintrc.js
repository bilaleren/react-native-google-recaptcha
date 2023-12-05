module.exports = {
  root: true,
  extends: '@react-native',
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  ignorePatterns: ['*.js'],
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        semi: 'off',
        'no-void': 'off',
        'no-shadow': 'off',
        'no-undef': 'off',
        'comma-dangle': 'off',
        'no-spaced-func': 'off',
        'react/react-in-jsx-scope': 'off',
        'react-native/no-inline-styles': 'off',
        '@typescript-eslint/no-shadow': ['off'],
        '@typescript-eslint/no-unused-vars': 'warn'
      },
    },
  ],
};

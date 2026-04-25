import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import eslintPluginReact from 'eslint-plugin-react'
import eslintPluginReactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'

export default [
  {
    ignores: [
      'eslint.config.mjs',
      'src/views/base/**',
      'src/views/buttons/**',
      'src/views/charts/**',
      'src/views/forms/**',
      'src/views/icons/**',
      'src/views/notifications/**',
      'src/views/theme/**',
      'src/views/widgets/**',
      'src/views/dashboard/MainChart.jsx',
    ],
  },
  {
    ...eslintPluginReact.configs.flat.recommended,
    ...eslintPluginReact.configs.flat['jsx-runtime'],
    files: ['src/**/*.{js,jsx}'],
    plugins: {
      eslintPluginReact,
      'react-hooks': eslintPluginReactHooks,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      ...eslintPluginReactHooks.configs.recommended.rules,
    },
  },
  eslintPluginPrettierRecommended,
]

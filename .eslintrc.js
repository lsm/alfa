const path = require('path')

module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: path.resolve(__dirname, './tsconfig.json'),
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true, // Allows for the parsing of JSX
      spread: true,
      classes: true,
      modules: true,
      restParams: true,
      impliedStrict: true
    }
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  plugins: ['react', '@typescript-eslint'],
  settings: {
    react: {
      // Tells eslint-plugin-react to automatically detect the version of React to use
      version: 'detect'
    }
  },
  rules: {
    '@typescript-eslint/indent': [
      'error',
      2,
      { SwitchCase: 1, ignoredNodes: ['JSXElement *'] }
    ],
    '@typescript-eslint/camelcase': ['error', { properties: 'never' }],
    '@typescript-eslint/explicit-member-accessibility': [
      'error',
      { accessibility: 'no-public' }
    ],
    '@typescript-eslint/no-parameter-properties': [
      'error',
      { allows: ['private'] }
    ],
    '@typescript-eslint/no-var-requires': 0,
    '@typescript-eslint/no-this-alias': [
      'error',
      {
        allowDestructuring: true, // Allow `const { props, state } = this`; false by default
        allowedNames: ['self'], // Allow `const self = this`; `[]` by default
      },
    ],
    "no-extra-parens": "off",
    "@typescript-eslint/no-extra-parens": ["error"],
    semi: ['error', 'never'],
    // Array brackets
    'array-bracket-newline': ['error', { multiline: true }],
    'array-bracket-spacing': ['error', 'always'],
    'array-element-newline': ['error', 'consistent'],
    // Quotes
    quotes: ['error', 'single'],
    'jsx-quotes': ['error', 'prefer-double'],
    // Curly brackets
    curly: ['error', 'all'],
    'block-spacing': 'error',
    'brace-style': ['error', '1tbs', { allowSingleLine: true }],
    'object-curly-spacing': ['error', 'always'],
    'object-curly-newline': [
      'error',
      {
        ObjectExpression: { multiline: true, consistent: false },
        ObjectPattern: { multiline: true },
        ImportDeclaration: 'never',
        ExportDeclaration: { multiline: true, minProperties: 3 }
      }
    ],
    // 'object-property-newline': ['error'],
    // Comma
    'comma-dangle': ['error', 'always-multiline'],
    'comma-spacing': ['error', { before: false, after: true }],
    'computed-property-spacing': ['error', 'never'],
    // Linebreak
    'eol-last': ['error', 'always'],
    'linebreak-style': ['error', 'unix'],
    'function-paren-newline': ['error', 'multiline'],
    'implicit-arrow-linebreak': ['error', 'beside'],
    'lines-between-class-members': ['error', 'always'],
    'newline-per-chained-call': ['error', { ignoreChainWithDepth: 2 }],
    'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 1, maxBOF: 0 }],
    // Comments
    'lines-around-comment': [
      'error',
      {
        beforeBlockComment: true,
        beforeLineComment: true,
        allowBlockStart: true,
        allowBlockEnd: true,
        allowObjectStart: true,
        allowObjectEnd: true,
        allowArrayStart: true,
        allowArrayEnd: true,
        allowClassStart: true,
        allowClassEnd: true
      }
    ],
    // 'multiline-comment-style': ['error', 'starred-block'],
    // Spaces & tabs
    'func-call-spacing': ['error', 'never'],
    'key-spacing': [
      'error',
      {
        beforeColon: false,
        afterColon: true,
        mode: 'strict'
      }
    ],
    'keyword-spacing': ['error', { before: true, after: true }],
    'no-trailing-spaces': 'error',
    // 'no-mixed-spaces-and-tabs': 'error',
    // Parentheses
    'new-parens': 'error',
    // Branches
    'no-lonely-if': 'error',
    'no-unneeded-ternary': 'error',
    'no-whitespace-before-property': 'error',
    // jsx
    'react/jsx-max-props-per-line': [
      'error',
      { maximum: 1, when: 'multiline' }
    ],
    'react/jsx-first-prop-new-line': ['error', 'never'],
    'react/jsx-indent': ['error', 2, { checkAttributes: true }],
    'react/jsx-indent-props': ['error', 'first'],
    //'react/jsx-closing-tag-location': 'error',
    'react/jsx-props-no-multi-spaces': 'error',
    'react/jsx-sort-props': [
      'warn',
      {
        //"callbacksLast": true,
        shorthandFirst: true,
        //"shorthandLast": true,
        ignoreCase: false,
        noSortAlphabetically: false,
        reservedFirst: true
      }
    ]
  }
}

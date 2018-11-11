"use strict";

const src = "src/**/*.{js,ts}";
const app = "app/**/*.{js,ts,vue}";
const test = "**/*.test.{js,ts,vue}";
const mocks = "**/__mocks__/**/*.{js,ts}";
const scripts = "scripts/**/*.{js,ts}";

module.exports = {
  root: true,
  parserOptions: {
    parser: "babel-eslint",
    ecmaVersion: 2018,
    sourceType: "script"
  },
  env: {
    es6: true,
    node: true
  },
  plugins: ["babel", "import", "vue"],
  settings: {
    "import/resolver": {
      webpack: {
        config: "build/webpack.app.config.js",
        env: {}
      }
    }
  },
  extends: [
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:vue/recommended"
  ],
  rules: {
    "import/extensions": ["error", { vue: "always" }],
    "import/first": "error",
    "import/max-dependencies": "error",
    "import/newline-after-import": "error",
    "import/no-absolute-path": "error",
    "import/no-deprecated": "error",
    "import/no-duplicates": "error",
    "import/no-extraneous-dependencies": "error",
    "import/no-mutable-exports": "error",
    "import/no-named-as-default": "error",
    "import/no-named-as-default-member": "error",
    "import/no-named-default": "error",
    "import/no-unassigned-import": ["error", { allow: ["**/*.{css,scss}"] }],
    "import/no-webpack-loader-syntax": "error",
    "import/order": ["error", { "newlines-between": "never" }],
    "import/unambiguous": "error",

    "vue/html-closing-bracket-newline": "off",
    "vue/html-closing-bracket-spacing": "off",
    "vue/html-indent": "off",
    "vue/html-quotes": "off",
    "vue/html-self-closing": "off",
    "vue/max-attributes-per-line": "off",
    "vue/require-prop-type-constructor": "off",

    "accessor-pairs": "error",
    camelcase: "error",
    "class-methods-use-this": "error",
    "consistent-return": "error",
    "consistent-this": "error",
    "default-case": "error",
    eqeqeq: ["error", "always", { null: "ignore" }],
    "func-style": ["error", "declaration", { allowArrowFunctions: true }],
    "line-comment-position": "error",
    "max-depth": ["error", 3],
    "new-cap": "error",
    "no-alert": "error",
    "no-array-constructor": "error",
    "no-async-promise-executor": "error",
    "no-await-in-loop": "error",
    "no-buffer-constructor": "error",
    "no-else-return": ["error", { allowElseIf: false }],
    "no-eval": "error",
    "no-extend-native": "error",
    "no-extra-bind": "error",
    "no-extra-label": "error",
    "no-global-assign": "error",
    "no-implicit-coercion": "error",
    "no-implicit-globals": "error",
    "no-implied-eval": "error",
    "no-label-var": "error",
    "no-lonely-if": "error",
    "no-misleading-character-class": "error",
    "no-mixed-requires": "error",
    "no-multi-str": "error",
    "no-negated-condition": "error",
    "no-new": "error",
    "no-new-func": "error",
    "no-new-object": "error",
    "no-new-require": "error",
    "no-new-wrappers": "error",
    "no-octal-escape": "error",
    "no-path-concat": "error",
    "no-proto": "error",
    "no-return-assign": ["error", "always"],
    "no-return-await": "error",
    "no-self-compare": "error",
    "no-sequences": "error",
    "no-shadow-restricted-names": "error",
    "no-sync": "error",
    "no-template-curly-in-string": "error",
    "no-throw-literal": "error",
    "no-unmodified-loop-condition": "error",
    "no-unneeded-ternary": ["error", { defaultAssignment: false }],
    "no-unsafe-negation": "error",
    "no-unused-expressions": "error",
    "no-unused-vars": ["error", { ignoreRestSiblings: true }],
    "no-use-before-define": ["error", "nofunc"],
    "no-useless-call": "error",
    "no-useless-concat": "error",
    "no-useless-constructor": "error",
    "no-useless-rename": "error",
    "no-useless-return": "error",
    "no-var": "error",
    "no-void": "error",
    "no-warning-comments": "error",
    "no-with": "error",
    "object-shorthand": "error",
    "operator-assignment": "error",
    "prefer-arrow-callback": "error",
    "prefer-const": "error",
    "prefer-numeric-literals": "error",
    "prefer-object-spread": "error",
    "prefer-promise-reject-errors": "error",
    "prefer-rest-params": "error",
    "prefer-spread": "error",
    radix: "error",
    "require-atomic-updates": "error",
    "require-await": "error",
    strict: "error",
    "symbol-description": "error"
  },
  overrides: [
    {
      files: [src, app, test, mocks, scripts],
      parserOptions: { sourceType: "module" }
    },
    {
      files: [src, app],
      env: { node: false },
      globals: { process: false }
    },
    {
      files: [src, app],
      excludedFiles: [test],
      rules: {
        "import/no-nodejs-modules": "error",
        "import/no-extraneous-dependencies": [
          "error",
          {
            devDependencies: false,
            optionalDependencies: false,
            peerDependencies: false
          }
        ]
      }
    },
    {
      files: [app],
      env: { browser: true }
    },
    {
      files: [test, mocks],
      env: { jest: true }
    },
    {
      files: [scripts],
      rules: { "no-console": "off" }
    }
  ]
};

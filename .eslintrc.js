"use strict";

const src = "src/**/*.js";
const app = "app/**/*.{js,vue}";
const test = "test/**/*.js";
const build = "build/**/*.js";
const scripts = "scripts/**/*.js";

module.exports = {
  root: true,
  parser: "babel-eslint",
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: "script"
  },
  env: {
    es6: true,
    node: true
  },
  plugins: ["babel", "html", "import", "prettier", "promise"],
  settings: {
    "html/indent": "0",
    "html/report-bad-indent": "error",
    "import/resolver": {
      webpack: { config: "build/webpack.app.config.js" }
    }
  },
  extends: ["eslint:recommended", "plugin:import/errors"],
  rules: {
    "import/extensions": "error",
    "import/first": "error",
    "import/newline-after-import": "error",
    "import/no-absolute-path": "error",
    "import/no-deprecated": "error",
    "import/no-duplicates": "error",
    "import/no-extraneous-dependencies": "error",
    "import/no-mutable-exports": "error",
    "import/no-named-as-default": "error",
    "import/no-named-as-default-member": "error",
    "import/no-named-default": "error",
    "import/no-unassigned-import": ["error", { allow: ["**/*.css"] }],
    "import/no-webpack-loader-syntax": "error",
    "import/order": ["error", { "newlines-between": "never" }],
    "import/unambiguous": "error",

    "promise/always-return": "error",
    "promise/avoid-new": "error",
    "promise/catch-or-return": "error",
    "promise/no-callback-in-promise": "error",
    "promise/no-nesting": "error",
    "promise/no-promise-in-callback": "error",
    "promise/no-return-in-finally": "error",
    "promise/no-return-wrap": "error",
    "promise/param-names": "error",
    "promise/prefer-await-to-callbacks": "error",
    "promise/prefer-await-to-then": "error",

    "prettier/prettier": "error",

    "accessor-pairs": "error",
    "array-callback-return": "error",
    camelcase: "error",
    "class-methods-use-this": "error",
    "consistent-return": "error",
    "consistent-this": ["error", "self"],
    "default-case": "error",
    "dot-notation": "error",
    eqeqeq: "error",
    "for-direction": "error",
    "func-name-matching": "error",
    "func-style": ["error", "declaration", { allowArrowFunctions: true }],
    "getter-return": "error",
    "max-depth": ["error", 3],
    "max-params": ["error", 4],
    "new-cap": "error",
    "no-alert": "error",
    "no-await-in-loop": "error",
    "no-buffer-constructor": "error",
    "no-caller": "error",
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
    "no-lone-blocks": "error",
    "no-lonely-if": "error",
    "no-loop-func": "error",
    "no-mixed-requires": "error",
    "no-multi-assign": "error",
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
    "no-script-url": "error",
    "no-self-compare": "error",
    "no-sequences": "error",
    "no-shadow-restricted-names": "error",
    "no-template-curly-in-string": "error",
    "no-throw-literal": "error",
    "no-trailing-spaces": "error",
    "no-unmodified-loop-condition": "error",
    "no-unneeded-ternary": ["error", { defaultAssignment: false }],
    "no-unsafe-negation": "error",
    "no-unused-expressions": "error",
    "no-use-before-define": ["error", "nofunc"],
    "no-useless-call": "error",
    "no-useless-computed-key": "error",
    "no-useless-concat": "error",
    "no-useless-constructor": "error",
    "no-useless-rename": "error",
    "no-var": "error",
    "no-void": "error",
    "no-warning-comments": "error",
    "no-with": "error",
    "object-shorthand": "error",
    "operator-assignment": "error",
    "prefer-arrow-callback": "error",
    "prefer-const": "error",
    "prefer-numeric-literals": "error",
    "prefer-promise-reject-errors": "error",
    "prefer-rest-params": "error",
    "prefer-spread": "error",
    radix: "error",
    "require-await": "error",
    strict: "error",
    "symbol-description": "error"
  },
  overrides: [
    {
      files: [src, app, test, scripts],
      parserOptions: { sourceType: "module" }
    },
    {
      files: [src, app],
      env: { node: false },
      globals: { process: false },
      rules: { "import/no-nodejs-modules": "error" }
    },
    {
      files: [app],
      env: { browser: true }
    },
    {
      files: [test],
      env: { jest: true }
    },
    {
      files: [build, scripts],
      rules: { "no-console": "off" }
    }
  ]
};

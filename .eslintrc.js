module.exports = {
    "extends": ["eslint:recommended", "plugin:node/recommended"],
    "env": {
        "es6": true,
        "mocha": true
    },
    "ignorePatterns": [
        "!packages/node_modules/*"
    ],
    "globals": {},
    "rules": {
        "semi": [
            2,
            "always"
        ],
        "curly": 2,
        "no-eq-null": 2,
        "no-extend-native": 2,
        "indent": [
            2,
            4,
            {
                "SwitchCase": 1
            }
        ],
        "guard-for-in": 2,
        "wrap-iife": [
            2,
            "any"
        ],
        "no-irregular-whitespace": 2,
        "no-loop-func": 2,
        "no-shadow": 0,
        "dot-notation": 0,
        "no-proto": 2,
        "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }]
    },
    "overrides": [{
        "files": [
            "test/**/*_spec.js",
            "packages/node_modules/*/test/**/*_spec.js"
        ],
        "rules": {
            "node/no-unpublished-require": 0,
            "no-unused-vars": ["error", { "varsIgnorePattern": "should|expect" }]
        }
    }]
};

module.exports = {
    env: {
        'es2021': true,
        'node': true
    },
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:@typescript-eslint/recommended-requiring-type-checking'],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    parserOptions: {
        project: true,
        tsconfigRootDir: __dirname,
    },
    root: true,
    rules: {
        'indent': [
            'error',
            4,
            { "SwitchCase": 1 }
        ],
        'linebreak-style': [
            'error',
            'unix'
        ],
        'quotes': [
            'error',
            'single'
        ],
        'semi': [
            'error',
            'always'
        ],
        '@typescript-eslint/restrict-template-expressions': 'off'
    },
    ignorePatterns: ['.eslintrc.cjs']
};
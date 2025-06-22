const { FlatCompat } = require("@eslint/eslintrc");
const nextPlugin = require("@next/eslint-plugin-next");
const reactPlugin = require("eslint-plugin-react");
const hooksPlugin = require("eslint-plugin-react-hooks");
const tseslint = require("typescript-eslint");

const compat = new FlatCompat();

module.exports = [
    ...tseslint.config({
        files: ["**/*.ts", "**/*.tsx"],
        extends: [
            ...tseslint.configs.recommended,
        ],
        languageOptions: {
            parserOptions: {
                project: true,
                tsconfigRootDir: __dirname,
            },
        },
    }),
    {
        files: ["**/*.ts", "**/*.tsx"],
        plugins: {
            "@next/next": nextPlugin,
            react: reactPlugin,
            "react-hooks": hooksPlugin,
        },
        rules: {
            ...nextPlugin.configs.recommended.rules,
            ...nextPlugin.configs["core-web-vitals"].rules,
            ...hooksPlugin.configs.recommended.rules,
            "@next/next/no-html-link-for-pages": "off",
        },
        settings: {
            react: {
                version: "detect"
            }
        }
    },
]; 
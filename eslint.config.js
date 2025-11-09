// import js from "@eslint/js";
// import globals from "globals";
// import tseslint from "typescript-eslint";
// import pluginReact from "eslint-plugin-react";
// import { defineConfig } from "eslint/config";

// export default defineConfig([
//   { files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"], plugins: { js }, extends: ["js/recommended"], languageOptions: { globals: globals.browser } },
//   tseslint.configs.recommended,
//   pluginReact.configs.flat.recommended,
// ]);

import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import typescriptEslintParser from '@typescript-eslint/parser';
import typescriptEslintPlugin from '@typescript-eslint/eslint-plugin';

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ['**/*.{js,mjs,cjs,ts}'] },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: process.cwd(),
      },
      parser: typescriptEslintParser,
    },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    ignores: [
      'node_modules/*', // ignore its content
      'build/**/*', // ignore all contents in and under `build/` directory but not the `build/` directory itself
      '.git/',
      'dist/',
    ],
  },
  {
    rules: {
      ...eslintPluginPrettier.configs.recommended.rules,
      'prettier/prettier': 'error',
      'no-unused-vars': 'warn',
      'no-undef': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      'arrow-parens': ['error', 'always'],
      'sort-vars': ['error', { ignoreCase: true }],
      'require-await': 'error', //Interdire les fonctions asynchrones qui n'ont pas d'expression await
      'no-unused-expressions': 'error', //Interdire les expressions inutilisées
      'no-return-assign': 'error', //Interdire les opérations d'affectation dans return les instructions
      'no-nested-ternary': 'error', //Interdire les expressions ternaires imbriquées
      'arrow-body-style': ['error', 'always'], //Exiger des accolades autour des corps de fonction fléchés
      semi: 'error',
      quotes: [
        'error',
        'single',
        {
          allowTemplateLiterals: true,
        },
      ],
      indent: [
        'error',
        2,
        {
          ObjectExpression: 'first',
          ArrayExpression: 1,
          CallExpression: { arguments: 'first' },
          StaticBlock: { body: 2 },
          MemberExpression: 1,
          outerIIFEBody: 'off',
          offsetTernaryExpressions: true,
        },
      ],
      camelcase: [
        'error',
        {
          properties: 'always',
          ignoreDestructuring: true,
        },
      ], // Ecriture des noms de variables en camelcase
      'prefer-destructuring': [
        'error',
        {
          array: true,
          object: true,
        },
      ], //Exiger une déstructuration des tableaux et/ou des objets
      'sort-imports': [
        'error',
        {
          ignoreCase: true,
          ignoreDeclarationSort: false,
          ignoreMemberSort: false,
          memberSyntaxSortOrder: ['none', 'all', 'single', 'multiple'],
          allowSeparatedGroups: false,
        },
      ],
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      'no-console': 'warn',
    },
    plugins: {
      '@typescript-eslint': typescriptEslintPlugin,
      prettier: eslintPluginPrettier,
    },
  },
];

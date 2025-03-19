import pluginJs from "@eslint/js";
import type { FlatConfig } from "@typescript-eslint/utils/ts-eslint";
import type { Linter } from "eslint";
import pluginReact from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  globalIgnores([".react-router/*"]),
  { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"] },
  {
    languageOptions: { globals: globals.browser },
    settings: { react: { version: "detect" } },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  pluginReact.configs.flat["jsx-runtime"],
  reactHooks.configs["recommended-latest"],
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
] satisfies FlatConfig.Config[] as Linter.Config[]);

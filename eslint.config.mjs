import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.typecheck.json"],
        tsconfigRootDir: import.meta.dirname
      }
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": ["error", { "prefer": "type-imports" }]
    }
  },
  {
    files: ["scripts/**/*.mjs"],
    rules: {
      "@typescript-eslint/no-var-requires": "off"
    }
  }
);

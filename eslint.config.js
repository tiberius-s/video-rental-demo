import eslintConfigPrettier from "eslint-config-prettier";
import neostandard from "neostandard";
import tseslint from "typescript-eslint";

const commonIgnores = [
  "**/dist/**",
  "**/node_modules/**",
  "**/coverage/**",
  "**/tsp-output/**",
  "**/*.tsp",
  "**/*.d.ts",
  "**/*.js.map",
  "**/*.ts.map",
  "packages/**/src/**/*.js",
  "packages/**/test/**/*.js",
];

// Keep config minimal: apply neostandard (with TS), then project-wide overrides,
// test-specific relaxations, and finally Prettier to own formatting rules.
export default tseslint.config(
  neostandard({ ts: true }),

  // Project-level defaults
  {
    ignores: commonIgnores,
    files: ["**/*.{ts,mts,cts}"],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.json", "./packages/*/tsconfig.json"],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "separate-type-imports" },
      ],
    },
  },

  // Test files: be more permissive
  {
    files: ["**/*.test.{js,ts}", "**/test/**/*.{js,ts}", "**/__tests__/**/*.{js,ts}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "no-console": "off",
    },
  },

  // Keep Prettier last so it can turn off stylistic ESLint rules
  eslintConfigPrettier,
);

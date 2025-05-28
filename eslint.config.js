import tseslint from "typescript-eslint";
import neostandard from "neostandard";
import eslintConfigPrettier from "eslint-config-prettier";

// Define common ignore patterns
const commonIgnores = [
  "**/dist/**",
  "**/node_modules/**",
  "**/coverage/**",
  "**/tsp-output/**",
  "**/*.tsp", // Ignore TypeSpec files completely
  "**/*.d.ts",
  "**/*.js.map",
  "**/*.ts.map",
  // Ignore compiled JS files that have corresponding TS files
  "packages/**/src/**/*.js",
  "packages/**/test/**/*.js",
];

export default tseslint.config(
  // Global ignores
  {
    ignores: commonIgnores,
  },

  // Neostandard configuration with TypeScript support
  ...neostandard({
    ts: true,
    ignores: commonIgnores,
  }),

  // Additional TypeScript configuration
  {
    files: ["**/*.{ts,mts,cts}"],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.json", "./packages/*/tsconfig.json"],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Essential overrides only
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "separate-type-imports" },
      ],
    },
  },

  // Test files configuration
  {
    files: ["**/*.test.{js,ts}", "**/test/**/*.{js,ts}", "**/__tests__/**/*.{js,ts}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-floating-promises": "off", // Tests often don't need to await promises
      "@typescript-eslint/require-await": "off",
      "no-console": "off",
    },
  },

  // Configuration files
  {
    files: ["**/*.config.{js,ts}", "**/.*rc.{js,ts}"],
    rules: {
      "@typescript-eslint/no-var-requires": "off",
      "@typescript-eslint/no-require-imports": "off",
      "no-console": "off",
    },
  },

  // Prettier configuration (should be last)
  eslintConfigPrettier,
);

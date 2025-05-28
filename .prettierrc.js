export default {
  printWidth: 100,
  plugins: ["@typespec/prettier-plugin-typespec"],
  overrides: [
    {
      files: "*.tsp",
      options: { parser: "typespec" },
    },
  ],
};

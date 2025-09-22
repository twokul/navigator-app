import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends(
    "next/core-web-vitals",
    "next/typescript",
    "prettier",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
  ),
  {
    ignores: ["node_modules/**", ".next/**", "out/**", "build/**", ".source/**", "next-env.d.ts"],
  },
  {
    rules: {
      "react/react-in-jsx-scope": "off",
    },
  },
];

export default eslintConfig;

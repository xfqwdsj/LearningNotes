import { globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import tseslint from "typescript-eslint";
const config = [
  ...nextVitals,
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": "error",
    },
  },
  globalIgnores([
    ".next/**",
    ".next-*/**",
    "dist/**",
    "public/**",
    ".generated/**",
    ".dev/**",
    "next-env.d.ts",
    "private-content/**",
  ]),
];

export default config;

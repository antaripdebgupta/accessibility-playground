import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import jsxA11y from "eslint-plugin-jsx-a11y";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      ...jsxA11y.flatConfigs.recommended.rules,
      "jsx-a11y/no-noninteractive-tabindex": [
        "error",
        {
          roles: ["tabpanel", "region", "separator"],
        },
      ],
      "no-console": ["error", { allow: ["warn", "error"] }],
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
  {
    files: ["scripts/**", "tests/**"],
    rules: {
      "no-console": "off",
    },
  },
  {
    files: ["src/components/workbench/SplitPane.tsx"],
    rules: {
      // WAI-ARIA 1.2: A separator with aria-valuenow is an interactive window splitter widget.
      // eslint-plugin-jsx-a11y classifies all separators as static/non-interactive structure,
      // which is a false positive for an accessible splitter with keyboard and pointer handlers.
      "jsx-a11y/no-noninteractive-element-interactions": "off",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "public/axe.min.js",
  ]),
]);

export default eslintConfig;

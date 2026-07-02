import { FlatCompat } from "@eslint/eslintrc";

/**
 * ESLint base config — dipakai oleh semua apps via @harmoni/config/eslint
 * Setiap app cukup import ini dan extend jika perlu
 */
const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

export default [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

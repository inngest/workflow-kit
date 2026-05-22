import nextPlugin from "eslint-config-next";
import nextTypescript from "eslint-config-next/typescript";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const config = [
  ...(Array.isArray(nextPlugin) ? nextPlugin : [nextPlugin]),
  ...(Array.isArray(nextCoreWebVitals) ? nextCoreWebVitals : [nextCoreWebVitals]),
  ...(Array.isArray(nextTypescript) ? nextTypescript : [nextTypescript]),
  {
    ignores: [".next/**", "node_modules/**", "supabase/**"],
  },
];

export default config;

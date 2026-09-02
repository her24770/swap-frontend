import coreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const config = [
    { ignores: [".next/**", "out/**", "node_modules/**", "next-env.d.ts"] },
    ...coreWebVitals,
    ...nextTypescript,
];

export default config;

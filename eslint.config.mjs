// eslint-config-next 16 ships native flat config — no FlatCompat wrapper needed
// (wrapping it produces a circular-reference crash in the config validator).
import coreWebVitals from "eslint-config-next/core-web-vitals"
import typescript from "eslint-config-next/typescript"

const config = [
  { ignores: [".next/**", "node_modules/**", "out/**"] },
  ...coreWebVitals,
  ...typescript,
]

export default config

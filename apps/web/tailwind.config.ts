import type { Config } from "tailwindcss";
import uiPreset from "@packages/ui/tailwind";

const config: Config = {
  presets: [uiPreset],
  content: [
    "./app/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
};

export default config;

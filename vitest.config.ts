import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

const config = defineConfig({
  test: {},
  plugins: [tsconfigPaths()],
});

export default config;

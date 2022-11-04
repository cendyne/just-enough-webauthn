import {defineConfig} from 'vitest/config';

export default defineConfig({
  test: {
    exclude: [
      "src/common.test.js",
      "node_modules/**"
    ]
  },
});

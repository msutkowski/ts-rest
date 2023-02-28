import { readFileSync } from 'node:fs';
import { parse } from 'toml';
import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

const config = parse(readFileSync('./wrangler.toml', 'utf8'));

export default defineConfig({
  plugins: [tsconfigPaths()],
  define: {
    bindings: JSON.stringify(config.vars),
  },
  test: {
    environment: 'miniflare',
  },
});

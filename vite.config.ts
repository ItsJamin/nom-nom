import { defineConfig } from 'vite';

export default defineConfig({
  root: './src',
  build: {
    outDir: '../build',
    minify: false,
    emptyOutDir: false,
  },
});

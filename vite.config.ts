import { resolve } from 'path';
import { readFileSync } from 'fs';
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

const PackageJson = JSON.parse(readFileSync(resolve(__dirname, './package.json'), { encoding: 'utf-8' })) as { dependencies: Record<string, string> };

export default defineConfig({
  build: {
    lib: {
      entry: './lib/main.ts',
      name: '@phifans/audio',
      formats: [ 'es' ],
      fileName: 'phifans-audio',
    },
    rollupOptions: {
      external: Object.keys(PackageJson.dependencies),
    },
  },
  plugins: [
    dts({
      rollupTypes: true,
      include: [ './lib/**/*' ],
      exclude: [ './src/**/*' ],
    }),
  ],
})

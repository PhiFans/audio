import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  build: {
    lib: {
      entry: './lib/main.ts',
      name: '@phifans/audio',
      formats: [ 'es' ],
      fileName: 'phifans-audio',
    },
    rollupOptions: {
      external: [ 'audio-decode' ],
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

// @ts-check
import {defineConfig} from 'astro/config'

import tailwindcss from '@tailwindcss/vite'

// https://astro.build/config
export default defineConfig({
  site: 'https://xxxyixuan.github.io',
  // 将来页面变多、需要复用 CSS 缓存时可改回 'auto'。
  build: {
    inlineStylesheets: 'always',
  },
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    shikiConfig: {
      themes: {light: 'github-light', dark: 'github-dark'},
    },
  },
})

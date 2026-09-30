// @ts-check
import {defineConfig} from 'astro/config'

import tailwindcss from '@tailwindcss/vite'
import pagefind from 'astro-pagefind'
import mdx from '@astrojs/mdx'

// https://astro.build/config
export default defineConfig({
  site: 'http://www.wangyuhang.net',
  // 将来页面变多、需要复用 CSS 缓存时可改回 'auto'。
  build: {
    inlineStylesheets: 'always',
  },
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    shikiConfig: {
      themes: {light: 'material-theme-lighter', dark: 'material-theme-darker'},
    },
  },
  integrations: [pagefind({indexConfig: {forceLanguage: 'zh-cn'}}), mdx()],
})

// @ts-check
import {defineConfig} from 'astro/config'

import tailwindcss from '@tailwindcss/vite'
import pagefind from 'astro-pagefind'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'

// https://astro.build/config
export default defineConfig({
  // 站点绝对地址：canonical / sitemap / RSS 里的链接都由它拼出来。
  // ⚠️ 必须是线上真正对外的主域名，且用 https —— 写 http 会让
  // sitemap 与 canonical 全部指向 http，被搜索引擎当作另一个站点。
  site: 'https://www.wangyuhang.net',
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
  integrations: [
    pagefind({indexConfig: {forceLanguage: 'zh-cn'}}),
    mdx(),
    sitemap({
      // 只收录真正的可索引页面：
      //   · /search/ 是纯客户端检索页，正文为空且带 noindex，收录没有意义
      //   · /404 是错误页，任何情况下都不该进索引
      filter: (page) => !page.includes('/search/') && !page.includes('/404'),
    }),
  ],
})

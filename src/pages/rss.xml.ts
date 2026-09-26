import type {APIRoute} from 'astro'
import {getSortedPosts} from '@src/utils/posts.ts'
import {SITE_DESCRIPTION, SITE_NAME} from '@src/config.ts'

/**
 * RSS 2.0 订阅源：构建时生成 /rss.xml
 *
 * 手写 XML 而不引 @astrojs/rss —— 站点目前只有 astro + tailwind 两个依赖，
 * 为这点内容多装一个包不划算。字段按官方 @astrojs/rss 的输出语义对齐：
 *   · 全文正文走 <content:encoded>，并在 <rss> 上声明 xmlns:content 命名空间
 *     （官方也是「有 content 才加命名空间」）
 *   · 正文 HTML 用实体转义，不用 CDATA —— 与官方实现一致，也免去处理 `]]>` 边界
 *   · <guid> 取文章永久链接并标 isPermaLink="true"
 *
 * 链接尾斜杠与 astro.config.mjs 的 trailingSlash 保持一致：本项目未显式配置
 * （默认 'ignore'），构建产物是 dist/posts/<id>/index.html，故链接带尾斜杠。
 * 若将来改成 trailingSlash: 'never'，这里要去掉 `${post.id}/` 的尾斜杠。
 */

/** XML 1.0 不允许的控制字符（\t \n \r 除外）会让整份订阅源解析失败 */
const stripInvalidXmlChars = (value: string) =>
    value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g, '')

const XML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
}

/** XML 文本节点转义（单次 replace，不存在二次转义问题） */
const escapeXml = (value: string) =>
    stripInvalidXmlChars(value).replace(/[&<>"']/g, (char) => XML_ENTITIES[char]!)

/**
 * 把正文 HTML 里的站内链接、图片补成绝对地址。
 * RSS 阅读器没有「当前站点」的概念，`/posts/x/` 这类相对路径会解析失败；
 * `(?!\/)` 用来放过 `//example.com` 形式的协议相对 URL。
 */
const absolutize = (html: string, origin: string) =>
    html.replace(/(\s)(href|src)="\/(?!\/)/g, `$1$2="${origin}/`)

export const GET: APIRoute = async ({site}) => {
  const origin = site?.origin ?? ''
  const posts = await getSortedPosts()
  const now = new Date()

  const items = posts
      .map((post) => {
        const url = `${origin}/posts/${post.id}/`
        const lines = [
          '    <item>',
          `      <title>${escapeXml(post.data.title)}</title>`,
          `      <link>${escapeXml(url)}</link>`,
          `      <guid isPermaLink="true">${escapeXml(url)}</guid>`,
          `      <pubDate>${post.data.pubDate.toUTCString()}</pubDate>`,
        ]

        // 摘要：复用列表页那份 excerpt；没写就省掉该标签（title 已满足必填要求）
        if (post.data.excerpt) {
          lines.push(`      <description>${escapeXml(post.data.excerpt)}</description>`)
        }

        // 全文：glob loader 默认会预渲染 markdown，rendered.html 直接可用
        const html = post.rendered?.html
        if (html) {
          lines.push(
              `      <content:encoded>${escapeXml(absolutize(html, origin))}</content:encoded>`,
          )
        }

        // 标签 → RSS 的 category，一个标签一个元素
        for (const tag of post.data.tags) {
          lines.push(`      <category>${escapeXml(tag)}</category>`)
        }

        lines.push('    </item>')
        return lines.join('\n')
      })
      .join('\n')

  // lastBuildDate 的语义是「本文件生成时间」，pubDate 才是「内容更新时间」——
  // 旧实现把两者都填成最新文章日期，语义是错的。
  const lastBuildDate = now.toUTCString()
  const pubDate = posts[0]?.data.pubDate.toUTCString() ?? lastBuildDate

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${escapeXml(`${origin}/`)}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>zh-CN</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <pubDate>${pubDate}</pubDate>
    <generator>Astro</generator>
    <docs>https://www.rssboard.org/rss-specification</docs>
    <ttl>60</ttl>
    <atom:link href="${escapeXml(`${origin}/rss.xml`)}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`

  return new Response(xml, {
    headers: {'Content-Type': 'application/xml; charset=utf-8'},
  })
}

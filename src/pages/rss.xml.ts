import type {APIRoute} from 'astro'
import {getSortedPosts} from '@src/utils/posts.ts'
import {SITE_DESCRIPTION, SITE_NAME} from '@src/config.ts'

/**
 * RSS 2.0 订阅源：构建时生成 /rss.xml
 *
 * 手写 XML 而不引 @astrojs/rss —— 站点目前只有 astro + tailwind 两个依赖，
 * 为这点内容多装一个包不划算。
 */

const escapeXml = (value: string) =>
    value.replace(/[<>&'"]/g, (char) => {
      switch (char) {
        case '<':
          return '&lt;'
        case '>':
          return '&gt;'
        case '&':
          return '&amp;'
        case "'":
          return '&apos;'
        default:
          return '&quot;'
      }
    })

export const GET: APIRoute = async ({site}) => {
  const origin = site?.origin ?? ''
  const posts = await getSortedPosts()

  const items = posts
      .map((post) => {
        const url = `${origin}/posts/${post.id}/`
        return [
          '    <item>',
          `      <title>${escapeXml(post.data.title)}</title>`,
          `      <link>${escapeXml(url)}</link>`,
          `      <guid isPermaLink="true">${escapeXml(url)}</guid>`,
          `      <pubDate>${post.data.pubDate.toUTCString()}</pubDate>`,
          `      <description>${escapeXml(post.data.excerpt ?? '')}</description>`,
          '    </item>',
        ].join('\n')
      })
      .join('\n')

  const lastBuildDate = (posts[0]?.data.pubDate ?? new Date()).toUTCString()

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <link>${escapeXml(`${origin}/`)}</link>
    <atom:link href="${escapeXml(`${origin}/rss.xml`)}" rel="self" type="application/rss+xml"/>
    <language>zh-CN</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
${items}
  </channel>
</rss>
`

  return new Response(xml, {
    headers: {'Content-Type': 'application/xml; charset=utf-8'},
  })
}

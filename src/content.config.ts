import {defineCollection} from 'astro:content'
import {z} from 'astro/zod'
import {glob} from 'astro/loaders'

/**
 * 文章集合
 *
 * 内容目录指向项目根目录的 contents/posts/（与 src 平级，方便把写作素材
 * 和站点代码分开管理）。文件名即 URL 片段：
 *   contents/posts/astro-notes.md  →  /posts/astro-notes/
 */
const posts = defineCollection({
  loader: glob({pattern: '**/*.md', base: './contents/posts'}),
  schema: z.object({
    title: z.string(),
    /** 发布日期：写字符串也会被自动转成 Date */
    pubDate: z.coerce.date(),
    /** 列表页展示的摘要；不写则列表里留空 */
    excerpt: z.string().optional(),
    tags: z.array(z.string()).default([]),
    /** 草稿：为 true 时不出现在任何列表中 */
    draft: z.boolean().default(false),
  }),
})

export const collections = {posts}

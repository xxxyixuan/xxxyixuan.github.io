import {defineCollection} from 'astro:content'
import {z} from 'astro/zod'
import {glob} from 'astro/loaders'

/**
 * 文章集合
 *
 * 内容目录指向项目根目录的 contents/posts/（与 src 平级，写作素材与站点代码
 * 在目录上分开，随站点仓库一起提交）。文件名即 URL 片段：
 *   contents/posts/astro-notes.md  →  /posts/astro-notes/
 */
const posts = defineCollection({
  loader: glob({pattern: '**/*.{md,mdx}', base: './contents/posts'}),
  schema: z.object({
    title: z.string(),
    /** 发布日期：写字符串也会被自动转成 Date */
    pubDate: z.coerce.date(),
    /**
     * 列表页展示的摘要；不写或留空都算没有，列表里留空。
     * 必须收 null：YAML 里只写键不给值（`excerpt:`）解析出来是 null 而不是 undefined，
     * 只写 .optional() 会让这种「占位空值」直接把构建打挂（报错还写成 received "object"，
     * 因为 typeof null === 'object'）。
     */
    excerpt: z.string().nullish(),
    tags: z.array(z.string()).default([]),
    /** 草稿：为 true 时不出现在任何列表中 */
    draft: z.boolean().default(false),
  }),
})

export const collections = {posts}

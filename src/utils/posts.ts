import {type CollectionEntry, getCollection} from 'astro:content'
import type {PostCard} from '@components/PostListItem.astro'

/**
 * 文章数据的公共处理：首页、文章列表页、详情页共用。
 * 内容集合条目统一映射成 PostCard，交给 PostListItem 渲染。
 */

/** 获取文章字数 */
export const getWordCount = (body?: string) => {
  if (!body) return 0

  // 剥离代码块、行内代码、图片、链接 URL、Markdown 标记
  let text = body
      .replace(/```[\s\S]*?```/g, '')        // 围栏代码块
      .replace(/`[^`]*`/g, '')               // 行内代码
      .replace(/!\[.*?]\(.*?\)/g, '')        // 图片
      .replace(/\[([^\]]*)]\([^)]*\)/g, '$1')// 链接：只保留可见文字
      .replace(/^#{1,6}\s+/gm, '')           // 标题标记
      .replace(/^[-*+]\s+/gm, '')            // 无序列表标记
      .replace(/^\d+\.\s+/gm, '')            // 有序列表标记
      .replace(/^>\s+/gm, '')                // 引用标记
      .replace(/[*_~]/g, '')                 // 强调标记

  // 字符数（含标点、空格）
  return [...text].length
}

/** 正文估算阅读时长 */
export const estimateMinutes = (body?: string) => {
  if (!body) return 0

  // 提取代码块为后面的统计做准备
  const codeBlocks: string[] = body.match(/```[\s\S]*?```/g) ?? []
  const codeLines = codeBlocks.reduce((sum, block) => {
    const lines = block
        .replace(/```[\s\S]*?\n/, '') // 去掉开头的 ```
        .replace(/```$/, '')          // 去掉结尾的 ```
        .split('\n')
        .filter(line => line.trim() !== '')
    return sum + lines.length
  }, 0)

  // 去掉代码块后的正文
  const textWithoutCode = body.replace(/```[\s\S]*?```/g, '')

  // 统计图片数量
  const images = (body.match(/!\[[^\]]*]\([^)]*\)/g) ?? []).length

  // 统计正文中的汉字和英文词
  const cjk = (textWithoutCode.match(/[\u4e00-\u9fa5]/g) ?? []).length
  const words = (textWithoutCode.match(/[a-zA-Z0-9]+/g) ?? []).length

  // 阅读速度
  // 中文-350字/分钟，英文-200词/分钟，代码-4秒/行，图片-8秒/张
  const CJK_SPEED = 350
  const WORD_SPEED = 200
  const CODE_SECOND_PER_LINE = 4
  const IMAGE_SECOND = 8

  const seconds =
      (cjk / CJK_SPEED) * 60 +
      (words / WORD_SPEED) * 60 +
      codeLines * CODE_SECOND_PER_LINE +
      images * IMAGE_SECOND

  const minutes = Math.ceil(seconds / 60)

  return Math.max(1, minutes)
}

/** 日期格式化*/
export const formatDate = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** 将内容集合条目转换为文章卡片信息 */
export const toCard = (entry: CollectionEntry<'posts'>): {
  id: string;
  title: any;
  href: string;
  date: string;
  datetime: any;
  excerpt: string;
  tags: any;
  wordCount: number;
  minutes: number
} => ({
  id: entry.id,
  title: entry.data.title,
  href: `/posts/${entry.id}/`,
  date: formatDate(entry.data.pubDate),
  datetime: entry.data.pubDate.toISOString(),
  excerpt: entry.data.excerpt ?? '',
  tags: entry.data.tags,
  wordCount: getWordCount(entry.body),
  minutes: estimateMinutes(entry.body),
})

/** 已发布的文章，按发布日期倒序（草稿不参与） */
export const getSortedPosts = async () => {
  const entries = await getCollection('posts', ({data}) => !data.draft)
  return entries.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
}

/** 从文章聚合标签：按文章数降序，同数按名称排 */
export const collectTags = (cards: PostCard[]): { tag: string; count: number }[] => {
  const counter = new Map<string, number>()
  for (const card of cards) {
    for (const tag of card.tags) {
      counter.set(tag, (counter.get(tag) ?? 0) + 1)
    }
  }
  return [...counter.entries()]
      .map(([tag, count]) => ({tag, count}))
      .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, 'zh'))
}

/** 取某个标签下的文章 */
export const filterByTag = (cards: PostCard[], tag: string): PostCard[] =>
    cards.filter((card) => card.tags.includes(tag))

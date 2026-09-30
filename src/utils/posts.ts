import {type CollectionEntry, getCollection} from 'astro:content'
import getReadingTime from 'reading-time'
import type {PostCard} from '@components/PostListItem.astro'

/**
 * 文章数据的公共处理：首页、文章列表页、详情页共用。
 * 内容集合条目统一映射成 PostCard，交给 PostListItem 渲染。
 */

/**
 * 把正文源码剥成纯文本：去掉代码块、行内代码、图片、链接 URL 与 Markdown 标记。
 * 字数与时长都只认这份文本，避免出现「一个把标点空格算进去、另一个不算」这种对不上的情况。
 */
const toPlainText = (body?: string) => {
  if (!body) return ''

  return body
      .replace(/```[\s\S]*?```/g, '')        // 围栏代码块
      .replace(/`[^`]*`/g, '')               // 行内代码
      .replace(/!\[.*?]\(.*?\)/g, '')        // 图片
      .replace(/\[([^\]]*)]\([^)]*\)/g, '$1')// 链接：只保留可见文字
      .replace(/^#{1,6}\s+/gm, '')           // 标题标记
      .replace(/^[-*+]\s+/gm, '')            // 无序列表标记
      .replace(/^\d+\.\s+/gm, '')            // 有序列表标记
      .replace(/^>\s+/gm, '')                // 引用标记
      .replace(/[*_~]/g, '')                 // 强调标记
}

/**
 * 正文统计：一次解析同时给出字数与分钟数。
 *
 * 分词交给 reading-time —— 一个汉字算一个词、一个英文单词算一个词，中文标点不计入；
 * 分钟数由它按 200 词/分折算。两个数出自同一次解析，所以天然一致。
 */
const analyze = (body?: string) => getReadingTime(toPlainText(body))

/** 分钟数向上取整并保底 1；正文里一个词都没有时返回 0 */
const toMinutes = ({words, minutes}: {words: number; minutes: number}) =>
    words === 0 ? 0 : Math.max(1, Math.ceil(minutes))

/** 获取文章字数 */
export const getWordCount = (body?: string) => analyze(body).words

/** 正文估算阅读时长（分钟） */
export const estimateMinutes = (body?: string) => toMinutes(analyze(body))

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
} => {
  // 只解析一次：字数和时长必须是同一份统计出来的
  const stats = analyze(entry.body)

  return {
    id: entry.id,
    title: entry.data.title,
    href: `/posts/${entry.id}/`,
    date: formatDate(entry.data.pubDate),
    datetime: entry.data.pubDate.toISOString(),
    excerpt: entry.data.excerpt ?? '',
    tags: entry.data.tags,
    wordCount: stats.words,
    minutes: toMinutes(stats),
  }
}

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

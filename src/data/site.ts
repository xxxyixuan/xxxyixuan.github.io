import type {IconName} from '@src/data/iconPaths.ts'

/**
 * 站点导航与社交数据 —— Header / Footer / about 共用同一份，避免多处维护
 * （改一个链接只需要改这里）。
 */

export type NavLink = {
  label: string
  href: string
}

export type SocialLink = {
  label: string
  href: string
  icon: IconName
  /** 展示用的账号或地址文本：about 页会显示，Footer 只用图标 */
  value?: string
}

/** 主导航 */
export const NAV_LINKS: NavLink[] = [
  {label: '首页', href: '/'},
  {label: '文章', href: '/posts/'},
  {label: '标签', href: '/tags/'},
  {label: '项目', href: '/projects/'},
  {label: '关于', href: '/about/'},
]

/** 页脚导航：首页与标签在 Header 已有入口，页脚不重复放 */
const FOOTER_NAV_HREFS = ['/posts/', '/projects/', '/about/']
export const FOOTER_NAV_LINKS: NavLink[] = NAV_LINKS.filter(({href}) =>
    FOOTER_NAV_HREFS.includes(href),
)

/** 社交与订阅入口：Footer 全部展示 */
export const SOCIAL_LINKS: SocialLink[] = [
  {label: 'GitHub', value: '@xxxyixuan', href: 'https://github.com/xxxyixuan', icon: 'github'},
  {label: 'Gitee', value: '@xxxyixuan', href: 'https://gitee.com/xxxyixuan', icon: 'gitee'},
  {label: 'Email', value: 'wyh030531@gmail.com', href: 'mailto:wyh030531@gmail.com', icon: 'email'},
  {label: 'RSS', value: '/rss.xml', href: '/rss.xml', icon: 'rss'},
]

/** about 页的社交入口：RSS 是站内订阅源、页脚已有入口，关于页不重复放 */
export const ABOUT_SOCIAL_LINKS: SocialLink[] = SOCIAL_LINKS.filter(({icon}) => icon !== 'rss')

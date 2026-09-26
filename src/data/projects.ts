/**
 * 开源项目 —— /about 与 /projects 共用同一份数据，避免两处维护。
 */
export type Project = {
  name: string
  desc: string
  lang: string[]
  href: string
  host: string
}

export const projects: Project[] = [
  {
    name: 'uvman',
    desc: 'uvman 是一个轻量级、插件化的开发工具版本管理器。它统一了 Node.js、Python等主流开发工具的安装与切换流程，让你用同一套命令管理所有工具。',
    lang: ['Rust'],
    href: 'https://github.com/xxxyixuan/uvman',
    host: 'GitHub',
  },
  {
    name: 'uvman-plugin',
    desc: 'uvman 的插件仓库：每个 TOML 文件声明一个工具的下载源与安装方案。',
    lang: ['TOML'],
    href: 'https://github.com/xxxyixuan/uvman-plugin',
    host: 'GitHub',
  },
]

# 逸瑄的博客

记录学习过程中的踩坑复盘与原理思考，也写一些生活随笔。基于 Astro 构建，部署在 Cloudflare Workers。

🔗 **在线访问：** [http://www.wangyuhang.net](http://www.wangyuhang.net)

（同一份站点另有 GitHub Pages 同步发布：[https://xxxyixuan.github.io](https://xxxyixuan.github.io)）

> 写下来才算真学会。

## 简介

个人博客，以技术路线为主 —— 记录学习路上的踩坑记录、原理思考和能照着做出来的教程，
同时也放一些生活里的随笔。支持深色 / 浅色主题切换，内置基于 Pagefind 的站内全文搜索（支持中文分词）。

## 技术栈

- **框架**：Astro 7（静态输出）
- **样式**：Tailwind CSS 4（只用到 preflight）+ `<style lang="scss">`（Sass）
- **内容**：Content Collections + glob loader；正文放 `contents/posts/`，配图放 `public/images/posts/`（都在本仓库）
- **代码高亮**：Shiki 双主题（`material-theme-lighter` / `material-theme-darker`，跟随站点亮暗主题）
- **搜索**：Pagefind（`astro-pagefind` 集成，构建期自动建索引，中文分词）
- **包管理**：pnpm
- **部署**：Cloudflare Workers（`yixuan-blog`）· 推送 `main` 自动构建部署

## 内容

| 类型 | 目录 | 说明 |
| --- | --- | --- |
| 文章 | `contents/posts/` | 技术笔记与生活随笔 |
| 配图 | `public/images/posts/<slug>/` | 目录名与文章 slug 同名 |

文章文件名即 URL 片段：`contents/posts/astro-intro.md` → `/posts/astro-intro/`。
slug 用**英文小写 + 短横线**，文件名不要带空格和中文。

正文格式支持 `.md` 与 `.mdx` 两种，frontmatter 完全一致。`.mdx` 额外可用组件与 JSX 表达式：

```mdx
import Icon from '../../src/components/Icon.astro'

export const marker = '可以插进正文的变量'

<Icon icon="arrow-left" size="14px" color="currentColor" />

正文里这样取值：{marker}，表达式也行：{2 ** 5}
```

⚠️ 同一目录下**不能有同名的 `.md` 与 `.mdx`**（去掉后缀会得到同一个 id，构建报错）。
⚠️ `contents/` 同时是 Obsidian vault，而 Obsidian 不认 `.mdx` —— 写 `.mdx` 文章请用 VS Code
（装官方 MDX 扩展），Obsidian 里那些文件只会显示成普通文本。

内容提交统一用 `content:` 前缀（如 `content: 新增开站文`），站点代码用 `feat:` / `fix:` / `docs:` 等 ——
这样 `git log -- src/` 只看站点开发记录时，历史一目了然。

frontmatter 只用到这四个字段：

```yaml
---
title: 标题
pubDate: 2026-09-26
excerpt: 列表页展示的摘要
tags: [Astro, 前端]
---
```

正文里引用配图用站点绝对路径：`![说明](/images/posts/astro-intro/01-what-is-astro.png)`。

## 项目结构

```text
contents/posts/                # Markdown 文章（与 src 平级，随仓库一起提交）
public/
  avatar.png                   # 头像
  favicon.svg                  # 站点图标
  images/posts/<slug>/         # 文章配图
src/
  config.ts                    # 站点常量（站名 / 简介 / 名字）
  content.config.ts            # 文章集合 schema
  layouts/PageLayout.astro     # 全站唯一布局 + :root 尺寸变量
  components/                  # Header / Footer / Icon / PostListItem / SectionHeading
  pages/                       # index / about / 404 / posts / tags / projects / search / rss.xml.ts
  data/iconPaths.ts            # 图标路径字典（256×256 viewBox）
  data/projects.ts             # 开源项目数据（/about 与 /projects 共用）
  data/site.ts                 # 导航 + 社交链接
  utils/posts.ts               # 字数 / 阅读时长 / 日期 / 标签等公共处理
  styles/global.css            # 主题变量 + .prose 文章排版
.github/workflows/deploy.yml   # GitHub Pages 同步发布（见「部署」）
```

## 本地开发

```bash
git clone <repo-url>
pnpm install

pnpm dev       # 开发服务器 http://localhost:4321
pnpm build     # 构建到 dist/，并自动生成搜索索引
pnpm preview   # 预览构建产物
pnpm fmt       # Prettier 格式化
```

### 关于搜索

搜索索引是**构建产物**：`astro-pagefind` 集成在 `astro:build:done` 钩子里自动对 `dist/` 建索引，
写入 `dist/pagefind/`，随站点一起发布 —— **部署时不需要额外的构建命令**。

⚠️ 因此**首次 `pnpm dev` 之前需要先跑一次 `pnpm build`**，否则搜索页会提示「索引尚未生成」。
集成会用 sirv 把 `/pagefind/*` 代理到上次构建的产物目录，所以 build 过一次之后，dev 模式下也能搜索。

## 写文章

写文章 = 改 `contents/posts/<slug>.md`（配图放 `public/images/posts/<slug>/`），提交推送即可：

```bash
# 新增 / 编辑 contents/posts/<slug>.md
git add contents/posts/<slug>.md
git commit -m "content: 新增 XX 文章"
git push                     # 推送 main 后自动构建部署
```

- 想本地预览：`pnpm dev`
- 提交信息用 `content:` 前缀，与站点开发提交区分；想在文章列表里隐藏用 `draft: true`

## 部署

站点部署在 **Cloudflare Workers**（`yixuan-blog`，配置见 `wrangler.jsonc`），主地址
**[http://www.wangyuhang.net](http://www.wangyuhang.net)**（`blog.wangyuhang.net` 也指向同一个 Worker）：

- 推送到 `main` 分支 → Cloudflare 自动构建并部署（构建命令 `pnpm run build`，部署命令 `npx wrangler deploy`）

`.github/workflows/deploy.yml`（GitHub Actions → GitHub Pages）**保留并同步发布**：
推送 `main` 时同样会构建一份部署到 [https://xxxyixuan.github.io](https://xxxyixuan.github.io)。
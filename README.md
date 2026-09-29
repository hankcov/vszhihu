# 💻 VSCode Zhihu (知乎 VS Code 皮肤)

![Version](https://img.shields.io/badge/version-1.0.3-blue.svg)
![Manifest](https://img.shields.io/badge/Manifest-V3-green.svg)
![License](https://img.shields.io/badge/license-MIT-orange.svg)
[![GitHub stars](https://img.shields.io/github/stars/hankcov/vszhihu?style=social)](https://github.com/hankcov/vszhihu)

**VSCode Zhihu** 是一款突破性的 Chrome / Edge 浏览器插件，能将知乎（zhihu.com）全量重构为现代化的 **VS Code 编辑器界面**。

无论是在办公室摸鱼、学习技术，还是享受沉浸式的代码化阅读体验，VSCode Zhihu 都能让您以极致优雅的开发者视角浏览知乎！

---

## ✨ 核心特性

- 🎨 **VS Code 经典 IDE 布局**：完整还原左侧 Activity Bar（活动栏）、Sidebar Explorer（文件树）、内置多标签页（Tab Bar）、代码行号（Line Numbers）及底部 Status Bar（状态栏）。
- 🥷 **极致伪装与纯代码 Title (Stealth Mode & Code Titles)**：
  - 浏览器 Tab 页标题及内置标签页文件名**全量转换为纯 ASCII 代码文件名**（如 `question_20556808.ts`、`article_20659198.ts`、`recommend.ts`），**绝不出任何中文字样**。
  - 双重 `MutationObserver` 结合定时锁定机制，强力锁定官方 VS Code Favicon 及网页 Title，彻底拦截知乎 SPA/WebSocket 异步消息对标题的篡改。
- 📝 **代码化内容渲染与 CSS 干净清洗**：
  - 知乎首页推荐、全网热榜、问题回答及专栏文章均被智能格式化为结构优雅的 TypeScript / JSON 代码块。
  - 全量剥离知乎 Emotion / Styled-components 的内嵌 `<style>` 标签与 `.css-1od93p9{...}` 样式声明，输出零噪点干净正文。
- 🖼️ **回答配图占位符与悬停预览 (Image Hover Preview)**：
  - 回答正文中的图片以注释风占位符呈现（如 `// 📷 图片(picx.zhimg.com/v2-xxx_r.jpg)`），**鼠标悬停即在旁侧弹出原图预览，移开即消失**；图片带 `figcaption` 时同步渲染 `// 图注: …`。
  - 同一张图的多 URL 变体（跨域名 / 宽度前缀 `/50/` / 尺寸后缀 `_r`、`_720w` / 查询串）按内容 hash 自动归一去重，绝无重复占位符。
- 📋 **回答元数据与真实标题 (Answer Metadata)**：
  - 每条回答头部输出 `Votes | Comments | Time`（创作/更新时间 `createdAt`）。
  - 问题页展示真实问题标题：回答 API 直出标题 + 非阻塞标题回填，标题请求不再拖慢或卡住正文加载。
- ⚡ **单回答页极速加载 (Single-answer Fast Path)**：
  - `/answer/…` 链接优先直连知乎回答 API 秒出正文（API 失败自动回退 HTML → 后台抓取）。
  - 单回答页不触发无限滚动，翻阅全部回答请经「查看全部回答」按钮进入问题页分页。
- 🔍 **首页作者昵称精准提取**：
  - 优先取个人主页链接（`/people/`）与 `AuthorInfo`，无作者节点时从「作者名：摘要…」前缀智能识别，绝不会误取标题为作者。
- 🔄 **API 级动态无限滚动 (Answer Stream Pagination)**：
  - 滚动到底部时自动通过知乎 API 动态分页拉取后续回答（包含完整正文），解决知乎 SSR 初始只包含 2 条回答的问题。
- 💬 **VS Code 终端评论面板 (Terminal Comments Panel)**：
  - 点击评论自动唤起底部的 VS Code 终端面板，支持二级嵌套回复（`nestedReplies`）展开，并具备 DOM 重绘持久化保障，不会闪退或被覆盖。
- 🙈 **一键摸鱼老板键 (Stealth Boss Key)**：
  - 按下 <kbd>Alt</kbd> + <kbd>V</kbd>（或 <kbd>Option</kbd> + <kbd>V</kbd>）瞬间将屏幕伪装为 100% 逼真的现代 C++ 线程池源码。
- ⚡ **命令面板 (Command Palette)**：
  - 按下 <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd>（Windows：<kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd>）或 <kbd>F1</kbd> 唤起命令面板，支持模糊搜索知乎问题、快速跳转路由及切换主题。
- 🎨 **多款经典 VS Code 主题**：
  - **VS Code Dark+**（默认暗黑主题）
  - **One Dark Pro**
  - **Monokai**
  - **Light Modern**（浅色亮色模式）

---

## 🚀 安装指引

### 开发者模式本地安装
1. **下载源码**：克隆或下载本仓库至本地文件夹：
   ```bash
   git clone https://github.com/hankcov/vszhihu.git
   ```
2. **打开 Chrome 扩展管理**：
   在浏览器地址栏输入 `chrome://extensions` 并按回车。
3. **开启开发者模式**：
   勾选右上角的 **“开发者模式” (Developer mode)** 开关。
4. **加载插件**：
   点击左上角的 **“加载已解压的扩展程序” (Load unpacked)** 按钮，选择本项目文件夹目录 `/vszhihu`。
5. **开始使用**：
   打开 [https://www.zhihu.com](https://www.zhihu.com) 或任意知乎问题/专栏文章页面，即可享受 VS Code 风格！

---

## ⌨️ 快捷键指南

| 快捷键 | 功能描述 |
| :--- | :--- |
| <kbd>Alt</kbd> + <kbd>V</kbd> (或 <kbd>Option</kbd> + <kbd>V</kbd>) | **摸鱼老板键**：瞬间切换/退出伪装 C++ 源码 |
| <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd>（Windows：<kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd>）/ <kbd>F1</kbd> | **命令面板**：搜索知乎、切换主题、跳转路由 |
| **点击代码内的 URL / 标题** | **内置新标签页打开**：直接在 VS Code 标签页中加载渲染 |
| **点击 `💬 XX 评论`** | **终端评论**：唤起底部 Terminal 面板查看评论及回复 |
| **悬停 `// 📷 图片(…)` 占位符** | **图片预览**：旁侧弹出原图预览，移开鼠标即消失 |

---

## 📂 项目结构

```text
vszhihu/
├── manifest.json         # Manifest V3 扩展配置文件 (v1.0.3)
├── background.js          # 后台 Service Worker
├── content.js             # Content Script 入口脚本（DOM 签名监听与增量应用）
├── initial-hide.css       # 预加载期防闪烁样式
├── PRIVACY_POLICY.md      # 隐私政策
├── README.md              # 项目说明文档
├── styles/
│   ├── vscode.css         # VS Code 界面主布局、组件样式与图片悬停预览
│   └── themes.css         # 颜色主题定义 (Dark+, One Dark, Monokai, Light)
├── scripts/
│   ├── preload.js         # document_start 零闪烁预加载脚本与标题/图标锁
│   ├── parser.js          # 知乎 DOM 解析、图片/图注标记、CSS 清洗与 TypeScript 格式化引擎
│   ├── vscode-ui.js       # VS Code UI 渲染、API 触底分页、Terminal 评论面板与图片悬停预览
│   ├── favicon.js         # VS Code Favicon 注入与维持
│   └── command-palette.js # Cmd+Shift+P / Ctrl+Shift+P 命令面板模块
├── popup/                 # 扩展控制弹窗 UI
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
└── icons/                 # 扩展图标 (16px, 48px, 128px)
```

---

## 🛠 调试与性能日志

- 打开 DevTools Console，在过滤框输入 **`perf`**，即可查看 `[VSCode-Zhihu][perf]` 前缀日志：
  - 各阶段耗时：解析 / 渲染 / API 请求（`took / n / avg / max`）；
  - 优化命中标记：`mode=partial`（局部渲染）、`skip-sig`（DOM 签名未变跳过）、`skip-empty`（空解析不覆盖）、`answer-api-first`（单回答 API 直连）、`src=api`（数据来源）。
- 图片占位符调试：控制台执行以下代码可列出每条回答的图片 URL（注意：扩展脚本运行在隔离世界，`VSZhihuUI` 等变量在 Console 中不可见，需通过 DOM 查询）：
  ```js
  [...document.querySelectorAll('.vsc-answer-card')].forEach((c, i) => {
    const u = [...c.querySelectorAll('.vsc-img-ph')].map(e => e.dataset.img);
    if (u.length) console.log('#' + i, u);
  })
  ```

---

## 📈 Star History

<p align="center"> <a href="https://www.star-history.com/#hankcov/vszhihu&Date"> <img src="https://api.star-history.com/svg?repos=hankcov/vszhihu&type=Date" alt="Star History Chart" /> </a> </p>

---

## 📄 开源协议

本项目基于 [MIT License](LICENSE) 协议开源。


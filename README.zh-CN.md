[English](README.md) | **中文**

# 追踪建造者，而非网红（Obsidian 版）

一个 AI 驱动的信息摘要工具，追踪 AI 领域最顶尖的建造者——研究员、创始人、产品经理和工程师——并将他们的最新动态整理成结构化摘要，每天**早上 6:15** 作为每日笔记直接推送到你的 **Obsidian Vault**。

**理念：** 追踪那些真正在做产品、有独立见解的人，而非只会搬运信息的网红。

---

## 你会得到什么

每天早上 6:15，你的 Obsidian Vault 会收到一份每日笔记（通过"Daily notes"核心插件），包含：

- 顶级 AI 播客新节目的精华摘要
- 25 位精选 AI 建造者在 X/Twitter 上的关键观点和洞察
- AI 公司官方博客的完整文章（Anthropic Engineering、Claude Blog）
- 所有原始内容的链接
- 支持繁体中文（繁體中文）输出

---

## 快速开始

1. **在 Obsidian 中启用每日笔记**（见下方前置要求）
2. **安装 Obsidian CLI**（见下方前置要求）
3. 在你的 Qwen Code agent 中安装此 skill
4. 输入 "set up follow builders" 或执行 `/ai`

Agent 会询问你的 vault 路径并自动设置每日定时任务。

不需要任何 API key。设置完成后你的第一期摘要会立即推送。

---

## 前置要求设置

### 1. 在 Obsidian 中启用每日笔记

Obsidian 的"Daily notes"核心插件会创建类似 `2026-04-08.md` 的笔记：

1. 打开 **Obsidian** → **设置** → **核心插件**
2. 启用 **Daily Notes**（如果尚未启用）
3. 根据需要配置每日笔记格式（默认：`YYYY-MM-DD.md`）
4. 将保存位置设置为你的 vault 根目录

**验证是否正常工作：** 通过以下方式创建新的每日笔记：
- 点击左侧边栏的日历图标，或
- 使用 `Cmd+Ctrl+D`（Mac）/ `Ctrl+Alt+D`（Windows/Linux）

你应该能在 vault 中看到类似 `2026-04-08.md` 的新文件。

### 2. 安装 Obsidian CLI

```bash
# 通过 npm 安装（推荐）
npm install -g obsidian-cli

# 验证安装
which obsidian
obsidian --help
```

**测试是否正常工作：**
```bash
obsidian daily:path
# 应该返回：/path/to/your-vault/2026-04-08.md
```

### 3. 设置定时任务（可选 - 在安装过程中自动完成）

Skill 会在引导设置过程中自动为你设置定时任务。如果你想手动设置：

```bash
# 你的 vault 路径（替换为你的实际 vault 路径）
VAULT_PATH="/path/to/your-obsidian-vault"

# 香港时间早上 6:15 = UTC 22:15（前一天）
(crontab -l 2>/dev/null; echo "15 22 * * * cd ~/.qwen/skills/follow-builders-obsidian/scripts && node prepare-digest.js 2>/dev/null | node deliver.js --method obsidian --vault '$VAULT_PATH' 2>/dev/null") | crontab -
```

**验证定时任务已设置：**
```bash
crontab -l | grep follow
```

---

## 安装（完成前置要求后）

### Qwen Code

```bash
git clone https://github.com/chongtinghoivan/follow-builders-obsidian.git ~/.qwen/skills/follow-builders-obsidian
cd ~/.qwen/skills/follow-builders-obsidian/scripts && npm install
```

然后对你的 Qwen agent 说 "set up follow builders"。

---

## Obsidian 推送工作原理

每天凌晨 6:15，你机器上的 cron 任务会本地运行：

1. 从中央 feed 获取最新的 AI 建造者内容
2. 将其重新整理为繁体中文的易读摘要
3. 使用 **Obsidian CLI**（`obsidian daily:append`）追加到今天的每日笔记
4. 笔记会出现在你的 Obsidian 应用中今天的日期下

## 修改设置

你的推送偏好可以通过对话进行配置。直接告诉你的 agent：

- "把推送时间改成早上 7 点"
- "把我的 vault 路径改成 /path/to/vault"
- "让摘要更简洁一些"
- "显示我当前的设置"

信息源列表（建造者和播客）由 centralized 统一管理并自动更新——你无需做任何操作即可获得最新的信息源。

## 自定义摘要风格

Skill 使用纯文本 prompt 文件来控制内容的摘要方式。你可以通过两种方式自定义：

**通过对话（推荐）：**
直接告诉你的 agent——"摘要写得更简练一些"、"多关注可操作的洞察"、"用更轻松的语气"。Agent 会自动帮你更新 prompt。

**直接编辑（高级用户）：**
编辑 `prompts/` 文件夹中的文件：
- `summarize-podcast.md` — 播客节目的摘要方式
- `summarize-tweets.md` — X/Twitter 帖子的摘要方式
- `summarize-blogs.md` — 博客文章的摘要方式
- `digest-intro.md` — 整体摘要的格式和语气
- `translate.md` — 英文内容翻译为繁体中文的方式

这些都是纯英文指令，不是代码。修改后下次推送即生效。

## 默认信息源

### 播客（6个）
- [Latent Space](https://www.youtube.com/@LatentSpacePod)
- [Training Data](https://www.youtube.com/playlist?list=PLOhHNjZItNnMm5tdW61JpnyxeYH5NDDx8)
- [No Priors](https://www.youtube.com/@NoPriorsPodcast)
- [Unsupervised Learning](https://www.youtube.com/@RedpointAI)
- [The MAD Podcast with Matt Turck](https://www.youtube.com/@DataDrivenNYC)
- [AI & I by Every](https://www.youtube.com/playlist?list=PLuMcoKK9mKgHtW_o9h5sGO2vXrffKHwJL)

### X 上的 AI 建造者（25位）
[Andrej Karpathy](https://x.com/karpathy), [Swyx](https://x.com/swyx), [Josh Woodward](https://x.com/joshwoodward), [Kevin Weil](https://x.com/kevinweil), [Peter Yang](https://x.com/petergyang), [Nan Yu](https://x.com/thenanyu), [Madhu Guru](https://x.com/realmadhuguru), [Amanda Askell](https://x.com/AmandaAskell), [Cat Wu](https://x.com/_catwu), [Thariq](https://x.com/trq212), [Google Labs](https://x.com/GoogleLabs), [Amjad Masad](https://x.com/amasad), [Guillermo Rauch](https://x.com/rauchg), [Alex Albert](https://x.com/alexalbert__), [Aaron Levie](https://x.com/levie), [Ryo Lu](https://x.com/ryolu_), [Garry Tan](https://x.com/garrytan), [Matt Turck](https://x.com/mattturck), [Zara Zhang](https://x.com/zarazhangrui), [Nikunj Kothari](https://x.com/nikunj), [Peter Steinberger](https://x.com/steipete), [Dan Shipper](https://x.com/danshipper), [Aditya Agarwal](https://x.com/adityaag), [Sam Altman](https://x.com/sama), [Claude](https://x.com/claudeai)

### 官方博客（2个）
- [Anthropic Engineering](https://www.anthropic.com/engineering) — Anthropic 团队的技术深度文章
- [Claude Blog](https://claude.com/blog) — Claude 的产品公告与更新

## 工作原理

1. 中央 feed 每日更新，抓取所有信息源的最新内容（博客文章通过网页抓取，YouTube 字幕通过 Supadata，X/Twitter 通过官方 API）
2. 早上 6:15，你机器上的 cron 任务触发摘要流程
3. 你的 agent 的 skill 获取 feed——一次 HTTP 请求，不需要 API key
4. 内容被重新整理为繁体中文的易读摘要
5. Obsidian CLI 将摘要追加到今天的每日笔记
6. 笔记自动出现在你的 Obsidian vault 中

查看 [examples/sample-digest.md](examples/sample-digest.md) 了解输出示例。

## 隐私

- 不发送任何 API key——所有内容由 centralized 服务获取
- 你的配置、偏好和阅读记录都保留在你自己的设备上
- Skill 只读取公开内容（公开的博客文章、公开的 YouTube 视频、公开的 X 帖子）
- 定时任务在你机器上本地运行——没有外部调度服务

## 许可证

MIT

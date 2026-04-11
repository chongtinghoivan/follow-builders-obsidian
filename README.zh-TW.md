[English](README.md) | [简体中文](README.zh-CN.md) | **繁體中文**

# 追蹤建造者，而非網紅（Obsidian 版）

一個 AI 驅動的資訊摘要工具，追蹤 AI 領域最頂尖的建造者——研究員、創辦人、產品經理和工程師——並將他們的最新動態整理成結構化摘要，每天**早上 6:15** 作為每日筆記直接推送到你的 **Obsidian Vault**。

**理念：** 追蹤那些真正在做產品、有獨立見解的人，而非只會搬運資訊的網紅。

---

## 你會得到什麼

每天早上 6:15，你的 Obsidian Vault 會收到一份每日筆記（透過「Daily notes」核心外掛），包含：

- 頂級 AI 播客新節目的精華摘要
- 25 位精選 AI 建造者在 X/Twitter 上的關鍵觀點和洞察
- AI 公司官方部落格的完整文章（Anthropic Engineering、Claude Blog）
- 所有原始內容的連結
- 支援繁體中文（繁體中文）輸出

---

## 快速開始

1. **在 Obsidian 中啟用每日筆記**（見下方前置需求）
2. **安裝 Obsidian CLI**（見下方前置需求）
3. 在你的 Qwen Code agent 中安裝此 skill
4. 輸入 "set up follow builders" 或執行 `/ai`

Agent 會詢問你的 vault 路徑並自動設定每日定時任務。

不需要任何 API key。設定完成後你的第一期摘要會立即推送。

---

## 前置需求設定

### 1. 在 Obsidian 中啟用每日筆記

Obsidian 的「Daily notes」核心外掛會建立類似 `2026-04-08.md` 的筆記：

1. 開啟 **Obsidian** → **設定** → **核心外掛**
2. 啟用 **Daily Notes**（如果尚未啟用）
3. 根據需要設定每日筆記格式（預設：`YYYY-MM-DD.md`）
4. 將儲存位置設定為你的 vault 根目錄

**驗證是否正常運作：** 透過以下方式建立新的每日筆記：
- 點擊左側邊欄的日曆圖示，或
- 使用 `Cmd+Ctrl+D`（Mac）/ `Ctrl+Alt+D`（Windows/Linux）

你應該能在 vault 中看到類似 `2026-04-08.md` 的新檔案。

### 2. 安裝 Obsidian CLI

```bash
# 透過 npm 安裝（推薦）
npm install -g obsidian-cli

# 驗證安裝
which obsidian
obsidian --help
```

**測試是否正常運作：**
```bash
obsidian daily:path
# 應該回傳：/path/to/your-vault/2026-04-08.md
```

### 3. 設定定時任務（可選 - 在安裝過程中自動完成）

Skill 會在引導設定過程中自動為你設定定時任務。如果你想手動設定：

```bash
# 你的 vault 路徑（替換為你的實際 vault 路徑）
VAULT_PATH="/path/to/your-obsidian-vault"

# 香港時間早上 6:15 = UTC 22:15（前一天）
(crontab -l 2>/dev/null; echo "15 22 * * * cd ~/.qwen/skills/follow-builders-obsidian/scripts && node prepare-digest.js 2>/dev/null | node deliver.js --method obsidian --vault '$VAULT_PATH' 2>/dev/null") | crontab -
```

**驗證定時任務已設定：**
```bash
crontab -l | grep follow
```

---

## 安裝（完成前置需求後）

### Qwen Code

```bash
git clone https://github.com/chongtinghoivan/follow-builders-obsidian.git ~/.qwen/skills/follow-builders-obsidian
cd ~/.qwen/skills/follow-builders-obsidian/scripts && npm install
```

然後對你的 Qwen agent 說 "set up follow builders"。

---

## Obsidian 推送工作原理

每天凌晨 6:15，你機器上的 cron 任務會本地執行：

1. 從中央 feed 取得最新的 AI 建造者內容
2. 將其重新整理為繁體中文的易讀摘要
3. 使用 **Obsidian CLI**（`obsidian daily:append`）追加到今天的每日筆記
4. 筆記會出現在你的 Obsidian 應用程式中今天的日期下

## 修改設定

你的推送偏好可以透過對話進行設定。直接告訴你的 agent：

- "把推送時間改成早上 7 點"
- "把我的 vault 路徑改成 /path/to/vault"
- "讓摘要更簡潔一些"
- "顯示我當前的設定"

資訊來源清單（建造者和播客）由中央統一管理並自動更新——你無需做任何操作即可取得最新的資訊來源。

## 自訂摘要風格

Skill 使用純文字 prompt 檔案來控制內容的摘要方式。你可以透過兩種方式自訂：

**透過對話（推薦）：**
直接告訴你的 agent——"摘要寫得更精簡一些"、"多關注可操作的洞察"、"用更輕鬆的語氣"。Agent 會自動幫你更新 prompt。

**直接編輯（進階使用者）：**
編輯 `prompts/` 資料夾中的檔案：
- `summarize-podcast.md` — 播客節目的摘要方式
- `summarize-tweets.md` — X/Twitter 帖子的摘要方式
- `summarize-blogs.md` — 部落格文章的摘要方式
- `digest-intro.md` — 整體摘要的格式和語氣
- `translate.md` — 英文內容翻譯為繁體中文的方式

這些都是純英文指令，不是程式碼。修改後下次推送即生效。

## 預設資訊來源

### 播客（6個）
- [Latent Space](https://www.youtube.com/@LatentSpacePod)
- [Training Data](https://www.youtube.com/playlist?list=PLOhHNjZItNnMm5tdW61JpnyxeYH5NDDx8)
- [No Priors](https://www.youtube.com/@NoPriorsPodcast)
- [Unsupervised Learning](https://www.youtube.com/@RedpointAI)
- [The MAD Podcast with Matt Turck](https://www.youtube.com/@DataDrivenNYC)
- [AI & I by Every](https://www.youtube.com/playlist?list=PLuMcoKK9mKgHtW_o9h5sGO2vXrffKHwJL)

### X 上的 AI 建造者（25位）
[Andrej Karpathy](https://x.com/karpathy), [Swyx](https://x.com/swyx), [Josh Woodward](https://x.com/joshwoodward), [Kevin Weil](https://x.com/kevinweil), [Peter Yang](https://x.com/petergyang), [Nan Yu](https://x.com/thenanyu), [Madhu Guru](https://x.com/realmadhuguru), [Amanda Askell](https://x.com/AmandaAskell), [Cat Wu](https://x.com/_catwu), [Thariq](https://x.com/trq212), [Google Labs](https://x.com/GoogleLabs), [Amjad Masad](https://x.com/amasad), [Guillermo Rauch](https://x.com/rauchg), [Alex Albert](https://x.com/alexalbert__), [Aaron Levie](https://x.com/levie), [Ryo Lu](https://x.com/ryolu_), [Garry Tan](https://x.com/garrytan), [Matt Turck](https://x.com/mattturck), [Zara Zhang](https://x.com/zarazhangrui), [Nikunj Kothari](https://x.com/nikunj), [Peter Steinberger](https://x.com/steipete), [Dan Shipper](https://x.com/danshipper), [Aditya Agarwal](https://x.com/adityaag), [Sam Altman](https://x.com/sama), [Claude](https://x.com/claudeai)

### 官方部落格（2個）
- [Anthropic Engineering](https://www.anthropic.com/engineering) — Anthropic 團隊的技術深度文章
- [Claude Blog](https://claude.com/blog) — Claude 的產品公告與更新

## 工作原理

1. 中央 feed 每日更新，抓取所有資訊來源的最新內容（部落格文章透過網頁爬取，YouTube 字幕透過 Supadata，X/Twitter 透過官方 API）
2. 早上 6:15，你機器上的 cron 任務觸發摘要流程
3. 你的 agent 的 skill 取得 feed——一次 HTTP 請求，不需要 API key
4. 內容被重新整理為繁體中文的易讀摘要
5. Obsidian CLI 將摘要追加到今天的每日筆記
6. 筆記自動出現在你的 Obsidian vault 中

查看 [examples/sample-digest.md](examples/sample-digest.md) 了解輸出範例。

## 隱私

- 不發送任何 API key——所有內容由中央服務取得
- 你的設定、偏好和閱讀記錄都保留在你自己的設備上
- Skill 只讀取公開內容（公開的部落格文章、公開的 YouTube 影片、公開的 X 帖子）
- 定時任務在你機器上本地執行——沒有外部調度服務

## 授權條款

MIT

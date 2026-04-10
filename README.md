**English** | [中文](README.zh-CN.md)

# Follow Builders, Not Influencers (Obsidian Edition)

An AI-powered digest that tracks the top builders in AI — researchers, founders, PMs,
and engineers who are actually building things — and delivers curated summaries
of what they're saying directly to your **Obsidian Vault** as a daily note at **6:15am**.

**Philosophy:** Follow people who build products and have original opinions, not
influencers who regurgitate information.

---

## What You Get

A daily digest at **6:15am HKT** delivered to your Obsidian Vault via **GitHub Actions**:

- Summaries of new podcast episodes from top AI podcasts
- Key posts and insights from 25 curated AI builders on X/Twitter
- Full articles from official AI company blogs (Anthropic Engineering, Claude Blog)
- Links to all original content
- Available in Traditional Chinese (繁體中文)

**Why GitHub Actions?** Your MacBook might be sleeping or offline at 6:15am. GitHub
Actions runs on GitHub' infrastructure — always online. You just `git pull` your vault
when you're back online, and the digest is waiting for you.

---

## Quick Start

1. **Enable Daily Notes** in Obsidian (see Prerequisites below)
2. Install the skill in your Qwen Code agent
3. Say "set up follow builders" or invoke `/ai`

The agent will guide you through setup. Your first digest arrives immediately after.

**One API key needed:** `OPENAI_API_KEY` as a GitHub repo secret on your `obsidian-vault` repo.

---

## Prerequisites Setup

### 1. Enable Daily Notes in Obsidian

Obsidian's "Daily notes" core plugin creates notes like `2026-04-08.md`:

1. Open **Obsidian** → **Settings** → **Core Plugins**
2. Enable **Daily Notes** (if not already enabled)
3. Configure the daily note format if desired (default: `YYYY-MM-DD.md`)
4. Set the save location to your vault root

**Verify it's working:** Create a new daily note by:
- Clicking the calendar icon in the left sidebar, OR
- Using `Cmd+Ctrl+D` (Mac) / `Ctrl+Alt+D` (Windows/Linux)

You should see a new file like `2026-04-08.md` in your vault.

### 2. Add OPENAI_API_KEY to GitHub Secrets

The GitHub Actions workflow needs your OpenAI API key to generate digests:

1. Go to your repo: **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `OPENAI_API_KEY`, Value: your OpenAI API key
4. Save

### 3. GitHub Actions Workflow (Automatic)

The workflow file `.github/workflows/daily-digest.yml` is included in your vault repo.
It runs daily at 6:15am HKT (22:15 UTC). No local cron needed.

**To trigger manually:** Go to **Actions** → **Daily AI Builders Digest** → **Run workflow**

---

## Installation (After Prerequisites)

### Qwen Code

```bash
git clone https://github.com/chongtinghoivan/follow-builders-obsidian.git ~/.qwen/skills/follow-builders-obsidian
cd ~/.qwen/skills/follow-builders-obsidian/scripts && npm install
```

Then say "set up follow builders" to your Qwen agent.

> **Note:** Feed content (tweets, podcasts, blogs) is sourced from
> [zarazhangrui/follow-builders](https://github.com/zarazhangrui/follow-builders).
> This repo provides the Obsidian delivery layer and summarization prompts only.

---

## Requirements

- Qwen Code (or similar AI agent)
- Obsidian with the "Daily notes" core plugin enabled
- GitHub repo for your Obsidian vault (for Actions workflow)
- `OPENAI_API_KEY` as a GitHub repo secret
- Internet connection (for `git pull` when you want to sync digests)

That's it. All content (blog articles + YouTube transcripts + X/Twitter posts)
is fetched centrally by the GitHub Action and updated daily.

---

## How GitHub Actions Delivery Works

At 6:15am HKT daily, a GitHub Actions workflow runs on GitHub's infrastructure:

1. Clones the follow-builders-obsidian skill repo
2. Fetches the latest AI builder content from the central feed
3. Calls OpenAI API to remix and translate to Traditional Chinese
4. Commits the digest to `AI News Daily/YYYY-MM-DD.md` and `YYYY-MM-DD.md`
5. Pushes to your vault repo

When your MacBook comes back online, just `git pull` your vault and the digest is waiting.

## Changing Settings

Your delivery preferences are configurable through conversation. Just tell your agent:

- "Change delivery time to 7am" (updates the cron schedule in the workflow)
- "Change my vault path to /path/to/vault"
- "Make the summaries more concise"
- "Show me my current settings"

The source list (builders and podcasts) is curated centrally and updates
automatically — you always get the latest sources without doing anything.

## Customizing the Summaries

The skill uses plain-English prompt files to control how content is summarized.
You can customize them two ways:

**Through conversation (recommended):**
Tell your agent what you want — "Make summaries more concise," "Focus on actionable
insights," "Use a more casual tone." The agent updates the prompts for you.

**Direct editing (power users):**
Edit the files in the `prompts/` folder:
- `summarize-podcast.md` — how podcast episodes are summarized
- `summarize-tweets.md` — how X/Twitter posts are summarized
- `summarize-blogs.md` — how blog posts are summarized
- `digest-intro.md` — the overall digest format and tone
- `translate.md` — how English content is translated to Traditional Chinese

These are plain English instructions, not code. Changes take effect on the next digest.

## Default Sources

### Podcasts (6)
- [Latent Space](https://www.youtube.com/@LatentSpacePod)
- [Training Data](https://www.youtube.com/playlist?list=PLOhHNjZItNnMm5tdW61JpnyxeYH5NDDx8)
- [No Priors](https://www.youtube.com/@NoPriorsPodcast)
- [Unsupervised Learning](https://www.youtube.com/@RedpointAI)
- [The MAD Podcast with Matt Turck](https://www.youtube.com/@DataDrivenNYC)
- [AI & I by Every](https://www.youtube.com/playlist?list=PLuMcoKK9mKgHtW_o9h5sGO2vXrffKHwJL)

### AI Builders on X (25)
[Andrej Karpathy](https://x.com/karpathy), [Swyx](https://x.com/swyx), [Josh Woodward](https://x.com/joshwoodward), [Kevin Weil](https://x.com/kevinweil), [Peter Yang](https://x.com/petergyang), [Nan Yu](https://x.com/thenanyu), [Madhu Guru](https://x.com/realmadhuguru), [Amanda Askell](https://x.com/AmandaAskell), [Cat Wu](https://x.com/_catwu), [Thariq](https://x.com/trq212), [Google Labs](https://x.com/GoogleLabs), [Amjad Masad](https://x.com/amasad), [Guillermo Rauch](https://x.com/rauchg), [Alex Albert](https://x.com/alexalbert__), [Aaron Levie](https://x.com/levie), [Ryo Lu](https://x.com/ryolu_), [Garry Tan](https://x.com/garrytan), [Matt Turck](https://x.com/mattturck), [Zara Zhang](https://x.com/zarazhangrui), [Nikunj Kothari](https://x.com/nikunj), [Peter Steinberger](https://x.com/steipete), [Dan Shipper](https://x.com/danshipper), [Aditya Agarwal](https://x.com/adityaag), [Sam Altman](https://x.com/sama), [Claude](https://x.com/claudeai)

### Official Blogs (2)
- [Anthropic Engineering](https://www.anthropic.com/engineering) — technical deep-dives from the Anthropic team
- [Claude Blog](https://claude.com/blog) — product announcements and updates from Claude

## How It Works

1. The upstream feed repo ([zarazhangrui/follow-builders](https://github.com/zarazhangrui/follow-builders)) is updated daily with the latest content from all sources
   (blog articles via web scraping, YouTube transcripts via Supadata, X/Twitter via official API)
2. At 6:15am HKT, a **GitHub Actions workflow** on your `obsidian-vault` repo triggers the digest pipeline
3. `prepare-digest.js` fetches the feed — one HTTP request, no API keys
4. `run-digest-ga.js` calls OpenAI API to remix and translate the content
5. The digest is committed to `AI News Daily/YYYY-MM-DD.md` and `YYYY-MM-DD.md` in your vault repo
6. When your MacBook is online, `git pull` brings the digest into your vault

See [examples/sample-digest.md](examples/sample-digest.md) for what the output looks like.

## Privacy

- No API keys are sent anywhere — all content is fetched centrally
- Your configuration, preferences, and reading history stay on your machine
- The skill only reads public content (public blog posts, public YouTube videos, public X posts)
- The GitHub Action runs on GitHub's infrastructure — no external scheduling service
- The `OPENAI_API_KEY` secret is stored securely in your GitHub repo settings

## License

MIT

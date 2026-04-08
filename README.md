**English** | [中文](README.zh-CN.md)

# Follow Builders, Not Influencers (Obsidian Edition)

An AI-powered digest that tracks the top builders in AI — researchers, founders, PMs,
and engineers who are actually building things — and delivers curated summaries
of what they're saying directly to your **Obsidian Vault** as a daily note at **6:15am**.

**Philosophy:** Follow people who build products and have original opinions, not
influencers who regurgitate information.

---

## What You Get

A daily digest at 6:15am in your Obsidian Vault (via the "Daily notes" core plugin) with:

- Summaries of new podcast episodes from top AI podcasts
- Key posts and insights from 25 curated AI builders on X/Twitter
- Full articles from official AI company blogs (Anthropic Engineering, Claude Blog)
- Links to all original content
- Available in Traditional Chinese (繁體中文)

---

## Quick Start

1. **Enable Daily Notes** in Obsidian (see Prerequisites below)
2. **Install Obsidian CLI** (see Prerequisites below)
3. Install the skill in your Qwen Code agent
4. Say "set up follow builders" or invoke `/ai`

The agent will ask for your vault path and set up the daily cron automatically.

No API keys needed. Your first digest arrives immediately after setup.

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

### 2. Install Obsidian CLI

```bash
# Install via npm (recommended)
npm install -g obsidian-cli

# Verify installation
which obsidian
obsidian --help
```

**Test it works:**
```bash
obsidian daily:path
# Should return: /path/to/your-vault/2026-04-08.md
```

### 3. Set Up Cron (Optional - Done Automatically During Setup)

The skill can set up cron for you during onboarding. If you want to set it up manually:

```bash
# Your vault path (replace with your actual vault path)
VAULT_PATH="/path/to/your-obsidian-vault"

# Hong Kong Time 6:15am = UTC 22:15 (previous day)
(crontab -l 2>/dev/null; echo "15 22 * * * cd ~/.qwen/skills/follow-builders-obsidian/scripts && node prepare-digest.js 2>/dev/null | node deliver.js --method obsidian --vault '$VAULT_PATH' 2>/dev/null") | crontab -
```

**Verify cron is set:**
```bash
crontab -l | grep follow
```

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
- Obsidian CLI installed (`npm install -g obsidian-cli` or via other means)
- Internet connection (to fetch the central feed)
- macOS or Linux (for cron-based scheduling)

That's it. No API keys needed. All content (blog articles + YouTube transcripts + X/Twitter posts)
is fetched centrally and updated daily.

---

## How Obsidian Delivery Works

At 6:15am daily, a cron job runs locally on your machine:

1. Fetches the latest AI builder content from the central feed
2. Remixes it into a digestible summary in Traditional Chinese
3. Uses **Obsidian CLI** (`obsidian daily:append`) to append to today's Daily Note
4. The note appears in your Obsidian app under today's date

## Changing Settings

Your delivery preferences are configurable through conversation. Just tell your agent:

- "Change delivery time to 7am"
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
2. At 6:15am, a cron job on your machine triggers the digest pipeline
3. `prepare-digest.js` fetches the feed — one HTTP request, no API keys
4. The content is remixed into a digestible summary in Traditional Chinese
5. Obsidian CLI appends to today's Daily Note with the digest
6. The note appears in your Obsidian vault automatically

See [examples/sample-digest.md](examples/sample-digest.md) for what the output looks like.

## Privacy

- No API keys are sent anywhere — all content is fetched centrally
- Your configuration, preferences, and reading history stay on your machine
- The skill only reads public content (public blog posts, public YouTube videos, public X posts)
- The cron job runs locally on your machine — no external scheduling service

## License

MIT

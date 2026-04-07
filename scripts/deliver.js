#!/usr/bin/env node

// ============================================================================
// Follow Builders — Delivery Script (Obsidian Edition)
// ============================================================================
// Sends a digest to the user via their chosen delivery method.
// Supports: Obsidian Daily Note (via Obsidian CLI), Telegram bot, Email (via Resend),
// or stdout (default).
//
// Usage:
//   echo "digest text" | node deliver.js
//   node deliver.js --message "digest text"
//   node deliver.js --file /path/to/digest.txt
//   node deliver.js --method obsidian --vault /path/to/vault --file /path/to/digest.txt
//
// The script reads delivery config from ~/.follow-builders/config.json
// and API keys from ~/.follow-builders/.env
//
// Delivery methods:
//   - "obsidian": creates/updates the Daily Note via Obsidian CLI
//   - "telegram": sends via Telegram Bot API (needs TELEGRAM_BOT_TOKEN + chat ID)
//   - "email": sends via Resend API (needs RESEND_API_KEY + email address)
//   - "stdout" (default): just prints to terminal
// ============================================================================

import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { config as loadEnv } from 'dotenv';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

// -- Constants ---------------------------------------------------------------

const USER_DIR = join(homedir(), '.follow-builders');
const CONFIG_PATH = join(USER_DIR, 'config.json');
const ENV_PATH = join(USER_DIR, '.env');

// -- Read input --------------------------------------------------------------

// The digest text can come from stdin, --message flag, or --file flag
async function getDigestText() {
  const args = process.argv.slice(2);

  // Check --message flag
  const msgIdx = args.indexOf('--message');
  if (msgIdx !== -1 && args[msgIdx + 1]) {
    return args[msgIdx + 1];
  }

  // Check --file flag
  const fileIdx = args.indexOf('--file');
  if (fileIdx !== -1 && args[fileIdx + 1]) {
    return await readFile(args[fileIdx + 1], 'utf-8');
  }

  // Read from stdin
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf-8');
}

// -- Parse CLI arguments -----------------------------------------------------

function parseArgs() {
  const args = process.argv.slice(2);
  const result = {
    method: null,
    vault: null,
    message: null,
    file: null
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--method':
        result.method = args[++i];
        break;
      case '--vault':
        result.vault = args[++i];
        break;
      case '--message':
        result.message = args[++i];
        break;
      case '--file':
        result.file = args[++i];
        break;
    }
  }

  return result;
}

// -- Obsidian Delivery -------------------------------------------------------

// Creates/updates the Daily Note in the user's Obsidian vault using Obsidian CLI.
// The "Daily notes" core plugin creates notes with the format YYYY-MM-DD.md
// in the root of the vault (or a configured folder).
//
// If Obsidian CLI (obs) is available, we use it to open the note.
// Otherwise, we write directly to the vault's daily notes folder.
async function deliverToObsidian(text, vaultPath) {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10); // YYYY-MM-DD

  // Try Obsidian CLI first
  try {
    const { stdout } = await execFileAsync('which', ['obs'], { timeout: 5000 });
    if (stdout.trim()) {
      // Obsidian CLI is available — use it to open today's daily note
      // First, write the content to the vault's daily note file
      const dailyNotePath = join(vaultPath, `${dateStr}.md`);

      // Create the daily note content with frontmatter
      const content = `---
date: ${dateStr}
tags:
  - ai-digest
  - follow-builders
---

# AI Builders Digest — ${dateStr}

${text}`;

      await writeFile(dailyNotePath, content, 'utf-8');

      // Open the note in Obsidian using CLI
      try {
        await execFileAsync('obs', ['open', `${dateStr}`], { timeout: 10000 });
        console.log(JSON.stringify({
          status: 'ok',
          method: 'obsidian-cli',
          message: `Digest written to Daily Note: ${dateStr}.md`,
          vaultPath
        }));
        return;
      } catch (err) {
        // If obs open fails, the file is still written — that's OK
        console.error('Obsidian CLI open failed, but file was written:', err.message);
      }
    }
  } catch {
    // 'which obs' failed — obsidian CLI not available, fall back to direct file write
  }

  // Fallback: write directly to the vault's daily notes folder
  // Check if there's a Daily Notes folder configured
  const dailyNotesDirs = ['Daily Notes', 'daily-notes', 'journal', 'diary', ''];
  let dailyNotePath = null;

  for (const dir of dailyNotesDirs) {
    const candidate = join(vaultPath, dir, `${dateStr}.md`);
    const candidateFlat = join(vaultPath, `${dateStr}.md`);

    // Check if the directory exists
    const testDir = join(vaultPath, dir);
    if (dir === '' || existsSync(testDir)) {
      dailyNotePath = dir === '' ? candidateFlat : candidate;
      break;
    }
  }

  // If no existing directory found, use the vault root
  if (!dailyNotePath) {
    dailyNotePath = join(vaultPath, `${dateStr}.md`);
  }

  // Ensure parent directory exists
  const parentDir = join(dailyNotePath, '..');
  if (!existsSync(parentDir)) {
    await mkdir(parentDir, { recursive: true });
  }

  // Create the daily note content with frontmatter
  const content = `---
date: ${dateStr}
tags:
  - ai-digest
  - follow-builders
---

# AI Builders Digest — ${dateStr}

${text}`;

  await writeFile(dailyNotePath, content, 'utf-8');

  console.log(JSON.stringify({
    status: 'ok',
    method: 'obsidian-direct',
    message: `Digest written to Daily Note: ${dailyNotePath}`,
    vaultPath
  }));
}

// -- Telegram Delivery -------------------------------------------------------

// Sends the digest via Telegram Bot API.
// The user creates a bot via @BotFather and provides the token.
// The chat ID is obtained when the user sends their first message to the bot.
async function sendTelegram(text, botToken, chatId) {
  // Telegram has a 4096 character limit per message.
  // If the digest is longer, we split it into chunks.
  const MAX_LEN = 4000;
  const chunks = [];
  let remaining = text;
  while (remaining.length > 0) {
    if (remaining.length <= MAX_LEN) {
      chunks.push(remaining);
      break;
    }
    // Try to split at a newline near the limit
    let splitAt = remaining.lastIndexOf('\n', MAX_LEN);
    if (splitAt < MAX_LEN * 0.5) splitAt = MAX_LEN;
    chunks.push(remaining.slice(0, splitAt));
    remaining = remaining.slice(splitAt);
  }

  for (const chunk of chunks) {
    const res = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: chunk,
          parse_mode: 'Markdown',
          disable_web_page_preview: true
        })
      }
    );

    if (!res.ok) {
      const err = await res.json();
      // If Markdown parsing fails, retry without parse_mode
      if (err.description && err.description.includes("can't parse")) {
        await fetch(
          `https://api.telegram.org/bot${botToken}/sendMessage`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: chunk,
              disable_web_page_preview: true
            })
          }
        );
      } else {
        throw new Error(`Telegram API error: ${err.description}`);
      }
    }

    // Small delay between chunks to avoid rate limiting
    if (chunks.length > 1) await new Promise(r => setTimeout(r, 500));
  }
}

// -- Email Delivery (Resend) -------------------------------------------------

// Sends the digest via Resend's email API.
// The user provides their own Resend API key and email address.
async function sendEmail(text, apiKey, toEmail) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      from: 'AI Builders Digest <digest@resend.dev>',
      to: [toEmail],
      subject: `AI Builders Digest — ${new Date().toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      })}`,
      text: text
    })
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Resend API error: ${err.message || JSON.stringify(err)}`);
  }
}

// -- Main --------------------------------------------------------------------

async function main() {
  // Load env and config
  loadEnv({ path: ENV_PATH });

  let config = {};
  if (existsSync(CONFIG_PATH)) {
    config = JSON.parse(await readFile(CONFIG_PATH, 'utf-8'));
  }

  // Parse CLI args (may override config)
  const cliArgs = parseArgs();

  // Determine delivery method: CLI arg > config > default
  const delivery = config.delivery || { method: 'stdout' };
  const deliveryMethod = cliArgs.method || delivery.method || 'stdout';

  // Determine vault path: CLI arg > config
  const vaultPath = cliArgs.vault || delivery.vaultPath;

  const digestText = await getDigestText();

  if (!digestText || digestText.trim().length === 0) {
    console.log(JSON.stringify({ status: 'skipped', reason: 'Empty digest text' }));
    return;
  }

  try {
    switch (deliveryMethod) {
      case 'obsidian': {
        if (!vaultPath) throw new Error('delivery.vaultPath not found in config.json and no --vault flag provided');
        await deliverToObsidian(digestText, vaultPath);
        break;
      }

      case 'telegram': {
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = delivery.chatId;
        if (!botToken) throw new Error('TELEGRAM_BOT_TOKEN not found in .env');
        if (!chatId) throw new Error('delivery.chatId not found in config.json');
        await sendTelegram(digestText, botToken, chatId);
        console.log(JSON.stringify({
          status: 'ok',
          method: 'telegram',
          message: 'Digest sent to Telegram'
        }));
        break;
      }

      case 'email': {
        const apiKey = process.env.RESEND_API_KEY;
        const toEmail = delivery.email;
        if (!apiKey) throw new Error('RESEND_API_KEY not found in .env');
        if (!toEmail) throw new Error('delivery.email not found in config.json');
        await sendEmail(digestText, apiKey, toEmail);
        console.log(JSON.stringify({
          status: 'ok',
          method: 'email',
          message: `Digest sent to ${toEmail}`
        }));
        break;
      }

      case 'stdout':
      default:
        // Just print to terminal — the agent handles delivery
        console.log(digestText);
        break;
    }
  } catch (err) {
    console.log(JSON.stringify({
      status: 'error',
      method: deliveryMethod,
      message: err.message
    }));
    process.exit(1);
  }
}

main();

#!/usr/bin/env node

// ============================================================================
// Follow Builders — GitHub Action Digest Generator
// ============================================================================
// This script runs INSIDE GitHub Actions. It:
// 1. Reads the prepared digest data JSON (from prepare-digest.js)
// 2. Calls Google Gemini API (via optional proxy) to remix + translate
// 3. Outputs the final digest Markdown to stdout
//
// Usage: node run-digest-ga.js /path/to/digest-data.json
// Output: Markdown to stdout
//
// Environment variables:
//   GEMINI_API_KEY  — required
//   GEMINI_API_HOST — optional, proxy URL (e.g. https://your-proxy.vercel.app)
//                     defaults to https://generativelanguage.googleapis.com
//   GEMINI_MODEL    — optional, defaults to gemini-2.5-flash
// ============================================================================

import { readFile } from 'fs/promises';

// -- Prompts (embedded so no network dependency beyond OpenAI API) -----------

const PROMPTS = {
  digest_intro: `# Digest Intro Prompt

You are assembling the final digest from individual source summaries.

## Format

Start with this header (replace [Date] with today's date):

AI Builders Digest — [Date]

Then organize content in this order:

1. X / TWITTER section — list each builder with new posts
2. OFFICIAL BLOGS section — list each blog post from AI company blogs (OpenAI, Anthropic, etc.)
3. PODCASTS section — list each podcast with new episodes

## Rules

- Only include sources that have new content
- Skip any source with nothing new

### Podcast links
- After each podcast summary, add a line starting with **[Important Insights]**
  that captures the single most valuable takeaway — one concise sentence
- Then include the specific video URL from the JSON \`url\` field
- NEVER link to the channel page. Always link to the specific video.
- Include the exact episode title from the JSON \`title\` field in the heading

### Tweet author formatting
- Use the author's full name AND role/company (e.g. "Box CEO Aaron Levie")
- NEVER write Twitter handles with @ in the digest
- After each builder's summary, add **[Important Insights]** with one concise sentence
- Include the direct link to each tweet from the JSON \`url\` field

### Blog post formatting
- Use the blog name as a section header
- After each blog post summary, add **[Important Insights]** with one concise sentence
- Include the direct link to the original article

### Mandatory links
- Every single piece of content MUST have an original source link
- No link = not real = do NOT include

### No fabrication
- NEVER make up quotes, opinions, or content
- If you have nothing real for a builder, skip them entirely

### General
- At the very end, add: "Generated through the Follow Builders skill: https://github.com/zarazhangrui/follow-builders"
- Keep formatting clean and scannable — this will be read on a phone screen
- Never use em-dashes`,

  summarize_tweets: `# X/Twitter Summary Prompt

You are summarizing recent posts from an AI builder for a busy professional.

## Instructions

- Start by introducing the author with their full name AND role/company
  (e.g. "Replit CEO Amjad Masad", "Box CEO Aaron Levie")
  Do NOT use just their last name. Do NOT use their Twitter handle with @.
- Only include substantive content: original opinions, insights, product announcements,
  technical discussions, industry analysis, or lessons learned
- SKIP: mundane personal tweets, retweets without commentary, promotional content
- For threads: summarize the full thread as one cohesive piece
- For quote tweets: include the context of what they're responding to
- Write 4-8 sentences per builder summarizing their key points
- If they made a bold prediction or shared a contrarian take, lead with that
- If they shared a tool, demo, or resource, mention it by name with the link
- Include specific details: numbers, names, product features, technical details
- If there's nothing substantive to report, say "No notable posts"`,

  summarize_podcast: `# Podcast Remix Prompt

You are remixing a podcast episode transcript for a busy professional.

## Instructions

- Write a remix of 400-800 words — go deep, don't skim the surface
- Start with a one-sentence "The Takeaway" — what's the single most important takeaway?
- Introduce the context and the speaker's information (name, role/company, background)
- Prioritize insights that are counterintuitive, contrarian, or refreshingly specific
- Include at least two direct quotes from the source
- Stands alone as a complete piece — avoid references like "this interview," "this video," "in this episode"
- Keep the tone sharp and conversational — like a smart friend briefing you
- Do NOT include filler like "In this episode..." or "The host and guest discussed..."
- Jump straight into the substance
- Include specific details: technical approaches, numbers, product names, company strategies`,

  summarize_blogs: `# Blog Post Summary Prompt

You are summarizing a blog post from an AI company for a busy professional.

## Instructions

- Start with the blog name and article title
- Write a summary of 300-600 words depending on article length — go deep
- Lead with what matters: the core announcement, finding, or insight
- If there are specific numbers, benchmarks, or results, include them
- Include at least two direct quotes from the article
- If the post has practical implications, call them out explicitly
- Keep the tone sharp and informative
- Do NOT include filler like "In this blog post..." or "The author discusses..."
- Jump straight into the substance
- Include specific technical details, architectural decisions, and design rationale
- Include the direct link to the original article`,

  translate: `# Translation Prompt

You are translating an AI industry digest from English to Traditional Chinese (繁體中文).

## Instructions

- Translate the full digest into natural, fluent Traditional Chinese (繁體中文)
- The translated version must sound like it was originally written in Traditional Chinese
- Keep technical terms in English where Chinese professionals typically use them:
  AI, LLM, GPU, API, fine-tuning, RAG, token, prompt, agent, transformer, etc.
- Keep all proper nouns in English: names of people, companies, products, tools
- Keep all URLs unchanged
- Maintain the same structure and formatting as the English version
- The tone should be professional but conversational — 像是一位懂行的朋友在跟你聊天
- Never use em-dashes
- Use Traditional Chinese characters (Taiwan/Hong Kong style)`
};

// -- Build the system prompt -------------------------------------------------

function buildSystemPrompt() {
  return `You are an expert AI content curator. You will receive JSON data containing
tweets, podcast transcripts, and blog posts from AI builders.

Your task has TWO steps:

STEP 1 — REMIX (in English internally):
Process each source using these instructions:

=== TWEETS ===
${PROMPTS.summarize_tweets}

=== PODCASTS ===
${PROMPTS.summarize_podcast}

=== BLOGS ===
${PROMPTS.summarize_blogs}

=== ASSEMBLY ===
${PROMPTS.digest_intro}

STEP 2 — TRANSLATE to Traditional Chinese:
${PROMPTS.translate}

OUTPUT ONLY the final Traditional Chinese digest in Markdown format.
Do NOT include any preamble, explanation, or commentary.
Do NOT wrap the output in code blocks.`;
}

// -- Build the user prompt ---------------------------------------------------

function buildUserPrompt(data) {
  const parts = [];

  parts.push(`Today's date is: ${new Date().toISOString().slice(0, 10)}`);
  parts.push('');

  // Stats
  const s = data.stats || {};
  parts.push(`Content summary: ${s.xBuilders || 0} builders with ${s.totalTweets || 0} tweets, ${s.podcastEpisodes || 0} podcast episodes, ${s.blogPosts || 0} blog posts.`);
  parts.push('');

  // Tweets
  if (data.x && data.x.length > 0) {
    parts.push('## TWEETS');
    for (const builder of data.x) {
      parts.push(`\n### ${builder.name} (${builder.handle})`);
      parts.push(`Bio: ${builder.bio || ''}`);
      for (const tweet of builder.tweets) {
        parts.push(`- [${tweet.createdAt}] ${tweet.text} (URL: ${tweet.url}, Likes: ${tweet.likes})`);
      }
    }
  }

  // Podcasts
  if (data.podcasts && data.podcasts.length > 0) {
    parts.push('\n## PODCASTS');
    for (const pod of data.podcasts) {
      parts.push(`\n### ${pod.name}: ${pod.title}`);
      parts.push(`URL: ${pod.url}`);
      // Include a truncated transcript (first ~15000 chars to stay within token limits)
      const transcript = pod.transcript || '';
      const truncated = transcript.length > 15000 ? transcript.slice(0, 15000) + '...(transcript truncated)' : transcript;
      parts.push(`Transcript:\n${truncated}`);
    }
  }

  // Blogs
  if (data.blogs && data.blogs.length > 0) {
    parts.push('\n## BLOGS');
    for (const blog of data.blogs) {
      parts.push(`\n### ${blog.name}: ${blog.title}`);
      parts.push(`Author: ${blog.author || 'Unknown'}`);
      parts.push(`URL: ${blog.url}`);
      if (blog.content) {
        parts.push(`Content:\n${blog.content}`);
      }
    }
  }

  return parts.join('\n');
}

// -- Main --------------------------------------------------------------------

async function main() {
  const jsonPath = process.argv[2];
  if (!jsonPath) {
    console.error('Usage: node run-digest-ga.js <path-to-digest-data.json>');
    process.exit(1);
  }

  // 1. Read prepared data
  const data = JSON.parse(await readFile(jsonPath, 'utf-8'));

  // Check for empty content
  const s = data.stats || {};
  if ((s.xBuilders || 0) === 0 && (s.podcastEpisodes || 0) === 0 && (s.blogPosts || 0) === 0) {
    const date = new Date().toISOString().slice(0, 10);
    console.log(`# AI Builders Digest — ${date}\n\n今天沒有來自建設者的新更新。請明天再回來！\n\nGenerated through the Follow Builders skill: https://github.com/zarazhangrui/follow-builders`);
    return;
  }

  // 2. Validate Gemini API config
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('ERROR: GEMINI_API_KEY environment variable is required');
    process.exit(1);
  }

  // Support both OpenAI-compatible endpoint (for Vercel proxies) and native Gemini
  const apiHost = process.env.GEMINI_API_HOST || 'https://generativelanguage.googleapis.com';
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  // Detect if this is an OpenAI-compatible endpoint (most Vercel proxies are)
  const isProxy = apiHost !== 'https://generativelanguage.googleapis.com';

  let url, headers, body;

  if (isProxy) {
    // OpenAI-compatible endpoint (Vercel proxy)
    url = `${apiHost.replace(/\/$/, '')}/v1/chat/completions`;
    headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    };
    body = JSON.stringify({
      model,
      messages: [
        { role: 'system', content: buildSystemPrompt() },
        { role: 'user', content: buildUserPrompt(data) }
      ],
      temperature: 0.7,
      max_tokens: 8000
    });
    console.error(`Calling OpenAI-compatible endpoint: ${url} (model: ${model})`);
  } else {
    // Native Gemini API
    url = `${apiHost.replace(/\/$/, '')}/v1beta/models/${model}:generateContent?key=${apiKey}`;
    headers = { 'Content-Type': 'application/json' };
    body = JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: buildSystemPrompt() + '\n\n---\n\n' + buildUserPrompt(data) }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8000
      }
    });
    console.error(`Calling native Gemini API: ${url} (model: ${model})`);
  }

  // 3. Call the API
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error(`API error (${res.status}): ${errText}`);
    process.exit(1);
  }

  const json = await res.json();

  // Extract response based on API format
  let digest;
  if (isProxy) {
    // OpenAI-compatible response format
    digest = json.choices[0].message.content;
  } else {
    // Native Gemini response format
    digest = json.candidates[0].content.parts[0].text;
  }

  if (!digest) {
    console.error('ERROR: No content in API response');
    console.error(JSON.stringify(json, null, 2));
    process.exit(1);
  }

  // 4. Output
  console.log(digest);
}

main().catch(err => {
  console.error(`Fatal error: ${err.message}`);
  process.exit(1);
});

<div align="center">

# 🌙 Luna

**An interactive visual novel storybook powered by Gemini AI**

[![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Gemini](https://img.shields.io/badge/Google_Gemini-8E75B2?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev/)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Cloud Run](https://img.shields.io/badge/Cloud_Run-4285F4?style=flat-square&logo=google-cloud&logoColor=white)](https://cloud.google.com/run)
[![License: MIT](https://img.shields.io/badge/License-MIT-A3B18A?style=flat-square)](LICENSE)

Give Luna a theme, and she will paint your story.

[Demo](#demo) · [How It Works](#how-it-works) · [Setup](#setup) · [Export](#export-your-story)

</div>

---

## What is Luna?

Luna generates illustrated stories — each page pairs an **impressionist digital painting** with brief **visual novel narration**, read aloud by an **AI narrator**. You guide the story by choosing what happens next.

A theme like *"a shallow pool among jagged rocks at sunset"* becomes a 5-page interactive storybook with paintings, prose, and voice — then branches into new chapters based on your choices.

## How It Works

```
Browser (Next.js / React)
    │  SSE stream
    ▼
Server (Next.js API Routes)
    │
    ├── Gemini 3.1 Pro         → Story plan (5 scenes, palette, choices)
    ├── Gemini 3.1 Flash Image → Painting + narration per page
    └── Gemini 2.5 Flash TTS   → Spoken narration (Aoede voice)
```

1. You enter a theme or scenario
2. **Gemini 3.1 Pro** produces a structured story plan — title, mood, color palette, 5 scene descriptions, and branching choices
3. **Gemini 3.1 Flash Image** generates each page one at a time: 1–2 sentences of narration + an impressionist painting, streamed to your browser via SSE as each page completes
4. **Gemini 2.5 Flash TTS** narrates the full section with the Aoede voice
5. After page 5, you choose a direction to continue — the story branches into a new 5-page chapter, with full continuity of title, mood, palette, and narrative

## Features

- **Per-page incremental rendering** — each painting and passage appears as it's generated, not all at once
- **Branching narrative** — choose from AI-generated options or write your own direction (120-char limit, sanitized)
- **Persistent audio** — TTS narration persists across story sections with per-page seek
- **Story export** — save your story as a **PDF** (serif type, justified layout, centered paintings) or a **ZIP** containing styled HTML + Markdown + separate image files
- **Per-painting download** — hover any painting for a download button
- **Silvery, cool aesthetic** — Cormorant Garamond serif, justified text with typewriter animation, vignette overlays, and a monochrome silver palette

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | **Next.js 16** (App Router, TypeScript) |
| AI — Planning | **Gemini 3.1 Pro** (`gemini-3.1-pro-preview`) |
| AI — Image + Text | **Gemini 3.1 Flash Image** (`gemini-3.1-flash-image-preview`) |
| AI — Narration | **Gemini 2.5 Flash TTS** (`gemini-2.5-flash-preview-tts`, Aoede voice) |
| AI SDK | **Google GenAI** (`@google/genai`) |
| Styling | **Tailwind CSS 4** |
| Typography | **Cormorant Garamond** + **Inter** (Google Fonts) |
| Export | **jsPDF** (PDF), **JSZip** (ZIP/HTML/Markdown) |
| Deploy | **Google Cloud Run** |

## Setup

### Prerequisites

- Node.js 20+
- Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)

### Local development

```bash
git clone https://github.com/YOUR_USERNAME/luna-storybook.git
cd luna-storybook
npm install
cp .env.example .env.local
# Add your GEMINI_API_KEY to .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Deploy to Cloud Run

```bash
export GCP_PROJECT_ID=your-project-id
export GEMINI_API_KEY=your-api-key
chmod +x deploy.sh
./deploy.sh
```

## Export Your Story

Once your story is complete, two export options appear:

- **Save Story** — downloads a `.zip` containing:
  - A styled `.html` file (open in any browser — Cormorant Garamond, justified layout, paintings, vignette)
  - A `.md` file (for VS Code, GitHub, or any Markdown editor)
  - An `images/` folder with each painting as a separate file
- **Save as PDF** — generates a formatted A4 PDF with a title page, centered paintings with shadow, and justified serif prose

You can also **download individual paintings** by hovering over any image in the story.

## Project Structure

```
src/
├── app/
│   ├── page.tsx           # Main story view + state management
│   └── api/generate/
│       └── route.ts       # SSE endpoint — orchestrates Gemini calls
├── components/
│   ├── StoryBook.tsx      # Story container with audio + choices
│   ├── StoryPage.tsx      # Single page (painting + prose)
│   ├── PaintingFrame.tsx  # Image frame with download button
│   ├── PoemText.tsx       # Typewriter-animated prose
│   ├── AudioPlayer.tsx    # Per-section audio with page seek
│   ├── ChoiceButtons.tsx  # Branching choices + custom input
│   ├── StoryInput.tsx     # Landing page / theme input
│   └── LoadingState.tsx   # Generation loading animation
└── lib/
    ├── gemini.ts          # Gemini API calls (plan, generate, TTS)
    ├── prompts.ts         # All system prompts + prompt builders
    ├── export.ts          # PDF, HTML, Markdown, ZIP export
    ├── pcm-to-wav.ts      # PCM → WAV conversion for TTS audio
    └── types.ts           # Shared TypeScript types
```

## Demo

[Link to YouTube video]

## License

MIT

---

<div align="center">

Built for the **Gemini Live Agent Challenge 2026** on Devpost

`#GeminiLiveAgentChallenge`

</div>

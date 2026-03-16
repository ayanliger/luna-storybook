# Luna — Interactive Impressionist Poetry Storybook

> An AI-powered creative storyteller that generates impressionist paintings paired with original poetry, narrated by an expressive AI voice.

## What it does

Luna transforms a theme, mood, or scenario into a multi-page illustrated poetry collection. Each "page" features an impressionist digital painting alongside a stanza of original poetry, with optional audio narration. Users guide the story through branching choices, creating a personalized, immersive multimodal narrative.

## How it works

```
User's Browser (Next.js React)
       │  HTTPS (SSE stream)
       ▼
Google Cloud Run (Next.js App)
       │  API calls
       ▼
Google AI APIs
  ├── Gemini 3.1 Pro → Story planning & structure (JSON)
  ├── Nano Banana 2  → Interleaved poetry + paintings
  └── Gemini TTS     → Expressive poetry narration
```

1. User submits a theme (e.g., "a rainy evening in a Japanese garden")
2. **Gemini 3.1 Pro** generates a structured story plan with 5 stanzas, visual scene descriptions, and branching choices
3. **Nano Banana 2** produces interleaved text and images — poetry stanzas alternating with impressionist paintings — in a single API call using `responseModalities: ["TEXT", "IMAGE"]`
4. **Gemini TTS** narrates the poetry with expressive, contemplative pacing
5. Content streams to the browser via SSE as it becomes available
6. User reads/listens, then selects a choice to continue the narrative

## Tech stack

- **Next.js** (TypeScript, App Router) on **Google Cloud Run**
- **Gemini 3.1 Pro** (`gemini-3.1-pro-preview`) for story planning
- **Nano Banana 2** (`gemini-3.1-flash-image-preview`) for interleaved text + image generation
- **Gemini 2.5 Flash TTS** (`gemini-2.5-flash-preview-tts`) for poetry narration
- **Google GenAI SDK** (`@google/genai`)
- **Tailwind CSS** for styling
- **Cormorant Garamond** + **Inter** from Google Fonts

## Setup instructions

### Prerequisites

- Node.js 20+
- Google Cloud account with billing enabled
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

## Architecture

See `docs/architecture.png` for the full architecture diagram.

## Demo

[Link to YouTube video]

## Built for

The **Gemini Live Agent Challenge** — Creative Storyteller category

#GeminiLiveAgentChallenge

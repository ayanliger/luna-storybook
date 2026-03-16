import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { StoryPlan, StoryPage } from "./types";
import {
  STORY_PLANNER_SYSTEM_PROMPT,
  IMPRESSIONIST_PROSE_SYSTEM_PROMPT,
  buildPlannerPrompt,
  buildSinglePagePrompt,
  buildTTSPrompt,
} from "./prompts";
import { pcmToWav } from "./pcm-to-wav";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const SAFETY_SETTINGS = [
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
  },
];

/** Strip markdown formatting, headers, and model reasoning/meta-commentary from prose output. */
function cleanProseOutput(raw: string): string {
  const lines = raw.split("\n");
  const cleaned = lines.filter((line) => {
    const trimmed = line.trim();
    // Remove markdown headers
    if (trimmed.startsWith("#")) return false;
    // Remove lines that are model reasoning / meta-commentary
    if (/^(I will |I have |The image |Since (it|the|this) |The (artwork|painting|generation) |Visual continuity)/i.test(trimmed)) return false;
    // Remove image placeholders and markdown artifacts
    if (/^[\[\{(](image|img|painting|illustration)[\]\})]$/i.test(trimmed)) return false;
    if (trimmed === "---" || trimmed === "***") return false;
    return true;
  });
  return cleaned.join("\n").trim();
}

const MODELS = {
  planner: "gemini-3.1-pro-preview",
  imagePoet: "gemini-3.1-flash-image-preview",
  tts: "gemini-2.5-flash-preview-tts",
} as const;

export async function planStory(
  theme: string,
  previousContext: {
    title: string;
    mood: string;
    colorPalette: string;
    previousStanzas: string[];
  } | null
): Promise<StoryPlan> {
  const prompt = buildPlannerPrompt(theme, previousContext);

  const response = await ai.models.generateContent({
    model: MODELS.planner,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      systemInstruction: STORY_PLANNER_SYSTEM_PROMPT,
      safetySettings: SAFETY_SETTINGS,
    },
  });

  const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("No response from story planner");

  return JSON.parse(text) as StoryPlan;
}

export async function generateSinglePage(
  plan: StoryPlan,
  pageIndex: number,
  previousPassages: string[]
): Promise<StoryPage> {
  const prompt = buildSinglePagePrompt(plan, pageIndex, previousPassages);

  const response = await ai.models.generateContent({
    model: MODELS.imagePoet,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      responseModalities: ["TEXT", "IMAGE"],
      systemInstruction: IMPRESSIONIST_PROSE_SYSTEM_PROMPT,
      safetySettings: SAFETY_SETTINGS,
    },
  });

  const parts = response.candidates?.[0]?.content?.parts;
  if (!parts) throw new Error("No response from image/prose generator");

  let prose = "";
  let imageData = "";
  let imageMime = "";
  let imageFound = false;

  for (const part of parts) {
    if (part.text && !imageFound) {
      // Only collect text before the first image to avoid duplicates
      prose += (prose ? "\n" : "") + part.text.trim();
    } else if (part.inlineData) {
      imageData = part.inlineData.data!;
      imageMime = part.inlineData.mimeType!;
      imageFound = true;
    }
  }

  // Strip model reasoning, markdown headers, and meta-commentary
  prose = cleanProseOutput(prose);

  return {
    pageNumber: pageIndex + 1,
    poem: prose || `Page ${pageIndex + 1}`,
    image: { data: imageData, mimeType: imageMime },
  };
}

export async function generateNarration(
  poemText: string
): Promise<{ data: string; mimeType: string }> {
  const prompt = buildTTSPrompt(poemText);

  const response = await ai.models.generateContent({
    model: MODELS.tts,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      responseModalities: ["AUDIO"],
      safetySettings: SAFETY_SETTINGS,
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: "Aoede",
          },
        },
      },
    },
  });

  const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;
  if (!audioData?.data) throw new Error("No audio data from TTS");

  const wavBuffer = pcmToWav(audioData.data);

  return {
    data: wavBuffer.toString("base64"),
    mimeType: "audio/wav",
  };
}

import { GoogleGenAI } from "@google/genai";
import { StoryPlan, StoryPage } from "./types";
import {
  STORY_PLANNER_SYSTEM_PROMPT,
  IMPRESSIONIST_PROSE_SYSTEM_PROMPT,
  buildPlannerPrompt,
  buildImagePrompt,
  buildTTSPrompt,
} from "./prompts";
import { pcmToWav } from "./pcm-to-wav";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

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
    },
  });

  const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("No response from story planner");

  return JSON.parse(text) as StoryPlan;
}

export async function generateInterleavedContent(
  plan: StoryPlan
): Promise<StoryPage[]> {
  const prompt = buildImagePrompt(plan);

  const response = await ai.models.generateContent({
    model: MODELS.imagePoet,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      responseModalities: ["TEXT", "IMAGE"],
      systemInstruction: IMPRESSIONIST_PROSE_SYSTEM_PROMPT,
    },
  });

  const parts = response.candidates?.[0]?.content?.parts;
  if (!parts) throw new Error("No response from image/prose generator");

  const pages: StoryPage[] = [];
  let currentPoem = "";

  for (const part of parts) {
    if (part.text) {
      currentPoem += (currentPoem ? "\n" : "") + part.text.trim();
    } else if (part.inlineData) {
      pages.push({
        pageNumber: pages.length + 1,
        poem: currentPoem || `Page ${pages.length + 1}`,
        image: {
          data: part.inlineData.data!,
          mimeType: part.inlineData.mimeType!,
        },
      });
      currentPoem = "";
    }
  }

  // If there's trailing text without an image, attach it to the last page
  if (currentPoem && pages.length > 0) {
    pages[pages.length - 1].poem += "\n\n" + currentPoem;
  }

  return pages;
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

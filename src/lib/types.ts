export interface StoryPage {
  pageNumber: number;
  poem: string;
  image: {
    data: string;
    mimeType: string;
  };
  audio?: {
    data: string;
    mimeType: string;
  };
}

export interface StoryPlan {
  title: string;
  mood: string;
  colorPalette: string;
  stanzas: StanzaPlan[];
  choices: StoryChoice[];
}

export interface StanzaPlan {
  stanzaNumber: number;
  poeticTheme: string;
  visualScene: string;
  emotionalArc: string;
}

export interface StoryChoice {
  label: string;
  themeDirection: string;
}

export interface StoryState {
  title: string;
  mood: string;
  colorPalette: string;
  pages: StoryPage[];
  choices: StoryChoice[];
  isGenerating: boolean;
  currentChapter: number;
}

export interface SSEEvent {
  type:
    | "status"
    | "title"
    | "stanza"
    | "image"
    | "audio"
    | "choices"
    | "done"
    | "error";
  [key: string]: unknown;
}

export interface GenerateRequest {
  theme: string;
  previousContext: {
    title: string;
    mood: string;
    colorPalette: string;
    previousStanzas: string[];
  } | null;
}

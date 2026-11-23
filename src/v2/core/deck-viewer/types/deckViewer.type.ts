export type DeckSlideTheme = "dark" | "light";

export interface DeckSlide {
  /** 1-based page/slide number */
  pageNumber: number;
  /** Short title displayed in the thumbnail sidebar (fallback if titleKey is omitted or missing) */
  title: string;
  /** Optional V2 i18n key for the slide title */
  titleKey?: string;
  /** Optional subtitle or section category */
  subtitle?: string;
  /** Optional V2 i18n key for the slide subtitle */
  subtitleKey?: string;
  /** Slide background theme for visual thumbnail preview */
  theme?: DeckSlideTheme;
  /** Optional accent color hex or CSS color for thumbnail card */
  accentColor?: string;
}

export interface DeckConfig {
  /** Unique identifier of the deck */
  id: string;
  /** Document title shown in the viewer toolbar */
  title: string;
  /** Optional V2 i18n key for the document title */
  titleKey?: string;
  /** Subtitle or metadata label shown under/beside the title */
  subtitle?: string;
  /** Optional V2 i18n key for the document subtitle */
  subtitleKey?: string;
  /** Static HTML path or URL of the slide deck */
  src: string;
  /** Slide/page definitions for the thumbnail navigation sidebar */
  slides: DeckSlide[];
  /** Optional default page number (1-based) */
  defaultPage?: number;
}

export interface UseV2DeckViewerOptions {
  totalSlides: number;
  defaultPage?: number;
}

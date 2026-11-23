import type { DeckConfig } from "@/v2/core/deck-viewer";
import { imotorbikeDeckConfig } from "./imotorbikeDeck.config";

export const DECK_REGISTRY: Record<string, DeckConfig> = {
  imotorbike: imotorbikeDeckConfig,
};

export { imotorbikeDeckConfig };

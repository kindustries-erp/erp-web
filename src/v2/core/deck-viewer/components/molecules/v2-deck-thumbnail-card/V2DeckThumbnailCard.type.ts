import type { DeckSlide } from "../../../types/deckViewer.type";

export interface V2DeckThumbnailCardProps {
  slide: DeckSlide;
  isActive: boolean;
  onSelect: (pageNumber: number) => void;
  buttonRef?: (el: HTMLButtonElement | null) => void;
}

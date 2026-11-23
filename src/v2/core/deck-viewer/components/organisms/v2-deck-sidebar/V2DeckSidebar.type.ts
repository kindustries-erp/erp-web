import type { DeckSlide } from "../../../types/deckViewer.type";

export interface V2DeckSidebarProps {
  slides: DeckSlide[];
  currentPage: number;
  isOpen: boolean;
  onSelectPage: (pageNumber: number) => void;
  onCloseMobile?: () => void;
}

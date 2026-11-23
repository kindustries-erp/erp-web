import "./deckViewer.locale";

export { V2DeckViewer } from "./components/organisms/v2-deck-viewer";
export type { V2DeckViewerProps } from "./components/organisms/v2-deck-viewer";
export { V2DeckSidebar } from "./components/organisms/v2-deck-sidebar";
export type { V2DeckSidebarProps } from "./components/organisms/v2-deck-sidebar";
export { V2DeckToolbar } from "./components/organisms/v2-deck-toolbar";
export type { V2DeckToolbarProps } from "./components/organisms/v2-deck-toolbar";
export { V2DeckThumbnailCard } from "./components/molecules/v2-deck-thumbnail-card";
export type { V2DeckThumbnailCardProps } from "./components/molecules/v2-deck-thumbnail-card";
export { useV2DeckViewer } from "./hooks";
export type {
  DeckConfig,
  DeckSlide,
  DeckSlideTheme,
  UseV2DeckViewerOptions,
} from "./types/deckViewer.type";

export interface V2DeckToolbarProps {
  title: string;
  subtitle?: string;
  currentPage: number;
  totalPages: number;
  isSidebarOpen: boolean;
  isFullscreen: boolean;
  onToggleSidebar: () => void;
  onPrev: () => void;
  onNext: () => void;
  onDownloadPdf: () => void;
  onToggleFullscreen: () => void;
}

import { useCallback, useEffect, useRef, useState } from "react";
import type { UseV2DeckViewerOptions } from "../types/deckViewer.type";

function parseSlideHash(hash: string, totalSlides: number): number | null {
  const match = /^#(\d+)$/.exec(hash);
  if (!match) return null;
  const page = Number(match[1]);
  if (!Number.isFinite(page) || page < 1 || page > totalSlides) return null;
  return page;
}

export function useV2DeckViewer({
  totalSlides,
  defaultPage = 1,
}: UseV2DeckViewerOptions) {
  const safeTotal = Math.max(1, totalSlides);
  const initialPage = Math.max(1, Math.min(safeTotal, defaultPage));

  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() =>
    typeof window !== "undefined" ? window.innerWidth >= 768 : true,
  );
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lastHashRef = useRef<string>(`#${initialPage}`);

  const goToPage = useCallback(
    (page: number) => {
      const target = Math.max(1, Math.min(safeTotal, page));
      const nextHash = `#${target}`;
      lastHashRef.current = nextHash;
      setCurrentPage(target);

      try {
        const cw = iframeRef.current?.contentWindow;
        if (cw && cw.location.hash !== nextHash) {
          cw.location.hash = nextHash;
        }
      } catch {
        // Ignore cross-origin errors if external deck src is used
      }
    },
    [safeTotal],
  );

  const goPrev = useCallback(
    () => goToPage(currentPage - 1),
    [currentPage, goToPage],
  );

  const goNext = useCallback(
    () => goToPage(currentPage + 1),
    [currentPage, goToPage],
  );

  const toggleSidebar = useCallback(
    () => setIsSidebarOpen((prev) => !prev),
    [],
  );

  const downloadPdf = useCallback(() => {
    const cw = iframeRef.current?.contentWindow;
    if (!cw) return;
    cw.focus();
    cw.print();
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (typeof document === "undefined") return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else if (containerRef.current?.requestFullscreen) {
      void containerRef.current.requestFullscreen();
    }
  }, []);

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  useEffect(() => {
    const syncFromIframe = () => {
      try {
        const cw = iframeRef.current?.contentWindow;
        if (!cw) return;
        const hash = cw.location.hash;
        if (!hash || hash === lastHashRef.current) return;
        const parsed = parseSlideHash(hash, safeTotal);
        if (parsed !== null) {
          lastHashRef.current = hash;
          setCurrentPage(parsed);
        }
      } catch {
        // Ignore cross-origin errors
      }
    };

    const timer = window.setInterval(syncFromIframe, 250);
    return () => window.clearInterval(timer);
  }, [safeTotal]);

  return {
    currentPage,
    totalPages: safeTotal,
    isSidebarOpen,
    isFullscreen,
    iframeRef,
    containerRef,
    goToPage,
    goPrev,
    goNext,
    toggleSidebar,
    setIsSidebarOpen,
    downloadPdf,
    toggleFullscreen,
  };
}

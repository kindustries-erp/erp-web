import { useMemo } from "react";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { cn } from "@/v2/shared/utils/cn";
import { useV2DeckViewer } from "../../../hooks";
import { V2DeckSidebar } from "../v2-deck-sidebar";
import { V2DeckToolbar } from "../v2-deck-toolbar";
import type { V2DeckViewerProps } from "./V2DeckViewer.type";

export function V2DeckViewer({ config, className }: V2DeckViewerProps) {
  const { t } = useV2Translation();
  const {
    currentPage,
    totalPages,
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
  } = useV2DeckViewer({
    totalSlides: config.slides.length,
    defaultPage: config.defaultPage,
  });

  const resolvedTitle = config.titleKey
    ? t(config.titleKey, config.title)
    : config.title;
  const resolvedSubtitle = config.subtitleKey
    ? t(config.subtitleKey, config.subtitle ?? "")
    : config.subtitle;

  const initialSrc = useMemo(
    () => `${config.src}#${config.defaultPage ?? 1}`,
    [config.src, config.defaultPage],
  );

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex h-screen w-screen flex-col overflow-hidden bg-neutral-950 text-neutral-100",
        className,
      )}
    >
      <V2DeckToolbar
        title={resolvedTitle}
        subtitle={resolvedSubtitle}
        currentPage={currentPage}
        totalPages={totalPages}
        isSidebarOpen={isSidebarOpen}
        isFullscreen={isFullscreen}
        onToggleSidebar={toggleSidebar}
        onPrev={goPrev}
        onNext={goNext}
        onDownloadPdf={downloadPdf}
        onToggleFullscreen={toggleFullscreen}
      />

      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        <V2DeckSidebar
          slides={config.slides}
          currentPage={currentPage}
          isOpen={isSidebarOpen}
          onSelectPage={goToPage}
          onCloseMobile={() => setIsSidebarOpen(false)}
        />

        <main className="relative flex-1 bg-black">
          <iframe
            ref={iframeRef}
            src={initialSrc}
            title={resolvedTitle}
            className="h-full w-full border-0"
          />
        </main>
      </div>
    </div>
  );
}

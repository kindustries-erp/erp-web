import { useEffect, useMemo, useRef, useState } from "react";
import { V2Icon, V2Input, V2Text } from "@/v2/shared/components/atoms";
import { Layers, Search } from "@/v2/shared/components/atoms/v2-icon/icons";
import { V2EmptyState } from "@/v2/shared/components/molecules/v2-empty-state";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { cn } from "@/v2/shared/utils/cn";
import { V2DeckThumbnailCard } from "../../molecules/v2-deck-thumbnail-card";
import type { V2DeckSidebarProps } from "./V2DeckSidebar.type";

export function V2DeckSidebar({
  slides,
  currentPage,
  isOpen,
  onSelectPage,
  onCloseMobile,
}: V2DeckSidebarProps) {
  const { t } = useV2Translation();
  const [query, setQuery] = useState("");
  const cardRefs = useRef<Record<number, HTMLButtonElement | null>>({});

  useEffect(() => {
    const activeEl = cardRefs.current[currentPage];
    if (activeEl && typeof activeEl.scrollIntoView === "function") {
      activeEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [currentPage]);

  const filteredSlides = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return slides;
    return slides.filter((slide) => {
      const title = (
        slide.titleKey ? t(slide.titleKey, slide.title) : slide.title
      ).toLowerCase();
      const subtitle = (
        slide.subtitleKey
          ? t(slide.subtitleKey, slide.subtitle ?? "")
          : (slide.subtitle ?? "")
      ).toLowerCase();
      return (
        String(slide.pageNumber).includes(q) ||
        title.includes(q) ||
        subtitle.includes(q)
      );
    });
  }, [query, slides, t]);

  if (!isOpen) return null;

  const handleSelect = (pageNumber: number) => {
    onSelectPage(pageNumber);
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      onCloseMobile?.();
    }
  };

  const searchLabel = t(
    "v2.deckViewer.searchPlaceholder",
    "Tìm theo số hoặc tiêu đề...",
  );

  return (
    <>
      <div
        className="fixed inset-0 top-14 z-20 bg-black/60 md:hidden"
        onClick={onCloseMobile}
        aria-hidden="true"
      />
      <aside
        aria-label={t("v2.deckViewer.pageList", "Danh sách trang")}
        className={cn(
          "fixed inset-y-0 top-14 left-0 z-30 flex w-64 shrink-0 flex-col border-r border-neutral-800 bg-neutral-950 md:static md:inset-auto md:z-auto md:w-64 lg:w-72",
        )}
      >
        <div className="space-y-2 border-b border-neutral-800 px-3 py-2.5">
          <div className="flex items-center gap-2 text-neutral-300">
            <V2Icon icon={Layers} size={14} className="text-emerald-400" />
            <V2Text as="span" variant="section-title" color="inherit">
              {t("v2.deckViewer.pagesCount", {
                defaultValue: `Mục lục (${slides.length} trang)`,
                count: slides.length,
              })}
            </V2Text>
          </div>

          <V2Input
            size="sm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            clearable
            onClear={() => setQuery("")}
            placeholder={searchLabel}
            aria-label={searchLabel}
            leftIcon={<V2Icon icon={Search} size={14} />}
            inputClassName="bg-neutral-900 border-neutral-800 text-base sm:text-xs text-neutral-100 placeholder:text-neutral-500"
          />
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto p-3">
          {filteredSlides.length === 0 ? (
            <V2EmptyState
              title={t(
                "v2.deckViewer.noMatchingPages",
                "Không tìm thấy trang phù hợp",
              )}
              className="py-8 text-neutral-400"
            />
          ) : (
            filteredSlides.map((slide) => (
              <V2DeckThumbnailCard
                key={slide.pageNumber}
                slide={slide}
                isActive={slide.pageNumber === currentPage}
                onSelect={handleSelect}
                buttonRef={(el) => {
                  cardRefs.current[slide.pageNumber] = el;
                }}
              />
            ))
          )}
        </nav>
      </aside>
    </>
  );
}

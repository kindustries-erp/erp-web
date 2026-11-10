import { V2Button, V2Icon, V2Text } from "@/v2/shared/components/atoms";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Maximize,
  Minimize,
  PanelLeft,
  PanelLeftClose,
} from "@/v2/shared/components/atoms/v2-icon/icons";
import { V2LanguageSwitcher } from "@/v2/shared/components/molecules/v2-language-switcher";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { cn } from "@/v2/shared/utils/cn";
import type { V2DeckToolbarProps } from "./V2DeckToolbar.type";

const ICON_BTN_CLS =
  "min-h-[44px] min-w-[44px] p-0 text-neutral-200 hover:bg-neutral-800 hover:text-white focus-visible:ring-emerald-500";

export function V2DeckToolbar({
  title,
  subtitle,
  currentPage,
  totalPages,
  isSidebarOpen,
  isFullscreen,
  onToggleSidebar,
  onPrev,
  onNext,
  onDownloadPdf,
  onToggleFullscreen,
}: V2DeckToolbarProps) {
  const { t } = useV2Translation();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-neutral-800 bg-neutral-950 px-2 sm:px-4">
      <div className="flex min-w-0 items-center gap-1.5 sm:gap-2.5">
        <V2Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          aria-label={t(
            "v2.deckViewer.toggleSidebar",
            "Đóng/mở danh sách trang",
          )}
          aria-expanded={isSidebarOpen}
          className={ICON_BTN_CLS}
        >
          <V2Icon icon={isSidebarOpen ? PanelLeftClose : PanelLeft} size={20} />
        </V2Button>

        <div className="min-w-0">
          <V2Text
            as="h1"
            variant="h4"
            color="inherit"
            truncate={1}
            className="text-sm text-neutral-100 sm:text-base"
          >
            {title}
          </V2Text>
          {subtitle && (
            <V2Text
              as="p"
              variant="caption"
              color="inherit"
              truncate={1}
              className="hidden text-neutral-400 sm:block"
            >
              {subtitle}
            </V2Text>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <V2LanguageSwitcher
          size="sm"
          className="hidden h-8 border-neutral-700 bg-neutral-900 text-neutral-300 md:inline-flex"
        />

        <div className="flex items-center rounded-md border border-neutral-800 bg-neutral-900">
          <V2Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onPrev}
            disabled={currentPage <= 1}
            aria-label={t("v2.deckViewer.prevPage", "Trang trước")}
            className={cn(ICON_BTN_CLS, "rounded-r-none")}
          >
            <V2Icon icon={ChevronLeft} size={16} />
          </V2Button>

          <V2Text
            as="span"
            variant="numeric"
            color="inherit"
            weight="medium"
            aria-live="polite"
            className="min-w-[64px] px-2 text-center text-xs text-neutral-200 sm:text-sm"
          >
            {currentPage} / {totalPages}
          </V2Text>

          <V2Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onNext}
            disabled={currentPage >= totalPages}
            aria-label={t("v2.deckViewer.nextPage", "Trang tiếp theo")}
            className={cn(ICON_BTN_CLS, "rounded-l-none")}
          >
            <V2Icon icon={ChevronRight} size={16} />
          </V2Button>
        </div>

        <V2Button
          type="button"
          variant="primary"
          onClick={onDownloadPdf}
          aria-label={t("v2.deckViewer.downloadPdf", "Tải PDF")}
          leftIcon={<V2Icon icon={Download} size={16} />}
          className="min-h-[44px] border-emerald-600 bg-emerald-600 px-3 text-xs font-semibold text-white hover:bg-emerald-500 sm:px-4 sm:text-sm"
        >
          <V2Text
            as="span"
            variant="body-sm"
            color="inherit"
            weight="semibold"
            className="hidden sm:inline"
          >
            {t("v2.deckViewer.downloadPdf", "Tải PDF")}
          </V2Text>
        </V2Button>

        <V2Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onToggleFullscreen}
          aria-label={t("v2.deckViewer.toggleFullscreen", "Toàn màn hình")}
          className={cn(ICON_BTN_CLS, "hidden sm:inline-flex")}
        >
          <V2Icon icon={isFullscreen ? Minimize : Maximize} size={16} />
        </V2Button>
      </div>
    </header>
  );
}

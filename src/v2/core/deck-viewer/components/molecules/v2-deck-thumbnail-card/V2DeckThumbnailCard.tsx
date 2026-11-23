import { V2Badge, V2Button, V2Text } from "@/v2/shared/components/atoms";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { cn } from "@/v2/shared/utils/cn";
import type { V2DeckThumbnailCardProps } from "./V2DeckThumbnailCard.type";

export function V2DeckThumbnailCard({
  slide,
  isActive,
  onSelect,
  buttonRef,
}: V2DeckThumbnailCardProps) {
  const { t } = useV2Translation();
  const isDark = slide.theme === "dark";
  const resolvedTitle = slide.titleKey
    ? t(slide.titleKey, slide.title)
    : slide.title;
  const resolvedSubtitle = slide.subtitleKey
    ? t(slide.subtitleKey, slide.subtitle ?? "")
    : slide.subtitle;

  return (
    <V2Button
      ref={buttonRef}
      type="button"
      variant="ghost"
      onClick={() => onSelect(slide.pageNumber)}
      aria-current={isActive ? "page" : undefined}
      aria-label={t("v2.deckViewer.slideAriaLabel", {
        defaultValue: `Trang ${slide.pageNumber}: ${resolvedTitle}`,
        page: slide.pageNumber,
        title: resolvedTitle,
      })}
      className={cn(
        "group relative flex h-auto w-full min-h-[44px] flex-col items-stretch justify-start gap-2 whitespace-normal rounded-lg p-2 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500",
        isActive
          ? "bg-neutral-800/90 ring-2 ring-emerald-500 hover:bg-neutral-800/90"
          : "bg-neutral-900/60 hover:bg-neutral-800/60",
      )}
    >
      <div
        className={cn(
          "relative flex aspect-video w-full flex-col justify-between overflow-hidden rounded-md border p-2.5 shadow-sm transition-transform",
          isDark
            ? "border-neutral-700 bg-[#0e1a2b] text-[#f4f2ec]"
            : "border-stone-300 bg-[#f4f2ec] text-[#0e1a2b]",
          isActive
            ? "border-emerald-500/80"
            : "group-hover:border-emerald-400/50",
        )}
      >
        <div className="flex items-center justify-between gap-1.5">
          <V2Badge
            variant="secondary"
            className={cn(
              "inline-flex h-5 min-w-[22px] items-center justify-center rounded border-0 px-1.5 text-[11px] font-bold tabular-nums",
              isActive
                ? "bg-emerald-500 text-neutral-950 hover:bg-emerald-500"
                : isDark
                  ? "bg-white/15 text-stone-200 hover:bg-white/15"
                  : "bg-stone-800/10 text-stone-700 hover:bg-stone-800/10",
            )}
          >
            {slide.pageNumber}
          </V2Badge>
          {resolvedSubtitle && (
            <V2Text
              as="span"
              variant="caption"
              color="inherit"
              weight="medium"
              truncate={1}
              className={cn(
                "text-[10px] uppercase tracking-wider",
                isDark ? "text-teal-300/90" : "text-emerald-700/90",
              )}
            >
              {resolvedSubtitle}
            </V2Text>
          )}
        </div>

        <div className="space-y-1">
          <V2Text
            as="p"
            variant="caption"
            color="inherit"
            weight="semibold"
            truncate={2}
            className="text-[11px] leading-snug"
          >
            {resolvedTitle}
          </V2Text>
          <div className="flex gap-1 pt-0.5 opacity-60">
            <span
              className={cn(
                "h-1 w-8 rounded-full",
                isDark ? "bg-teal-400" : "bg-emerald-700",
              )}
            />
            <span
              className={cn(
                "h-1 w-4 rounded-full",
                isDark ? "bg-stone-500" : "bg-stone-400",
              )}
            />
          </div>
        </div>
      </div>

      <div className="flex items-start gap-2 px-0.5">
        <V2Text
          as="span"
          variant="numeric"
          color="inherit"
          weight="semibold"
          className={cn(
            "mt-0.5 text-xs",
            isActive ? "text-emerald-400" : "text-neutral-400",
          )}
        >
          {slide.pageNumber}.
        </V2Text>
        <V2Text
          as="span"
          variant="body-sm"
          color="inherit"
          truncate={2}
          weight={isActive ? "medium" : "normal"}
          className={cn(
            "leading-snug",
            isActive
              ? "text-neutral-100"
              : "text-neutral-300 group-hover:text-neutral-100",
          )}
        >
          {resolvedTitle}
        </V2Text>
      </div>
    </V2Button>
  );
}

import React from "react";
import { cn } from "@/shared/utils";
import { Popover } from "@/core/components/ui/Popover";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { ChevronDown, Loader2, Plus } from "lucide-react";
import { GarageCaseExclusionBadges } from "../../GarageCaseExclusionBadges";
import { useGarageCaseExclusionDropdown } from "./GarageCaseExclusionDropdown.hook";
import { getExclusionTooltipContent } from "./GarageCaseExclusionDropdown.helper";
import { GarageCaseExclusionPopoverContent } from "./GarageCaseExclusionPopoverContent";
import type { GarageCaseExclusionDropdownProps } from "./GarageCaseExclusionDropdown.type";

export function GarageCaseExclusionDropdown({
  caseItem,
  canUpdate = true,
  onOpenDrawer,
  className,
}: GarageCaseExclusionDropdownProps) {
  const {
    open,
    setOpen,
    excludeFromReports,
    excludeFromDebt,
    hasAnyExclusion,
    handleToggle,
    handleTriggerClick,
    isUpdating,
    t,
  } = useGarageCaseExclusionDropdown(caseItem, canUpdate, onOpenDrawer);

  const values = { excludeFromReports, excludeFromDebt };

  return (
    <div
      className={cn("inline-flex items-center justify-center", className)}
      onClick={(e) => e.stopPropagation()}
    >
      <Popover
        open={open}
        onOpenChange={setOpen}
        content={
          <GarageCaseExclusionPopoverContent
            caseCode={caseItem.soChungTu}
            values={values}
            handleToggle={handleToggle}
            onOpenDrawer={onOpenDrawer}
            onClose={() => setOpen(false)}
            t={t}
          />
        }
        align="center"
        side="bottom"
        sideOffset={4}
      >
        <button
          type="button"
          onClick={handleTriggerClick}
          disabled={isUpdating}
          className={cn(
            "group w-[136px] h-6 inline-flex items-center justify-between px-2 rounded-md text-[11px] font-semibold border transition-all select-none focus:outline-hidden",
            canUpdate
              ? "cursor-pointer hover:opacity-90 hover:scale-[1.02]"
              : "cursor-default opacity-90",
            isUpdating && "opacity-60 pointer-events-none",
            hasAnyExclusion
              ? "bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-foreground"
              : "border-dashed border-slate-300 dark:border-slate-700 bg-transparent text-muted-foreground/70 hover:border-slate-400 dark:hover:border-slate-600 hover:text-foreground",
          )}
          title={
            canUpdate
              ? t(
                  "cases.actions.clickToSelectExclusion",
                  "Nhấn để thiết lập nhanh quy tắc loại trừ",
                )
              : t("cases.actions.viewOnly", "Chỉ xem")
          }
        >
          <Tooltip
            content={getExclusionTooltipContent(
              hasAnyExclusion,
              excludeFromReports,
              excludeFromDebt,
              t("cases.exclusions.ruleLabel", "Quy tắc loại trừ"),
            )}
          >
            <div className="flex items-center gap-1 min-w-0 truncate pr-1">
              {hasAnyExclusion ? (
                <GarageCaseExclusionBadges
                  excludeFromReports={excludeFromReports}
                  excludeFromDebt={excludeFromDebt}
                />
              ) : (
                <div className="inline-flex items-center gap-1 truncate text-[11px] font-medium text-muted-foreground">
                  <Plus className="w-2.5 h-2.5 opacity-70 shrink-0" />
                  <span className="truncate">
                    {t("cases.exclusions.ruleLabel", "Quy tắc")}
                  </span>
                </div>
              )}
            </div>
          </Tooltip>
          {isUpdating ? (
            <Loader2 className="w-2.5 h-2.5 animate-spin text-muted-foreground shrink-0" />
          ) : (
            canUpdate && (
              <ChevronDown className="w-2.5 h-2.5 opacity-70 transition-transform group-hover:opacity-100 group-hover:scale-110 shrink-0" />
            )
          )}
        </button>
      </Popover>
    </div>
  );
}

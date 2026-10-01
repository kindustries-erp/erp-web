import React from "react";
import { cn } from "@/shared/utils";
import { Popover } from "@/core/components/ui/Popover";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { ChevronDown, Settings2, Loader2, Plus } from "lucide-react";
import { GarageCaseExclusionBadges } from "../../GarageCaseExclusionBadges";
import { useGarageCaseExclusionDropdown } from "./GarageCaseExclusionDropdown.hook";
import { EXCLUSION_OPTIONS } from "./GarageCaseExclusionDropdown.helper";
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

  const popoverContent = (
    <div
      className="w-72 max-w-[90vw] p-1.5 flex flex-col text-xs select-none"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="px-2.5 py-1.5 border-b border-border/50 flex items-center justify-between">
        <span className="font-semibold text-foreground tracking-tight">
          {t("cases.dropdown.exclusionTitle", "Quy tắc loại trừ")}
        </span>
        {caseItem.soChungTu && (
          <span className="text-[11px] text-muted-foreground font-mono">
            {caseItem.soChungTu}
          </span>
        )}
      </div>

      <div className="py-1 flex flex-col gap-1">
        {EXCLUSION_OPTIONS.map((opt) => {
          const isChecked = values[opt.key];
          return (
            <div
              key={opt.key}
              role="button"
              tabIndex={0}
              onClick={() => handleToggle(opt.key)}
              onKeyDown={(e) => e.key === "Enter" && handleToggle(opt.key)}
              className={cn(
                "w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-left transition-all cursor-pointer group",
                isChecked
                  ? cn(
                      "bg-slate-100 dark:bg-slate-800/80 font-medium text-foreground shadow-xs border-l-2 pl-2",
                      opt.activeBorder,
                    )
                  : "hover:bg-slate-100/90 dark:hover:bg-slate-800/60 text-foreground/80 hover:text-foreground",
              )}
            >
              <div className="flex flex-col min-w-0 pr-1">
                <div className="flex items-center gap-1.5">
                  {opt.icon}
                  <span className="truncate text-xs font-medium group-hover:text-foreground">
                    {t(opt.labelKey, opt.labelDefault)}
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground truncate leading-tight mt-0.5 group-hover:text-muted-foreground/90">
                  {t(opt.descKey, opt.descDefault)}
                </span>
              </div>
              <Checkbox
                checked={isChecked}
                onCheckedChange={() => handleToggle(opt.key)}
                className="shrink-0 pointer-events-none"
              />
            </div>
          );
        })}
      </div>

      {onOpenDrawer && (
        <div className="pt-1.5 mt-0.5 border-t border-border/50">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onOpenDrawer();
            }}
            className="w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-left text-muted-foreground hover:text-foreground hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
          >
            <Settings2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span className="text-[11px] font-medium">
              {t("cases.dropdown.openDrawerDetails", "Mở Drawer cấu hình...")}
            </span>
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div
      className={cn("inline-flex items-center justify-center", className)}
      onClick={(e) => e.stopPropagation()}
    >
      <Popover
        open={open}
        onOpenChange={setOpen}
        content={popoverContent}
        align="center"
        side="bottom"
        sideOffset={4}
      >
        <button
          type="button"
          onClick={handleTriggerClick}
          disabled={isUpdating}
          className={cn(
            "group w-[150px] h-6 inline-flex items-center justify-between px-2 rounded-md text-[11px] font-semibold border transition-all select-none focus:outline-hidden",
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

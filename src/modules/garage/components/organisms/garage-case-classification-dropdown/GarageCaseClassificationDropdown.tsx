import React from "react";
import { cn } from "@/shared/utils";
import { Popover } from "@/core/components/ui/Popover";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { Check, ChevronDown, Settings2, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useGarageCaseClassificationDropdown } from "./GarageCaseClassificationDropdown.hook";
import { getClassificationDisplayMeta } from "./GarageCaseClassificationDropdown.helper";
import type { GarageCaseClassificationDropdownProps } from "./GarageCaseClassificationDropdown.type";

export function GarageCaseClassificationDropdown({
  caseItem,
  canUpdate = true,
  onOpenDrawer,
  className,
}: GarageCaseClassificationDropdownProps) {
  const { t } = useTranslation("garage");
  const {
    open,
    setOpen,
    options,
    activeOption,
    handleSelect,
    handleTriggerClick,
    isUpdating,
  } = useGarageCaseClassificationDropdown(caseItem, canUpdate, onOpenDrawer);

  const popoverContent = (
    <div
      className="w-72 max-w-[90vw] p-1.5 flex flex-col text-xs select-none"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="px-2.5 py-1.5 border-b border-border/50 flex items-center justify-between">
        <span className="font-semibold text-foreground tracking-tight">
          {t("cases.dropdown.classificationTitle", "Phân loại ERP")}
        </span>
        {caseItem.soChungTu && (
          <span className="text-[11px] text-muted-foreground font-mono">
            {caseItem.soChungTu}
          </span>
        )}
      </div>

      <div className="py-1 max-h-64 overflow-y-auto flex flex-col gap-1">
        {options.map((opt) => {
          const isSelected = activeOption?.id === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleSelect(opt)}
              className={cn(
                "w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-left transition-all cursor-pointer group",
                isSelected
                  ? "bg-slate-100 dark:bg-slate-800/80 font-medium text-foreground shadow-xs border-l-2 border-indigo-600 dark:border-indigo-400 pl-2"
                  : "hover:bg-slate-100/90 dark:hover:bg-slate-800/60 text-foreground/80 hover:text-foreground",
              )}
            >
              <div className="flex flex-col min-w-0 pr-1">
                <div className="flex items-center gap-1.5">
                  {opt.icon}
                  <span className="truncate text-xs font-medium group-hover:text-foreground">
                    {opt.label}
                  </span>
                </div>
                {opt.subLabel && (
                  <span className="text-[10px] text-muted-foreground truncate leading-tight mt-0.5 group-hover:text-muted-foreground/90">
                    {opt.subLabel}
                  </span>
                )}
              </div>
              {isSelected && (
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              )}
            </button>
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

  const { label, icon, colorClass } = getClassificationDisplayMeta(caseItem, t);

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
            "group w-[136px] h-6 inline-flex items-center justify-between px-2 rounded-md text-[11px] font-semibold border transition-all select-none focus:outline-hidden",
            canUpdate
              ? "cursor-pointer hover:opacity-90 hover:scale-[1.02]"
              : "cursor-default opacity-90",
            isUpdating && "opacity-60 pointer-events-none",
            colorClass,
          )}
          title={
            canUpdate
              ? t(
                  "cases.actions.clickToSelectClassification",
                  "Nhấn để đổi nhanh phân loại ERP",
                )
              : t("cases.actions.viewOnly", "Chỉ xem")
          }
        >
          <Tooltip content={label}>
            <div className="flex items-center gap-1 min-w-0 truncate pr-1">
              {icon}
              <span className="truncate">{label}</span>
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

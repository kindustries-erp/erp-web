import React from "react";
import { cn } from "@/shared/utils";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Settings2 } from "lucide-react";
import { EXCLUSION_OPTIONS } from "./GarageCaseExclusionDropdown.helper";

interface PopoverContentProps {
  caseCode?: string | null;
  values: { excludeFromReports: boolean; excludeFromDebt: boolean };
  handleToggle: (key: "excludeFromReports" | "excludeFromDebt") => void;
  onOpenDrawer?: () => void;
  onClose: () => void;
  t: any;
}

export function GarageCaseExclusionPopoverContent({
  caseCode,
  values,
  handleToggle,
  onOpenDrawer,
  onClose,
  t,
}: PopoverContentProps) {
  return (
    <div
      className="w-72 max-w-[90vw] p-1.5 flex flex-col text-xs select-none"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="px-2.5 py-1.5 border-b border-border/50 flex items-center justify-between">
        <span className="font-semibold text-foreground tracking-tight">
          {t("cases.dropdown.exclusionTitle", "Quy tắc loại trừ")}
        </span>
        {caseCode && (
          <span className="text-[11px] text-muted-foreground font-mono">
            {caseCode}
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
              onClose();
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
}

import React, { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import {
  Check,
  ChevronDown,
  Plus,
  Pencil,
  Trash2,
  SlidersHorizontal,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { type TableViewPreset } from "@/shared/hooks/useUserPreferences";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { cn } from "@/shared/utils";

export interface InvoiceViewModeComboboxProps {
  presets: TableViewPreset[];
  activePresetKey: string;
  onSelect: (preset: TableViewPreset) => void;
  onCreateView: () => void;
  onEditView: (preset: TableViewPreset) => void;
  onDeleteView: (key: string) => void;
  disabled?: boolean;
  className?: string;
}

export function InvoiceViewModeCombobox({
  presets,
  activePresetKey,
  onSelect,
  onCreateView,
  onEditView,
  onDeleteView,
  disabled = false,
  className,
}: InvoiceViewModeComboboxProps) {
  const { t } = useTranslation("erpInvoices");
  const [open, setOpen] = useState(false);
  const [pendingDeleteKey, setPendingDeleteKey] = useState<string | null>(null);

  const getPresetLabel = (preset: TableViewPreset) => {
    if (preset.key === "overview") return t("viewModeOverview", "Tổng quan");
    if (preset.key === "audit")
      return t("viewModeAudit", "Kiểm toán / Đối soát");
    return preset.label;
  };

  const pendingDeletePreset = presets.find((p) => p.key === pendingDeleteKey);
  const pendingDeleteLabel = pendingDeletePreset
    ? getPresetLabel(pendingDeletePreset)
    : "";

  const activePreset =
    presets.find((p) => p.key === activePresetKey) || presets[0];
  const activeLabel = activePreset
    ? getPresetLabel(activePreset)
    : t("viewMode", "Chế độ xem");

  return (
    <>
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild disabled={disabled}>
          <button
            type="button"
            className={cn(
              "h-8 px-3 inline-flex items-center gap-1.5 rounded-full text-xs font-medium",
              "bg-slate-100/80 hover:bg-slate-200/70 dark:bg-slate-800/80 dark:hover:bg-slate-700/80",
              "border border-slate-200/60 dark:border-slate-700/60 shadow-[0_1px_2px_rgba(15,23,42,.03)]",
              "text-slate-700 dark:text-slate-200 transition-colors focus:outline-none focus:ring-1 focus:ring-primary/40",
              disabled && "opacity-50 cursor-not-allowed",
              className,
            )}
            title={t("viewMode", "Chế độ xem")}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
            <span className="truncate max-w-[140px]">{activeLabel}</span>
            <ChevronDown
              className={cn(
                "w-3 h-3 text-slate-400 transition-transform duration-200 shrink-0",
                open && "rotate-180",
              )}
            />
          </button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            align="start"
            sideOffset={6}
            className="z-50 w-64 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-1.5 shadow-xl text-xs space-y-1 animate-in fade-in-0 zoom-in-95"
          >
            <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {t("viewMode", "Chế độ xem")}
            </div>

            <div className="max-h-60 overflow-y-auto space-y-0.5 custom-scrollbar">
              {presets.map((preset) => {
                const isSelected = preset.key === activePresetKey;
                const label = getPresetLabel(preset);

                return (
                  <div
                    key={preset.key}
                    onClick={() => {
                      onSelect(preset);
                      setOpen(false);
                    }}
                    className={cn(
                      "group flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors",
                      isSelected
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800",
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <Check
                        className={cn(
                          "w-3.5 h-3.5 shrink-0 text-primary transition-opacity",
                          isSelected ? "opacity-100" : "opacity-0",
                        )}
                      />
                      <span className="truncate">{label}</span>
                    </div>

                    {preset.isCustom && (
                      <div
                        className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpen(false);
                            onEditView(preset);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors"
                          title={t("viewModeEdit", "Chỉnh sửa view")}
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpen(false);
                            setPendingDeleteKey(preset.key);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title={t("viewModeDelete", "Xóa view")}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-1 border-t border-slate-100 dark:border-slate-800/80">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onCreateView();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary transition-colors text-left"
              >
                <Plus className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="font-medium text-primary">
                  {t("viewModeCreateNew", "Tạo view mới...")}
                </span>
              </button>
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      <ConfirmModal
        open={pendingDeleteKey !== null}
        danger={true}
        title={t("viewModeDeleteTitle", "Xóa chế độ xem")}
        message={t(
          "viewModeDeleteConfirm",
          'Bạn có chắc muốn xóa view "{{name}}"?',
          { name: pendingDeleteLabel },
        )}
        confirmLabel={t("viewModeDelete", "Xóa view")}
        onConfirm={() => {
          if (pendingDeleteKey) onDeleteView(pendingDeleteKey);
          setPendingDeleteKey(null);
        }}
        onCancel={() => setPendingDeleteKey(null)}
      />
    </>
  );
}

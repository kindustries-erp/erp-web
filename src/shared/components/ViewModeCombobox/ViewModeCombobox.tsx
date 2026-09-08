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

export interface ViewModeComboboxProps {
  presets: TableViewPreset[];
  activePresetKey: string;
  onSelect: (preset: TableViewPreset) => void;
  onCreateView: () => void;
  onEditView: (preset: TableViewPreset) => void;
  onDeleteView: (key: string) => void;
  disabled?: boolean;
  className?: string;
  i18nNamespace?: string;
  maxLabelWidthClass?: string;
}

export function ViewModeCombobox({
  presets,
  activePresetKey,
  onSelect,
  onCreateView,
  onEditView,
  onDeleteView,
  disabled = false,
  className,
  i18nNamespace,
  maxLabelWidthClass = "max-w-[95px]",
}: ViewModeComboboxProps) {
  const { t } = useTranslation(
    i18nNamespace ? [i18nNamespace, "common"] : "common",
  );
  const [open, setOpen] = useState(false);
  const [pendingDeleteKey, setPendingDeleteKey] = useState<string | null>(null);

  const isDefaultPreset = (preset: TableViewPreset) => {
    return (
      preset.key === "overview" ||
      preset.key === "audit" ||
      preset.key === "all_columns" ||
      preset.key === "financial_progress" ||
      preset.isDefault === true
    );
  };

  const getPresetLabel = (preset: TableViewPreset) => {
    if (preset.key === "overview" || preset.key === "all_columns") {
      if (
        !preset.label ||
        preset.label === "Tổng quan" ||
        preset.label === "Tất cả cột" ||
        preset.label === "Overview"
      ) {
        return t("viewModeOverview", {
          defaultValue: t("cases.viewModeOverview", {
            defaultValue: "Tổng quan",
          }),
        });
      }
    }
    if (preset.key === "audit" || preset.key === "financial_progress") {
      if (
        !preset.label ||
        preset.label === "Đối soát" ||
        preset.label === "Kiểm toán / Đối soát" ||
        preset.label === "Tiến độ & Dòng tiền" ||
        preset.label === "Audit"
      ) {
        return t("viewModeAudit", {
          defaultValue: t("cases.viewModeAudit", { defaultValue: "Đối soát" }),
        });
      }
    }
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
    : t("viewMode", {
        defaultValue: t("cases.viewMode", { defaultValue: "Chế độ xem" }),
      });

  return (
    <>
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild disabled={disabled}>
          <button
            type="button"
            className={cn(
              "h-8 px-2.5 inline-flex items-center gap-1.5 rounded-full text-xs font-medium shrink-0",
              "bg-[color:var(--muted)] hover:bg-[color:var(--surface-hover)]",
              "border border-[color:var(--border)] shadow-[0_1px_2px_rgba(15,23,42,.03)]",
              "text-[color:var(--foreground)] transition-colors focus:outline-none focus:ring-1 focus:ring-[color:var(--primary)]/40",
              disabled && "opacity-50 cursor-not-allowed",
              className,
            )}
            title={t("viewMode", {
              defaultValue: t("cases.viewMode", { defaultValue: "Chế độ xem" }),
            })}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[color:var(--muted-fg)] shrink-0" />
            <span className={cn("truncate", maxLabelWidthClass)}>
              {activeLabel}
            </span>
            <ChevronDown
              className={cn(
                "w-3 h-3 text-[color:var(--muted-fg)] transition-transform duration-200 shrink-0",
                open && "rotate-180",
              )}
            />
          </button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            align="start"
            sideOffset={6}
            className="z-[9999] w-56 rounded-xl border border-[color:var(--popup-border)] bg-[color:var(--popup-bg)] backdrop-blur-md p-1.5 shadow-xl text-xs space-y-1 animate-in fade-in-0 zoom-in-95"
          >
            <div className="px-2 py-1 text-[11px] font-semibold text-[color:var(--muted-fg)] uppercase tracking-wider">
              {t("viewMode", {
                defaultValue: t("cases.viewMode", {
                  defaultValue: "Chế độ xem",
                }),
              })}
            </div>

            <div className="max-h-60 overflow-y-auto space-y-0.5 custom-scrollbar">
              {presets.map((preset) => {
                const isSelected = preset.key === activePresetKey;
                const isDefault = isDefaultPreset(preset);
                const canDelete = !isDefault;
                const label = getPresetLabel(preset);

                return (
                  <div
                    key={preset.key}
                    className={cn(
                      "group flex items-center justify-between px-2 py-1.5 rounded-lg cursor-pointer transition-colors",
                      isSelected
                        ? "bg-[color:var(--primary)]/10 text-[color:var(--primary)] font-medium dark:bg-[color:var(--primary)]/15"
                        : "hover:bg-[color:var(--popup-bg-hover)] text-[color:var(--foreground)]",
                    )}
                    onClick={() => {
                      onSelect(preset);
                      setOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-1">
                      <div className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <span className="truncate">{label}</span>
                    </div>

                    <div
                      className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          onEditView(preset);
                          setOpen(false);
                        }}
                        className="p-1 rounded text-[color:var(--muted-fg)] hover:text-[color:var(--foreground)] hover:bg-[color:var(--popup-bg-hover)] transition-colors"
                        title={t("viewModeEdit", {
                          defaultValue: t("cases.viewModeEdit", {
                            defaultValue: "Chỉnh sửa view",
                          }),
                        })}
                      >
                        <Pencil className="w-3 h-3" />
                      </button>

                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => setPendingDeleteKey(preset.key)}
                          className="p-1 rounded text-[color:var(--muted-fg)] hover:text-[color:var(--down-fg)] hover:bg-[color:var(--down-bg)] transition-colors"
                          title={t("viewModeDelete", {
                            defaultValue: t("cases.viewModeDelete", {
                              defaultValue: "Xóa view",
                            }),
                          })}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-1 mt-1 border-t border-[color:var(--border)]">
              <button
                type="button"
                onClick={() => {
                  onCreateView();
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-[color:var(--primary)] hover:bg-[color:var(--primary)]/10 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>
                  {t("viewModeCreateNew", {
                    defaultValue: t("cases.viewModeCreateNew", {
                      defaultValue: "Tạo chế độ xem mới",
                    }),
                  })}
                </span>
              </button>
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      <ConfirmModal
        open={!!pendingDeleteKey}
        onCancel={() => setPendingDeleteKey(null)}
        onConfirm={() => {
          if (pendingDeleteKey) {
            onDeleteView(pendingDeleteKey);
            setPendingDeleteKey(null);
          }
        }}
        title={t("viewModeDeleteTitle", {
          defaultValue: t("cases.viewModeDeleteTitle", {
            defaultValue: "Xóa chế độ xem",
          }),
        })}
        message={t("viewModeDeleteConfirm", {
          defaultValue: t("cases.viewModeDeleteConfirm", {
            defaultValue: `Bạn có chắc chắn muốn xóa chế độ xem "${pendingDeleteLabel}" không?`,
            name: pendingDeleteLabel,
          }),
          name: pendingDeleteLabel,
        })}
        confirmLabel={t("delete", { defaultValue: "Xóa" })}
        cancelLabel={t("cancel", { defaultValue: "Hủy" })}
        danger={true}
      />
    </>
  );
}

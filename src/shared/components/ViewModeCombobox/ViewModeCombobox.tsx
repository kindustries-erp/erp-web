import React from "react";
import * as Popover from "@radix-ui/react-popover";
import {
  Check,
  ChevronDown,
  Plus,
  Pencil,
  Trash2,
  SlidersHorizontal,
} from "lucide-react";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { cn } from "@/shared/utils";
import type { ViewModeComboboxProps } from "./ViewModeCombobox.type";
import { isDefaultPreset, getPresetLabel } from "./ViewModeCombobox.helper";
import { useViewModeCombobox } from "./ViewModeCombobox.hook";

export function ViewModeCombobox<TFilter extends string = string>(
  props: ViewModeComboboxProps<TFilter>,
) {
  const {
    disabled = false,
    className,
    maxLabelWidthClass = "max-w-[130px]",
    filterGroup,
    presets,
    activePresetKey,
  } = props;
  const {
    t,
    open,
    setOpen,
    pendingDeleteKey,
    pendingDeleteLabel,
    triggerLabel,
    handleSelectPreset,
    handleSelectFilter,
    handleOpenEdit,
    handleOpenCreate,
    handleConfirmDelete,
    handleCancelDelete,
    setPendingDeleteKey,
  } = useViewModeCombobox(props);

  return (
    <>
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild disabled={disabled}>
          <button
            type="button"
            className={cn(
              "h-8 px-2.5 inline-flex items-center gap-1.5 rounded-lg text-xs font-medium shrink-0",
              "bg-surface hover:bg-surface-hover dark:hover:bg-white/[0.05]",
              "border border-border/80 dark:border-white/[0.06] shadow-2xs",
              "text-foreground transition-colors focus:outline-none focus:ring-1 focus:ring-primary/40",
              disabled && "opacity-50 cursor-not-allowed",
              className,
            )}
            title={triggerLabel}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400 shrink-0" />
            <span className={cn("truncate", maxLabelWidthClass)}>
              {triggerLabel}
            </span>
            <ChevronDown
              className={cn(
                "w-3 h-3 text-slate-400 dark:text-zinc-500 transition-transform duration-200 shrink-0",
                open && "rotate-180",
              )}
            />
          </button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            align="end"
            sideOffset={6}
            className="z-[9999] w-60 rounded-xl border border-slate-200/80 dark:border-zinc-700/80 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md p-1.5 shadow-xl text-xs space-y-1 animate-in fade-in-0 zoom-in-95"
          >
            {/* Nhóm 1: Bộ lọc dữ liệu / Trạng thái */}
            {filterGroup && (
              <div className="space-y-0.5">
                <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                  {filterGroup.title ||
                    t("filterStatus", { defaultValue: "Bộ lọc dữ liệu" })}
                </div>
                <div className="space-y-0.5">
                  {filterGroup.items.map((item) => {
                    const isSelected = item.value === filterGroup.value;
                    return (
                      <div
                        key={item.value}
                        className={cn(
                          "flex items-center justify-between px-2 py-1.5 rounded-lg cursor-pointer transition-colors",
                          isSelected
                            ? "bg-primary/10 text-primary font-medium dark:bg-primary/20"
                            : "hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300",
                        )}
                        onClick={() => handleSelectFilter(item.value)}
                      >
                        <div className="flex items-center gap-2 min-w-0 pr-1">
                          <div className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
                            {isSelected && <Check className="w-3.5 h-3.5" />}
                          </div>
                          <span className="truncate">{item.label}</span>
                        </div>
                        {item.badge}
                      </div>
                    );
                  })}
                </div>
                <div className="my-1.5 border-t border-slate-200/70 dark:border-zinc-800/70" />
              </div>
            )}

            {/* Nhóm 2: Chế độ hiển thị cột */}
            <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
              {t("viewMode", {
                defaultValue: t("cases.viewMode", {
                  defaultValue: "Chế độ xem",
                }),
              })}
            </div>

            <div className="max-h-56 overflow-y-auto space-y-0.5 custom-scrollbar">
              {presets.map((preset) => {
                const isSelected = preset.key === activePresetKey;
                const canDelete = !isDefaultPreset(preset);
                const label = getPresetLabel(preset, t);

                return (
                  <div
                    key={preset.key}
                    className={cn(
                      "group flex items-center justify-between px-2 py-1.5 rounded-lg cursor-pointer transition-colors",
                      isSelected
                        ? "bg-primary/10 text-primary font-medium dark:bg-primary/20"
                        : "hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300",
                    )}
                    onClick={() => handleSelectPreset(preset)}
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
                        onClick={() => handleOpenEdit(preset)}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-200/60 dark:hover:bg-zinc-700/60 transition-colors"
                        title={t("viewModeEdit", {
                          defaultValue: "Chỉnh sửa view",
                        })}
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => setPendingDeleteKey(preset.key)}
                          className="p-1 rounded text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                          title={t("viewModeDelete", {
                            defaultValue: "Xóa view",
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

            <div className="pt-1 mt-1 border-t border-slate-200/70 dark:border-zinc-800/70">
              <button
                type="button"
                onClick={handleOpenCreate}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 dark:hover:bg-primary/20 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>
                  {t("viewModeCreateNew", {
                    defaultValue: "Tạo chế độ xem mới",
                  })}
                </span>
              </button>
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      <ConfirmModal
        open={Boolean(pendingDeleteKey)}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title={t("viewModeDeleteTitle", { defaultValue: "Xóa chế độ xem" })}
        message={t("viewModeDeleteConfirm", {
          defaultValue: `Bạn có chắc chắn muốn xóa chế độ xem "${pendingDeleteLabel}" không?`,
          name: pendingDeleteLabel,
        })}
        confirmLabel={t("delete", { defaultValue: "Xóa" })}
        cancelLabel={t("cancel", { defaultValue: "Hủy" })}
        danger={true}
      />
    </>
  );
}

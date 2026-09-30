import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { ShieldCheck } from "lucide-react";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import {
  DrawerSection,
  DrawerField,
  inputCls,
} from "@/shared/components/DrawerModal";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { type TableViewPreset } from "@/shared/hooks/useUserPreferences";
import {
  INVOICE_COLUMN_GROUPS,
  INVOICE_COLUMN_VIEW_PRESETS,
  DEFAULT_INVOICE_COLUMN_VISIBILITY,
} from "../utils";

export interface InvoiceViewConfigDrawerProps {
  open: boolean;
  onClose: () => void;
  preset?: TableViewPreset | null;
  currentColumnVisibility?: Record<string, boolean>;
  onSave: (data: {
    key?: string;
    label: string;
    columnVisibility: Record<string, boolean>;
  }) => void;
  onResetDefault?: (key: string) => void;
}

export function InvoiceViewConfigDrawer({
  open,
  onClose,
  preset,
  currentColumnVisibility,
  onSave,
  onResetDefault,
}: InvoiceViewConfigDrawerProps) {
  const { t } = useTranslation("erpInvoices");
  const [name, setName] = useState("");
  const [visibility, setVisibility] = useState<Record<string, boolean>>({});

  const isDefaultPreset =
    preset?.key === "overview" ||
    preset?.key === "audit" ||
    preset?.isDefault === true;

  const getDefaultPresetLabel = (p?: TableViewPreset | null) => {
    if (!p) return "";
    if (p.key === "overview" && (!p.label || p.label === "Tổng quan")) {
      return t("viewModeOverview", "Tổng quan");
    }
    if (p.key === "audit" && (!p.label || p.label === "Kiểm toán / Đối soát")) {
      return t("viewModeAudit", "Kiểm toán / Đối soát");
    }
    return p.label;
  };

  useEffect(() => {
    if (open) {
      if (preset) {
        setName(getDefaultPresetLabel(preset));
        setVisibility(
          preset.columnVisibility ? { ...preset.columnVisibility } : {},
        );
      } else {
        setName("");
        const initialVis: Record<string, boolean> = {};
        INVOICE_COLUMN_GROUPS.forEach((group) => {
          group.columns.forEach((col) => {
            if (
              currentColumnVisibility &&
              currentColumnVisibility[col.key] !== undefined
            ) {
              initialVis[col.key] = currentColumnVisibility[col.key];
            } else if (col.defaultVisible !== undefined) {
              initialVis[col.key] = col.defaultVisible;
            } else {
              initialVis[col.key] =
                DEFAULT_INVOICE_COLUMN_VISIBILITY[col.key] !== false;
            }
          });
        });
        setVisibility(initialVis);
      }
    }
  }, [open, preset, currentColumnVisibility]);

  const handleToggleCol = (key: string, checked: boolean) => {
    setVisibility((prev) => ({
      ...prev,
      [key]: checked,
    }));
  };

  const handleSelectAll = (select: boolean) => {
    const nextVis: Record<string, boolean> = {};
    INVOICE_COLUMN_GROUPS.forEach((group) => {
      group.columns.forEach((col) => {
        nextVis[col.key] = select;
      });
    });
    setVisibility(nextVis);
  };

  const handleResetToFactory = () => {
    if (!preset) return;
    const factoryPreset = INVOICE_COLUMN_VIEW_PRESETS.find(
      (p) => p.key === preset.key,
    );

    if (factoryPreset) {
      setName(getDefaultPresetLabel(factoryPreset));
      setVisibility(
        factoryPreset.columnVisibility
          ? { ...factoryPreset.columnVisibility }
          : {},
      );
    }

    if (onResetDefault) {
      onResetDefault(preset.key);
      onClose();
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
      toast.error(t("viewConfigNameRequired", "Vui lòng nhập tên view"));
      return;
    }

    const hasAnySelected = Object.values(visibility).some((v) => v === true);
    if (!hasAnySelected) {
      toast.error(
        t("viewConfigColumnsRequired", "Vui lòng chọn ít nhất một cột"),
      );
      return;
    }

    onSave({
      key: preset?.key,
      label: name.trim(),
      columnVisibility: visibility,
    });
    onClose();
  };

  const drawerTitle = preset
    ? isDefaultPreset
      ? t("viewConfigEditDefaultTitle", "Chỉnh sửa chế độ xem: {{name}}", {
          name: getDefaultPresetLabel(preset),
        })
      : t("viewConfigEditTitle", "Chỉnh sửa view")
    : t("viewConfigTitle", "Tạo view mới");

  const actions = [
    {
      label: t("viewConfigSave", "Lưu view"),
      onClick: handleSave,
      primary: true,
    },
    ...(isDefaultPreset && onResetDefault
      ? [
          {
            label: t("viewModeReset", "Khôi phục mặc định"),
            onClick: handleResetToFactory,
            variant: "outline" as const,
          },
        ]
      : []),
    {
      label: t("viewConfigCancel", "Hủy"),
      onClick: onClose,
      variant: "ghost" as const,
    },
  ];

  return (
    <StandardFormDrawer
      open={open}
      mode="edit"
      onClose={onClose}
      layout="1-column"
      size="sm"
      title={drawerTitle}
      confirmOnClose={true}
      actions={actions}
      leftPanel={
        <div className="space-y-3 pb-4">
          {isDefaultPreset && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/40 text-xs text-indigo-700 dark:text-indigo-300">
              <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>
                {t(
                  "viewModeDefaultNotice",
                  "Chế độ xem mặc định của hệ thống. Bạn có thể tùy chỉnh cột và đổi tên, nhưng không thể xóa.",
                )}
              </span>
            </div>
          )}

          <DrawerSection
            title={t("viewConfigNameLabel", "Tên view")}
            collapsible
            defaultCollapsed={false}
          >
            <DrawerField label={t("viewConfigNameLabel", "Tên view")} required>
              <input
                type="text"
                className={inputCls}
                placeholder={t(
                  "viewConfigNamePlaceholder",
                  "VD: Báo cáo kiểm toán thuế",
                )}
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </DrawerField>
          </DrawerSection>

          <DrawerSection
            title={t("viewConfigColumnsLabel", "Cột hiển thị")}
            collapsible
            defaultCollapsed={false}
            titleExtra={
              <div
                className="flex items-center gap-2 text-[11px]"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => handleSelectAll(true)}
                  className="text-primary hover:underline font-medium"
                >
                  {t("viewConfigSelectAll", "Chọn tất cả")}
                </button>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <button
                  type="button"
                  onClick={() => handleSelectAll(false)}
                  className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium"
                >
                  {t("viewConfigDeselectAll", "Bỏ chọn tất cả")}
                </button>
              </div>
            }
          >
            <div className="space-y-3 pt-1">
              {INVOICE_COLUMN_GROUPS.map((group) => (
                <DrawerSection
                  key={group.groupKey}
                  title={t(group.titleKey)}
                  collapsible
                  defaultCollapsed={false}
                >
                  <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 py-1">
                    {group.columns.map((col) => {
                      const isChecked = visibility[col.key] !== false;

                      return (
                        <label
                          key={col.key}
                          className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none hover:text-primary transition-colors"
                        >
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={(checked) =>
                              handleToggleCol(col.key, !!checked)
                            }
                          />
                          <span className="truncate">
                            {t(col.labelKey, col.key)}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </DrawerSection>
              ))}
            </div>
          </DrawerSection>
        </div>
      }
    />
  );
}

import React from "react";
import { ShieldCheck, Edit2, Trash2, Power, PowerOff } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/Button";
import { Tooltip } from "@/core/components/ui/Tooltip";
import {
  resolveAttrName,
  type ModuleAttributeDef,
} from "@/core/api/moduleConfigApi";
import {
  FIELD_TYPE_ICONS,
  getFieldTypeShortLabel,
} from "../../domains/constants";

export interface AttributeFieldRowProps {
  def: ModuleAttributeDef;
  isSystem: boolean;
  activeModuleKey: string;
  locale: string;
  t: (key: string, fallback: string) => string;
  onEdit: (def: ModuleAttributeDef) => void;
  onDelete?: (def: ModuleAttributeDef) => void;
  onToggleActive?: (def: ModuleAttributeDef) => void;
}

export function AttributeFieldRow({
  def,
  isSystem,
  activeModuleKey,
  locale,
  t,
  onEdit,
  onDelete,
  onToggleActive,
}: AttributeFieldRowProps) {
  return (
    <div className="flex items-center justify-between px-3.5 py-2.5 bg-surface/80 hover:bg-muted/30 dark:bg-surface/30 dark:hover:bg-muted/15 rounded-lg text-xs transition-colors border border-border/40 group">
      <div className="flex items-center gap-2 min-w-0 flex-1 flex-wrap">
        {isSystem ? (
          <Badge
            variant="outline"
            className="text-[10px] gap-1 shrink-0 flex items-center font-medium bg-muted/40 border-0 text-muted-foreground"
          >
            <ShieldCheck className="w-3 h-3 text-muted-foreground" />
            <span>{t("moduleConfig.systemBadge", "Mặc định")}</span>
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="text-[10px] gap-1 shrink-0 flex items-center font-medium bg-muted/40 border-0 text-foreground"
          >
            {FIELD_TYPE_ICONS[def.fieldType]}
            <span>{getFieldTypeShortLabel(def.fieldType, t)}</span>
          </Badge>
        )}
        <span className="font-semibold text-foreground truncate">
          {resolveAttrName(def, activeModuleKey, locale, t)}
        </span>
        <span className="text-[11px] text-muted-foreground font-mono shrink-0">
          ({def.code})
        </span>
        {def.fieldType === "SELECT" && def.options && (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium text-muted-foreground bg-muted/50 border-0">
            {def.options.length} {t("moduleConfig.optionsCount", "tùy chọn")}
          </span>
        )}
        {def.isRequired && (
          <Badge
            variant="destructive"
            className="text-[9px] px-1.5 py-0 border-0"
          >
            {t("moduleConfig.requiredBadge", "Bắt buộc *")}
          </Badge>
        )}
        {!isSystem && !def.isActive && (
          <Badge
            variant="secondary"
            className="text-[9px] px-1.5 py-0 text-muted-foreground border-0"
          >
            {t("common.inactive", "Ngừng dùng")}
          </Badge>
        )}
        {!isSystem && (def.usageCount || 0) > 0 && (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium text-muted-foreground bg-muted/50 border-0">
            {def.usageCount} {t("moduleConfig.used", "đang dùng")}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {!isSystem && onToggleActive && (
          <Tooltip
            content={
              def.isActive
                ? t("common.deactivate", "Ngừng hoạt động")
                : t("common.activate", "Kích hoạt lại")
            }
          >
            <Button
              size="icon"
              variant="ghost"
              className="w-7 h-7"
              onClick={() => onToggleActive(def)}
            >
              {def.isActive ? (
                <Power className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <PowerOff className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </Button>
          </Tooltip>
        )}
        <Tooltip
          content={
            isSystem
              ? t("common.edit", "Chỉnh sửa tùy chọn")
              : t("common.edit", "Chỉnh sửa")
          }
        >
          <Button
            size="icon"
            variant="ghost"
            aria-label={
              isSystem
                ? t("common.edit", "Chỉnh sửa tùy chọn")
                : t("common.edit", "Chỉnh sửa")
            }
            data-testid="edit-attr-btn"
            className="w-7 h-7 text-muted-foreground hover:text-foreground hover:bg-surface"
            onClick={() => onEdit(def)}
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
        </Tooltip>
        {!isSystem && onDelete && (
          <Tooltip content={t("common.delete", "Xóa thuộc tính")}>
            <Button
              size="icon"
              variant="ghost"
              className="w-7 h-7 text-destructive hover:bg-destructive/10"
              onClick={() => onDelete(def)}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </Tooltip>
        )}
      </div>
    </div>
  );
}

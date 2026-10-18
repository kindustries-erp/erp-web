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
} from "@/shared/constants/customFields";

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
        {def.isRequired && (
          <Badge
            variant="destructive"
            className="text-[9px] px-1 py-0 h-4 uppercase tracking-wider shrink-0"
          >
            {t("moduleConfig.required", "Bắt buộc")}
          </Badge>
        )}
        {def.isActive === false && (
          <Badge
            variant="outline"
            className="text-[9px] px-1 py-0 h-4 text-muted-foreground shrink-0 border-dashed"
          >
            {t("moduleConfig.disabled", "Tắt")}
          </Badge>
        )}
        {def.parentAttrCode && (
          <span className="text-[10px] text-muted-foreground/80 flex items-center gap-1 font-mono shrink-0">
            <span>↳ {t("moduleConfig.childOf", "Thuộc:")}</span>
            <span className="font-medium text-foreground">
              {def.parentAttrCode}
            </span>
          </span>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0 ml-2 opacity-90 group-hover:opacity-100 transition-opacity">
        <Tooltip
          content={t("moduleConfig.editAttr", "Chỉnh sửa thuộc tính")}
          side="top"
        >
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => onEdit(def)}
            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
        </Tooltip>

        {!isSystem && onToggleActive && (
          <Tooltip
            content={
              def.isActive !== false
                ? t("moduleConfig.disableAttr", "Tạm tắt")
                : t("moduleConfig.enableAttr", "Kích hoạt")
            }
            side="top"
          >
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => onToggleActive(def)}
              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
            >
              {def.isActive !== false ? (
                <Power className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <PowerOff className="w-3.5 h-3.5 text-amber-500" />
              )}
            </Button>
          </Tooltip>
        )}

        {!isSystem && onDelete && (
          <Tooltip
            content={t("moduleConfig.deleteAttr", "Xóa thuộc tính")}
            side="top"
          >
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => onDelete(def)}
              className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </Tooltip>
        )}
      </div>
    </div>
  );
}

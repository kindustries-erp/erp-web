import * as React from "react";
import {
  V2Badge,
  V2Button,
  V2Input,
  V2Stack,
  V2Text,
} from "@/v2/shared/components/atoms";
import { V2Combobox } from "@/v2/shared/components/molecules/v2-combobox";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { cn } from "@/v2/shared/utils/cn";
import { useLinkedField } from "./V2LinkedField.hook";
import type { V2LinkedFieldProps } from "./V2LinkedField.type";

/**
 * Field liên kết FK: dropdown chọn bản ghi nguồn + ô giá trị song song sửa được.
 * Chọn nguồn thì điền giá trị vào ô song song; sửa ô song song không làm đổi bản ghi nguồn.
 * Khác nguồn thì hiện nhãn "đã chỉnh" kèm nút khôi phục / cập nhật từ nguồn.
 */
export function V2LinkedField(props: V2LinkedFieldProps) {
  const { t } = useV2Translation();
  const f = useLinkedField(props);
  const { disabled } = props;

  return (
    <V2Stack gap="xs" className={cn("w-full", props.className)}>
      <V2Combobox
        aria-label={props.fkLabel}
        options={props.options}
        value={props.fkValue}
        onValueChange={f.select}
        placeholder={props.fkPlaceholder}
        onSearchChange={props.onSearchChange}
        loading={props.loading}
        fallbackLabel={props.fallbackLabel}
        disabled={disabled}
        clearable
      />
      <V2Input
        aria-label={props.localLabel}
        value={props.localValue}
        placeholder={props.localPlaceholder}
        disabled={disabled}
        onChange={(e) => f.edit(e.target.value)}
      />
      {(f.overridden || f.canRefresh) && (
        <div className="flex flex-wrap items-center gap-2">
          {f.overridden && (
            <V2Badge variant="warning" size="sm">
              {t("v2.linkedField.edited", "Đã chỉnh")}
            </V2Badge>
          )}
          {f.overridden && f.sourceText !== null && (
            <V2Text variant="helper" color="muted" truncate>
              {t("v2.linkedField.sourceHint", {
                defaultValue: "Gốc: {{value}}",
                value: f.sourceText,
              })}
            </V2Text>
          )}
          {f.canRevert && !disabled && (
            <V2Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={f.revert}
            >
              {t("v2.linkedField.revert", "Khôi phục theo nguồn")}
            </V2Button>
          )}
          {f.canRefresh && !disabled && (
            <V2Button
              type="button"
              variant="ghost"
              size="sm"
              isLoading={f.isRefreshing}
              onClick={f.refresh}
            >
              {t("v2.linkedField.refresh", "Cập nhật từ nguồn")}
            </V2Button>
          )}
        </div>
      )}
    </V2Stack>
  );
}

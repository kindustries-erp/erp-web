import * as React from "react";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { V2ViewModeRowActions } from "./V2ViewModeCombobox.actions";
import { V2ViewModeSectionHeader } from "./V2ViewModeCombobox.header";
import { V2ViewModeOption } from "./V2ViewModeCombobox.option";
import type {
  V2CustomFilterSection,
  V2FilterGroup,
} from "./V2ViewModeCombobox.type";

type FilterListProps = V2FilterGroup & {
  close: () => void;
  /** Nút hành động cùng hàng tiêu đề nhóm (căn phải) */
  action?: React.ReactNode;
  /** Bộ lọc custom: là mục thứ hai trong cùng danh sách, chỉ một mục được chọn */
  custom?: V2CustomFilterSection;
};

/** Số đếm trên mục lọc: ẩn khi 0, cắt "99+" */
const badgeText = (count?: number): string | null => {
  if (!count || count <= 0) return null;
  return count > 99 ? "99+" : String(count);
};

/**
 * Nhóm "Bộ lọc có sẵn": mục hệ thống và bộ lọc custom trong cùng một danh sách.
 * Chỉ một mục được chọn: bộ lọc custom đang chọn thì mục hệ thống không được chọn.
 */
export const V2FilterGroupList: React.FC<FilterListProps> = ({
  title,
  items,
  activeKey,
  onChange,
  close,
  action,
  custom,
}) => {
  const { t } = useV2Translation();
  const heading = title ?? t("v2.table.filterGroupTitle", "Bộ lọc dữ liệu");
  const customActive = custom?.activeKey;
  return (
    <div className="flex flex-col gap-0.5 pb-1">
      <V2ViewModeSectionHeader title={heading} action={action} />
      <ul role="listbox" aria-label={heading} className="flex flex-col gap-0.5">
        {items.map((item) => (
          <li key={item.key} className="flex items-center gap-1">
            <V2ViewModeOption
              active={!customActive && item.key === activeKey}
              onClick={() => {
                // Chọn mục hệ thống khi đang ở bộ lọc custom: bỏ điều kiện custom trước
                if (customActive) custom?.onClear();
                onChange(item.key);
                close();
              }}
            >
              {item.dotColor && (
                <span
                  aria-hidden
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: item.dotColor }}
                />
              )}
              <V2Text as="span" truncate className="flex-1 text-left">
                {item.label}
              </V2Text>
              {badgeText(item.badgeCount) && (
                <V2Text
                  as="span"
                  variant="caption"
                  className="ml-auto tabular-nums"
                >
                  {badgeText(item.badgeCount)}
                </V2Text>
              )}
            </V2ViewModeOption>
          </li>
        ))}
        {custom?.items.map((item) => (
          <li
            key={`custom-${item.key}`}
            className="group flex items-center gap-1"
          >
            <V2ViewModeOption
              active={item.key === customActive}
              onClick={() => {
                custom.onSelect(item.key);
                close();
              }}
            >
              <V2Text as="span" truncate className="flex-1 text-left">
                {item.label}
              </V2Text>
            </V2ViewModeOption>
            <V2ViewModeRowActions
              itemKey={item.key}
              onEdit={custom.onEdit}
              onDelete={custom.onDelete}
              editLabel={t("v2.table.editFilterPreset", "Sửa bộ lọc")}
              deleteLabel={t("v2.table.deleteFilterPreset", "Xóa bộ lọc")}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

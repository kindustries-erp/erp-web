import * as React from "react";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { V2ViewModeRowActions } from "./V2ViewModeCombobox.actions";
import { V2ViewModeOption } from "./V2ViewModeCombobox.option";
import type {
  V2ViewModeComboboxProps,
  V2ViewModeItem,
} from "./V2ViewModeCombobox.type";

type ListProps = Pick<V2ViewModeComboboxProps, "onEdit" | "onDelete"> & {
  items: V2ViewModeItem[];
  activeKey: string;
  onSelect: (key: string) => void;
  close: () => void;
  /** Nhãn nút sửa/xóa và tên danh sách; mặc định là nhãn chế độ xem */
  listLabel?: string;
  editLabel?: string;
  deleteLabel?: string;
};

export const V2ViewModeList: React.FC<ListProps> = ({
  items,
  activeKey,
  onSelect,
  onEdit,
  onDelete,
  close,
  listLabel,
  editLabel,
  deleteLabel,
}) => {
  const { t } = useV2Translation();
  return (
    <ul role="listbox" aria-label={listLabel} className="flex flex-col gap-0.5">
      {items.map((item) => (
        <li key={item.key} className="group flex items-center gap-1">
          <V2ViewModeOption
            active={item.key === activeKey}
            onClick={() => {
              onSelect(item.key);
              close();
            }}
          >
            <V2Text as="span" truncate className="text-left">
              {item.label}
            </V2Text>
          </V2ViewModeOption>
          {!item.isSystem && (
            <V2ViewModeRowActions
              itemKey={item.key}
              onEdit={onEdit}
              onDelete={onDelete}
              editLabel={editLabel ?? t("v2.table.editView", "Sửa chế độ xem")}
              deleteLabel={
                deleteLabel ?? t("v2.table.deleteView", "Xóa chế độ xem")
              }
            />
          )}
        </li>
      ))}
    </ul>
  );
};

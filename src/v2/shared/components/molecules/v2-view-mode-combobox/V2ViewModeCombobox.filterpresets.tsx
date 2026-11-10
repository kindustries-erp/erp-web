import * as React from "react";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { V2ViewModeCreateButton } from "./V2ViewModeCombobox.create";
import { V2ViewModeList } from "./V2ViewModeCombobox.list";
import type { V2CustomFilterSection } from "./V2ViewModeCombobox.type";

type SectionProps = V2CustomFilterSection & { close: () => void };

/** Bộ lọc tùy chỉnh của user, nằm trong nhóm "Bộ lọc có sẵn" ngay sau các mục hệ thống */
export const V2FilterPresetSection: React.FC<SectionProps> = ({
  items,
  activeKey,
  canCreate,
  onSelect,
  onCreate,
  onEdit,
  onDelete,
  close,
}) => {
  const { t } = useV2Translation();
  return (
    <div className="flex flex-col gap-0.5">
      {items.length > 0 && (
        <V2ViewModeList
          items={items}
          activeKey={activeKey ?? ""}
          onSelect={onSelect}
          onEdit={onEdit}
          onDelete={onDelete}
          close={close}
          listLabel={t("v2.table.filterPresetsSection", "Bộ lọc của tôi")}
          editLabel={t("v2.table.editFilterPreset", "Sửa bộ lọc")}
          deleteLabel={t("v2.table.deleteFilterPreset", "Xóa bộ lọc")}
        />
      )}
      <V2ViewModeCreateButton
        label={t("v2.table.createFilterPreset", "Tạo bộ lọc mới")}
        disabled={!canCreate}
        onClick={() => {
          onCreate();
          close();
        }}
      />
    </div>
  );
};

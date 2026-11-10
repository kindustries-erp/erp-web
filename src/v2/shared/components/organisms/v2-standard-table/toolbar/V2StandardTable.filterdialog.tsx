import * as React from "react";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
import { V2Modal } from "@/v2/shared/components/molecules/v2-modal";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type { V2FilterPresetQuery } from "./V2StandardTable.toolbar.type";
import type {
  V2FilterPresetDraft,
  V2FilterPresetEditorSource,
} from "../hooks/V2StandardTable.filterpresets.hook";
import { useV2HeaderFilters } from "../hooks/V2StandardTable.filter.hook";
import { useV2TableState } from "../hooks/V2StandardTable.state.hook";
import {
  fromPresetQuery,
  hasConditions,
  toPresetQuery,
} from "../utils/v2FilterPresets";
import { V2FilterPresetEditor } from "./V2StandardTable.filterdialog.editor";
import { V2PresetNameField } from "./V2StandardTable.presetname";
import {
  V2ViewFilterField,
  type V2ViewFilterOption,
} from "./V2StandardTable.viewdialog.filter-field";

export interface V2FilterPresetDialogProps {
  mode: "create" | "edit";
  initialLabel: string;
  /** Bộ lọc có sẵn gốc của bộ lọc (nền), đã kiểm tra thuộc nhóm */
  initialGroupKey: string;
  /** Điều kiện đã lưu (chỉ khi sửa) */
  initialQuery?: V2FilterPresetQuery;
  /** Nhóm bộ lọc có sẵn của trang */
  groupOptions: V2ViewFilterOption[];
  /** Key của mục "Tất cả": nền khác key này mới được lưu khi không có điều kiện */
  allKey: string;
  source: V2FilterPresetEditorSource;
  isNameTaken: (name: string) => boolean;
  onSubmit: (draft: V2FilterPresetDraft) => void;
  onClose: () => void;
}

/** Tạo/sửa bộ lọc tùy chỉnh: tên, bộ lọc có sẵn (nền) và điều kiện lọc theo cột ngay trong hộp thoại */
export const V2FilterPresetDialog: React.FC<V2FilterPresetDialogProps> = ({
  mode,
  initialLabel,
  initialGroupKey,
  initialQuery,
  groupOptions,
  allKey,
  source,
  isNameTaken,
  onSubmit,
  onClose,
}) => {
  const { t } = useV2Translation();
  const [name, setName] = React.useState(initialLabel);
  const [groupKey, setGroupKey] = React.useState(initialGroupKey);
  const [submitted, setSubmitted] = React.useState(false);

  // Bản nháp điều kiện: state riêng, không đẩy lên bảng cho tới khi lưu
  const table = useV2TableState({
    initialQuery:
      mode === "edit" ? fromPresetQuery(initialQuery ?? {}) : source.tableQuery,
  });
  const columnsByKey = React.useMemo(
    () => new Map(source.columns.map((column) => [column.key, column])),
    [source.columns],
  );
  const filters = useV2HeaderFilters({
    tableId: source.tableId,
    columnsByKey,
    fetchOptionsForKey: source.fetchOptionsForKey,
    filtersStrFor: (columnKey) =>
      source.filtersStrForQuery(table.query, columnKey),
  });

  const trimmed = name.trim();
  const draftQuery = toPresetQuery(table.query);
  const nameError = !trimmed
    ? t("v2.table.filterPresetNameRequired", "Vui lòng nhập tên bộ lọc")
    : isNameTaken(trimmed)
      ? t("v2.table.filterPresetNameDuplicate", "Tên bộ lọc đã tồn tại")
      : null;
  // Không có điều kiện lọc và nền là "Tất cả": không có gì để lưu
  const canSave = hasConditions(draftQuery) || groupKey !== allKey;
  const emptyError = canSave
    ? null
    : t("v2.table.filterPresetEmpty", "Chưa có điều kiện nào để lưu");

  const submit = () => {
    setSubmitted(true);
    if (nameError || emptyError) return;
    onSubmit({ label: trimmed, groupKey, query: draftQuery });
  };

  const title =
    mode === "create"
      ? t("v2.table.filterPresetCreateTitle", "Tạo bộ lọc")
      : t("v2.table.filterPresetEditTitle", "Sửa bộ lọc");

  return (
    <V2Modal
      open
      onOpenChange={(open) => !open && onClose()}
      title={title}
      size="lg"
      footer={
        <div className="flex justify-end gap-2">
          <V2Button variant="outline" size="sm" onClick={onClose}>
            {t("v2.common.cancel", "Hủy")}
          </V2Button>
          <V2Button variant="primary" size="sm" onClick={submit}>
            {t("v2.common.save", "Lưu")}
          </V2Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <V2PresetNameField
          id="v2-filter-preset-name"
          label={t("v2.table.filterPresetNameLabel", "Tên bộ lọc")}
          placeholder={t(
            "v2.table.filterPresetNamePlaceholder",
            "Nhập tên bộ lọc",
          )}
          value={name}
          onChange={setName}
          onSubmit={submit}
          error={nameError}
          submitted={submitted}
        />
        <V2ViewFilterField
          options={groupOptions}
          value={groupKey}
          onChange={setGroupKey}
        />
        <V2FilterPresetEditor source={source} table={table} filters={filters} />
        {submitted && emptyError && (
          <V2Text as="p" variant="helper" color="destructive" role="alert">
            {emptyError}
          </V2Text>
        )}
      </div>
    </V2Modal>
  );
};

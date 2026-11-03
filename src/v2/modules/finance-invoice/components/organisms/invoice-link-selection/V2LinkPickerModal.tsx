import React, { useMemo } from "react";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
import { V2LinkSelectionModal } from "@/v2/shared/components/molecules/v2-link-selection-modal";
import {
  V2StandardTable,
  type V2Column,
} from "@/v2/shared/components/organisms/v2-standard-table";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type { V2LinkPickerState } from "./useV2LinkPicker";
import "./invoice-link-selection.locale";

export interface V2LinkPickerModalProps<T extends { id: string }> {
  open: boolean;
  onClose: () => void;
  title: string;
  emptyLabel: string;
  loadErrorLabel: string;
  tableId: string;
  /** Các cột dữ liệu; cột chọn được thêm tự động ở cuối */
  columns: V2Column<T>[];
  picker: V2LinkPickerState<T>;
}

/**
 * Khung chung của modal chọn chứng từ: bảng chế độ server (tìm kiếm và phân trang nằm trong
 * thanh công cụ của bảng), chọn một dòng bằng nút trong ô.
 */
export function V2LinkPickerModal<T extends { id: string }>({
  open,
  onClose,
  title,
  emptyLabel,
  loadErrorLabel,
  tableId,
  columns,
  picker,
}: V2LinkPickerModalProps<T>) {
  const { t } = useV2Translation();

  const allColumns = useMemo<V2Column<T>[]>(
    () => [
      ...columns,
      {
        key: "choose",
        label: "",
        size: 110,
        // Nút trực tiếp trong ô (không dùng menu hàng): menu lồng trong modal không mở ổn định
        cell: (row) =>
          picker.isLinked(row.id) ? (
            <V2Text as="span" className="text-xs text-muted-fg">
              {t("v2.invoiceLinkSelection.picker.linked")}
            </V2Text>
          ) : (
            <V2Button
              type="button"
              size="xs"
              variant="outline"
              onClick={() => picker.choose(row)}
            >
              {t("v2.invoiceLinkSelection.picker.select")}
            </V2Button>
          ),
      },
    ],
    [columns, picker, t],
  );

  return (
    <V2LinkSelectionModal open={open} onClose={onClose} title={title}>
      <V2StandardTable<T>
        tableId={tableId}
        mode="server"
        items={picker.rows}
        total={picker.total}
        initialQuery={{ page: picker.page, pageSize: picker.pageSize }}
        onQueryChange={picker.onTableQueryChange}
        columns={allColumns}
        getRowKey={(row) => row.id}
        loading={picker.loading}
        emptyLabel={picker.failed ? loadErrorLabel : emptyLabel}
      />
    </V2LinkSelectionModal>
  );
}

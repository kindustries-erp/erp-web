import React, { useMemo } from "react";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { V2SearchInput } from "@/v2/shared/components/molecules/v2-search-input";
import { V2TablePagination } from "@/v2/shared/components/molecules/v2-table-pagination";
import { V2LinkSelectionModal } from "@/v2/shared/components/molecules/v2-link-selection-modal";
import {
  V2StandardTable,
  type V2Column,
} from "@/v2/shared/components/organisms/v2-standard-table";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type { V2LinkPickerState } from "./useV2LinkPicker";
import "./invoice-link-selection.locale";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";

export interface V2LinkPickerModalProps<T extends { id: string }> {
  open: boolean;
  onClose: () => void;
  title: string;
  searchPlaceholder: string;
  emptyLabel: string;
  loadErrorLabel: string;
  tableId: string;
  /** Các cột dữ liệu; cột chọn được thêm tự động ở cuối */
  columns: V2Column<T>[];
  picker: V2LinkPickerState<T>;
}

/** Khung chung của mọi modal chọn chứng từ: ô tìm, bảng một dòng được chọn, phân trang */
export function V2LinkPickerModal<T extends { id: string }>({
  open,
  onClose,
  title,
  searchPlaceholder,
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
      <V2SearchInput
        value={picker.search}
        onChange={picker.setSearch}
        placeholder={searchPlaceholder}
      />
      <V2StandardTable<T>
        tableId={tableId}
        mode="client"
        items={picker.rows}
        columns={allColumns}
        getRowKey={(row) => row.id}
        loading={picker.loading}
        emptyLabel={picker.failed ? loadErrorLabel : emptyLabel}
      />
      <V2TablePagination
        page={picker.page}
        pageSize={picker.pageSize}
        total={picker.total}
        onPageChange={picker.setPage}
        onPageSizeChange={picker.setPageSize}
      />
    </V2LinkSelectionModal>
  );
}

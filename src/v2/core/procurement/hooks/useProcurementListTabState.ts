import * as React from "react";
import type {
  V2FetchOptions,
  V2RowActionGroup,
} from "@/v2/shared/types/v2-table";
import type { V2Column } from "@/v2/shared/components/organisms/v2-standard-table/V2StandardTable.type";
import type { V2FilterOption } from "@/v2/shared/types/v2-table";
import { withProcurementFilter } from "../procurement.api";
import type { ProcurementApi } from "../procurement.types";
import type { ProcurementListState } from "./useProcurementList";
import {
  buildProcurementFilterGroup,
  useProcurementListFilter,
} from "./useProcurementListFilter";
import {
  useProcurementListView,
  type ProcurementViewVisibility,
} from "./useProcurementListView";

type T = (key: string, fallback: string) => string;

export interface ProcurementListTabStateInput<R extends { id: string }> {
  t: T;
  tableId: string;
  state: ProcurementListState<R>;
  api: ProcurementApi<R>;
  viewVisibility: ProcurementViewVisibility;
  buildColumns: (
    t: T,
    openDetail?: (id: string) => void,
    openLinked?: (id: string) => void,
  ) => V2Column<R>[];
  /** Các trạng thái đưa vào nhóm lọc, theo thứ tự hiển thị */
  statusItems: V2FilterOption[];
  /** Mở chứng từ liên kết của họ kia (PR ↔ PO) ngay trên trang */
  openLinked?: (id: string) => void;
}

/**
 * Trạng thái một bảng procurement trong trang: bộ lọc có sẵn (trạng thái + đã xóa mềm),
 * chế độ xem và các thao tác dòng. Ở chế độ đã xóa mềm chỉ còn nút xóa vĩnh viễn.
 */
export function useProcurementListTabState<R extends { id: string }>({
  t,
  tableId,
  state,
  api,
  viewVisibility,
  buildColumns,
  statusItems,
  openLinked,
}: ProcurementListTabStateInput<R>) {
  const filterState = useProcurementListFilter();
  const viewState = useProcurementListView(tableId, viewVisibility);
  const { isDeleted, changeFilter, filterKey, resetCount, filter } =
    filterState;
  const { openView, rowActions, purgeActions } = state;

  // Phiếu đã xóa mềm không mở được drawer (API chỉ trả phiếu chưa xóa)
  const openDetail = React.useCallback(
    (id: string) => {
      if (!isDeleted) openView(id);
    },
    [isDeleted, openView],
  );

  const columns = React.useMemo(
    () => buildColumns(t, openDetail, openLinked),
    [buildColumns, openDetail, openLinked, t],
  );

  const rowActionsForMode = React.useCallback(
    (row: R): V2RowActionGroup[] => {
      if (!isDeleted) return rowActions(row);
      const purge = purgeActions(row);
      return purge.length ? [{ items: purge }] : [];
    },
    [isDeleted, purgeActions, rowActions],
  );

  const filterGroup = React.useMemo(
    () =>
      buildProcurementFilterGroup({
        title: t("v2.procurement.filters.title", "Bộ lọc có sẵn"),
        allLabel: t("v2.procurement.filters.all", "Tất cả"),
        deletedLabel: t("v2.procurement.filters.deleted", "Đã xóa mềm"),
        statusItems,
        activeKey: filterKey,
        onChange: changeFilter,
      }),
    [changeFilter, filterKey, statusItems, t],
  );

  const viewItems = React.useMemo(
    () => [
      {
        key: "overview",
        label: t("v2.procurement.views.overview", "Tổng quan"),
        isSystem: true,
      },
      {
        key: "all",
        label: t("v2.procurement.views.all", "Tất cả cột"),
        isSystem: true,
      },
    ],
    [t],
  );

  const viewModes = React.useMemo(
    () => ({
      items: viewItems,
      activeKey: viewState.view,
      onSelect: viewState.selectView,
    }),
    [viewItems, viewState.selectView, viewState.view],
  );

  const fetchOptions: V2FetchOptions | undefined = React.useMemo(
    () => withProcurementFilter(api.options, { deleted: filter.deleted }),
    [api.options, filter.deleted],
  );

  return {
    columns,
    rowActions: rowActionsForMode,
    filter,
    filterGroup,
    viewModes,
    fetchOptions,
    resetKey: `${tableId}-${viewState.tableKey}-${resetCount}`,
  };
}

/** Kiểu trả về của `useProcurementListTabState`, dùng cho component dựng tab. */
export type ProcurementListTabState<R extends { id: string }> = ReturnType<
  typeof useProcurementListTabState<R>
>;

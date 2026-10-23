import * as React from "react";
import type { V2ModuleTab } from "@/v2/shared/components";
import type {
  FakeInvoice,
  InvoiceDirection,
} from "@/v2/modules/finance-invoice/domain/entities/invoiceShape.data";
import { buildInvoiceColumns } from "@/v2/modules/finance-invoice/components/organisms/invoice-shape-table/invoiceShape.columns";
import { useInvoiceList } from "@/v2/modules/finance-invoice/api/queries/useInvoiceShapeQuery";
import { createInvoiceFetchOptions } from "@/v2/modules/finance-invoice/api/queries/useInvoiceColumnOptions";
import { InvoiceShapeDashboard } from "@/v2/modules/finance-invoice/components/organisms/invoice-shape-dashboard/InvoiceShapeDashboard";
import { DETAIL_PREFIX } from "@/v2/modules/finance-invoice/components/organisms/invoice-shape-overlays/InvoiceShapeOverlays";
import {
  v2ColumnPreferencesStorage,
  v2ViewPresetStorage,
} from "@/v2/shared/preferences/v2TablePreferenceStorages";
import {
  TAX_FILTER_TITLE,
  TAX_TABS,
  VIEW_MODES,
  invoiceTableId,
} from "./InvoiceShapePage.constants";
import type { InvoiceShapePageState } from "./InvoiceShapePage.hook";

const buildListTab = (
  state: InvoiceShapePageState,
  direction: InvoiceDirection,
  label: string,
): V2ModuleTab<FakeInvoice> => {
  const {
    taxTab,
    view,
    setView,
    selected,
    setSelected,
    resetCount,
    changeTaxTab,
    openOverlay,
  } = state;

  const columns = buildInvoiceColumns(
    view,
    (id) => openOverlay(`${DETAIL_PREFIX}${id}`),
    direction,
  );

  return {
    key: direction.toLowerCase(),
    label,
    kind: "list",
    resetKey: String(resetCount),
    initialQuery: { pageSize: 20 },
    useData: (query) => useInvoiceList(direction, taxTab, query),
    table: {
      tableId: invoiceTableId(direction),
      columns,
      getRowKey: (row) => row.id,
      mode: "server",
      fetchOptions: createInvoiceFetchOptions(direction),
      preferencesStorage: v2ColumnPreferencesStorage,
      viewPresetStorage: v2ViewPresetStorage,
      enableRowSelection: true,
      selectedKeys: selected,
      onSelectionChange: setSelected,
      emptyLabel: "Không tìm thấy hóa đơn nào phù hợp",
      rowActions: (row) => [
        {
          items: [
            {
              label: "Xem chi tiết",
              onClick: () => openOverlay(`${DETAIL_PREFIX}${row.id}`),
            },
          ],
        },
      ],
      toolbar: {
        filterGroup: {
          title: TAX_FILTER_TITLE,
          items: TAX_TABS,
          activeKey: taxTab,
          onChange: changeTaxTab,
          allKey: "all",
        },
        viewModes: {
          items: VIEW_MODES,
          activeKey: view,
          onSelect: (key) => setView(key as any),
        },
        filterPanel: {},
        enableFullscreen: true,
      },
    },
  };
};

/** Tab của trang: tổng quan (dashboard) + danh sách hóa đơn mua vào / bán ra */
export const buildInvoiceTabs = (
  state: InvoiceShapePageState,
): V2ModuleTab<FakeInvoice>[] => [
  {
    key: "overview",
    label: "Tổng quan",
    kind: "dashboard",
    content: <InvoiceShapeDashboard />,
  },
  buildListTab(state, "IN", "Hóa đơn mua vào"),
  buildListTab(state, "OUT", "Hóa đơn bán ra"),
];

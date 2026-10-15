import * as React from "react";
import {
  Download,
  DownloadCloud,
  FileCheck,
  KeyRound,
  Settings,
} from "lucide-react";
import type { V2ModuleTab } from "@/v2/shared/components/templates/v2-module-page/V2ModulePage.type";
import type {
  FakeInvoice,
  InvoiceDirection,
} from "@/v2/modules/finance-invoice/domain/entities/invoiceShape.data";
import type { InvoiceView } from "@/v2/modules/finance-invoice/components/organisms/invoice-shape-table/invoiceShape.columns";
import { useFakeInvoices } from "@/v2/modules/finance-invoice/api/queries/useInvoiceShapeQuery";
import { InvoiceShapeDashboard } from "@/v2/modules/finance-invoice/components/organisms/invoice-shape-dashboard/InvoiceShapeDashboard";
import { DETAIL_PREFIX } from "@/v2/modules/finance-invoice/components/organisms/invoice-shape-overlays/InvoiceShapeOverlays";
import { TAX_TABS, VIEW_MODES } from "./InvoiceShapePage.constants";
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
    bumpResetCount,
    setBulkOpen,
    columns,
    changeTaxTab,
    openOverlay,
  } = state;

  return {
    key: direction.toLowerCase(),
    label,
    kind: "list",
    resetKey: String(resetCount),
    initialQuery: { pageSize: 20 },
    useData: (query) => useFakeInvoices(direction, taxTab, query),
    table: {
      tableId: `invoice-shape-${direction}`,
      columns,
      getRowKey: (row) => row.id,
      enableRowSelection: true,
      selectedKeys: selected,
      onSelectionChange: setSelected,
      rowActions: (row) => [
        {
          items: [
            {
              label: "Xem chi tiết",
              onClick: () => openOverlay(`${DETAIL_PREFIX}${row.id}`),
            },
            { label: "Hạch toán", onClick: () => openOverlay("posting") },
          ],
        },
      ],
      toolbar: {
        pillTabs: {
          items: TAX_TABS,
          activeKey: taxTab,
          onChange: changeTaxTab,
        },
        viewModes: {
          items: VIEW_MODES,
          activeKey: view,
          onSelect: (key) => setView(key as InvoiceView),
        },
        bulkActions: [
          {
            groupLabel: "Hàng loạt",
            items: [
              {
                label: "Gán chi nhánh, ghi chú",
                onClick: () => setBulkOpen(true),
              },
              { label: "Hạch toán", onClick: () => openOverlay("posting") },
            ],
          },
        ],
        filterPanel: {},
        create: {
          label: "Đồng bộ",
          icon: <DownloadCloud className="h-4 w-4" />,
          onClick: bumpResetCount,
          actions: [
            {
              groupLabel: "Tra cứu",
              items: [
                {
                  label: "Xuất Excel",
                  icon: <Download className="h-3.5 w-3.5" />,
                  onClick: () => openOverlay("export"),
                },
              ],
            },
            {
              groupLabel: "Thao tác",
              items: [
                {
                  label: "Đăng nhập Cổng Thuế",
                  icon: <KeyRound className="h-3.5 w-3.5" />,
                },
                {
                  label: "Đồng bộ & Tải PDF gốc NCC",
                  icon: <FileCheck className="h-3.5 w-3.5" />,
                },
              ],
            },
            {
              groupLabel: "Cấu hình",
              items: [
                {
                  label: "Cấu hình hóa đơn mua vào",
                  icon: <Settings className="h-3.5 w-3.5" />,
                },
              ],
            },
          ],
        },
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

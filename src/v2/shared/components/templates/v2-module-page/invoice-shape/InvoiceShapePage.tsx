import * as React from "react";
import { FileDown, FileUp, Receipt } from "lucide-react";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { useV2OverlayState } from "@/v2/shared/hooks/useV2OverlayState";
import { resetV2TableUrl } from "@/v2/shared/utils/v2TableUrl";
import { V2ModulePage } from "../V2ModulePage";
import type { V2ModuleTab } from "../V2ModulePage.type";
import { buildInvoiceColumns } from "./invoiceShape.columns";
import type { InvoiceView } from "./invoiceShape.columns";
import type {
  FakeInvoice,
  InvoiceDirection,
  TaxTab,
} from "./invoiceShape.data";
import { findInvoice, useFakeInvoices } from "./invoiceShape.logic";
import { InvoiceShapeDashboard } from "./InvoiceShapeDashboard";
import { DETAIL_PREFIX, InvoiceShapeOverlays } from "./InvoiceShapeOverlays";

const TAX_TABS = [
  { key: "all", label: "Tất cả" },
  { key: "new", label: "Mới" },
  { key: "replacement", label: "Thay thế" },
  { key: "adjustment", label: "Điều chỉnh" },
];

const VIEW_MODES = [
  { key: "overview", label: "Tổng quan", isSystem: true },
  { key: "audit", label: "Kiểm toán / Đối soát", isSystem: true },
];

/**
 * Trang mẫu hình dạng erp-invoice: toàn bộ UI do khung V2 lo, phần "logic" chỉ gồm
 * `useFakeInvoices` (nhận query, trả dữ liệu) và các state nghiệp vụ nhỏ của trang.
 */
export const InvoiceShapePage: React.FC<{ syncUrl?: boolean }> = ({
  syncUrl = true,
}) => {
  const [taxTab, setTaxTab] = React.useState<TaxTab>("all");
  const [view, setView] = React.useState<InvoiceView>("overview");
  const [selected, setSelected] = React.useState<string[]>([]);
  const [resetCount, setResetCount] = React.useState(0);
  const [bulkOpen, setBulkOpen] = React.useState(false);
  const [importOpen, setImportOpen] = React.useState(false);
  const overlay = useV2OverlayState();
  const { open: openOverlay } = overlay;

  const columns = React.useMemo(
    () =>
      buildInvoiceColumns(view, (id) => openOverlay(`${DETAIL_PREFIX}${id}`)),
    [view, openOverlay],
  );

  const changeTaxTab = (key: string) => {
    setTaxTab(key as TaxTab);
    setSelected([]);
    resetV2TableUrl("in");
    resetV2TableUrl("out");
    setResetCount((count) => count + 1);
  };

  const listTab = (
    direction: InvoiceDirection,
    label: string,
  ): V2ModuleTab<FakeInvoice> => ({
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
        search: { placeholder: "Tìm số hóa đơn, đối tác, MST" },
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
      },
    },
  });

  const tabs: V2ModuleTab<FakeInvoice>[] = [
    {
      key: "overview",
      label: "Tổng quan",
      kind: "dashboard",
      content: <InvoiceShapeDashboard />,
    },
    listTab("IN", "Hóa đơn mua vào"),
    listTab("OUT", "Hóa đơn bán ra"),
  ];

  const detailId = overlay.stack
    .find((id) => id.startsWith(DETAIL_PREFIX))
    ?.slice(DETAIL_PREFIX.length);
  const invoice = detailId ? findInvoice(detailId) : undefined;

  return (
    <V2ModulePage<FakeInvoice>
      title="Hóa đơn điện tử"
      description="Quản lý hóa đơn mua vào, bán ra và tổng quan thuế"
      icon={<Receipt className="h-4 w-4" />}
      tabs={tabs}
      syncUrl={syncUrl}
      actions={
        <>
          <V2Button
            variant="outline"
            size="sm"
            leftIcon={<FileUp className="h-3.5 w-3.5" />}
            onClick={() => setImportOpen(true)}
          >
            Nhập XML
          </V2Button>
          <V2Button
            variant="outline"
            size="sm"
            leftIcon={<FileDown className="h-3.5 w-3.5" />}
            onClick={() => openOverlay("export")}
          >
            Xuất Excel
          </V2Button>
        </>
      }
      overlays={
        <InvoiceShapeOverlays
          invoice={invoice}
          overlay={overlay}
          selectedCount={selected.length}
          bulkOpen={bulkOpen}
          onBulkOpenChange={setBulkOpen}
          importOpen={importOpen}
          onImportOpenChange={setImportOpen}
        />
      }
    />
  );
};

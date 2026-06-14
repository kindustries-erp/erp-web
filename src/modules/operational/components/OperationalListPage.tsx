import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  periodFirstDay,
  periodLastDay,
  monthFirstDay,
} from "@/modules/finance/utils/financeHelpers";
import {
  AlertCircle,
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
  FileText,
  Link2,
  Loader2,
  Plus,
  RefreshCcw,
  Repeat,
  Warehouse,
  Eye,
} from "lucide-react";
import { cn } from "@/shared/utils";
import { useUIStore } from "@/core/config/uiStore";
import { useAppStore } from "@/core/config/appStore";
import { useT } from "@/core/i18n";
import { getBranchesApi } from "@/modules/branches/api/branchApi";
import {
  getPaymentVouchersPagedApi,
  type PaymentVoucher,
} from "@/modules/finance/api/financeApi";
import { BtnPrimary } from "@/shared/components/BtnPrimary";
import { Button } from "@/shared/components/ui/Button";
import { TableActionGroup } from "@/shared/components/TableActionGroup";
import { Combobox } from "@/shared/components/Combobox";
import { ActionDropdown } from "@/shared/components/ActionDropdown";
import { DataTable, type DataTableColumn } from "@/shared/components/DataTable";
import { DatePicker } from "@/shared/components/DatePicker";
import {
  DrawerField,
  DrawerModal,
  DrawerSection,
  inputCls,
} from "@/shared/components/DrawerModal";
import { Skeleton } from "@/shared/components/Skeleton";
import { PageLayout } from "@/shared/components/PageLayout";
import { FilterButton, FilterPanel } from "@/shared/components/FilterPanel";
import { type FilterPanelConfig } from "@/shared/hooks/useFilterPanel";
import { StatusBadge } from "@/shared/components/badges";
import { extractApiError } from "@/shared/utils/apiError";
import {
  isRecurringDocument,
  operationalApi,
  type CreateOperationalPayload,
  InventoryStockRow,
  OperationalDocument,
  type OperationalDocumentPaymentLink,
  OperationalDocumentType,
  OperationalVariant,
} from "../api/operationalApi";
import {
  useOperationalFlowStore,
  type InventoryPostingLineForm,
  type SettlementFormState,
} from "../hooks/useOperationalFlowStore";
import { OperationalFormDrawer } from "./OperationalFormDrawer";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { GoodsReceiptViewDrawer } from "@/modules/goods-receipts-core/components/GoodsReceiptViewDrawer";
import { InventoryItemFormDrawer } from "@/modules/inventory-core/components/InventoryItemFormDrawer";
import {
  purchaseOrdersCoreApi,
  type ErpPoReceipt,
  type ErpPurchaseOrder,
} from "@/modules/purchase-orders-core/api/purchaseOrdersCoreApi";
import {
  inventoryCoreApi,
  type InventoryMovement,
  type InventoryMovementsPayload,
} from "@/modules/inventory-core/api/inventoryCoreApi";
import { useOperationalListQuery } from "../hooks/useOperationalListQuery";
import { useBasicMasterInfinite } from "@/modules/basic-masters/hooks/useBasicMasterInfinite";
import { DocumentLineTable } from "@/shared/components/DocumentLineTable";

const variantConfig: Record<
  OperationalVariant,
  { title: string; desc: string; cta?: string; paymentLinkable?: boolean }
> = {
  sales: {
    title: "Bán hàng / Đơn sửa xe",
    desc: "Nguồn ERP, KGARA, Vinfast DMS. Công nợ phải thu sinh từ chứng từ gốc.",
    cta: "Tạo đơn sửa xe mẫu",
  },
  purchase: {
    title: "Đơn mua hàng",
    desc: "Phụ tùng, nguyên vật liệu; có thể định kỳ và trigger nhập kho.",
  },
  expenses: {
    title: "Chi phí vận hành",
    desc: "Điện nước, thuê máy in, dịch vụ; không qua kho, có thể định kỳ/chưa hóa đơn.",
    cta: "Tạo chi phí mẫu",
  },
  receivables: {
    title: "Công nợ phải thu mới",
    desc: "Tổng hợp từ đơn sửa xe/bán hàng, không nhập công nợ trực tiếp.",
    paymentLinkable: true,
  },
  payables: {
    title: "Công nợ phải trả mới",
    desc: "Tổng hợp từ đơn mua hàng và chi phí vận hành; link phiếu Dòng tiền.",
    paymentLinkable: true,
  },
  inventory: {
    title: "Kho (Tổng hợp tồn)",
    desc: "Tổng hợp tồn kho toàn bộ hàng hóa: linh kiện (RAW), thành phẩm (FG), bán thành phẩm (WIP). Có thể lọc theo loại.",
  },
};

function money(value: unknown) {
  const n = Number(value || 0);
  return n.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  });
}

function normalizeDate(value?: string | null) {
  return value ? String(value).slice(0, 10) : "";
}

function normalizeDateTime(value?: string | null) {
  if (!value) return "";
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  } catch {
    return String(value);
  }
}

function today() {
  return normalizeDate(new Date().toISOString());
}

function fmtQty(value?: number | string | null) {
  if (value == null) return "0";
  const n = Number(value);
  if (Number.isNaN(n)) return String(value);
  return new Intl.NumberFormat("vi-VN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  }).format(n);
}

function movementLabel(m: InventoryMovement) {
  const type = m.transactionType || "—";
  const doc = m.documentType ? ` • ${m.documentType}` : "";
  return `${type}${doc}`;
}

function InventoryTimelineBlock({
  itemId,
  loadingId,
  error,
  data,
}: {
  itemId: string;
  loadingId: string | null;
  error: string | null;
  data?: InventoryMovementsPayload;
}) {
  const t = useT();
  const isLoading = loadingId === itemId;

  if (isLoading) {
    return (
      <div className="rounded-xl bg-slate-50 dark:bg-zinc-950/50 p-8 flex items-center justify-center text-sm text-muted-foreground my-4 mr-4 -ml-6 md:mr-8 md:-ml-2 shadow-md border border-border">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Đang tải lịch sử xuất nhập kho...
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 flex items-center justify-center text-sm text-red-700 my-4 mr-4 -ml-6 md:mr-8 md:-ml-2 shadow-md">
        <AlertCircle className="mr-2 h-5 w-5" />
        {error}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="rounded-xl bg-slate-50 dark:bg-zinc-950/50 p-4 md:p-6 overflow-x-auto my-4 mr-4 -ml-6 md:mr-8 md:-ml-2 shadow-md border border-border">
      <div className="min-w-[700px]">
        <div className="mb-4 font-semibold text-base text-foreground">
          {t("Lịch sử xuất nhập kho")}
        </div>
        {data.movements.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
            Chưa có phát sinh xuất nhập kho.
          </div>
        ) : (
          <div className="w-full text-sm">
            <div className="flex items-center text-muted-foreground border-b border-border pb-2 mb-2 px-2">
              <div className="w-[100px] font-medium">Thời gian</div>
              <div className="flex-1 font-medium">Giao dịch</div>
              <div className="w-[120px] text-right font-medium">Thay đổi</div>
              <div className="w-[120px] text-right font-medium">Tồn kho</div>
            </div>
            <div className="space-y-1">
              {data.movements.map((m) => {
                const isIn = Number(m.qtyIn || 0) > 0;
                const qty = isIn ? m.qtyIn : m.qtyOut;
                const dt = normalizeDateTime(m.createdAt);
                return (
                  <div
                    key={m.id}
                    className="flex items-center hover:bg-muted/50 rounded py-2 px-2 transition-colors"
                  >
                    <div className="w-[100px]">
                      <div className="text-xs font-semibold text-foreground">
                        {dt.slice(11, 16)}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {dt.slice(0, 10)}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={
                            isIn
                              ? "text-[11px] font-medium text-emerald-600"
                              : "text-[11px] font-medium text-amber-600"
                          }
                        >
                          {isIn ? "Nhập" : "Xuất"}
                        </span>
                        <span className="truncate font-medium text-foreground">
                          {movementLabel(m)}
                        </span>
                        {m.notes ? (
                          <span className="truncate text-xs text-muted-foreground">
                            • {m.notes}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="w-[120px] text-right">
                      <div
                        className={
                          isIn
                            ? "font-medium text-emerald-600"
                            : "font-medium text-amber-600"
                        }
                      >
                        {isIn ? "+" : "-"}
                        {fmtQty(qty)}
                      </div>
                    </div>

                    <div className="w-[120px] text-right">
                      <div className="font-medium text-foreground">
                        {fmtQty(m.balanceAfter)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function docNo(row: OperationalDocument) {
  return row.order_no || row.purchase_no || row.expense_no || "—";
}

function partner(row: OperationalDocument) {
  return (
    row.customer_name_snapshot || row.supplier_name_snapshot || row.title || "—"
  );
}

function sourceLabel(row: OperationalDocument, variant: OperationalVariant) {
  if (row.source_system) return row.source_system;
  if (variant === "payables" || variant === "receivables") {
    return row.document_type === "operating_expenses"
      ? "CHI PHÍ"
      : row.document_type === "purchase_orders"
        ? "MUA HÀNG"
        : "BÁN HÀNG";
  }
  return "ERP";
}

function resolveDocumentType(
  row: OperationalDocument,
  variant: OperationalVariant,
): OperationalDocumentType | null {
  if (row.document_type === "sales_service_orders")
    return "sales_service_orders";
  if (row.document_type === "purchase_orders") return "purchase_orders";
  if (row.document_type === "operating_expenses") return "operating_expenses";
  if (variant === "sales" || variant === "receivables")
    return "sales_service_orders";
  if (variant === "purchase") return "purchase_orders";
  if (variant === "expenses") return "operating_expenses";
  return null;
}

function inventoryStatusLabel(status?: string | null) {
  if (status === "NOT_RECEIVED") return "Chưa nhập";
  if (status === "PARTIAL") return "Đang xử lý một phần";
  if (status === "FULLY_RECEIVED") return "Đã nhập đủ";
  if (status === "NOT_ISSUED") return "Chưa xuất";
  if (status === "ISSUED") return "Đã xuất";
  return status || "—";
}

function canPostReceipt(row: OperationalDocument, variant: OperationalVariant) {
  return (
    variant === "purchase" &&
    row.status === "RECEIVED" &&
    row.inventory_status !== "FULLY_RECEIVED"
  );
}

function canPostIssue(row: OperationalDocument, variant: OperationalVariant) {
  return (
    variant === "sales" &&
    ["CONFIRMED", "IN_PROGRESS"].includes(row.status) &&
    row.inventory_status !== "ISSUED"
  );
}

function buildSamplePayload(
  variant: OperationalVariant,
): CreateOperationalPayload | null {
  if (variant === "sales") {
    return {
      source_system: "ERP",
      customer_name_snapshot: "Khách hàng mẫu",
      vehicle_plate: "51A-000.00",
      status: "CONFIRMED",
      invoice_status: "NO_INVOICE",
      total_amount: 1500000,
      lines: [
        {
          line_type: "SERVICE",
          item_name: "Dịch vụ sửa chữa mẫu",
          qty: 1,
          unit_price: 1500000,
        },
      ],
    };
  }

  if (variant === "expenses") {
    return {
      supplier_name_snapshot: "NCC dịch vụ mẫu",
      title: "Chi phí vận hành mẫu",
      expense_category: "UTILITY",
      status: "CONFIRMED",
      recurrence_type: "MONTHLY",
      auto_generate_next: true,
      total_amount: 800000,
      lines: [{ description: "Điện/nước/internet mẫu", amount: 800000 }],
    };
  }
  return null;
}

function PurchaseSubRow({ rowId }: { rowId: string }) {
  const [detail, setDetail] = useState<OperationalDocument | null>(null);
  const [poDetail, setPoDetail] = useState<ErpPurchaseOrder | null>(null);
  const [receipts, setReceipts] = useState<ErpPoReceipt[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewingReceiptId, setViewingReceiptId] = useState<string | null>(null);
  const t = useT();

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      try {
        const doc = await operationalApi.getDocument("purchase_orders", rowId);
        if (active) setDetail(doc);
        const po = await purchaseOrdersCoreApi.get(rowId);
        if (active) {
          setReceipts(po.receipts || []);
          setPoDetail(po);
        }
      } catch (e) {
        if (active) setError(t("Không tải được chi tiết dòng"));
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [rowId, t]);

  if (loading)
    return (
      <div className="rounded-xl bg-slate-50 dark:bg-zinc-950/50 p-8 flex items-center justify-center text-sm text-muted-foreground my-4 mr-4 -ml-6 md:mr-8 md:-ml-2 shadow-md border border-border">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        {t("Đang tải chi tiết...")}
      </div>
    );
  if (error)
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 flex items-center justify-center text-sm text-red-700 my-4 mr-4 -ml-6 md:mr-8 md:-ml-2 shadow-md">
        <AlertCircle className="mr-2 h-5 w-5" />
        {error}
      </div>
    );
  if (!detail) return null;

  return (
    <div className="rounded-xl bg-slate-50 dark:bg-zinc-950/50 p-4 md:p-6 my-4 mr-4 -ml-6 md:mr-8 md:-ml-2 shadow-md border border-border flex flex-col md:flex-row gap-6">
      <div className="flex-1 min-w-0">
        <div className="mb-4 font-semibold text-base text-foreground">
          {t("Chi tiết")}
        </div>
        {!detail.lines || detail.lines.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
            {t("Không có dòng chi tiết.")}
          </div>
        ) : (
          <div className="w-full overflow-y-auto max-h-[300px]">
            <DocumentLineTable
              columns={[
                {
                  key: "index",
                  header: "#",
                  width: 40,
                  align: "center",
                  cell: (_, idx) => (
                    <span className="text-muted-foreground">{idx + 1}</span>
                  ),
                },
                {
                  key: "itemCode",
                  header: t("Mã linh kiện"),
                  minWidth: 140,
                  cell: (
                    line: NonNullable<OperationalDocument["lines"]>[number],
                  ) => line.item_code || "—",
                },
                {
                  key: "itemName",
                  header: t("Linh kiện / Tên hàng"),
                  minWidth: 260,
                  cell: (
                    line: NonNullable<OperationalDocument["lines"]>[number],
                    idx: number,
                  ) => (
                    <div className="font-medium text-foreground">
                      {line.item_name ||
                        line.description ||
                        `${t("Dòng")} ${idx + 1}`}
                    </div>
                  ),
                },
                {
                  key: "qtyOrdered",
                  header: t("Số lượng"),
                  minWidth: 100,
                  align: "center",
                  cell: (
                    line: NonNullable<OperationalDocument["lines"]>[number],
                  ) => (
                    <div className="font-medium text-foreground">
                      {Number(line.qty || 0).toLocaleString("vi-VN")}
                    </div>
                  ),
                },
                {
                  key: "qtyReceived",
                  header: t("Đã nhập"),
                  minWidth: 100,
                  align: "center",
                  cell: (
                    line: NonNullable<OperationalDocument["lines"]>[number],
                    idx: number,
                  ) => {
                    const poLine = poDetail?.lines?.find(
                      (l, i) => l.id === line.id || i === idx,
                    );
                    const qtyReceived = Number(poLine?.qtyReceived || 0);
                    return (
                      <div className="font-medium text-emerald-600">
                        {qtyReceived.toLocaleString("vi-VN")}
                      </div>
                    );
                  },
                },
                {
                  key: "qtyRemaining",
                  header: t("Còn lại"),
                  minWidth: 100,
                  align: "center",
                  cell: (
                    line: NonNullable<OperationalDocument["lines"]>[number],
                    idx: number,
                  ) => {
                    const poLine = poDetail?.lines?.find(
                      (l, i) => l.id === line.id || i === idx,
                    );
                    const qtyReceived = Number(poLine?.qtyReceived || 0);
                    const qtyOrdered = Number(
                      line.qty || poLine?.qtyOrdered || 0,
                    );
                    const qtyRemaining = Math.max(0, qtyOrdered - qtyReceived);
                    return (
                      <div className="font-medium text-amber-600">
                        {qtyRemaining.toLocaleString("vi-VN")}
                      </div>
                    );
                  },
                },
              ]}
              data={detail.lines || []}
              getRowKey={(line, idx) => line.id || idx}
              viewOnly={true}
            />
          </div>
        )}
      </div>

      <div className="w-full md:w-72 lg:w-80 shrink-0 md:border-l md:border-border md:pl-6">
        <div className="mb-4 font-semibold text-base text-foreground">
          {t("Lịch sử nhập kho")}
        </div>
        {receipts.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
            {t("Chưa có lịch sử nhập.")}
          </div>
        ) : (
          <div className="space-y-3">
            {receipts.map((receipt) => (
              <div
                key={receipt.id}
                className="rounded-lg border border-border bg-background p-3 hover:border-primary/30 transition-colors shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="font-semibold text-sm text-primary cursor-pointer hover:underline"
                    onClick={() => setViewingReceiptId(receipt.id)}
                  >
                    {receipt.receiptNo}
                  </span>
                  <div className="text-right">
                    <div className="text-xs font-medium text-muted-foreground">
                      {receipt.createdAt
                        ? normalizeDateTime(receipt.createdAt)
                        : receipt.receiptDate
                          ? receipt.receiptDate.slice(0, 10)
                          : "—"}
                    </div>
                  </div>
                </div>
                {receipt.remarks && (
                  <div className="text-xs text-muted-foreground mb-2 italic">
                    {receipt.remarks}
                  </div>
                )}
                <div className="space-y-1.5 mt-2 border-t border-border pt-2">
                  {(receipt.lines || []).map((line, idx) => {
                    const matchingPoLine = poDetail?.lines?.find(
                      (l) => l.id === line.purchaseOrderLineId,
                    );
                    const itemName =
                      matchingPoLine?.itemName ||
                      matchingPoLine?.description ||
                      `${t("Dòng")} ${line.lineNo || idx + 1}`;
                    return (
                      <div
                        key={line.id || idx}
                        className="flex justify-between items-center text-xs gap-4"
                      >
                        <Tooltip content={itemName}>
                          <span className="text-muted-foreground truncate flex-1 cursor-help">
                            {itemName}
                          </span>
                        </Tooltip>
                        <span className="font-medium text-emerald-600 shrink-0">
                          {t("Nhận:")} +
                          {Number(line.qtyReceived || 0).toLocaleString(
                            "vi-VN",
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
        <GoodsReceiptViewDrawer
          open={!!viewingReceiptId}
          receiptId={viewingReceiptId}
          onClose={() => setViewingReceiptId(null)}
        />
      </div>
    </div>
  );
}

export function OperationalListPage({
  variant,
}: {
  variant: OperationalVariant;
}) {
  const t = useT();
  const navigate = useAppStore((s) => s.navigate);
  const showToast = useUIStore((s) => s.showToast);
  const queryClient = useQueryClient();
  const config = variantConfig[variant];

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedStockItemIds, setExpandedStockItemIds] = useState<
    Record<string, boolean>
  >({});
  const [movLoadingId, setMovLoadingId] = useState<string | null>(null);
  const [movError, setMovError] = useState<string | null>(null);
  const [movMap, setMovMap] = useState<
    Record<string, InventoryMovementsPayload>
  >({});
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [branchFilter, setBranchFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [recurringFilter, setRecurringFilter] = useState("");
  const [period, setPeriod] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [branchOptions, setBranchOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [formOpen, setFormOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [viewOnly, setViewOnly] = useState(false);
  const [expandedRowIds, setExpandedRowIds] = useState<Record<string, boolean>>(
    {},
  );
  const [editingRow, setEditingRow] = useState<OperationalDocument | null>(
    null,
  );
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [itemTypeFilter, setItemTypeFilter] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("");
  const [supplierSearch, setSupplierSearch] = useState("");
  const {
    data: suppliersData,
    fetchNextPage: fetchNextSuppliers,
    isFetchingNextPage: loadingSuppliers,
  } = useBasicMasterInfinite({
    search: supplierSearch,
    limit: 50,
    entities: "suppliers",
    enabled: variant === "purchase",
  });

  const supplierOptions = useMemo(() => {
    return (
      suppliersData?.pages.flatMap((p) =>
        (p.items.suppliers || []).map((s) => ({
          value: s.id,
          label: s.name,
        })),
      ) || []
    );
  }, [suppliersData]);
  // sort state: "field" = ASC, "-field" = DESC, "" = default (createdAt DESC)
  const [purchaseSort, setPurchaseSort] = useState<string>("");
  const [poReceipts, setPoReceipts] = useState<ErpPoReceipt[]>([]);
  const [viewingItemId, setViewingItemId] = useState<string | null>(null);

  function toggleExpand(id: string) {
    setExpandedRowIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }

  async function handleToggleInventoryExpand(row: InventoryStockRow) {
    const isExpanded = expandedStockItemIds[row.inventory_item_id];
    setExpandedStockItemIds((prev) => ({
      ...prev,
      [row.inventory_item_id]: !isExpanded,
    }));

    if (isExpanded) return;

    setMovError(null);
    if (movMap[row.inventory_item_id]) return;
    setMovLoadingId(row.inventory_item_id);
    try {
      const data = await inventoryCoreApi.movements(row.inventory_item_id);
      setMovMap((prev) => ({ ...prev, [row.inventory_item_id]: data }));
    } catch (e) {
      setMovError(
        e instanceof Error ? e.message : "Không thể tải lịch sử xuất nhập kho",
      );
    } finally {
      setMovLoadingId(null);
    }
  }

  const {
    activeStep,
    rootDocument,
    rootDocumentType,
    detailDocument,
    detailLoading,
    detailError,
    settlementLoading,
    settlementError,
    voucherLoading,
    paymentLinks,
    voucherOptions,
    settlementForm,
    postingDocument,
    postingDocumentType,
    postingLoading,
    postingLineForms,
    postingNotes,
    setRootContext,
    setActiveStep,
    setDetailState,
    setSettlementState,
    setPostingState,
    resetFlow,
  } = useOperationalFlowStore();

  useEffect(() => {
    const id = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  useEffect(() => {
    getBranchesApi()
      .then((branches) => {
        setBranchOptions(
          (branches ?? []).map((branch) => ({
            value: branch.id,
            label: branch.code
              ? `${branch.code} — ${branch.name}`
              : branch.name,
          })),
        );
      })
      .catch(() => {
        setBranchOptions([]);
      });
  }, []);

  useEffect(() => {
    resetFlow();
  }, [variant]);

  useEffect(() => {
    resetFlow();
  }, [variant]);

  const purchaseSortArray = purchaseSort ? [purchaseSort] : undefined;

  const listQuery = useOperationalListQuery({
    variant,
    page,
    pageSize,
    search: search || undefined,
    branch_id: branchFilter || undefined,
    supplier_id: supplierFilter || undefined,
    recurring: recurringFilter === "RECURRING",
    payment_status: paymentStatusFilter || undefined,
    status: statusFilter || undefined,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
    item_type: itemTypeFilter || undefined,
    sort: purchaseSortArray,
  });

  useEffect(() => {
    setLoading(listQuery.isLoading || listQuery.isFetching);
    setError(
      listQuery.error
        ? extractApiError(listQuery.error, "Không tải được dữ liệu")
        : null,
    );
  }, [listQuery.error, listQuery.isFetching, listQuery.isLoading]);

  useEffect(() => {
    if (variant !== "purchase") return;
    void listQuery.refetch();
  }, [variant, supplierFilter]);

  const items = useMemo(
    () =>
      variant === "inventory"
        ? []
        : ((listQuery.data?.items || []) as OperationalDocument[]),
    [listQuery.data?.items, variant],
  );

  const stockItems = useMemo(
    () =>
      variant === "inventory"
        ? ((listQuery.data?.items || []) as InventoryStockRow[])
        : [],
    [listQuery.data?.items, variant],
  );

  const total = listQuery.data?.total || 0;
  const totalPages = listQuery.data?.totalPages || 0;

  async function createSample() {
    const payload = buildSamplePayload(variant);
    if (!payload) return;
    setLoading(true);
    setError(null);
    try {
      if (variant === "sales") await operationalApi.createSales(payload);
      else if (variant === "purchase")
        await operationalApi.createPurchase(payload);
      else if (variant === "expenses")
        await operationalApi.createExpense(payload);
      showToast({ title: "Đã tạo chứng từ mẫu", variant: "success" });
      await listQuery.refetch();
    } catch (err) {
      setError(extractApiError(err, "Không tạo được chứng từ mẫu"));
    } finally {
      setLoading(false);
    }
  }

  async function openSettlement(row: OperationalDocument) {
    const documentType = resolveDocumentType(row, variant);
    if (!documentType) return;
    setRootContext(row, documentType);
    setActiveStep("settlement");
    setSettlementState({
      settlementError: null,
      settlementForm: {
        payment_voucher_id: "",
        applied_date: today(),
        applied_amount: Number(row.open_amount || 0),
        notes: "",
      },
      voucherLoading: true,
      paymentLinks: [],
      voucherOptions: [],
    });
    try {
      const [links, vouchers] = await Promise.all([
        operationalApi.listPaymentLinks(documentType, row.id),
        getPaymentVouchersPagedApi({
          page: 1,
          pageSize: 100,
          status: "APPROVED",
          voucher_direction: variant === "receivables" ? "IN" : "OUT",
          counterparty_id:
            typeof row.customer_id === "string"
              ? row.customer_id
              : typeof row.supplier_id === "string"
                ? row.supplier_id
                : undefined,
          sort: ["-document_date"],
        }),
      ]);
      setSettlementState({
        paymentLinks: links,
        voucherOptions: vouchers.items ?? [],
      });
    } catch (err) {
      setSettlementState({
        settlementError: extractApiError(err, "Không tải được dữ liệu cấn trừ"),
        paymentLinks: [],
        voucherOptions: [],
      });
    } finally {
      setSettlementState({ voucherLoading: false });
    }
  }

  function closeSettlement() {
    if (detailDocument) {
      setActiveStep("detail");
      setSettlementState({ settlementError: null });
      return;
    }
    resetFlow();
  }

  const selectedVoucher = useMemo(
    () =>
      voucherOptions.find(
        (voucher) => voucher.id === settlementForm.payment_voucher_id,
      ),
    [voucherOptions, settlementForm.payment_voucher_id],
  );

  const voucherSelectOptions = useMemo(
    () =>
      voucherOptions.map((voucher) => ({
        value: voucher.id,
        label: `${voucher.voucher_no} — ${money(voucher.amount)}`,
      })),
    [voucherOptions],
  );

  async function refreshSettlementData() {
    if (!rootDocument || !rootDocumentType) return;
    const [document, links] = await Promise.all([
      operationalApi.getDocument(rootDocumentType, rootDocument.id),
      operationalApi.listPaymentLinks(rootDocumentType, rootDocument.id),
    ]);
    setRootContext(document, rootDocumentType);
    setDetailState({ detailDocument: document });
    setSettlementState({ paymentLinks: links });
  }

  async function saveSettlement() {
    if (!rootDocument || !rootDocumentType) return;
    if (!settlementForm.payment_voucher_id) {
      setSettlementState({ settlementError: "Vui lòng chọn phiếu dòng tiền." });
      return;
    }
    if (settlementForm.applied_amount <= 0) {
      setSettlementState({
        settlementError: "Số tiền cấn trừ phải lớn hơn 0.",
      });
      return;
    }
    setSettlementState({ settlementLoading: true, settlementError: null });
    try {
      await operationalApi.createPaymentLink({
        document_type: rootDocumentType,
        document_id: rootDocument.id,
        payment_voucher_id: settlementForm.payment_voucher_id,
        applied_amount: settlementForm.applied_amount,
        applied_date: settlementForm.applied_date,
        notes: settlementForm.notes || undefined,
      });
      await refreshSettlementData();
      await listQuery.refetch();
      showToast({ title: "Đã liên kết phiếu dòng tiền", variant: "success" });
      setSettlementState({
        settlementForm: {
          ...settlementForm,
          payment_voucher_id: "",
          notes: "",
        },
      });
    } catch (err) {
      setSettlementState({
        settlementError: extractApiError(err, "Liên kết thanh toán thất bại"),
      });
    } finally {
      setSettlementState({ settlementLoading: false });
    }
  }

  async function openDetail(row: OperationalDocument) {
    const documentType = resolveDocumentType(row, variant);
    if (!documentType) return;

    if (variant === "purchase") {
      setEditingRow(row);
      setPoReceipts([]);
      setViewOnly(true);
      setFormOpen(true);
      setFormLoading(true);
      setError(null);
      try {
        const document = await operationalApi.getDocument(documentType, row.id);
        const po = await purchaseOrdersCoreApi.get(row.id);
        setPoReceipts(po.receipts || []);
        setEditingRow(document);
      } catch (err) {
        setError(extractApiError(err, t("Không tải được chi tiết chứng từ")));
      } finally {
        setFormLoading(false);
      }
      return;
    }

    setRootContext(row, documentType);
    setActiveStep("detail");
    setDetailState({
      detailLoading: true,
      detailError: null,
      detailDocument: null,
    });
    try {
      const document = await operationalApi.getDocument(documentType, row.id);
      setRootContext(document, documentType);
      setDetailState({ detailDocument: document });
      if (documentType === "purchase_orders") {
        try {
          const po = await purchaseOrdersCoreApi.get(row.id);
          setPoReceipts(po.receipts || []);
        } catch {
          setPoReceipts([]);
        }
      } else {
        setPoReceipts([]);
      }
    } catch (err) {
      setDetailState({
        detailError: extractApiError(err, "Không tải được chi tiết chứng từ"),
      });
    } finally {
      setDetailState({ detailLoading: false });
    }
  }

  function closeDetail() {
    resetFlow();
  }

  async function openPostingDrawer(row: OperationalDocument) {
    const documentType = resolveDocumentType(row, variant);
    if (!documentType) return;
    if (documentType === "purchase_orders") {
      navigate("erp-goods-receipts");
      const params = new URLSearchParams(window.location.search);
      params.set("purchaseOrderId", row.id);
      params.set("mode", "from-po");
      const nextPath = `${window.location.pathname}?${params.toString()}`;
      history.replaceState(null, "", nextPath);
      return;
    }
    setPostingState({ postingLoading: true });
    setError(null);
    try {
      const document = await operationalApi.getDocument(documentType, row.id);
      const lineForms = (document.lines || [])
        .filter(
          (line: import("../api/operationalApi").OperationalLine) =>
            line.inventory_item_id && Number(line.qty || 0) > 0,
        )
        .map((line: import("../api/operationalApi").OperationalLine) => ({
          line_id: String(line.id || ""),
          line_name:
            line.item_name ||
            line.description ||
            line.item_code ||
            String(line.id),
          requested_qty: Number(line.qty || 0),
          max_qty: Number(line.qty || 0),
          inventory_item_id: line.inventory_item_id || null,
        }))
        .filter((line: InventoryPostingLineForm) => line.line_id);
      setRootContext(document, documentType);
      setDetailState({ detailDocument: document });
      setPostingState({
        postingDocument: document,
        postingDocumentType: documentType,
        postingLineForms: lineForms,
        postingNotes: "",
      });
    } catch (err) {
      setError(extractApiError(err, "Không tải được dữ liệu post kho"));
    } finally {
      setPostingState({ postingLoading: false });
    }
  }

  function closePostingDrawer() {
    if (detailDocument) {
      setActiveStep("detail");
      setPostingState({
        postingDocument: null,
        postingDocumentType: null,
        postingLineForms: [],
        postingNotes: "",
      });
      return;
    }
    resetFlow();
  }

  async function submitPostingDrawer() {
    if (!postingDocument || !postingDocumentType) return;
    const selectedLines = postingLineForms
      .filter((line) => Number(line.requested_qty || 0) > 0)
      .map((line) => ({
        line_id: line.line_id,
        qty: Number(line.requested_qty || 0),
      }));
    if (!selectedLines.length) {
      setError("Vui lòng nhập số lượng post kho cho ít nhất 1 dòng.");
      return;
    }
    setPostingState({ postingLoading: true });
    setError(null);
    try {
      if (postingDocumentType === "purchase_orders") {
        await operationalApi.postPurchaseReceipt(postingDocument.id, {
          transaction_date: today(),
          notes: postingNotes || undefined,
          receipt_lines: selectedLines,
        } as any);
        showToast({ title: "Đã post nhập kho", variant: "success" });
      } else if (postingDocumentType === "sales_service_orders") {
        await operationalApi.postSalesIssue(postingDocument.id, {
          transaction_date: today(),
          notes: postingNotes || undefined,
          issue_lines: selectedLines,
        } as any);
        showToast({ title: "Đã post xuất kho", variant: "success" });
      }
      await listQuery.refetch();
      if (detailDocument?.id === postingDocument.id) {
        const refreshed = await operationalApi.getDocument(
          postingDocumentType,
          postingDocument.id,
        );
        setRootContext(refreshed, postingDocumentType);
        setDetailState({ detailDocument: refreshed });
      }
      closePostingDrawer();
    } catch (err) {
      setError(extractApiError(err, "Post kho thất bại"));
    } finally {
      setPostingState({ postingLoading: false });
    }
  }

  const visibleItems = useMemo(() => {
    if (!recurringFilter) return items;
    return items.filter((row) =>
      recurringFilter === "RECURRING"
        ? isRecurringDocument(row)
        : !isRecurringDocument(row),
    );
  }, [items, recurringFilter]);

  async function removePaymentLink(linkId: string) {
    if (!rootDocument || !rootDocumentType) return;
    setSettlementState({ settlementLoading: true, settlementError: null });
    try {
      await operationalApi.deletePaymentLink(
        rootDocumentType,
        rootDocument.id,
        linkId,
      );
      await refreshSettlementData();
      await listQuery.refetch();
      showToast({ title: "Đã gỡ liên kết thanh toán", variant: "success" });
    } catch (err) {
      setSettlementState({
        settlementError: extractApiError(
          err,
          "Không gỡ được liên kết thanh toán",
        ),
      });
    } finally {
      setSettlementState({ settlementLoading: false });
    }
  }

  const ITEM_TYPE_OPTIONS = [
    { value: "RAW", label: "RAW — Linh kiện" },
    { value: "FG", label: "FG — Thành phẩm" },
    { value: "WIP", label: "WIP — Bán thành phẩm" },
  ];

  const STATUS_OPTIONS = [
    { value: "DRAFT", label: "DRAFT" },
    { value: "CONFIRMED", label: "CONFIRMED" },
    { value: "IN_PROGRESS", label: "IN_PROGRESS" },
    { value: "COMPLETED", label: "COMPLETED" },
    { value: "RECEIVED", label: "RECEIVED" },
    { value: "CANCELLED", label: "CANCELLED" },
  ];
  const PAYMENT_STATUS_OPTIONS = [
    { value: "UNPAID", label: "UNPAID" },
    { value: "PARTIALLY_PAID", label: "PARTIALLY_PAID" },
    { value: "PAID", label: "PAID" },
    { value: "OVERDUE", label: "OVERDUE" },
    { value: "VOID", label: "VOID" },
  ];
  const RECURRING_OPTIONS = [
    { value: "RECURRING", label: "Recurring" },
    { value: "NON_RECURRING", label: "Không recurring" },
  ];

  const filterConfig: FilterPanelConfig =
    variant === "inventory"
      ? {
          search: true,
          custom: [
            {
              key: "itemType",
              label: "Loại item",
              placeholder: "Tất cả loại item",
              options: ITEM_TYPE_OPTIONS,
            },
          ],
        }
      : variant === "purchase"
        ? {
            search: true,
            period: true,
            custom: [
              {
                key: "supplier_id",
                label: "Nhà cung cấp",
                placeholder: "Tất cả nhà cung cấp",
                options: supplierOptions,
              },
            ],
          }
        : {
            search: true,
            channel: {
              label: "Chi nhánh",
              placeholder: "Tất cả chi nhánh",
              options: branchOptions,
            },
            status: {
              options: STATUS_OPTIONS,
              placeholder: "Tất cả trạng thái",
            },
            custom: [
              {
                key: "paymentStatus",
                label: "Thanh toán",
                placeholder: "Tất cả thanh toán",
                options: PAYMENT_STATUS_OPTIONS,
              },
              {
                key: "recurring",
                label: "Recurring",
                placeholder: "Tất cả recurring",
                options: RECURRING_OPTIONS,
              },
            ],
          };

  const activeFilterCount = [
    !!searchInput,
    !!dateFrom || !!dateTo || !!period,
    ...(variant === "inventory"
      ? [!!itemTypeFilter]
      : variant === "purchase"
        ? [!!supplierFilter]
        : [
            !!branchFilter,
            !!statusFilter,
            !!paymentStatusFilter,
            !!recurringFilter,
          ]),
  ].filter(Boolean).length;

  function resetAllFilters() {
    setSearchInput("");
    setSearch("");
    setBranchFilter("");
    setStatusFilter("");
    setPaymentStatusFilter("");
    setRecurringFilter("");
    setItemTypeFilter("");
    setSupplierFilter("");
    setPurchaseSort("");
    setPeriod("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  }

  function togglePurchaseSort(field: string) {
    setPurchaseSort((prev) => {
      if (prev === field) return `-${field}`;
      if (prev === `-${field}`) return "";
      return field;
    });
    setPage(1);
  }

  function renderPurchaseSortHeader(label: string, field: string) {
    const active = purchaseSort === field || purchaseSort === `-${field}`;
    const direction =
      purchaseSort === field
        ? "asc"
        : purchaseSort === `-${field}`
          ? "desc"
          : null;

    return (
      <button
        type="button"
        onClick={() => togglePurchaseSort(field)}
        className={cn(
          "inline-flex items-center gap-1 text-left font-medium hover:text-primary transition-colors",
          active && "text-primary",
        )}
      >
        <span>{label}</span>
        {direction === "asc" ? (
          <span className="text-[10px]">▲</span>
        ) : direction === "desc" ? (
          <span className="text-[10px]">▼</span>
        ) : (
          <ArrowUpDown className="h-3.5 w-3.5 opacity-60" />
        )}
      </button>
    );
  }

  const tableActions = (
    <TableActionGroup
      onRefresh={() => void listQuery.refetch()}
      loading={loading}
      onFilterToggle={() => setFilterPanelOpen((v) => !v)}
      activeFilterCount={activeFilterCount}
      onCreate={
        variant === "sales" || variant === "purchase" || variant === "expenses"
          ? () => {
              setEditingRow(null);
              setFormOpen(true);
            }
          : undefined
      }
    >
      {config.cta ? (
        <Button
          variant="secondary"
          size="sm"
          className="px-3 py-2"
          onClick={() => void createSample()}
          disabled={loading}
        >
          {config.cta}
        </Button>
      ) : undefined}
    </TableActionGroup>
  );

  const purchaseColumns = useMemo<DataTableColumn<OperationalDocument>[]>(
    () => [
      {
        key: "po_no",
        header: renderPurchaseSortHeader(t("Số PO"), "po_no"),
        className: "align-top min-w-[140px]",
        cell: (row) => {
          const rowKey = `${row.document_type || variant}-${row.id}`;
          const isExpanded = !!expandedRowIds[rowKey];
          return (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(rowKey);
              }}
              className="font-medium text-primary hover:underline focus:outline-none flex items-center gap-1.5 text-left text-sm"
            >
              <span className="font-semibold text-primary">
                {row.purchase_no || "—"}
              </span>
              {row.status === "DRAFT" && (
                <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800 border border-amber-200 whitespace-nowrap">
                  {t("Nháp")}
                </span>
              )}
              <ChevronRight
                className={cn(
                  "h-3.5 w-3.5 transition-transform text-[color:var(--muted-fg)]",
                  isExpanded && "rotate-90 text-primary",
                )}
              />
            </button>
          );
        },
      },
      {
        key: "supplier",
        header: renderPurchaseSortHeader("Nhà cung cấp", "supplier_id"),
        className: "align-top min-w-[200px]",
        cell: (row) => (
          <div className="space-y-0.5">
            <div>{row.supplier_name_snapshot || "—"}</div>
          </div>
        ),
      },
      {
        key: "order_date",
        header: renderPurchaseSortHeader("Ngày đặt", "order_date"),
        className: "align-top min-w-[150px]",
        cell: (row) => normalizeDateTime(row.document_date) || "—",
      },
      {
        key: "expected_date",
        header: renderPurchaseSortHeader("Ngày nhận DK", "expected_date"),
        className: "align-top min-w-[150px]",
        cell: (row) => normalizeDateTime(row.due_date) || "—",
      },
    ],

    [expandedRowIds, toggleExpand, t, variant, purchaseSort],
  );

  const columns = useMemo<DataTableColumn<OperationalDocument>[]>(() => {
    if (variant === "purchase") return purchaseColumns;

    const baseColumns: DataTableColumn<OperationalDocument>[] = [
      {
        key: "document",
        header: "Chứng từ",
        className: "align-top min-w-[180px]",
        cell: (row) => (
          <div className="space-y-1">
            <div className="font-medium text-sm">{docNo(row)}</div>
            <div className="text-xs text-[color:var(--muted-fg)]">
              {sourceLabel(row, variant)}
            </div>
          </div>
        ),
      },
      {
        key: "partner",
        header:
          variant === "receivables"
            ? "Khách hàng/Nội dung"
            : "Đối tác/Nội dung",
        className: "align-top min-w-[220px]",
        cell: (row) => (
          <div className="space-y-1">
            <div>{partner(row)}</div>
            {row.vehicle_plate ? (
              <div className="text-xs text-[color:var(--muted-fg)]">
                Xe: {row.vehicle_plate}
              </div>
            ) : null}
          </div>
        ),
      },
      {
        key: "dates",
        header: "Ngày",
        className: "align-top min-w-[140px]",
        cell: (row) => (
          <div className="space-y-1 text-sm">
            <div>CT: {normalizeDate(row.document_date) || "—"}</div>
            <div className="text-xs text-[color:var(--muted-fg)]">
              ĐH: {normalizeDate(row.due_date) || "—"}
            </div>
            {isRecurringDocument(row) ? (
              <div className="inline-flex items-center gap-1 rounded-full bg-[color:var(--muted)] px-2 py-0.5 text-xs text-[color:var(--muted-fg)]">
                <Repeat className="h-3 w-3" />
                Recurring
              </div>
            ) : null}
            {row.next_due_date ? (
              <div className="text-xs text-[color:var(--muted-fg)]">
                Kỳ sau: {normalizeDate(row.next_due_date)}
              </div>
            ) : null}
          </div>
        ),
      },
      {
        key: "amounts",
        header: "Số tiền",
        className: "align-top min-w-[180px]",
        cell: (row) => (
          <div className="space-y-1 text-sm">
            <div>Tổng: {money(row.total_amount)}</div>
            <div>Đã cấn: {money(row.settled_amount)}</div>
            <div className="font-medium">Còn mở: {money(row.open_amount)}</div>
          </div>
        ),
      },
      {
        key: "status",
        header: "Trạng thái",
        className: "align-top min-w-[170px]",
        cell: (row) => (
          <div className="flex flex-col gap-1">
            <StatusBadge status={row.status} />
            <StatusBadge status={row.payment_status} />
            {variant === "sales" && row.inventory_status ? (
              <div className="text-xs text-[color:var(--muted-fg)]">
                Kho: {inventoryStatusLabel(row.inventory_status)}
              </div>
            ) : null}
          </div>
        ),
      },
    ];

    return baseColumns;
  }, [variant, config.paymentLinkable, purchaseColumns]);

  const stockColumns = useMemo<DataTableColumn<InventoryStockRow>[]>(
    () => [
      {
        key: "item",
        header: "Vật tư",
        className: "align-middle min-w-[220px]",
        cell: (row) => {
          const expanded = !!expandedStockItemIds[row.inventory_item_id];
          return (
            <div className="space-y-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  void handleToggleInventoryExpand(row);
                }}
                className="font-medium text-foreground hover:underline focus:outline-none flex items-center gap-1.5 text-left text-sm"
              >
                <span>{row.item_code || "—"}</span>
                <ChevronRight
                  className={cn(
                    "h-3.5 w-3.5 transition-transform text-[color:var(--muted-fg)]",
                    expanded && "rotate-90",
                  )}
                />
              </button>
              <div className="text-xs text-[color:var(--muted-fg)]">
                {row.item_name || "Chưa đặt tên"}
              </div>
            </div>
          );
        },
      },
      {
        key: "item_type",
        header: "Loại",
        className: "align-middle min-w-[90px]",
        cell: (row) => {
          const t = row.item_type;
          let cls = "bg-slate-100 text-slate-600";
          if (t === "RAW") cls = "bg-blue-100 text-blue-700";
          else if (t === "FG") cls = "bg-emerald-100 text-emerald-700";
          else if (t === "WIP") cls = "bg-amber-100 text-amber-700";
          return (
            <span
              className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${cls}`}
            >
              {t || "—"}
            </span>
          );
        },
      },
      {
        key: "received_qty",
        header: "Nhập",
        className: "align-middle min-w-[100px] text-left",
        cell: (row) => (
          <span className="inline-block w-full text-left text-sm tabular-nums">
            {Number(row.received_qty || 0).toLocaleString("vi-VN")}
          </span>
        ),
      },
      {
        key: "issued_qty",
        header: "Xuất",
        className: "align-middle min-w-[100px] text-left",
        cell: (row) => (
          <span className="inline-block w-full text-left text-sm tabular-nums">
            {Number(row.issued_qty || 0).toLocaleString("vi-VN")}
          </span>
        ),
      },
      {
        key: "on_hand_qty",
        header: "Tồn",
        className: "align-middle min-w-[110px] text-left",
        cell: (row) => (
          <span className="inline-block w-full text-left text-sm font-medium tabular-nums">
            {Number(row.on_hand_qty || 0).toLocaleString("vi-VN")}
          </span>
        ),
      },
      {
        key: "unit",
        header: "Đơn vị",
        className: "align-middle min-w-[80px]",
        cell: (row) => <span className="text-sm">{row.unit || "—"}</span>,
      },
      {
        key: "last",
        header: "Giao dịch cuối",
        className: "align-middle min-w-[180px]",
        cell: (row) => normalizeDateTime(row.last_transaction_date) || "—",
      },
      {
        key: "status",
        header: "Trạng thái",
        className: "align-middle min-w-[100px]",
        cell: (row) => (
          <span
            className={
              row.status === "ACTIVE" || !row.status
                ? "inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200"
                : "inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground ring-1 ring-border"
            }
          >
            {row.status || "ACTIVE"}
          </span>
        ),
      },
    ],
    [expandedStockItemIds],
  );

  const expandedStockRowKeys = useMemo(
    () =>
      stockItems
        .filter((row) => expandedStockItemIds[row.inventory_item_id])
        .map((row) => `${row.inventory_item_id}-${row.branch_id || "all"}`),
    [expandedStockItemIds, stockItems],
  );

  if (variant === "inventory") {
    return (
      <PageLayout
        title={config.title}
        desc={config.desc}
        icon={<FileText className="h-4 w-4" />}
        actions={tableActions}
      >
        {error ? (
          <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}
        <div className="flex items-start">
          <div className="flex-1 min-w-0 space-y-4">
            <DataTable
              items={stockItems}
              columns={stockColumns}
              getRowKey={(row) =>
                `${row.inventory_item_id}-${row.branch_id || "all"}`
              }
              loading={loading}
              error={error}
              emptyLabel="Chưa có tồn kho."
              minWidth={760}
              actionsColumn={{
                header: "",
                className: "w-[48px]",
                cell: (row) => (
                  <ActionDropdown
                    items={[
                      {
                        label: t("Chi tiết"),
                        onClick: () => setViewingItemId(row.inventory_item_id),
                        icon: <FileText className="h-4 w-4" />,
                      },
                    ]}
                  />
                ),
              }}
              expandedRowKeys={expandedStockRowKeys}
              renderSubRow={(row) => (
                <InventoryTimelineBlock
                  itemId={row.inventory_item_id}
                  loadingId={movLoadingId}
                  error={movError}
                  data={movMap[row.inventory_item_id]}
                />
              )}
              page={page}
              pageSize={pageSize}
              total={total}
              totalPages={totalPages}
              onPage={setPage}
              onPageSize={(size) => {
                setPageSize(size);
                setPage(1);
              }}
            />
          </div>
          <FilterPanel
            config={filterConfig}
            filter={{
              state: {
                period: "",
                dateFrom: "",
                dateTo: "",
                channel: variant === "inventory" ? "" : branchFilter,
                search: searchInput,
                amountMin: "",
                amountMax: "",
                status: variant === "inventory" ? "" : statusFilter,
                counterpartySource: "",
                custom:
                  variant === "inventory"
                    ? { itemType: itemTypeFilter }
                    : variant === "purchase"
                      ? { supplier_id: supplierFilter }
                      : {
                          paymentStatus: paymentStatusFilter,
                          recurring: recurringFilter,
                        },
              },
              inputs: { search: searchInput, amountMin: "", amountMax: "" },
              panelOpen: filterPanelOpen,
              openPanel: () => setFilterPanelOpen(true),
              closePanel: () => setFilterPanelOpen(false),
              togglePanel: () => setFilterPanelOpen((v) => !v),
              setPeriod: () => {},
              setDateFrom: () => {},
              setDateTo: () => {},
              setChannel: (v: string) => {
                if (variant === "inventory") return;
                setBranchFilter(v);
                setPage(1);
              },
              setSearchInput: (v: string) => setSearchInput(v),
              setAmountMinInput: () => {},
              setAmountMaxInput: () => {},
              setStatus: (v: string) => {
                if (variant === "inventory") return;
                setStatusFilter(v);
                setPage(1);
              },
              setCounterpartySource: () => {},
              setCustom: (key: string, v: string) => {
                if (key === "itemType" && variant === "inventory") {
                  setItemTypeFilter(v);
                  setPage(1);
                }
                if (key === "supplier_id") {
                  setSupplierFilter(v);
                  setPage(1);
                }
                if (key === "paymentStatus") {
                  setPaymentStatusFilter(v);
                  setPage(1);
                }
                if (key === "recurring") {
                  setRecurringFilter(v);
                  setPage(1);
                }
              },
              resetAll: resetAllFilters,
              hasActiveFilter: activeFilterCount > 0,
              activeFilterCount,
            }}
          />
        </div>
        <InventoryItemFormDrawer
          open={!!viewingItemId}
          onClose={() => setViewingItemId(null)}
          itemId={viewingItemId}
          onSuccess={() => void listQuery.refetch()}
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={config.title}
      desc={config.desc}
      icon={<FileText className="h-4 w-4" />}
      actions={tableActions}
    >
      {error ? (
        <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="flex items-start">
        <div className="flex-1 min-w-0 space-y-4">
          <DataTable
            items={visibleItems}
            columns={columns}
            getRowKey={(row) => `${row.document_type || variant}-${row.id}`}
            loading={loading}
            error={error}
            emptyLabel="Chưa có dữ liệu."
            minWidth={980}
            actionsColumn={{
              cell: (row) => (
                <ActionDropdown
                  items={[
                    {
                      label: t("Chi tiết"),
                      icon: <Eye className="h-4 w-4" />,
                      onClick: () => void openDetail(row),
                    },
                    {
                      label: "Liên kết tiền",
                      icon: <Link2 className="h-4 w-4" />,
                      onClick: () => void openSettlement(row),
                      hidden:
                        !config.paymentLinkable ||
                        Number(row.open_amount || 0) <= 0,
                    },
                    {
                      label: "Nhập kho",
                      icon: <Warehouse className="h-4 w-4" />,
                      onClick: () => {
                        if (!postingLoading) void openPostingDrawer(row);
                      },
                      hidden: !canPostReceipt(row, variant),
                    },
                    {
                      label: "Xuất kho",
                      icon: <Warehouse className="h-4 w-4" />,
                      onClick: () => {
                        if (!postingLoading) void openPostingDrawer(row);
                      },
                      hidden: !canPostIssue(row, variant),
                    },
                  ]}
                />
              ),
            }}
            renderSubRow={
              variant === "purchase"
                ? (item) => <PurchaseSubRow rowId={item.id} />
                : undefined
            }
            expandedRowKeys={Object.keys(expandedRowIds).filter(
              (key) => expandedRowIds[key],
            )}
            page={page}
            pageSize={pageSize}
            total={total}
            totalPages={totalPages}
            onPage={setPage}
            onPageSize={(size) => {
              setPageSize(size);
              setPage(1);
            }}
          />
        </div>
        <FilterPanel
          config={filterConfig}
          filter={{
            state: {
              period,
              dateFrom,
              dateTo,
              channel: branchFilter,
              search: searchInput,
              amountMin: "",
              amountMax: "",
              status: statusFilter,
              counterpartySource: "",
              custom:
                variant === "purchase"
                  ? { supplier_id: supplierFilter }
                  : {
                      paymentStatus: paymentStatusFilter,
                      recurring: recurringFilter,
                    },
            },
            inputs: { search: searchInput, amountMin: "", amountMax: "" },
            panelOpen: filterPanelOpen,
            openPanel: () => setFilterPanelOpen(true),
            closePanel: () => setFilterPanelOpen(false),
            togglePanel: () => setFilterPanelOpen((v) => !v),
            setPeriod: (v) => {
              setPeriod(v);
              if (v) {
                setDateFrom(periodFirstDay(v));
                setDateTo(periodLastDay(v));
              }
              setPage(1);
            },
            setDateFrom: (v) => {
              const newVal =
                v && dateTo && dateTo < v ? monthFirstDay(dateTo) : v;
              setDateFrom(newVal);
              setPeriod("");
              setPage(1);
            },
            setDateTo: (v) => {
              setDateTo(v);
              if (v && dateFrom && v < dateFrom) setDateFrom(monthFirstDay(v));
              setPeriod("");
              setPage(1);
            },
            setChannel: (v: string) => {
              setBranchFilter(v);
              setPage(1);
            },
            setSearchInput: (v: string) => setSearchInput(v),
            setAmountMinInput: () => {},
            setAmountMaxInput: () => {},
            setStatus: (v: string) => {
              setStatusFilter(v);
              setPage(1);
            },
            setCounterpartySource: () => {},
            setCustom: (key: string, v: string) => {
              if (key === "supplier_id") {
                setSupplierFilter(v);
                setPage(1);
              }
              if (key === "paymentStatus") {
                setPaymentStatusFilter(v);
                setPage(1);
              }
              if (key === "recurring") {
                setRecurringFilter(v);
                setPage(1);
              }
            },
            resetAll: resetAllFilters,
            hasActiveFilter: activeFilterCount > 0,
            activeFilterCount,
          }}
        />
      </div>

      <DrawerModal
        open={activeStep === "detail"}
        onClose={closeDetail}
        title="Chi tiết chứng từ"
        subtitle={
          detailDocument
            ? `${docNo(detailDocument)} — ${partner(detailDocument)}`
            : "Chi tiết chứng từ operational"
        }
        bodyClassName="space-y-4"
      >
        {detailError ? (
          <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
            {detailError}
          </div>
        ) : null}
        {detailLoading ? (
          <div className="space-y-6">
            <DrawerSection title="Thông tin chính">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </DrawerSection>
            <DrawerSection title="Dòng chi tiết">
              <div className="space-y-3">
                <Skeleton className="h-[72px] w-full" />
                <Skeleton className="h-[72px] w-full" />
                <Skeleton className="h-[72px] w-full" />
              </div>
            </DrawerSection>
          </div>
        ) : detailDocument ? (
          <>
            <DrawerSection title="Thông tin chính">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <DrawerField label="Số chứng từ">
                  <div>{docNo(detailDocument)}</div>
                </DrawerField>
                <DrawerField label="Đối tác/Nội dung">
                  <div>{partner(detailDocument)}</div>
                </DrawerField>
                <DrawerField label="Ngày chứng từ">
                  <div>
                    {normalizeDate(detailDocument.document_date) || "—"}
                  </div>
                </DrawerField>
                <DrawerField label="Đến hạn/Kỳ sau">
                  <div>
                    {normalizeDate(detailDocument.due_date) || "—"}
                    {detailDocument.next_due_date
                      ? ` / ${normalizeDate(detailDocument.next_due_date)}`
                      : ""}
                  </div>
                </DrawerField>
                <DrawerField label="Trạng thái">
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge status={detailDocument.status} />
                    <StatusBadge status={detailDocument.payment_status} />
                  </div>
                </DrawerField>
                <DrawerField label="Kho">
                  <div>
                    {inventoryStatusLabel(detailDocument.inventory_status)}
                  </div>
                </DrawerField>
              </div>
            </DrawerSection>
            <DrawerSection title="Dòng chi tiết">
              {detailDocument.lines?.length ? (
                <div className="space-y-2">
                  {detailDocument.lines.map((line, index) => (
                    <div
                      key={
                        line.id ||
                        `${index}-${line.item_code || line.description || "line"}`
                      }
                      className="rounded-xl border border-border p-3 text-sm"
                    >
                      <div className="font-medium">
                        {line.item_name ||
                          line.description ||
                          `Dòng ${index + 1}`}
                      </div>
                      <div className="text-xs text-[color:var(--muted-fg)]">
                        {line.item_code || "—"} · SL{" "}
                        {Number(line.qty || 0).toLocaleString("vi-VN")} · Thành
                        tiền{" "}
                        {money(
                          line.amount ||
                            Number(line.qty || 0) *
                              Number(line.unit_price || 0),
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-[color:var(--muted-fg)]">
                  Chưa có dòng chi tiết.
                </div>
              )}
            </DrawerSection>
            {rootDocumentType === "purchase_orders" ? (
              <DrawerSection title="Lịch sử nhập kho">
                {poReceipts.length ? (
                  <div className="space-y-3">
                    {poReceipts.map((receipt) => (
                      <div
                        key={receipt.id}
                        className="rounded-xl border border-border p-3 text-sm"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="font-medium">{receipt.receiptNo}</div>
                          <div className="text-xs text-[color:var(--muted-fg)]">
                            {normalizeDate(receipt.receiptDate) || "—"} ·{" "}
                            {receipt.status || "—"}
                          </div>
                        </div>
                        {receipt.remarks ? (
                          <div className="mt-1 text-xs text-[color:var(--muted-fg)]">
                            {receipt.remarks}
                          </div>
                        ) : null}
                        <div className="mt-2 space-y-1">
                          {(receipt.lines || []).map((line, idx) => (
                            <div
                              key={line.id || `${receipt.id}-${idx}`}
                              className="text-xs text-[color:var(--muted-fg)]"
                            >
                              Dòng {line.lineNo || idx + 1}: nhận{" "}
                              {Number(line.qtyReceived || 0).toLocaleString(
                                "vi-VN",
                              )}{" "}
                              đơn vị
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-[color:var(--muted-fg)]">
                    Chưa có lần nhập kho nào cho PO này.
                  </div>
                )}
              </DrawerSection>
            ) : null}
          </>
        ) : null}
      </DrawerModal>

      <DrawerModal
        open={activeStep === "posting"}
        onClose={closePostingDrawer}
        title={
          postingDocumentType === "purchase_orders"
            ? "Nhập kho theo dòng"
            : "Xuất kho theo dòng"
        }
        subtitle={
          postingDocument
            ? `${docNo(postingDocument)} — ${partner(postingDocument)}`
            : "Chọn số lượng theo từng dòng chứng từ"
        }
        actions={[
          {
            label: postingLoading ? "Đang post..." : "Xác nhận post kho",
            primary: true,
            loading: postingLoading,
            onClick: () => void submitPostingDrawer(),
          },
        ]}
      >
        <DrawerSection title="Số lượng theo dòng">
          <div className="space-y-3">
            {postingLineForms.length === 0 ? (
              <div className="text-sm text-[color:var(--muted-fg)]">
                Chứng từ không có dòng vật tư/phụ tùng hợp lệ.
              </div>
            ) : (
              postingLineForms.map((line) => (
                <div
                  key={line.line_id}
                  className="rounded-xl border border-border p-3 space-y-2"
                >
                  <div className="text-sm font-medium">{line.line_name}</div>
                  <div className="text-xs text-[color:var(--muted-fg)]">
                    Tối đa có thể post:{" "}
                    {Number(line.max_qty || 0).toLocaleString("vi-VN")}
                  </div>
                  <input
                    type="number"
                    min={0}
                    max={line.max_qty}
                    step={1}
                    className={inputCls}
                    value={line.requested_qty}
                    onChange={(event) => {
                      const value = Number(event.target.value || 0);
                      setPostingState({
                        postingLineForms: postingLineForms.map((item) =>
                          item.line_id === line.line_id
                            ? {
                                ...item,
                                requested_qty: Math.max(
                                  0,
                                  Math.min(item.max_qty, value),
                                ),
                              }
                            : item,
                        ),
                      });
                    }}
                  />
                </div>
              ))
            )}
          </div>
          <DrawerField label="Ghi chú post kho">
            <input
              className={inputCls}
              value={postingNotes}
              onChange={(event) =>
                setPostingState({ postingNotes: event.target.value })
              }
              placeholder="Ghi chú nhập/xuất kho"
            />
          </DrawerField>
        </DrawerSection>
      </DrawerModal>

      <DrawerModal
        open={activeStep === "settlement"}
        onClose={closeSettlement}
        title="Liên kết phiếu dòng tiền"
        subtitle={
          rootDocument
            ? `${docNo(rootDocument)} — Còn mở ${money(rootDocument.open_amount)}`
            : "Liên kết thanh toán cho chứng từ operational"
        }
        actions={[
          {
            label: settlementLoading ? "Đang lưu..." : "Lưu liên kết",
            primary: true,
            loading: settlementLoading,
            onClick: () => void saveSettlement(),
          },
        ]}
      >
        <DrawerSection title="Thông tin cấn trừ">
          <DrawerField label="Phiếu dòng tiền" required>
            <Combobox
              options={voucherSelectOptions}
              value={settlementForm.payment_voucher_id}
              onChange={(value) => {
                const voucher = voucherOptions.find(
                  (item) => item.id === value,
                );
                setSettlementState({
                  settlementForm: {
                    ...settlementForm,
                    payment_voucher_id: value,
                    applied_amount: voucher
                      ? Math.min(
                          Number(rootDocument?.open_amount || 0),
                          Number(voucher.amount || 0),
                        )
                      : settlementForm.applied_amount,
                  },
                });
              }}
              placeholder={
                voucherLoading ? "Đang tải..." : "Chọn phiếu dòng tiền"
              }
              className="w-full"
            />
          </DrawerField>
          {selectedVoucher ? (
            <div className="rounded-lg bg-[color:var(--muted)] px-3 py-2 text-xs text-[color:var(--muted-fg)]">
              {selectedVoucher.voucher_no} — {money(selectedVoucher.amount)} —{" "}
              {selectedVoucher.status}
            </div>
          ) : null}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <DrawerField label="Ngày cấn trừ" required>
              <DatePicker
                value={settlementForm.applied_date}
                onChange={(value) =>
                  setSettlementState({
                    settlementForm: {
                      ...settlementForm,
                      applied_date: value,
                    },
                  })
                }
                className="w-full"
              />
            </DrawerField>
            <DrawerField label="Số tiền cấn trừ" required>
              <input
                type="number"
                min={0}
                step={1000}
                className={inputCls}
                value={settlementForm.applied_amount}
                onChange={(event) =>
                  setSettlementState({
                    settlementForm: {
                      ...settlementForm,
                      applied_amount: Number(event.target.value || 0),
                    },
                  })
                }
              />
            </DrawerField>
          </div>
          <DrawerField label="Ghi chú">
            <input
              className={inputCls}
              value={settlementForm.notes}
              onChange={(event) =>
                setSettlementState({
                  settlementForm: {
                    ...settlementForm,
                    notes: event.target.value,
                  },
                })
              }
              placeholder="Ghi chú cấn trừ"
            />
          </DrawerField>
        </DrawerSection>

        <DrawerSection title="Liên kết hiện có">
          {paymentLinks.length === 0 ? (
            <div className="text-sm text-[color:var(--muted-fg)]">
              Chưa có liên kết thanh toán.
            </div>
          ) : (
            <div className="space-y-2">
              {paymentLinks.map((link) => {
                const voucher = voucherOptions.find(
                  (item) => item.id === link.payment_voucher_id,
                );
                return (
                  <div
                    key={link.id}
                    className="flex flex-col gap-2 rounded-xl border border-border p-3 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="font-medium text-sm">
                        {voucher?.voucher_no || link.payment_voucher_id}
                      </div>
                      <div className="text-xs text-[color:var(--muted-fg)]">
                        {normalizeDate(link.applied_date) || "—"} —{" "}
                        {money(link.applied_amount)}
                      </div>
                      {link.notes ? (
                        <div className="text-xs text-[color:var(--muted-fg)]">
                          {link.notes}
                        </div>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => void removePaymentLink(link.id)}
                      disabled={settlementLoading}
                    >
                      Gỡ link
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </DrawerSection>

        {settlementError ? (
          <div className="mx-4 mb-2 rounded-lg bg-[#fde8e8] px-3 py-2 text-sm text-[#d92a2a]">
            {settlementError}
          </div>
        ) : null}
      </DrawerModal>

      {(variant === "sales" ||
        variant === "purchase" ||
        variant === "expenses") && (
        <OperationalFormDrawer
          variant={variant as "sales" | "purchase" | "expenses"}
          open={formOpen}
          loading={formLoading}
          editing={editingRow}
          viewOnly={viewOnly}
          poReceipts={poReceipts}
          onClose={() => {
            setFormOpen(false);
            setEditingRow(null);
            setViewOnly(false);
          }}
          onToggleEdit={() => setViewOnly(false)}
          onSaved={async () => {
            await queryClient.invalidateQueries({
              queryKey: ["operational-list", variant],
            });
            showToast({
              title: editingRow
                ? "Đã cập nhật chứng từ"
                : "Đã tạo chứng từ mới",
              variant: "success",
            });
            setFormOpen(false);
            setEditingRow(null);
          }}
        />
      )}
    </PageLayout>
  );
}

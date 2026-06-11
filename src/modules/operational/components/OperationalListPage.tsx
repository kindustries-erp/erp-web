import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  FileText,
  Link2,
  Pencil,
  Plus,
  RefreshCcw,
  Repeat,
  Warehouse,
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
import {
  purchaseOrdersCoreApi,
  type ErpPoReceipt,
} from "@/modules/purchase-orders-core/api/purchaseOrdersCoreApi";
import {
  inventoryCoreApi,
  type InventoryMovement,
  type InventoryMovementsPayload,
} from "@/modules/inventory-core/api/inventoryCoreApi";

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
    title: "Mua hàng nhập kho",
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
  const isLoading = loadingId === itemId;

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-muted/20 px-4 py-4 text-sm text-muted-foreground">
        Đang tải lịch sử xuất nhập kho...
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="rounded-xl border border-border bg-muted/10 p-3">
      {data.movements.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
          Chưa có phát sinh xuất nhập kho.
        </div>
      ) : (
        <div className="relative pl-6">
          <div className="absolute bottom-4 left-[7px] top-4 w-px bg-border" />
          <div className="space-y-2">
            {data.movements.map((m) => {
              const isIn = Number(m.qtyIn || 0) > 0;
              const qty = isIn ? m.qtyIn : m.qtyOut;
              return (
                <div key={m.id} className="relative">
                  <div
                    className={
                      isIn
                        ? "absolute left-[-22px] top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-emerald-200 bg-emerald-500"
                        : "absolute left-[-22px] top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-amber-200 bg-amber-500"
                    }
                  />
                  <div className="rounded-xl border border-border bg-background px-4 py-3">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,2.2fr)_180px_120px_140px_120px] md:items-center">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={
                              isIn
                                ? "inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200"
                                : "inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 ring-1 ring-amber-200"
                            }
                          >
                            {isIn ? "Nhập" : "Xuất"}
                          </span>
                          <span className="truncate text-sm font-medium text-foreground">
                            {movementLabel(m)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {normalizeDateTime(m.transactionDate)}
                          </span>
                          {m.notes ? (
                            <span className="truncate text-xs text-muted-foreground">
                              • {m.notes}
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <div className="rounded-lg bg-muted/20 px-3 py-2 text-xs md:bg-transparent md:px-0 md:py-0">
                        <div className="mb-0.5 text-muted-foreground md:hidden">
                          Thời gian ghi nhận
                        </div>
                        <div className="font-medium text-foreground">
                          {normalizeDateTime(m.createdAt)}
                        </div>
                      </div>

                      <div className="rounded-lg bg-muted/20 px-3 py-2 text-xs md:bg-transparent md:px-0 md:py-0">
                        <div className="mb-0.5 text-muted-foreground md:hidden">
                          Số lượng
                        </div>
                        <div
                          className={
                            isIn
                              ? "font-semibold text-emerald-700"
                              : "font-semibold text-amber-700"
                          }
                        >
                          {isIn ? "+" : "-"}
                          {fmtQty(qty)}
                        </div>
                      </div>

                      <div className="rounded-lg bg-muted/20 px-3 py-2 text-xs md:bg-transparent md:px-0 md:py-0">
                        <div className="mb-0.5 text-muted-foreground md:hidden">
                          Số dư sau mốc
                        </div>
                        <div className="font-semibold text-foreground">
                          {fmtQty(m.balanceAfter)}
                        </div>
                      </div>

                      <div className="rounded-lg bg-muted/20 px-3 py-2 text-xs md:bg-transparent md:px-0 md:py-0">
                        <div className="mb-0.5 text-muted-foreground md:hidden">
                          Đơn giá
                        </div>
                        <div className="font-medium text-foreground">
                          {m.unitCost == null ? "—" : fmtQty(m.unitCost)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
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
  const [receipts, setReceipts] = useState<ErpPoReceipt[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = useT();

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      try {
        const doc = await operationalApi.getDocument("purchase_orders", rowId);
        if (active) setDetail(doc);
        const po = await purchaseOrdersCoreApi.get(rowId);
        if (active) setReceipts(po.receipts || []);
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
      <div className="pl-4 py-2 text-xs text-[color:var(--muted-fg)] animate-pulse">
        {t("Đang tải chi tiết...")}
      </div>
    );
  if (error)
    return (
      <div className="pl-4 py-2 text-xs text-red-500 font-medium">
        ⚠️ {error}
      </div>
    );
  if (!detail) return null;

  return (
    <div className="flex flex-col md:flex-row gap-6 pl-4 border-l border-dashed border-[color:var(--border)]/40 ml-2.5 mt-1 mb-2">
      <div className="flex-1 space-y-1">
        <div className="text-xs font-semibold text-[color:var(--muted-fg)] mb-1 uppercase tracking-wider">
          {t("Chi tiết")}
        </div>
        {!detail.lines || detail.lines.length === 0 ? (
          <div className="text-xs text-[color:var(--muted-fg)] italic">
            {t("Không có dòng chi tiết.")}
          </div>
        ) : (
          <div className="space-y-1">
            {detail.lines.map((line, idx) => (
              <div
                key={line.id || idx}
                className="text-xs flex items-center justify-between py-1.5 hover:bg-[color:var(--muted)]/80 rounded px-2 transition-all duration-150 gap-4"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-4 h-4 flex items-center justify-center text-[color:var(--muted-fg)]/30 text-[10px] shrink-0">
                    •
                  </span>
                  <span className="font-medium text-[color:var(--foreground)]/90 truncate">
                    {line.item_name ||
                      line.description ||
                      `${t("Dòng")} ${idx + 1}`}
                    {line.item_code && (
                      <span className="text-[color:var(--muted-fg)] ml-1.5 font-normal">
                        ({line.item_code})
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0 text-[11px] text-[color:var(--muted-fg)]">
                  <span className="font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full min-w-[32px] text-center">
                    {Number(line.qty || 0).toLocaleString("vi-VN")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="w-full md:w-72 shrink-0 space-y-1">
        <div className="text-xs font-semibold text-[color:var(--muted-fg)] mb-1 uppercase tracking-wider">
          {t("Lịch sử nhập kho")}
        </div>
        {receipts.length === 0 ? (
          <div className="text-xs text-[color:var(--muted-fg)] italic px-2">
            {t("Chưa có lịch sử nhập.")}
          </div>
        ) : (
          <div className="space-y-2">
            {receipts.map((receipt) => (
              <div
                key={receipt.id}
                className="bg-surface border border-[color:var(--border)] rounded px-3 py-2 text-xs hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-medium">{receipt.receiptNo}</span>
                  <span className="text-[color:var(--muted-fg)]">
                    {receipt.receiptDate
                      ? receipt.receiptDate.slice(0, 10)
                      : "—"}{" "}
                    · {t(receipt.status || "—")}
                  </span>
                </div>
                {receipt.remarks && (
                  <div className="text-[color:var(--muted-fg)] mb-1.5">
                    {receipt.remarks}
                  </div>
                )}
                <div className="space-y-1 mt-1 border-t border-[color:var(--border)] pt-1.5">
                  {(receipt.lines || []).map((line, idx) => (
                    <div
                      key={line.id || idx}
                      className="flex justify-between text-[color:var(--muted-fg)]"
                    >
                      <span>
                        {t("Dòng")} {line.lineNo || idx + 1}
                      </span>
                      <span className="font-medium text-[color:var(--foreground)]/80">
                        {t("Nhận:")}{" "}
                        {Number(line.qtyReceived || 0).toLocaleString("vi-VN")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
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
  const config = variantConfig[variant];

  const [items, setItems] = useState<OperationalDocument[]>([]);
  const [stockItems, setStockItems] = useState<InventoryStockRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedStockItemId, setExpandedStockItemId] = useState<string | null>(
    null,
  );
  const [movLoadingId, setMovLoadingId] = useState<string | null>(null);
  const [movError, setMovError] = useState<string | null>(null);
  const [movMap, setMovMap] = useState<
    Record<string, InventoryMovementsPayload>
  >({});
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [branchFilter, setBranchFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [recurringFilter, setRecurringFilter] = useState("");
  const [branchOptions, setBranchOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [formOpen, setFormOpen] = useState(false);
  const [viewOnly, setViewOnly] = useState(false);
  const [expandedRowIds, setExpandedRowIds] = useState<Record<string, boolean>>(
    {},
  );
  const [editingRow, setEditingRow] = useState<OperationalDocument | null>(
    null,
  );
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [itemTypeFilter, setItemTypeFilter] = useState("");
  const [poReceipts, setPoReceipts] = useState<ErpPoReceipt[]>([]);

  function toggleExpand(id: string) {
    setExpandedRowIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }

  async function handleToggleInventoryExpand(row: InventoryStockRow) {
    if (expandedStockItemId === row.inventory_item_id) {
      setExpandedStockItemId(null);
      setMovError(null);
      return;
    }
    setExpandedStockItemId(row.inventory_item_id);
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

  const loader = useMemo(() => {
    if (variant === "sales") return operationalApi.listSales;
    if (variant === "purchase") return operationalApi.listPurchases;
    if (variant === "expenses") return operationalApi.listExpenses;
    if (variant === "receivables") return operationalApi.listReceivables;
    if (variant === "payables") return operationalApi.listPayables;
    if (variant === "inventory") return operationalApi.listInventoryStock;
    return null;
  }, [variant]);

  async function load() {
    if (!loader) return;
    setLoading(true);
    setError(null);
    try {
      const data = await loader({
        page,
        pageSize,
        search: search || undefined,
        branch_id: branchFilter || undefined,
        payment_status: paymentStatusFilter || undefined,
        status: statusFilter || undefined,
        ...(variant === "inventory" && itemTypeFilter
          ? { item_type: itemTypeFilter }
          : {}),
      } as any);
      if (variant === "inventory") {
        setStockItems((data.items || []) as InventoryStockRow[]);
        setItems([]);
      } else {
        setItems((data.items || []) as OperationalDocument[]);
        setStockItems([]);
      }
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 0);
    } catch (err) {
      setError(extractApiError(err, "Không tải được dữ liệu"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [
    loader,
    page,
    pageSize,
    search,
    branchFilter,
    paymentStatusFilter,
    statusFilter,
    itemTypeFilter,
  ]);

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
      await load();
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
      await load();
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
      setLoading(true);
      setError(null);
      try {
        const document = await operationalApi.getDocument(documentType, row.id);
        const po = await purchaseOrdersCoreApi.get(row.id);
        setPoReceipts(po.receipts || []);
        setEditingRow(document);
        setViewOnly(true);
        setFormOpen(true);
      } catch (err) {
        setError(extractApiError(err, t("Không tải được chi tiết chứng từ")));
      } finally {
        setLoading(false);
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
      await load();
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
      await load();
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

  const filters =
    variant === "inventory" ? (
      <>
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setPage(1);
              setSearch(searchInput.trim());
            }
          }}
          placeholder="Tìm mã / tên vật tư"
          className="inline-flex h-9 rounded-lg border border-border bg-surface px-3 text-xs min-w-[220px] focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <div className="w-[180px]">
          <Combobox
            value={itemTypeFilter}
            onChange={(value) => {
              setPage(1);
              setItemTypeFilter(value);
            }}
            placeholder="Tất cả loại"
            options={ITEM_TYPE_OPTIONS}
          />
        </div>
        <button
          className="btn-secondary inline-flex items-center gap-2"
          onClick={() => void load()}
          disabled={loading}
        >
          <RefreshCcw className="h-4 w-4" />
          Tải lại
        </button>
      </>
    ) : (
      <>
        <button
          className="btn-secondary inline-flex items-center gap-2"
          onClick={() => void load()}
          disabled={loading}
        >
          <RefreshCcw className="h-4 w-4" />
          Tải lại
        </button>
      </>
    );

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

  const filterConfig: FilterPanelConfig = {
    search: true,
    channel: {
      label: "Chi nhánh",
      placeholder: "Tất cả chi nhánh",
      options: branchOptions,
    },
    status: { options: STATUS_OPTIONS, placeholder: "Tất cả trạng thái" },
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
    !!branchFilter,
    !!statusFilter,
    !!paymentStatusFilter,
    !!recurringFilter,
  ].filter(Boolean).length;

  function resetAllFilters() {
    setSearchInput("");
    setSearch("");
    setBranchFilter("");
    setStatusFilter("");
    setPaymentStatusFilter("");
    setRecurringFilter("");
    setPage(1);
  }

  const purchaseColumns = useMemo<DataTableColumn<OperationalDocument>[]>(
    () => [
      {
        key: "po_no",
        header: t("Số PO"),
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
        header: "Nhà cung cấp",
        className: "align-top min-w-[200px]",
        cell: (row) => (
          <div className="space-y-0.5">
            <div>{row.supplier_name_snapshot || "—"}</div>
          </div>
        ),
      },
      {
        key: "order_date",
        header: "Ngày đặt",
        className: "align-top min-w-[150px]",
        cell: (row) => normalizeDateTime(row.document_date) || "—",
      },
      {
        key: "expected_date",
        header: "Ngày nhận DK",
        className: "align-top min-w-[150px]",
        cell: (row) => normalizeDateTime(row.due_date) || "—",
      },
      {
        key: "po_status",
        header: "Trạng thái",
        className: "align-top min-w-[140px]",
        cell: (row) => (
          <div className="flex flex-col gap-1">
            <StatusBadge status={row.status} />
            <StatusBadge status={row.payment_status} />
            {row.inventory_status ? (
              <div className="text-xs text-[color:var(--muted-fg)]">
                Kho: {inventoryStatusLabel(row.inventory_status)}
              </div>
            ) : null}
          </div>
        ),
      },
      {
        key: "receipt_status",
        header: "Tình trạng nhập",
        className: "align-top min-w-[140px]",
        cell: (row) => {
          const status = row.inventory_status;
          let label = "—";
          let cls = "text-[color:var(--muted-fg)]";
          if (status === "NOT_RECEIVED") {
            label = "Chưa nhập kho";
            cls = "text-orange-600";
          } else if (status === "PARTIAL") {
            label = "Nhập một phần";
            cls = "text-yellow-600";
          } else if (status === "FULLY_RECEIVED") {
            label = "Đã nhập đủ";
            cls = "text-green-600 font-medium";
          }
          return <span className={`text-xs ${cls}`}>{label}</span>;
        },
      },
    ],
    [],
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
        key: "expand",
        header: "",
        className: "align-top w-[44px]",
        cell: (row) => {
          const expanded = expandedStockItemId === row.inventory_item_id;
          return (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                void handleToggleInventoryExpand(row);
              }}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background hover:bg-muted"
              title={expanded ? "Thu gọn" : "Xem lịch sử"}
            >
              {expanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          );
        },
      },
      {
        key: "item",
        header: "Vật tư",
        className: "align-top min-w-[220px]",
        cell: (row) => (
          <div className="space-y-1">
            <div className="font-medium text-sm">{row.item_code || "—"}</div>
            <div className="text-xs text-[color:var(--muted-fg)]">
              {row.item_name || "Chưa đặt tên"}
            </div>
          </div>
        ),
      },
      {
        key: "item_type",
        header: "Loại",
        className: "align-top min-w-[90px]",
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
        className: "align-top min-w-[100px] text-right",
        cell: (row) => (
          <span className="text-sm tabular-nums">
            {Number(row.received_qty || 0).toLocaleString("vi-VN")}
          </span>
        ),
      },
      {
        key: "issued_qty",
        header: "Xuất",
        className: "align-top min-w-[100px] text-right",
        cell: (row) => (
          <span className="text-sm tabular-nums">
            {Number(row.issued_qty || 0).toLocaleString("vi-VN")}
          </span>
        ),
      },
      {
        key: "on_hand_qty",
        header: "Tồn",
        className: "align-top min-w-[110px] text-right",
        cell: (row) => (
          <span className="text-sm font-medium tabular-nums">
            {Number(row.on_hand_qty || 0).toLocaleString("vi-VN")}{" "}
            <span className="font-normal text-xs text-[color:var(--muted-fg)]">
              {row.unit}
            </span>
          </span>
        ),
      },
      {
        key: "last",
        header: "Giao dịch cuối",
        className: "align-top min-w-[140px]",
        cell: (row) => normalizeDate(row.last_transaction_date) || "—",
      },
    ],
    [expandedStockItemId],
  );

  const expandedStockRowKeys = useMemo(
    () =>
      expandedStockItemId
        ? stockItems
            .filter((row) => row.inventory_item_id === expandedStockItemId)
            .map((row) => `${row.inventory_item_id}-${row.branch_id || "all"}`)
        : [],
    [expandedStockItemId, stockItems],
  );

  if (variant === "inventory") {
    return (
      <PageLayout
        title={config.title}
        desc={config.desc}
        icon={<FileText className="h-4 w-4" />}
        actions={
          <FilterButton
            onClick={() => setFilterPanelOpen((v) => !v)}
            activeCount={activeFilterCount}
          />
        }
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
              filters={filters}
              minWidth={760}
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
                channel: branchFilter,
                search: searchInput,
                amountMin: "",
                amountMax: "",
                status: statusFilter,
                counterpartySource: "",
                custom: {
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
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={config.title}
      desc={config.desc}
      icon={<FileText className="h-4 w-4" />}
      actions={
        <div className="flex items-center gap-2">
          <FilterButton
            onClick={() => setFilterPanelOpen((v) => !v)}
            activeCount={activeFilterCount}
          />
          {(variant === "sales" ||
            variant === "purchase" ||
            variant === "expenses") && (
            <BtnPrimary
              onClick={() => {
                setEditingRow(null);
                setFormOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Tạo mới
            </BtnPrimary>
          )}
          {config.cta ? (
            <button
              className="btn-secondary inline-flex items-center gap-2"
              onClick={() => void createSample()}
              disabled={loading}
            >
              {config.cta}
            </button>
          ) : undefined}
        </div>
      }
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
            filters={filters}
            minWidth={980}
            actionsColumn={{
              cell: (row) => (
                <ActionDropdown
                  items={[
                    {
                      label: t("Chi tiết"),
                      icon: <FileText className="h-4 w-4" />,
                      onClick: () => void openDetail(row),
                      hidden: variant === "purchase",
                    },
                    {
                      label: "Sửa",
                      onClick: async () => {
                        const documentType = resolveDocumentType(row, variant);
                        if (!documentType) return;
                        try {
                          const detail = await operationalApi.getDocument(
                            documentType,
                            row.id,
                          );
                          setEditingRow(detail);
                          setFormOpen(true);
                        } catch (err) {
                          setError(
                            extractApiError(
                              err,
                              "Không tải được dữ liệu chỉnh sửa",
                            ),
                          );
                        }
                      },
                      icon: <Pencil className="h-4 w-4" />,
                      hidden: !["sales", "purchase", "expenses"].includes(
                        variant,
                      ),
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
              period: "",
              dateFrom: "",
              dateTo: "",
              channel: branchFilter,
              search: searchInput,
              amountMin: "",
              amountMax: "",
              status: statusFilter,
              counterpartySource: "",
              custom: {
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
            : "Xem chi tiết chứng từ operational"
        }
        bodyClassName="space-y-4"
      >
        {detailError ? (
          <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
            {detailError}
          </div>
        ) : null}
        {detailLoading ? (
          <div className="text-sm text-[color:var(--muted-fg)]">
            Đang tải chi tiết...
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
          editing={editingRow}
          viewOnly={viewOnly}
          poReceipts={poReceipts}
          onClose={() => {
            setFormOpen(false);
            setEditingRow(null);
            setViewOnly(false);
          }}
          onSaved={async () => {
            await load();
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

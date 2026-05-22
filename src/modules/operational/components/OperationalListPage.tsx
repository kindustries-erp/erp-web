import { useEffect, useMemo, useState } from "react";
import { FileText, Link2, RefreshCcw, Repeat, Warehouse } from "lucide-react";
import { useUIStore } from "@/core/config/uiStore";
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
import { PageHeader } from "@/shared/components/PageHeader";
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
    cta: "Tạo đơn mua mẫu",
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
    title: "Kho",
    desc: "Nhập kho từ đơn mua, xuất kho vào đơn sửa xe; tồn theo chi nhánh.",
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

function today() {
  return normalizeDate(new Date().toISOString());
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
    row.status === "CONFIRMED" &&
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
  if (variant === "purchase") {
    return {
      supplier_name_snapshot: "Nhà cung cấp mẫu",
      status: "CONFIRMED",
      invoice_status: "NO_INVOICE",
      recurrence_type: "ONE_TIME",
      total_amount: 2500000,
      lines: [{ item_name: "Phụ tùng mẫu", qty: 2, unit_price: 1250000 }],
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

export function OperationalListPage({
  variant,
}: {
  variant: OperationalVariant;
}) {
  const t = useT();
  const showToast = useUIStore((s) => s.showToast);
  const config = variantConfig[variant];

  const [items, setItems] = useState<OperationalDocument[]>([]);
  const [stockItems, setStockItems] = useState<InventoryStockRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
      });
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
    setPostingState({ postingLoading: true });
    setError(null);
    try {
      const document = await operationalApi.getDocument(documentType, row.id);
      const lineForms = (document.lines || [])
        .filter((line) => line.inventory_item_id && Number(line.qty || 0) > 0)
        .map((line) => ({
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
        .filter((line) => line.line_id);
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

  const filters = (
    <>
      <input
        className="input min-w-[220px] flex-1"
        placeholder="Tìm số chứng từ, đối tác, ghi chú..."
        value={searchInput}
        onChange={(event) => setSearchInput(event.target.value)}
      />
      <Combobox
        options={[{ value: "", label: "Tất cả chi nhánh" }, ...branchOptions]}
        value={branchFilter}
        onChange={(value) => {
          setBranchFilter(value);
          setPage(1);
        }}
        className="w-[220px]"
        allowClear={false}
      />
      <Combobox
        options={[
          { value: "", label: "Tất cả thanh toán" },
          { value: "UNPAID", label: "UNPAID" },
          { value: "PARTIALLY_PAID", label: "PARTIALLY_PAID" },
          { value: "PAID", label: "PAID" },
          { value: "OVERDUE", label: "OVERDUE" },
          { value: "VOID", label: "VOID" },
        ]}
        value={paymentStatusFilter}
        onChange={(value) => {
          setPaymentStatusFilter(value);
          setPage(1);
        }}
        className="w-[210px]"
        allowClear={false}
      />
      <Combobox
        options={[
          { value: "", label: "Tất cả trạng thái" },
          { value: "DRAFT", label: "DRAFT" },
          { value: "CONFIRMED", label: "CONFIRMED" },
          { value: "IN_PROGRESS", label: "IN_PROGRESS" },
          { value: "COMPLETED", label: "COMPLETED" },
          { value: "RECEIVED", label: "RECEIVED" },
          { value: "CANCELLED", label: "CANCELLED" },
        ]}
        value={statusFilter}
        onChange={(value) => {
          setStatusFilter(value);
          setPage(1);
        }}
        className="w-[210px]"
        allowClear={false}
      />
      <Combobox
        options={[
          { value: "", label: "Tất cả recurring" },
          { value: "RECURRING", label: "Recurring" },
          { value: "NON_RECURRING", label: "Không recurring" },
        ]}
        value={recurringFilter}
        onChange={(value) => {
          setRecurringFilter(value);
          setPage(1);
        }}
        className="w-[210px]"
        allowClear={false}
      />
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

  const columns = useMemo<DataTableColumn<OperationalDocument>[]>(() => {
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
            {(variant === "purchase" || variant === "sales") &&
            row.inventory_status ? (
              <div className="text-xs text-[color:var(--muted-fg)]">
                Kho: {inventoryStatusLabel(row.inventory_status)}
              </div>
            ) : null}
          </div>
        ),
      },
    ];

    return baseColumns;
  }, [variant, config.paymentLinkable]);

  const stockColumns = useMemo<DataTableColumn<InventoryStockRow>[]>(
    () => [
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
        key: "qty",
        header: "Số lượng",
        className: "align-top min-w-[180px]",
        cell: (row) => (
          <div className="space-y-1 text-sm">
            <div>
              Nhập: {Number(row.received_qty || 0).toLocaleString("vi-VN")}
            </div>
            <div>
              Xuất: {Number(row.issued_qty || 0).toLocaleString("vi-VN")}
            </div>
            <div className="font-medium">
              Tồn: {Number(row.on_hand_qty || 0).toLocaleString("vi-VN")}{" "}
              {row.unit}
            </div>
          </div>
        ),
      },
      {
        key: "value",
        header: "Giá trị tồn",
        className: "align-top min-w-[160px]",
        cell: (row) => money(row.stock_value),
      },
      {
        key: "last",
        header: "Giao dịch cuối",
        className: "align-top min-w-[150px]",
        cell: (row) => normalizeDate(row.last_transaction_date) || "—",
      },
    ],
    [],
  );

  if (variant === "inventory") {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <PageHeader
          title={config.title}
          desc={config.desc}
          icon={<FileText className="h-4 w-4" />}
        />
        {error ? (
          <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}
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
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <PageHeader
        title={config.title}
        desc={config.desc}
        icon={<FileText className="h-4 w-4" />}
        actions={
          config.cta ? (
            <BtnPrimary onClick={() => void createSample()} disabled={loading}>
              {config.cta}
            </BtnPrimary>
          ) : undefined
        }
      />

      {error ? (
        <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

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
                  label: "Chi tiết",
                  icon: <FileText className="h-4 w-4" />,
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
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { FileText, Link2, RefreshCcw } from "lucide-react";
import { useUIStore } from "@/core/config/uiStore";
import { useT } from "@/core/i18n";
import { getBranchesApi } from "@/modules/branches/api/branchApi";
import {
  getPaymentVouchersPagedApi,
  type PaymentVoucher,
} from "@/modules/finance/api/financeApi";
import { BtnPrimary } from "@/shared/components/BtnPrimary";
import { Combobox } from "@/shared/components/Combobox";
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
  operationalApi,
  type CreateOperationalPayload,
  InventoryStockRow,
  OperationalDocument,
  OperationalDocumentPaymentLink,
  OperationalDocumentType,
  OperationalVariant,
} from "../api/operationalApi";

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

interface SettlementFormState {
  payment_voucher_id: string;
  applied_date: string;
  applied_amount: number;
  notes: string;
}

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
  const [branchOptions, setBranchOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);

  const [settlementOpen, setSettlementOpen] = useState(false);
  const [settlementLoading, setSettlementLoading] = useState(false);
  const [settlementError, setSettlementError] = useState<string | null>(null);
  const [activeDocument, setActiveDocument] =
    useState<OperationalDocument | null>(null);
  const [activeDocumentType, setActiveDocumentType] =
    useState<OperationalDocumentType | null>(null);
  const [paymentLinks, setPaymentLinks] = useState<
    OperationalDocumentPaymentLink[]
  >([]);
  const [voucherOptions, setVoucherOptions] = useState<PaymentVoucher[]>([]);
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [settlementForm, setSettlementForm] = useState<SettlementFormState>({
    payment_voucher_id: "",
    applied_date: today(),
    applied_amount: 0,
    notes: "",
  });

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
    setSettlementOpen(true);
    setSettlementError(null);
    setActiveDocument(row);
    setActiveDocumentType(documentType);
    setSettlementForm({
      payment_voucher_id: "",
      applied_date: today(),
      applied_amount: Number(row.open_amount || 0),
      notes: "",
    });
    setVoucherLoading(true);
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
      setPaymentLinks(links);
      setVoucherOptions(vouchers.items ?? []);
    } catch (err) {
      setSettlementError(
        extractApiError(err, "Không tải được dữ liệu cấn trừ"),
      );
      setPaymentLinks([]);
      setVoucherOptions([]);
    } finally {
      setVoucherLoading(false);
    }
  }

  function closeSettlement() {
    setSettlementOpen(false);
    setSettlementError(null);
    setActiveDocument(null);
    setActiveDocumentType(null);
    setPaymentLinks([]);
    setVoucherOptions([]);
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
    if (!activeDocument || !activeDocumentType) return;
    const [document, links] = await Promise.all([
      operationalApi.getDocument(activeDocumentType, activeDocument.id),
      operationalApi.listPaymentLinks(activeDocumentType, activeDocument.id),
    ]);
    setActiveDocument(document);
    setPaymentLinks(links);
  }

  async function saveSettlement() {
    if (!activeDocument || !activeDocumentType) return;
    if (!settlementForm.payment_voucher_id) {
      setSettlementError("Vui lòng chọn phiếu dòng tiền.");
      return;
    }
    if (settlementForm.applied_amount <= 0) {
      setSettlementError("Số tiền cấn trừ phải lớn hơn 0.");
      return;
    }
    setSettlementLoading(true);
    setSettlementError(null);
    try {
      await operationalApi.createPaymentLink({
        document_type: activeDocumentType,
        document_id: activeDocument.id,
        payment_voucher_id: settlementForm.payment_voucher_id,
        applied_amount: settlementForm.applied_amount,
        applied_date: settlementForm.applied_date,
        notes: settlementForm.notes || undefined,
      });
      await refreshSettlementData();
      await load();
      showToast({ title: "Đã liên kết phiếu dòng tiền", variant: "success" });
      setSettlementForm((prev) => ({
        ...prev,
        payment_voucher_id: "",
        notes: "",
      }));
    } catch (err) {
      setSettlementError(extractApiError(err, "Liên kết thanh toán thất bại"));
    } finally {
      setSettlementLoading(false);
    }
  }

  async function removePaymentLink(linkId: string) {
    if (!activeDocument || !activeDocumentType) return;
    setSettlementLoading(true);
    setSettlementError(null);
    try {
      await operationalApi.deletePaymentLink(
        activeDocumentType,
        activeDocument.id,
        linkId,
      );
      await refreshSettlementData();
      await load();
      showToast({ title: "Đã gỡ liên kết thanh toán", variant: "success" });
    } catch (err) {
      setSettlementError(
        extractApiError(err, "Không gỡ được liên kết thanh toán"),
      );
    } finally {
      setSettlementLoading(false);
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
          </div>
        ),
      },
    ];

    if (config.paymentLinkable) {
      baseColumns.push({
        key: "actions",
        header: "Thao tác",
        className: "align-top min-w-[140px]",
        cell: (row) => (
          <button
            type="button"
            className="btn-secondary inline-flex items-center gap-2"
            onClick={() => void openSettlement(row)}
            disabled={Number(row.open_amount || 0) <= 0}
          >
            <Link2 className="h-4 w-4" />
            Liên kết tiền
          </button>
        ),
      });
    }

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
        items={items}
        columns={columns}
        getRowKey={(row) => `${row.document_type || variant}-${row.id}`}
        loading={loading}
        error={error}
        emptyLabel="Chưa có dữ liệu."
        filters={filters}
        minWidth={980}
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
        open={settlementOpen}
        onClose={closeSettlement}
        title="Liên kết phiếu dòng tiền"
        subtitle={
          activeDocument
            ? `${docNo(activeDocument)} — Còn mở ${money(activeDocument.open_amount)}`
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
                setSettlementForm((prev) => ({
                  ...prev,
                  payment_voucher_id: value,
                  applied_amount: voucher
                    ? Math.min(
                        Number(activeDocument?.open_amount || 0),
                        Number(voucher.amount || 0),
                      )
                    : prev.applied_amount,
                }));
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
                  setSettlementForm((prev) => ({
                    ...prev,
                    applied_date: value,
                  }))
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
                  setSettlementForm((prev) => ({
                    ...prev,
                    applied_amount: Number(event.target.value || 0),
                  }))
                }
              />
            </DrawerField>
          </div>
          <DrawerField label="Ghi chú">
            <input
              className={inputCls}
              value={settlementForm.notes}
              onChange={(event) =>
                setSettlementForm((prev) => ({
                  ...prev,
                  notes: event.target.value,
                }))
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

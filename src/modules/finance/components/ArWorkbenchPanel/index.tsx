import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, FilePlus2, Loader2, Receipt } from "lucide-react";
import { BtnPrimary } from "@/shared/components/BtnPrimary";
import { DrawerField, DrawerModal, DrawerSection, inputCls } from "@/shared/components/DrawerModal";
import { SearchInput } from "@/shared/components/SearchInput";
import { TablePagination } from "@/shared/components/TablePagination";
import { cn } from "@/shared/utils";
import { extractApiError } from "@/shared/utils/apiError";
import { todayIsoDate } from "@/modules/finance/utils/financeHelpers";
import {
  applyAdvanceToInvoiceApi,
  createArSalesInvoiceApi,
  createCustomerAdvanceApi,
  createPaymentReceiptApi,
  getAdvanceApplicationsApi,
  getArCoverageApi,
  getArDocumentsApi,
  getArSummaryApi,
  getCustomerAdvancesApi,
  getPaymentVouchersApi,
  postArDocumentApi,
  postArPaymentVoucherApi,
  postCustomerAdvanceApi,
  reverseArDocumentApi,
  reverseAdvanceApplicationApi,
  reverseCustomerAdvanceApi,
  reversePaymentVoucherApi,
  type AdvanceApplication,
  type ArCoverageItem,
  type ArDocument,
  type ArDocumentStatus,
  type ArDocumentType,
  type ArSummary,
  type CreateArSalesInvoiceDto,
  type CreateCustomerAdvanceDto,
  type CreatePaymentReceiptDto,
  type ApplyAdvanceToInvoiceDto,
  type PaymentMethod,
  type PaymentVoucher,
  type VoucherStatus,
} from "@/modules/finance/api/financeApi";

const DOC_TYPES: { value: ArDocumentType; label: string }[] = [
  { value: "INVOICE", label: "Invoice công nợ" },
  { value: "IMMEDIATE_SALE", label: "Bán thu tiền ngay" },
  { value: "ADVANCE", label: "Đặt cọc/credit" },
  { value: "CREDIT_NOTE", label: "Credit note" },
  { value: "SALES_RETURN", label: "Hàng trả lại" },
  { value: "SUSPENSE", label: "Tiền treo" },
  { value: "COD", label: "COD" },
  { value: "GATEWAY", label: "Payment gateway" },
  { value: "RETENTION", label: "Retention" },
  { value: "CONTRACT_MILESTONE", label: "Milestone" },
  { value: "WRITE_OFF", label: "Write-off" },
  { value: "REFUND", label: "Refund" },
];

const STATUS_LABELS: Record<ArDocumentStatus, string> = {
  DRAFT: "Nháp",
  POSTED: "Đã ghi nhận",
  PARTIAL: "Một phần",
  SETTLED: "Tất toán",
  DISPUTED: "Tranh chấp",
  REVERSED: "Đảo bút toán",
  CANCELLED: "Đã hủy",
};

function money(v?: number | string | null) {
  return Number(v ?? 0).toLocaleString("vi-VN");
}

function statusCls(status: ArDocumentStatus) {
  if (status === "SETTLED") return "bg-approve-bg text-approve-fg";
  if (status === "PARTIAL" || status === "POSTED") return "bg-[#e8f0fd] text-[#2a6dd9]";
  if (status === "DISPUTED") return "bg-warn-bg text-warn-fg";
  return "bg-[color:var(--muted)] text-[color:var(--muted-fg)]";
}

function emptySalesInvoiceForm(): CreateArSalesInvoiceDto {
  const today = todayIsoDate();
  return {
    document_no: `AR-${today.split("-").join("")}-`,
    business_partner_id: "",
    document_date: today,
    posting_date: today,
    due_date: "",
    currency: "VND",
    exchange_rate: 1,
    reference_no: "",
    description: "",
    lines: [
      {
        line_no: 1,
        description: "",
        quantity: 1,
        unit_price: 0,
        tax_rate: 10,
      },
    ],
  };
}

export function ArWorkbenchPanel() {
  const [activeTab, setActiveTab] = useState<"invoices" | "receipts" | "advances" | "advanceApplications">("invoices");
  const [summary, setSummary] = useState<ArSummary | null>(null);
  const [coverage, setCoverage] = useState<ArCoverageItem[]>([]);
  const [docs, setDocs] = useState<ArDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<ArDocumentType | "">("");
  const [statusFilter, setStatusFilter] = useState<ArDocumentStatus | "">("");
  const [openOnly, setOpenOnly] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState<CreateArSalesInvoiceDto>(() => emptySalesInvoiceForm());
  const [saving, setSaving] = useState(false);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const params = useMemo(
    () => ({
      page,
      pageSize,
      search: search || undefined,
      document_type: typeFilter || undefined,
      status: statusFilter || undefined,
      open_only: openOnly || undefined,
      sort: ["-posting_date"],
    }),
    [openOnly, page, pageSize, search, statusFilter, typeFilter],
  );

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    Promise.all([getArDocumentsApi(params), getArSummaryApi(params), getArCoverageApi()])
      .then(([list, sum, cov]) => {
        setDocs(list.items);
        setTotal(list.total);
        setTotalPages(list.totalPages);
        setSummary(sum);
        setCoverage(cov.items);
      })
      .catch((e) => setError(extractApiError(e, "Không tải được AR Workbench")))
      .finally(() => setLoading(false));
  }, [params]);

  useEffect(() => {
    load();
  }, [load]);

  const saveDocument = () => {
    setSaving(true);
    setSaveError(null);
    createArSalesInvoiceApi({
      ...form,
      business_partner_id: form.business_partner_id.trim(),
      due_date: form.due_date || undefined,
      reference_no: form.reference_no || undefined,
      lines: form.lines.map((line, index) => ({ ...line, line_no: index + 1 })),
    })
      .then(() => {
        setDrawerOpen(false);
        setForm(emptySalesInvoiceForm());
        load();
      })
      .catch((err) => setSaveError(extractApiError(err, "Không tạo được sales invoice")))
      .finally(() => setSaving(false));
  };

  const updateLine = (index: number, patch: Partial<CreateArSalesInvoiceDto["lines"][number]>) => {
    setForm((current) => ({
      ...current,
      lines: current.lines.map((line, lineIndex) => (lineIndex === index ? { ...line, ...patch } : line)),
    }));
  };

  const addLine = () => {
    setForm((current) => ({
      ...current,
      lines: [
        ...current.lines,
        { line_no: current.lines.length + 1, description: "", quantity: 1, unit_price: 0, tax_rate: 10 },
      ],
    }));
  };

  const removeLine = (index: number) => {
    setForm((current) => ({
      ...current,
      lines: current.lines.length === 1 ? current.lines : current.lines.filter((_, lineIndex) => lineIndex !== index),
    }));
  };

  const runDocumentAction = (doc: ArDocument, action: "post" | "reverse") => {
    setActioningId(doc.id);
    setError(null);
    const request = action === "post"
      ? postArDocumentApi(doc.id)
      : reverseArDocumentApi(doc.id, { reason: `Reverse from AR Workbench ${todayIsoDate()}` });
    request
      .then(load)
      .catch((err) => setError(extractApiError(err, action === "post" ? "Không post được hóa đơn" : "Không reverse được hóa đơn")))
      .finally(() => setActioningId(null));
  };

  const supported = coverage.filter((c) => c.status !== "phase1_foundation").length;
  const foundation = coverage.length - supported;

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-4 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-fg)]">AR Workbench mới</p>
            <h2 className="text-lg font-semibold text-[color:var(--fg)]">Phải thu production-grade</h2>
            <p className="mt-1 max-w-3xl text-sm text-[color:var(--muted-fg)]">
              Chạy song song với sổ công nợ cũ; thêm document semantics cho invoice, advance, allocation, suspense, credit note, COD, gateway, FX và collection workflow.
            </p>
          </div>
          <BtnPrimary onClick={() => setDrawerOpen(true)}>
            <FilePlus2 className="h-4 w-4" /> Tạo sales invoice
          </BtnPrimary>
        </div>

        {/* Tab navigation */}
        <div className="mt-3 flex gap-1 border-b border-[color:var(--border)]">
          <button
            onClick={() => setActiveTab("invoices")}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors",
              activeTab === "invoices"
                ? "border-b-2 border-[color:var(--primary)] text-[color:var(--primary)]"
                : "text-[color:var(--muted-fg)] hover:text-[color:var(--fg)]",
            )}
          >
            <FilePlus2 className="h-3.5 w-3.5" /> Hóa đơn / Công nợ
          </button>
          <button
            onClick={() => setActiveTab("receipts")}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors",
              activeTab === "receipts"
                ? "border-b-2 border-[color:var(--primary)] text-[color:var(--primary)]"
                : "text-[color:var(--muted-fg)] hover:text-[color:var(--fg)]",
            )}
          >
            <Receipt className="h-3.5 w-3.5" /> Phiếu thu
          </button>
          <button
            onClick={() => setActiveTab("advances")}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors",
              activeTab === "advances"
                ? "border-b-2 border-[color:var(--primary)] text-[color:var(--primary)]"
                : "text-[color:var(--muted-fg)] hover:text-[color:var(--fg)]",
            )}
          >
            <Receipt className="h-3.5 w-3.5" /> Đặt cọc
          </button>
          <button
            onClick={() => setActiveTab("advanceApplications")}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors",
              activeTab === "advanceApplications"
                ? "border-b-2 border-[color:var(--primary)] text-[color:var(--primary)]"
                : "text-[color:var(--muted-fg)] hover:text-[color:var(--fg)]",
            )}
          >
            <CheckCircle2 className="h-3.5 w-3.5" /> Cấn trừ cọc
          </button>
        </div>
      </div>

      {activeTab === "receipts" && (
        <PaymentReceiptsTab />
      )}

      {activeTab === "advances" && (
        <CustomerAdvancesTab />
      )}

      {activeTab === "advanceApplications" && (
        <AdvanceApplicationsTab />
      )}

      {activeTab === "invoices" && (<>
      <div className="grid gap-3 md:grid-cols-4">
        <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] p-4">
          <p className="text-xs text-[color:var(--muted-fg)]">Open amount</p>
          <p className="text-xl font-semibold">{money(summary?.totals.open_amount)} VND</p>
        </div>
        <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] p-4">
          <p className="text-xs text-[color:var(--muted-fg)]">Overdue</p>
          <p className="text-xl font-semibold text-warn-fg">{money(summary?.totals.overdue_amount)} VND</p>
        </div>
        <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] p-4">
          <p className="text-xs text-[color:var(--muted-fg)]">Documents</p>
          <p className="text-xl font-semibold">{summary?.totals.count ?? 0}</p>
        </div>
        <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] p-4">
          <p className="text-xs text-[color:var(--muted-fg)]">Use case coverage</p>
          <p className="text-xl font-semibold">{supported}/{coverage.length || 40}</p>
          <p className="text-xs text-[color:var(--muted-fg)]">{foundation} use case cần hardening phase sau</p>
        </div>
      </div>

      <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] p-4">
        <div className="flex flex-wrap items-center gap-2">
          <SearchInput value={search} onChange={(value) => { setPage(1); setSearch(value); }} placeholder="Tìm document / reference" />
          <select className={cn(inputCls, "h-10 w-52")} value={typeFilter} onChange={(e) => { setPage(1); setTypeFilter(e.target.value as ArDocumentType | ""); }}>
            <option value="">Tất cả loại</option>
            {DOC_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <select className={cn(inputCls, "h-10 w-44")} value={statusFilter} onChange={(e) => { setPage(1); setStatusFilter(e.target.value as ArDocumentStatus | ""); }}>
            <option value="">Tất cả trạng thái</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <label className="inline-flex items-center gap-2 rounded-lg border border-[color:var(--border)] px-3 py-2 text-sm">
            <input type="checkbox" checked={openOnly} onChange={(e) => { setPage(1); setOpenOnly(e.target.checked); }} />
            Chỉ còn phải thu
          </label>
          {loading ? <Loader2 className="h-4 w-4 animate-spin text-[color:var(--muted-fg)]" /> : null}
        </div>
        {error ? <div className="mt-3 rounded-lg bg-warn-bg p-3 text-sm text-warn-fg"><AlertTriangle className="mr-2 inline h-4 w-4" />{error}</div> : null}

        <div className="mt-4 overflow-x-auto rounded-xl border border-[color:var(--border)]">
          <table className="min-w-full text-sm">
            <thead className="bg-[color:var(--muted)] text-left text-xs uppercase tracking-wide text-[color:var(--muted-fg)]">
              <tr>
                <th className="px-3 py-2">Số chứng từ</th>
                <th className="px-3 py-2">Loại</th>
                <th className="px-3 py-2">Ngày</th>
                <th className="px-3 py-2 text-right">Tổng</th>
                <th className="px-3 py-2 text-right">Còn phải thu</th>
                <th className="px-3 py-2">Trạng thái</th>
                <th className="px-3 py-2 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {docs.length === 0 && !loading ? (
                <tr><td colSpan={7} className="px-3 py-8 text-center text-[color:var(--muted-fg)]">Chưa có AR document. Flow cũ vẫn ở tab Sổ công nợ.</td></tr>
              ) : docs.map((doc) => (
                <tr key={doc.id} className="border-t border-[color:var(--border)]">
                  <td className="px-3 py-2 font-medium">{doc.document_no}<div className="text-xs text-[color:var(--muted-fg)]">{doc.reference_no || doc.description}</div></td>
                  <td className="px-3 py-2">{doc.document_type}</td>
                  <td className="px-3 py-2">{doc.posting_date}</td>
                  <td className="px-3 py-2 text-right">{money(doc.total_amount)}</td>
                  <td className="px-3 py-2 text-right font-semibold">{money(doc.open_amount)}</td>
                  <td className="px-3 py-2"><span className={cn("rounded-full px-2 py-1 text-xs", statusCls(doc.status))}>{STATUS_LABELS[doc.status]}</span></td>
                  <td className="px-3 py-2 text-right">
                    {doc.status === "DRAFT" && doc.document_type === "INVOICE" && (
                      <button
                        disabled={actioningId === doc.id}
                        onClick={() => runDocumentAction(doc, "post")}
                        className="rounded-md bg-[#2a6dd9] px-2.5 py-1 text-xs text-white hover:bg-[#1e5ab8] disabled:opacity-50"
                      >
                        {actioningId === doc.id ? "..." : "Ghi sổ"}
                      </button>
                    )}
                    {doc.status === "POSTED" && Number(doc.settled_amount ?? 0) === 0 && (
                      <button
                        disabled={actioningId === doc.id}
                        onClick={() => runDocumentAction(doc, "reverse")}
                        className="rounded-md border border-[color:var(--border)] px-2.5 py-1 text-xs hover:bg-[color:var(--muted)] disabled:opacity-50"
                      >
                        {actioningId === doc.id ? "..." : "Đảo bút toán"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <TablePagination page={page} pageSize={pageSize} total={total} totalPages={totalPages} onPage={setPage} onPageSize={(v: number) => { setPageSize(v); setPage(1); }} />
      </div>

      <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] p-4">
        <div className="mb-3 flex items-center gap-2 font-semibold"><CheckCircle2 className="h-4 w-4 text-approve-fg" /> Đối chiếu 40 use case</div>
        <div className="grid gap-2 md:grid-cols-2">
          {coverage.slice(0, 12).map((item) => (
            <div key={item.id} className="rounded-lg border border-[color:var(--border)] p-3 text-sm">
              <div className="font-medium">#{item.id} {item.use_case}</div>
              <div className="mt-1 text-xs text-[color:var(--muted-fg)]">{item.route}</div>
            </div>
          ))}
        </div>
      </div>

      <DrawerModal
        open={drawerOpen}
        title="Tạo sales invoice"
        onClose={() => setDrawerOpen(false)}
        actions={[
          { label: "Hủy", onClick: () => setDrawerOpen(false) },
          { label: saving ? "Đang lưu..." : "Lưu nháp", onClick: saveDocument, primary: true, loading: saving },
        ]}
      >
        <div className="space-y-4">
          <DrawerSection title="Thông tin chính">
            <DrawerField label="Số chứng từ"><input className={inputCls} value={form.document_no} onChange={(e) => setForm({ ...form, document_no: e.target.value })} required /></DrawerField>
            <DrawerField label="Mã khách hàng (UUID)"><input className={inputCls} value={form.business_partner_id} onChange={(e) => setForm({ ...form, business_partner_id: e.target.value })} required placeholder="UUID khách hàng trong hệ thống" /></DrawerField>
            <DrawerField label="Ngày chứng từ"><input className={inputCls} type="date" value={form.document_date} onChange={(e) => setForm({ ...form, document_date: e.target.value })} required /></DrawerField>
            <DrawerField label="Ngày hạch toán"><input className={inputCls} type="date" value={form.posting_date} onChange={(e) => setForm({ ...form, posting_date: e.target.value })} required /></DrawerField>
            <DrawerField label="Ngày đến hạn"><input className={inputCls} type="date" value={form.due_date || ""} onChange={(e) => setForm({ ...form, due_date: e.target.value })} /></DrawerField>
            <DrawerField label="Tiền tệ"><input className={inputCls} value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} placeholder="VND" /></DrawerField>
            <DrawerField label="Tỷ giá"><input className={inputCls} type="number" min="1" value={form.exchange_rate} onChange={(e) => setForm({ ...form, exchange_rate: Number(e.target.value) })} /></DrawerField>
            <DrawerField label="Số tham chiếu"><input className={inputCls} value={form.reference_no || ""} onChange={(e) => setForm({ ...form, reference_no: e.target.value })} placeholder="Số hợp đồng / PO / hoá đơn VAT" /></DrawerField>
            <DrawerField label="Diễn giải"><textarea className={inputCls} value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></DrawerField>
          </DrawerSection>

          <DrawerSection title="Dòng hàng hóa / dịch vụ">
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead className="text-left text-[color:var(--muted-fg)]">
                  <tr>
                    <th className="pb-1 pr-2">Diễn giải</th>
                    <th className="pb-1 pr-2 text-right w-16">SL</th>
                    <th className="pb-1 pr-2 text-right w-28">Đơn giá</th>
                    <th className="pb-1 pr-2 text-right w-16">VAT %</th>
                    <th className="pb-1 text-right w-24">Thành tiền</th>
                    <th className="pb-1 w-8" />
                  </tr>
                </thead>
                <tbody>
                  {form.lines.map((line, i) => (
                    <tr key={i} className="border-t border-[color:var(--border)]">
                      <td className="py-1 pr-2"><input className={inputCls} value={line.description} onChange={(e) => updateLine(i, { description: e.target.value })} /></td>
                      <td className="py-1 pr-2"><input className={cn(inputCls, "text-right")} type="number" min="0" value={line.quantity} onChange={(e) => updateLine(i, { quantity: Number(e.target.value) })} /></td>
                      <td className="py-1 pr-2"><input className={cn(inputCls, "text-right")} type="number" min="0" value={line.unit_price} onChange={(e) => updateLine(i, { unit_price: Number(e.target.value) })} /></td>
                      <td className="py-1 pr-2"><input className={cn(inputCls, "text-right")} type="number" min="0" max="100" value={line.tax_rate} onChange={(e) => updateLine(i, { tax_rate: Number(e.target.value) })} /></td>
                      <td className="py-1 text-right font-semibold">{money(line.quantity * line.unit_price * (1 + (line.tax_rate ?? 0) / 100))}</td>
                      <td className="py-1 pl-2"><button onClick={() => removeLine(i)} className="text-[color:var(--muted-fg)] hover:text-red-500">✕</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button onClick={addLine} className="mt-2 rounded-md border border-dashed border-[color:var(--border)] px-3 py-1.5 text-xs text-[color:var(--muted-fg)] hover:border-[color:var(--primary)] hover:text-[color:var(--primary)]">
              + Thêm dòng
            </button>
            <div className="mt-2 text-right text-sm font-semibold">
              Tổng: {money(form.lines.reduce((acc, l) => acc + l.quantity * l.unit_price * (1 + (l.tax_rate ?? 0) / 100), 0))}
            </div>
          </DrawerSection>

          {saveError ? <div className="rounded-lg bg-warn-bg p-3 text-sm text-warn-fg">{saveError}</div> : null}
        </div>
      </DrawerModal>
    </>)}
    </section>
  );
}

// ─── PaymentReceiptsTab ────────────────────────────────────────────────────────

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "CASH", label: "Tiền mặt (111)" },
  { value: "BANK", label: "Ngân hàng (112)" },
  { value: "EWALLET", label: "Ví điện tử (113)" },
];

const VOUCHER_STATUS_LABELS: Record<VoucherStatus, string> = {
  DRAFT: "Nháp",
  PENDING_APPROVAL: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  POSTED: "Đã ghi nhận",
  REJECTED: "Bị từ chối",
  CANCELLED: "Đã hủy",
};

function emptyReceiptForm(): CreatePaymentReceiptDto {
  const today = todayIsoDate();
  return {
    payment_method: "BANK",
    document_date: today,
    posting_date: today,
    counterparty_id: "",
    counterparty_name_snapshot: "",
    amount: 0,
    currency: "VND",
    description: "",
  };
}

function PaymentReceiptsTab() {
  const [vouchers, setVouchers] = useState<PaymentVoucher[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState<CreatePaymentReceiptDto>(() => emptyReceiptForm());
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    getPaymentVouchersApi({ page, pageSize })
      .then((res) => {
        setVouchers(res.items);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      })
      .catch((e) => setError(extractApiError(e, "Không tải được phiếu thu")))
      .finally(() => setLoading(false));
  }, [page, pageSize]);

  useEffect(() => { load(); }, [load]);

  const saveReceipt = () => {
    setSaving(true);
    setSaveError(null);
    createPaymentReceiptApi({
      ...form,
      counterparty_id: form.counterparty_id.trim(),
    })
      .then(() => { setDrawerOpen(false); setForm(emptyReceiptForm()); load(); })
      .catch((err) => setSaveError(extractApiError(err, "Không tạo được phiếu thu")))
      .finally(() => setSaving(false));
  };

  const runVoucherAction = (v: PaymentVoucher, action: "post" | "reverse") => {
    setActioningId(v.id);
    setError(null);
    const req = action === "post"
      ? postArPaymentVoucherApi(v.id)
      : reversePaymentVoucherApi(v.id, { reason: `Reverse ${todayIsoDate()}` });
    req.then(load)
      .catch((e) => setError(extractApiError(e, action === "post" ? "Không post được phiếu thu" : "Không reverse được phiếu thu")))
      .finally(() => setActioningId(null));
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[color:var(--muted-fg)]">Tổng phiếu thu: <span className="font-semibold text-[color:var(--fg)]">{total}</span></p>
        </div>
        <BtnPrimary onClick={() => setDrawerOpen(true)}>
          <Receipt className="h-4 w-4" /> Tạo phiếu thu
        </BtnPrimary>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-error-bg p-3 text-sm text-error-fg">
          <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--card)]">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-[color:var(--muted-fg)]">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Đang tải...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-[color:var(--border)] bg-[color:var(--muted)] text-left text-xs uppercase tracking-wider text-[color:var(--muted-fg)]">
                <tr>
                  <th className="px-3 py-2">Số phiếu</th>
                  <th className="px-3 py-2">Ngày</th>
                  <th className="px-3 py-2">Đối tác</th>
                  <th className="px-3 py-2">PT thanh toán</th>
                  <th className="px-3 py-2 text-right">Số tiền</th>
                  <th className="px-3 py-2">Trạng thái</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {vouchers.length === 0 ? (
                  <tr><td colSpan={7} className="py-8 text-center text-[color:var(--muted-fg)]">Chưa có phiếu thu nào</td></tr>
                ) : vouchers.map((v) => (
                  <tr key={v.id} className="border-b border-[color:var(--border)] transition-colors hover:bg-[color:var(--muted)]/40">
                    <td className="px-3 py-2 font-mono text-xs">{v.voucher_no ?? v.id.slice(0, 8)}</td>
                    <td className="px-3 py-2">{v.document_date}</td>
                    <td className="px-3 py-2">{v.counterparty_name_snapshot ?? v.counterparty_id ?? "—"}</td>
                    <td className="px-3 py-2">{v.voucher_type}</td>
                    <td className="px-3 py-2 text-right font-semibold">{Number(v.amount).toLocaleString("vi-VN")}</td>
                    <td className="px-3 py-2">
                      <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium",
                        v.status === "POSTED" ? "bg-approve-bg text-approve-fg"
                          : v.status === "CANCELLED" ? "bg-error-bg text-error-fg"
                          : "bg-[color:var(--muted)] text-[color:var(--muted-fg)]",
                      )}>
                        {VOUCHER_STATUS_LABELS[v.status]}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        {v.status === "DRAFT" && (
                          <button
                            disabled={actioningId === v.id}
                            onClick={() => runVoucherAction(v, "post")}
                            className="flex items-center gap-1 rounded bg-approve-bg px-2 py-0.5 text-xs font-medium text-approve-fg hover:opacity-80 disabled:opacity-50"
                          >
                            {actioningId === v.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
                            Post
                          </button>
                        )}
                        {v.status === "POSTED" && (
                          <button
                            disabled={actioningId === v.id}
                            onClick={() => runVoucherAction(v, "reverse")}
                            className="flex items-center gap-1 rounded bg-error-bg px-2 py-0.5 text-xs font-medium text-error-fg hover:opacity-80 disabled:opacity-50"
                          >
                            {actioningId === v.id ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                            Reverse
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <TablePagination page={page} totalPages={totalPages} pageSize={pageSize} total={total} onPage={setPage} onPageSize={() => {}} />

      <DrawerModal
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Tạo phiếu thu"
        actions={[{ label: "Tạo phiếu thu", onClick: saveReceipt, primary: true, loading: saving }]}
      >
        <div className="space-y-6">
          <DrawerSection title="Thông tin phiếu thu">
            <DrawerField label="Phương thức thanh toán *">
              <select
                className={cn(inputCls, "h-10 w-full")}
                value={form.payment_method}
                onChange={(e) => setForm((f) => ({ ...f, payment_method: e.target.value as PaymentMethod }))}
              >
                {PAYMENT_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </DrawerField>
            <DrawerField label="ID Đối tác *">
              <input
                className={inputCls}
                value={form.counterparty_id}
                onChange={(e) => setForm((f) => ({ ...f, counterparty_id: e.target.value }))}
                placeholder="UUID của business partner"
              />
            </DrawerField>
            <DrawerField label="Tên đối tác">
              <input
                className={inputCls}
                value={form.counterparty_name_snapshot ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, counterparty_name_snapshot: e.target.value }))}
                placeholder="Tên hiển thị"
              />
            </DrawerField>
            <DrawerField label="Ngày chứng từ *">
              <input type="date" className={inputCls} value={form.document_date} onChange={(e) => setForm((f) => ({ ...f, document_date: e.target.value }))} />
            </DrawerField>
            <DrawerField label="Ngày ghi nhận">
              <input type="date" className={inputCls} value={form.posting_date ?? ""} onChange={(e) => setForm((f) => ({ ...f, posting_date: e.target.value }))} />
            </DrawerField>
            <DrawerField label="Số tiền *">
              <input
                type="number"
                min={0}
                className={cn(inputCls, "text-right")}
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: Number(e.target.value) }))}
              />
            </DrawerField>
            <DrawerField label="Diễn giải">
              <input
                className={inputCls}
                value={form.description ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Nội dung thu tiền"
              />
            </DrawerField>
          </DrawerSection>

          {saveError && <div className="rounded-lg bg-warn-bg p-3 text-sm text-warn-fg">{saveError}</div>}
        </div>
      </DrawerModal>
    </section>
  );
}

// ─── AdvanceApplicationsTab / UC#4 ─────────────────────────────────────────────

function emptyApplyAdvanceForm(): ApplyAdvanceToInvoiceDto {
  return {
    advance_voucher_id: "",
    ar_document_id: "",
    amount: 0,
    application_date: todayIsoDate(),
    reason: "Cấn trừ tiền cọc vào invoice",
  };
}

function AdvanceApplicationsTab() {
  const [advances, setAdvances] = useState<PaymentVoucher[]>([]);
  const [invoices, setInvoices] = useState<ArDocument[]>([]);
  const [applications, setApplications] = useState<AdvanceApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<ApplyAdvanceToInvoiceDto>(() => emptyApplyAdvanceForm());
  const [saving, setSaving] = useState(false);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const selectedAdvance = advances.find((item) => item.id === form.advance_voucher_id);
  const selectedInvoice = invoices.find((item) => item.id === form.ar_document_id);
  const maxApply = Math.min(
    Number(selectedAdvance?.ar_advance_remaining_amount ?? 0),
    Number(selectedInvoice?.open_amount ?? 0),
  );

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      getCustomerAdvancesApi({ page: 1, pageSize: 100, status: "POSTED" }),
      getArDocumentsApi({ page: 1, pageSize: 100, document_type: "INVOICE", open_only: true, sort: ["-posting_date"] }),
      getAdvanceApplicationsApi({ page: 1, pageSize: 50 }),
    ])
      .then(([advanceRes, invoiceRes, appRes]) => {
        setAdvances(advanceRes.items.filter((item) => Number(item.ar_advance_remaining_amount ?? 0) > 0));
        setInvoices(invoiceRes.items.filter((item) => Number(item.open_amount ?? 0) > 0));
        setApplications(appRes.items);
      })
      .catch((e) => setError(extractApiError(e, "Không tải được dữ liệu cấn trừ cọc")))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (maxApply > 0 && (!form.amount || form.amount > maxApply)) {
      setForm((current) => ({ ...current, amount: maxApply }));
    }
  }, [form.amount, maxApply]);

  const applyAdvance = () => {
    if (!form.advance_voucher_id || !form.ar_document_id || form.amount <= 0) {
      setError("Chọn phiếu cọc, invoice và số tiền cấn trừ hợp lệ");
      return;
    }
    setSaving(true);
    setError(null);
    applyAdvanceToInvoiceApi({
      ...form,
      amount: Number(form.amount),
      reason: form.reason?.trim() || undefined,
    })
      .then(() => { setForm(emptyApplyAdvanceForm()); load(); })
      .catch((e) => setError(extractApiError(e, "Không cấn trừ được tiền cọc")))
      .finally(() => setSaving(false));
  };

  const reverseApplication = (app: AdvanceApplication) => {
    setActioningId(app.id);
    setError(null);
    reverseAdvanceApplicationApi(app.id, { reason: `Hủy cấn trừ cọc ${todayIsoDate()}` })
      .then(load)
      .catch((e) => setError(extractApiError(e, "Không hủy được cấn trừ cọc")))
      .finally(() => setActioningId(null));
  };

  return (
    <section className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] p-4">
          <p className="text-xs text-[color:var(--muted-fg)]">Advance khả dụng</p>
          <p className="text-xl font-semibold">{advances.length}</p>
        </div>
        <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] p-4">
          <p className="text-xs text-[color:var(--muted-fg)]">Invoice còn công nợ</p>
          <p className="text-xl font-semibold">{invoices.length}</p>
        </div>
        <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] p-4">
          <p className="text-xs text-[color:var(--muted-fg)]">Hạch toán</p>
          <p className="text-sm font-semibold">N131 advance / C131 invoice</p>
          <p className="text-xs text-[color:var(--muted-fg)]">Không tạo revenue/VAT mới; chỉ giảm open amount.</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-error-bg p-3 text-sm text-error-fg">
          <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Use case #4 — Cấn trừ tiền cọc</h3>
            <p className="text-sm text-[color:var(--muted-fg)]">Chọn phiếu cọc POSTED còn số dư và invoice còn open amount.</p>
          </div>
          {loading ? <Loader2 className="h-4 w-4 animate-spin text-[color:var(--muted-fg)]" /> : null}
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <DrawerField label="Phiếu đặt cọc *">
            <select
              className={cn(inputCls, "h-10 w-full")}
              value={form.advance_voucher_id}
              onChange={(e) => setForm((current) => ({ ...current, advance_voucher_id: e.target.value }))}
            >
              <option value="">Chọn advance voucher</option>
              {advances.map((advance) => (
                <option key={advance.id} value={advance.id}>
                  {advance.voucher_no ?? advance.id.slice(0, 8)} — còn {money(advance.ar_advance_remaining_amount)}
                </option>
              ))}
            </select>
          </DrawerField>
          <DrawerField label="Invoice/công nợ *">
            <select
              className={cn(inputCls, "h-10 w-full")}
              value={form.ar_document_id}
              onChange={(e) => setForm((current) => ({ ...current, ar_document_id: e.target.value }))}
            >
              <option value="">Chọn invoice</option>
              {invoices.map((invoice) => (
                <option key={invoice.id} value={invoice.id}>
                  {invoice.document_no} — còn {money(invoice.open_amount)}
                </option>
              ))}
            </select>
          </DrawerField>
          <DrawerField label="Ngày cấn trừ *">
            <input
              type="date"
              className={inputCls}
              value={form.application_date}
              onChange={(e) => setForm((current) => ({ ...current, application_date: e.target.value }))}
            />
          </DrawerField>
          <DrawerField label={`Số tiền cấn trừ *${maxApply > 0 ? ` (tối đa ${money(maxApply)})` : ""}`}>
            <input
              type="number"
              min={0}
              max={maxApply || undefined}
              className={cn(inputCls, "text-right")}
              value={form.amount}
              onChange={(e) => setForm((current) => ({ ...current, amount: Number(e.target.value) }))}
            />
          </DrawerField>
          <div className="md:col-span-2">
            <DrawerField label="Lý do / diễn giải">
              <input
                className={inputCls}
                value={form.reason ?? ""}
                onChange={(e) => setForm((current) => ({ ...current, reason: e.target.value }))}
                placeholder="Cấn trừ tiền cọc vào invoice"
              />
            </DrawerField>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <BtnPrimary onClick={applyAdvance} disabled={saving || maxApply <= 0}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Cấn trừ cọc
          </BtnPrimary>
        </div>
      </div>

      <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--card)]">
        <div className="border-b border-[color:var(--border)] p-3 text-sm font-semibold">Lịch sử cấn trừ gần nhất</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-[color:var(--border)] bg-[color:var(--muted)] text-left text-xs uppercase tracking-wider text-[color:var(--muted-fg)]">
              <tr>
                <th className="px-3 py-2">Số cấn trừ</th>
                <th className="px-3 py-2">Ngày</th>
                <th className="px-3 py-2 text-right">Số tiền</th>
                <th className="px-3 py-2">Trạng thái</th>
                <th className="px-3 py-2">Diễn giải</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {applications.length === 0 ? (
                <tr><td colSpan={6} className="py-8 text-center text-[color:var(--muted-fg)]">Chưa có bản ghi cấn trừ cọc</td></tr>
              ) : applications.map((app) => (
                <tr key={app.id} className="border-b border-[color:var(--border)]">
                  <td className="px-3 py-2 font-mono text-xs">{app.application_no}</td>
                  <td className="px-3 py-2">{app.application_date}</td>
                  <td className="px-3 py-2 text-right font-semibold">{money(app.amount)}</td>
                  <td className="px-3 py-2">{app.status}</td>
                  <td className="px-3 py-2 text-[color:var(--muted-fg)]">{app.reason ?? "—"}</td>
                  <td className="px-3 py-2 text-right">
                    {app.status === "POSTED" && Number(app.amount) > 0 ? (
                      <button
                        disabled={actioningId === app.id}
                        onClick={() => reverseApplication(app)}
                        className="rounded bg-error-bg px-2 py-0.5 text-xs font-medium text-error-fg hover:opacity-80 disabled:opacity-50"
                      >
                        {actioningId === app.id ? "Đang hủy..." : "Reverse"}
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

// ─── CustomerAdvancesTab ───────────────────────────────────────────────────────

function emptyAdvanceForm(): CreateCustomerAdvanceDto {
  const today = todayIsoDate();
  return {
    payment_method: "BANK",
    document_date: today,
    posting_date: today,
    counterparty_id: "",
    counterparty_name_snapshot: "",
    amount: 0,
    currency: "VND",
    description: "Khách đặt cọc trước — chưa ghi nhận doanh thu/VAT",
  };
}

function CustomerAdvancesTab() {
  const [advances, setAdvances] = useState<PaymentVoucher[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState<CreateCustomerAdvanceDto>(() => emptyAdvanceForm());
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    getCustomerAdvancesApi({ page, pageSize })
      .then((res) => {
        setAdvances(res.items);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      })
      .catch((e) => setError(extractApiError(e, "Không tải được danh sách đặt cọc")))
      .finally(() => setLoading(false));
  }, [page, pageSize]);

  useEffect(() => { load(); }, [load]);

  const saveAdvance = () => {
    setSaving(true);
    setSaveError(null);
    createCustomerAdvanceApi({
      ...form,
      counterparty_id: form.counterparty_id.trim(),
      counterparty_name_snapshot: form.counterparty_name_snapshot?.trim() || undefined,
      description: form.description?.trim() || undefined,
    })
      .then(() => { setDrawerOpen(false); setForm(emptyAdvanceForm()); load(); })
      .catch((err) => setSaveError(extractApiError(err, "Không tạo được phiếu đặt cọc")))
      .finally(() => setSaving(false));
  };

  const runAdvanceAction = (advance: PaymentVoucher, action: "post" | "reverse") => {
    setActioningId(advance.id);
    setError(null);
    const req = action === "post"
      ? postCustomerAdvanceApi(advance.id)
      : reverseCustomerAdvanceApi(advance.id, { reason: `Reverse đặt cọc ${todayIsoDate()}` });
    req.then(load)
      .catch((e) => setError(extractApiError(e, action === "post" ? "Không post được đặt cọc" : "Không reverse được đặt cọc")))
      .finally(() => setActioningId(null));
  };

  const openBalance = advances.reduce((sum, item) => sum + Number(item.ar_advance_remaining_amount ?? 0), 0);

  return (
    <section className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] p-4">
          <p className="text-xs text-[color:var(--muted-fg)]">Tổng phiếu đặt cọc</p>
          <p className="text-xl font-semibold">{total}</p>
        </div>
        <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] p-4">
          <p className="text-xs text-[color:var(--muted-fg)]">Cọc còn lại trên trang</p>
          <p className="text-xl font-semibold">{money(openBalance)} VND</p>
        </div>
        <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] p-4">
          <p className="text-xs text-[color:var(--muted-fg)]">Hạch toán</p>
          <p className="text-sm font-semibold">N111/112/113 / C131 advance</p>
          <p className="text-xs text-[color:var(--muted-fg)]">Không ghi nhận doanh thu/VAT khi nhận cọc.</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-[color:var(--muted-fg)]">Use case #3 — Khách đặt cọc trước</p>
        <BtnPrimary onClick={() => setDrawerOpen(true)}>
          <Receipt className="h-4 w-4" /> Tạo phiếu đặt cọc
        </BtnPrimary>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-error-bg p-3 text-sm text-error-fg">
          <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--card)]">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-[color:var(--muted-fg)]">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Đang tải...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-[color:var(--border)] bg-[color:var(--muted)] text-left text-xs uppercase tracking-wider text-[color:var(--muted-fg)]">
                <tr>
                  <th className="px-3 py-2">Số phiếu</th>
                  <th className="px-3 py-2">Ngày</th>
                  <th className="px-3 py-2">Khách hàng</th>
                  <th className="px-3 py-2 text-right">Ban đầu</th>
                  <th className="px-3 py-2 text-right">Đã cấn trừ</th>
                  <th className="px-3 py-2 text-right">Còn lại</th>
                  <th className="px-3 py-2">Trạng thái</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {advances.length === 0 ? (
                  <tr><td colSpan={8} className="py-8 text-center text-[color:var(--muted-fg)]">Chưa có phiếu đặt cọc</td></tr>
                ) : advances.map((advance) => (
                  <tr key={advance.id} className="border-b border-[color:var(--border)] transition-colors hover:bg-[color:var(--muted)]/40">
                    <td className="px-3 py-2 font-mono text-xs">{advance.voucher_no ?? advance.id.slice(0, 8)}</td>
                    <td className="px-3 py-2">{advance.document_date}</td>
                    <td className="px-3 py-2">{advance.counterparty_name_snapshot ?? advance.counterparty_id ?? "—"}</td>
                    <td className="px-3 py-2 text-right font-semibold">{money(advance.ar_advance_original_amount ?? advance.amount)}</td>
                    <td className="px-3 py-2 text-right">{money(advance.ar_advance_applied_amount ?? 0)}</td>
                    <td className="px-3 py-2 text-right font-semibold">{money(advance.ar_advance_remaining_amount ?? 0)}</td>
                    <td className="px-3 py-2">
                      <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium",
                        advance.status === "POSTED" ? "bg-approve-bg text-approve-fg"
                          : advance.status === "CANCELLED" ? "bg-error-bg text-error-fg"
                          : "bg-[color:var(--muted)] text-[color:var(--muted-fg)]",
                      )}>
                        {VOUCHER_STATUS_LABELS[advance.status]} / {advance.ar_advance_status ?? "NONE"}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        {advance.status === "DRAFT" && (
                          <button
                            disabled={actioningId === advance.id}
                            onClick={() => runAdvanceAction(advance, "post")}
                            className="flex items-center gap-1 rounded bg-approve-bg px-2 py-0.5 text-xs font-medium text-approve-fg hover:opacity-80 disabled:opacity-50"
                          >
                            {actioningId === advance.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
                            Post
                          </button>
                        )}
                        {advance.status === "POSTED" && Number(advance.ar_advance_applied_amount ?? 0) === 0 && (
                          <button
                            disabled={actioningId === advance.id}
                            onClick={() => runAdvanceAction(advance, "reverse")}
                            className="flex items-center gap-1 rounded bg-error-bg px-2 py-0.5 text-xs font-medium text-error-fg hover:opacity-80 disabled:opacity-50"
                          >
                            {actioningId === advance.id ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                            Reverse
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <TablePagination page={page} totalPages={totalPages} pageSize={pageSize} total={total} onPage={setPage} onPageSize={() => {}} />

      <DrawerModal
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Tạo phiếu đặt cọc khách hàng"
        actions={[{ label: "Tạo phiếu đặt cọc", onClick: saveAdvance, primary: true, loading: saving }]}
      >
        <div className="space-y-6">
          <DrawerSection title="Thông tin đặt cọc">
            <DrawerField label="Phương thức thu cọc *">
              <select
                className={cn(inputCls, "h-10 w-full")}
                value={form.payment_method}
                onChange={(e) => setForm((f) => ({ ...f, payment_method: e.target.value as PaymentMethod }))}
              >
                {PAYMENT_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </DrawerField>
            <DrawerField label="ID khách hàng *">
              <input
                className={inputCls}
                value={form.counterparty_id}
                onChange={(e) => setForm((f) => ({ ...f, counterparty_id: e.target.value }))}
                placeholder="UUID của business partner"
              />
            </DrawerField>
            <DrawerField label="Tên khách hàng">
              <input
                className={inputCls}
                value={form.counterparty_name_snapshot ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, counterparty_name_snapshot: e.target.value }))}
                placeholder="Để trống sẽ lấy từ business partner"
              />
            </DrawerField>
            <DrawerField label="Ngày chứng từ *">
              <input type="date" className={inputCls} value={form.document_date} onChange={(e) => setForm((f) => ({ ...f, document_date: e.target.value }))} />
            </DrawerField>
            <DrawerField label="Ngày hạch toán">
              <input type="date" className={inputCls} value={form.posting_date ?? ""} onChange={(e) => setForm((f) => ({ ...f, posting_date: e.target.value }))} />
            </DrawerField>
            <DrawerField label="Số tiền đặt cọc *">
              <input
                type="number"
                min={0}
                className={cn(inputCls, "text-right")}
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: Number(e.target.value) }))}
              />
            </DrawerField>
            <DrawerField label="Diễn giải">
              <input
                className={inputCls}
                value={form.description ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Nội dung đặt cọc"
              />
            </DrawerField>
          </DrawerSection>

          {saveError && <div className="rounded-lg bg-warn-bg p-3 text-sm text-warn-fg">{saveError}</div>}
        </div>
      </DrawerModal>
    </section>
  );
}

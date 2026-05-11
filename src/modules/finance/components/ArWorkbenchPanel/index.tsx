import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, FilePlus2, Loader2 } from "lucide-react";
import { BtnPrimary } from "@/shared/components/BtnPrimary";
import { DrawerField, DrawerModal, DrawerSection, inputCls } from "@/shared/components/DrawerModal";
import { SearchInput } from "@/shared/components/SearchInput";
import { TablePagination } from "@/shared/components/TablePagination";
import { cn } from "@/shared/utils";
import { extractApiError } from "@/shared/utils/apiError";
import { todayIsoDate } from "@/modules/finance/utils/financeHelpers";
import {
  createArSalesInvoiceApi,
  getArCoverageApi,
  getArDocumentsApi,
  getArSummaryApi,
  postArDocumentApi,
  reverseArDocumentApi,
  type ArCoverageItem,
  type ArDocument,
  type ArDocumentStatus,
  type ArDocumentType,
  type ArSummary,
  type CreateArSalesInvoiceDto,
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
      </div>

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
    </section>
  );
}

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  FilePlus2,
  Loader2,
  Receipt,
} from "lucide-react";
import { useT } from "@/core/i18n";
import { BtnPrimary } from "@/shared/components/BtnPrimary";
import { Combobox } from "@/shared/components/Combobox";
import {
  DrawerField,
  DrawerModal,
  DrawerSection,
  inputCls,
} from "@/shared/components/DrawerModal";
import { DatePicker } from "@/shared/components/DatePicker";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { SearchInput } from "@/shared/components/SearchInput";
import { TablePagination } from "@/shared/components/TablePagination";
import { cn } from "@/shared/utils";
import { useAppStore } from "@/core/config/appStore";
import { extractApiError } from "@/shared/utils/apiError";
import { PageWithTabsLayout } from "@/shared/components/PageWithTabsLayout";
import {
  createArDocumentApi,
  deleteArDocumentApi,
  createArSalesInvoiceApi,
  getArCoverageApi,
  getArDocumentsApi,
  getArSummaryApi,
  getPaymentVoucherLookupBusinessPartnersApi,
  postArDocumentApi,
  updateArDocumentApi,
  type ArCoverageItem,
  type ArDocument,
  type ArDocumentStatus,
  type ArDocumentType,
  type ArSummary,
  type CreateArSalesInvoiceDto,
} from "@/modules/finance/api/financeApi";
import type { BusinessPartner } from "@/modules/partners/api/partnerApi";
import {
  DOC_TYPES,
  STATUS_LABELS,
  emptySalesInvoiceForm,
  money,
  statusCls,
} from "./shared";
import { SinvoiceDraftModal } from "@/modules/accounting/components/SinvoiceDraftModal";
import { PartnerLedgerPage } from "@/modules/finance/components/PartnerLedgerPage";

type ArWorkbenchTab = "phai-thu" | "phai-tra";

interface ArWorkbenchPanelProps {
  defaultTab?: ArWorkbenchTab;
  title?: string;
  description?: string;
}

export function ArWorkbenchPanel({
  defaultTab,
  title,
  description,
}: ArWorkbenchPanelProps = {}) {
  const t = useT();
  const [activeTab, setActiveTab] = useState<ArWorkbenchTab>(
    defaultTab ?? "phai-thu",
  );
  const { setCustomBreadcrumbs } = useAppStore();

  // Derive header title/desc: use explicit props, or derive from tab when defaultTab is set
  const headerTitle = title
    ? title
    : defaultTab === "phai-thu"
      ? "Phải thu"
      : defaultTab === "phai-tra"
        ? "Phải trả"
        : t("nav.items.debt");
  const headerDesc = description
    ? description
    : defaultTab === "phai-thu"
      ? "Quản lý công nợ phải thu"
      : defaultTab === "phai-tra"
        ? "Quản lý công nợ phải trả"
        : t("nav.items.debtDesc");

  useEffect(() => {
    // When defaultTab is provided, skip URL sync entirely (navigation is via sidebar)
    if (defaultTab) {
      setActiveTab(defaultTab);
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    const active =
      tab && ["phai-thu", "phai-tra"].includes(tab)
        ? (tab as ArWorkbenchTab)
        : "phai-thu";
    setActiveTab(active);

    if (active === "phai-thu") {
      setCustomBreadcrumbs([
        ["breadcrumb.accounting"],
        ["breadcrumb.debt"],
        ["breadcrumb.debtReceivable"],
      ]);
    } else {
      setCustomBreadcrumbs([
        ["breadcrumb.accounting"],
        ["breadcrumb.debt"],
        ["breadcrumb.debtPayable"],
      ]);
    }

    if (!tab) {
      params.set("tab", "phai-thu");
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}?${params.toString()}`,
      );
    }
  }, [defaultTab, setCustomBreadcrumbs]);

  const handleTabChange = (val: string) => {
    setActiveTab(val as ArWorkbenchTab);

    // Skip URL manipulation when defaultTab is set (sidebar navigation)
    if (!defaultTab) {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", val);
      history.pushState(null, "", url.toString());
    }

    if (val === "phai-thu") {
      setCustomBreadcrumbs([
        ["breadcrumb.accounting"],
        ["breadcrumb.debt"],
        ["breadcrumb.debtReceivable"],
      ]);
    } else {
      setCustomBreadcrumbs([
        ["breadcrumb.accounting"],
        ["breadcrumb.debt"],
        ["breadcrumb.debtPayable"],
      ]);
    }
  };

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
  const [draftModalOpen, setDraftModalOpen] = useState(false);
  const [editDoc, setEditDoc] = useState<ArDocument | null>(null);
  const [editPaidAmount, setEditPaidAmount] = useState(0);
  const [createMode, setCreateMode] = useState<"INVOICE" | "OTHER">("INVOICE");
  const [form, setForm] = useState<CreateArSalesInvoiceDto>(() =>
    emptySalesInvoiceForm(),
  );
  const [saving, setSaving] = useState(false);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [partners, setPartners] = useState<BusinessPartner[]>([]);
  const [partnersLoading, setPartnersLoading] = useState(false);

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
    Promise.all([
      getArDocumentsApi(params),
      getArSummaryApi(params),
      getArCoverageApi(),
    ])
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

  const openDrawer = (mode: "INVOICE" | "OTHER" = "INVOICE") => {
    setCreateMode(mode);
    const next = emptySalesInvoiceForm();
    if (mode === "OTHER") {
      next.document_no = `THU-KHAC-${Date.now().toString(36).toUpperCase()}`;
      next.description = "Thu chứng từ khác";
      next.lines = [
        {
          line_no: 1,
          description: "Thu chứng từ khác",
          quantity: 1,
          unit_price: 0,
          tax_rate: 0,
        },
      ];
    }
    setForm(next);
    setDrawerOpen(true);
    setPartnersLoading(true);
    getPaymentVoucherLookupBusinessPartnersApi({ pageSize: 200 })
      .then(setPartners)
      .catch(() => setPartners([]))
      .finally(() => setPartnersLoading(false));
  };

  const supported = coverage.filter(
    (c) => c.status !== "phase1_foundation",
  ).length;
  const foundation = coverage.length - supported;

  const saveDocument = () => {
    setSaving(true);
    setSaveError(null);
    const totalAmount = form.lines.reduce(
      (sum, line) =>
        sum +
        line.quantity * line.unit_price * (1 + (line.tax_rate ?? 0) / 100),
      0,
    );
    const request =
      createMode === "INVOICE"
        ? createArSalesInvoiceApi({
            ...form,
            business_partner_id: form.business_partner_id.trim(),
            due_date: form.due_date || undefined,
            reference_no: form.reference_no || undefined,
            metadata: { ...(form.metadata ?? {}), entry_type: "INVOICE" },
            lines: form.lines.map((line, index) => ({
              ...line,
              line_no: index + 1,
            })),
          })
        : createArDocumentApi({
            document_no: form.document_no,
            document_type: "ADJUSTMENT",
            business_partner_id: form.business_partner_id.trim(),
            document_date: form.document_date,
            posting_date: form.posting_date,
            due_date: form.due_date || undefined,
            currency: form.currency,
            exchange_rate: form.exchange_rate,
            total_amount: totalAmount,
            status: "POSTED",
            reference_no: form.reference_no || undefined,
            description: form.description || "Thu chứng từ khác",
            metadata: {
              ...(form.metadata ?? {}),
              entry_type: "OTHER_RECEIVABLE",
            },
          });
    request
      .then(() => {
        setDrawerOpen(false);
        setForm(emptySalesInvoiceForm());
        load();
      })
      .catch((err) =>
        setSaveError(
          extractApiError(
            err,
            createMode === "INVOICE"
              ? "Không tạo được hóa đơn"
              : "Không tạo được thu khác",
          ),
        ),
      )
      .finally(() => setSaving(false));
  };

  const updateLine = (
    index: number,
    patch: Partial<CreateArSalesInvoiceDto["lines"][number]>,
  ) => {
    setForm((current) => ({
      ...current,
      lines: current.lines.map((line, lineIndex) =>
        lineIndex === index ? { ...line, ...patch } : line,
      ),
    }));
  };
  const addLine = () =>
    setForm((current) => ({
      ...current,
      lines: [
        ...current.lines,
        {
          line_no: current.lines.length + 1,
          description: "",
          quantity: 1,
          unit_price: 0,
          tax_rate: 10,
        },
      ],
    }));
  const removeLine = (index: number) =>
    setForm((current) => ({
      ...current,
      lines:
        current.lines.length === 1
          ? current.lines
          : current.lines.filter((_, lineIndex) => lineIndex !== index),
    }));
  const openEdit = (doc: ArDocument) => {
    setEditDoc(doc);
    setEditPaidAmount(Number(doc.settled_amount ?? 0));
    setSaveError(null);
  };
  const saveEdit = () => {
    if (!editDoc) return;
    setSaving(true);
    setSaveError(null);
    updateArDocumentApi(editDoc.id, { settled_amount: editPaidAmount } as any)
      .then(() => {
        setEditDoc(null);
        load();
      })
      .catch((err) =>
        setSaveError(extractApiError(err, "Không cập nhật được thanh toán")),
      )
      .finally(() => setSaving(false));
  };
  const deleteDocument = (doc: ArDocument) => {
    if (!doc.can_delete) return;
    setActioningId(doc.id);
    deleteArDocumentApi(doc.id)
      .then(load)
      .catch((err) => setError(extractApiError(err, "Không xóa được chứng từ")))
      .finally(() => setActioningId(null));
  };

  const runDocumentAction = (doc: ArDocument) => {
    setActioningId(doc.id);
    setError(null);
    postArDocumentApi(doc.id)
      .then(load)
      .catch((err) => setError(extractApiError(err, "Không post được hóa đơn")))
      .finally(() => setActioningId(null));
  };

  return (
    <PageWithTabsLayout
      title={headerTitle}
      desc={headerDesc}
      icon={<Receipt className="h-4 w-4" />}
      hideTabs={!!defaultTab}
      actions={
        activeTab === "phai-thu" ? (
          <div className="flex flex-wrap gap-2">
            <BtnPrimary onClick={() => setDraftModalOpen(true)}>
              <FilePlus2 className="h-4 w-4" /> Tạo hóa đơn
            </BtnPrimary>
            <button
              onClick={() => openDrawer("OTHER")}
              className="rounded-xl border border-[color:var(--border)] px-3 py-2 text-sm font-medium hover:bg-[color:var(--muted)]"
            >
              <Receipt className="mr-1 inline h-4 w-4" /> Thu khác
            </button>
          </div>
        ) : undefined
      }
      tabs={[
        { value: "phai-thu", label: t("nav.items.debtReceivable") },
        { value: "phai-tra", label: t("nav.items.debtPayable") },
      ]}
      activeTab={activeTab}
      onTabChange={handleTabChange}
    >
      <div className={activeTab === "phai-thu" ? "space-y-4" : "hidden"}>
        <InvoiceKpis
          summary={summary}
          supported={supported}
          coverageTotal={coverage.length || 40}
          foundation={foundation}
        />
        <InvoiceList
          docs={docs}
          loading={loading}
          error={error}
          search={search}
          typeFilter={typeFilter}
          statusFilter={statusFilter}
          openOnly={openOnly}
          page={page}
          pageSize={pageSize}
          total={total}
          totalPages={totalPages}
          actioningId={actioningId}
          setSearch={(value) => {
            setPage(1);
            setSearch(value);
          }}
          setTypeFilter={(value) => {
            setPage(1);
            setTypeFilter(value);
          }}
          setStatusFilter={(value) => {
            setPage(1);
            setStatusFilter(value);
          }}
          setOpenOnly={(value) => {
            setPage(1);
            setOpenOnly(value);
          }}
          setPage={setPage}
          setPageSize={setPageSize}
          runDocumentAction={runDocumentAction}
          onEdit={openEdit}
          onDelete={deleteDocument}
        />
        <CoveragePreview coverage={coverage} />
        <EditArDocumentDrawer
          open={!!editDoc}
          doc={editDoc}
          paidAmount={editPaidAmount}
          setPaidAmount={setEditPaidAmount}
          saving={saving}
          saveError={saveError}
          onClose={() => setEditDoc(null)}
          onSave={saveEdit}
        />
        <SalesInvoiceDrawer
          open={drawerOpen}
          mode={createMode}
          onClose={() => setDrawerOpen(false)}
          form={form}
          setForm={setForm}
          saving={saving}
          saveError={saveError}
          saveDocument={saveDocument}
          updateLine={updateLine}
          addLine={addLine}
          removeLine={removeLine}
          partners={partners}
          partnersLoading={partnersLoading}
        />
        <SinvoiceDraftModal
          open={draftModalOpen}
          onClose={() => setDraftModalOpen(false)}
          title="Xuất hóa đơn nháp từ Công nợ"
          subtitle="Dùng cùng form nháp như trang Hóa đơn điện tử để tránh duplicate UI"
          onSaved={async () => {
            setError(null);
          }}
        />
      </div>
      <div className={activeTab === "phai-tra" ? "" : "hidden"}>
        <PartnerLedgerPage
          itemType="PAYABLE"
          title="Phải trả"
          desc="Quản lý công nợ phải trả"
          compact={true}
        />
      </div>
    </PageWithTabsLayout>
  );
}

function InvoiceKpis({
  summary,
  supported,
  coverageTotal,
  foundation,
}: {
  summary: ArSummary | null;
  supported: number;
  coverageTotal: number;
  foundation: number;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-4">
      <Kpi
        label="Open amount"
        value={`${money(summary?.totals.open_amount)} VND`}
      />
      <Kpi
        label="Overdue"
        value={`${money(summary?.totals.overdue_amount)} VND`}
        warn
      />
      <Kpi label="Documents" value={summary?.totals.count ?? 0} />
      <Kpi
        label="Use case coverage"
        value={`${supported}/${coverageTotal}`}
        sub={`${foundation} use case cần hardening phase sau`}
      />
    </div>
  );
}

function Kpi({
  label,
  value,
  sub,
  warn,
}: {
  label: string;
  value: string | number;
  sub?: string;
  warn?: boolean;
}) {
  return (
    <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] p-4">
      <p className="text-xs text-[color:var(--muted-fg)]">{label}</p>
      <p className={cn("text-xl font-semibold", warn && "text-warn-fg")}>
        {value}
      </p>
      {sub && <p className="text-xs text-[color:var(--muted-fg)]">{sub}</p>}
    </div>
  );
}

interface InvoiceListProps {
  docs: ArDocument[];
  loading: boolean;
  error: string | null;
  search: string;
  typeFilter: ArDocumentType | "";
  statusFilter: ArDocumentStatus | "";
  openOnly: boolean;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  actioningId: string | null;
  setSearch: (value: string) => void;
  setTypeFilter: (value: ArDocumentType | "") => void;
  setStatusFilter: (value: ArDocumentStatus | "") => void;
  setOpenOnly: (value: boolean) => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  runDocumentAction: (doc: ArDocument) => void;
  onEdit: (doc: ArDocument) => void;
  onDelete: (doc: ArDocument) => void;
}

function InvoiceList(props: InvoiceListProps) {
  const {
    docs,
    loading,
    error,
    search,
    typeFilter,
    statusFilter,
    openOnly,
    page,
    pageSize,
    total,
    totalPages,
    actioningId,
    onEdit,
    onDelete,
    setSearch,
    setTypeFilter,
    setStatusFilter,
    setOpenOnly,
    setPage,
    setPageSize,
    runDocumentAction,
  } = props;
  return (
    <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] p-4">
      <div className="flex flex-wrap items-center gap-2">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Tìm document / reference"
        />
        <Combobox
          options={DOC_TYPES}
          value={typeFilter}
          onChange={(v) => {
            setPage(1);
            setTypeFilter(v as ArDocumentType | "");
          }}
          placeholder="Tất cả loại"
          className="w-52"
        />
        <Combobox
          options={Object.entries(STATUS_LABELS).map(([value, label]) => ({
            value,
            label: label as string,
          }))}
          value={statusFilter}
          onChange={(v) => {
            setPage(1);
            setStatusFilter(v as ArDocumentStatus | "");
          }}
          placeholder="Tất cả trạng thái"
          className="w-44"
        />
        <label className="inline-flex items-center gap-2 rounded-lg border border-[color:var(--border)] px-3 py-2 text-sm">
          <Checkbox
            checked={openOnly}
            onCheckedChange={(checked) => setOpenOnly(!!checked)}
          />
          Chỉ còn phải thu
        </label>
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin text-[color:var(--muted-fg)]" />
        ) : null}
      </div>
      {error ? (
        <div className="mt-3 rounded-lg bg-warn-bg p-3 text-sm text-warn-fg">
          <AlertTriangle className="mr-2 inline h-4 w-4" />
          {error}
        </div>
      ) : null}
      <div className="mt-4 overflow-x-auto rounded-xl border border-[color:var(--border)]">
        <InvoiceTable
          docs={docs}
          loading={loading}
          actioningId={actioningId}
          runDocumentAction={runDocumentAction}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
      <TablePagination
        page={page}
        pageSize={pageSize}
        total={total}
        totalPages={totalPages}
        onPage={setPage}
        onPageSize={(v: number) => {
          setPageSize(v);
          setPage(1);
        }}
      />
    </div>
  );
}

function InvoiceTable({
  docs,
  loading,
  actioningId,
  runDocumentAction,
  onEdit,
  onDelete,
}: {
  docs: ArDocument[];
  loading: boolean;
  actioningId: string | null;
  runDocumentAction: (doc: ArDocument) => void;
  onEdit: (doc: ArDocument) => void;
  onDelete: (doc: ArDocument) => void;
}) {
  return (
    <table className="min-w-full text-sm">
      <thead className="bg-[color:var(--muted)] text-left text-xs uppercase tracking-wide text-[color:var(--muted-fg)]">
        <tr>
          {[
            "Số chứng từ",
            "Đối tượng",
            "Loại",
            "Ngày",
            "Tổng",
            "Đã thanh toán",
            "Còn lại",
            "Trạng thái",
            "Thao tác",
          ].map((h, i) => (
            <th
              key={h}
              className={cn(
                "px-3 py-2",
                i === 4 || i === 5 || i === 6 || i === 8 ? "text-right" : "",
              )}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {docs.length === 0 && !loading ? (
          <tr>
            <td
              colSpan={9}
              className="px-3 py-8 text-center text-[color:var(--muted-fg)]"
            >
              Chưa có AR document. Flow cũ vẫn ở tab Sổ công nợ.
            </td>
          </tr>
        ) : (
          docs.map((doc) => (
            <InvoiceRow
              key={doc.id}
              doc={doc}
              actioningId={actioningId}
              runDocumentAction={runDocumentAction}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        )}
      </tbody>
    </table>
  );
}

function InvoiceRow({
  doc,
  actioningId,
  runDocumentAction,
  onEdit,
  onDelete,
}: {
  doc: ArDocument;
  actioningId: string | null;
  runDocumentAction: (doc: ArDocument) => void;
  onEdit: (doc: ArDocument) => void;
  onDelete: (doc: ArDocument) => void;
}) {
  return (
    <tr className="border-t border-[color:var(--border)]">
      <td className="px-3 py-2 font-medium">
        {doc.document_no}
        <div className="text-xs text-[color:var(--muted-fg)]">
          {doc.reference_no || doc.description}
        </div>
      </td>
      <td className="px-3 py-2">
        {doc.business_partner_name_snapshot || doc.business_partner_id || "—"}
      </td>
      <td className="px-3 py-2">{doc.document_type}</td>
      <td className="px-3 py-2">{doc.posting_date}</td>
      <td className="px-3 py-2 text-right">{money(doc.total_amount)}</td>
      <td className="px-3 py-2 text-right text-approve-fg">
        {money(doc.settled_amount)}
      </td>
      <td className="px-3 py-2 text-right font-semibold">
        {money(doc.open_amount)}
      </td>
      <td className="px-3 py-2">
        <span
          className={cn(
            "rounded-full px-2 py-1 text-xs",
            statusCls(doc.status),
          )}
        >
          {STATUS_LABELS[doc.status]}
        </span>
      </td>
      <td className="px-3 py-2 text-right">
        <InvoiceActions
          doc={doc}
          actioningId={actioningId}
          runDocumentAction={runDocumentAction}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </td>
    </tr>
  );
}

function InvoiceActions({
  doc,
  actioningId,
  runDocumentAction,
  onEdit,
  onDelete,
}: {
  doc: ArDocument;
  actioningId: string | null;
  runDocumentAction: (doc: ArDocument) => void;
  onEdit: (doc: ArDocument) => void;
  onDelete: (doc: ArDocument) => void;
}) {
  return (
    <div className="flex justify-end gap-1">
      <button
        onClick={() => onEdit(doc)}
        className="rounded-md border border-[color:var(--border)] px-2.5 py-1 text-xs hover:bg-[color:var(--muted)]"
      >
        Sửa
      </button>
      {doc.status === "DRAFT" && doc.document_type === "INVOICE" && (
        <button
          disabled={actioningId === doc.id}
          onClick={() => runDocumentAction(doc)}
          className="rounded-md bg-[#2a6dd9] px-2.5 py-1 text-xs text-white hover:bg-[#1e5ab8] disabled:opacity-50"
        >
          {actioningId === doc.id ? "..." : "Ghi sổ"}
        </button>
      )}
      {doc.can_delete && (
        <button
          disabled={actioningId === doc.id}
          onClick={() => onDelete(doc)}
          className="rounded-md border border-red-300 px-2.5 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          Xóa
        </button>
      )}
    </div>
  );
}

function relatedVoucherLabel(item: any) {
  const voucher = item?.payment_voucher_id;
  if (voucher && typeof voucher === "object") {
    const channel =
      voucher.voucher_channel === "BANK" ? "Tiền gửi" : "Tiền mặt";
    const direction = voucher.voucher_direction === "IN" ? "Thu" : "Chi";
    return `${voucher.voucher_no || "Phiếu liên quan"} · ${channel} · ${direction} · ${STATUS_LABELS[voucher.status as ArDocumentStatus] || voucher.status || "—"}`;
  }
  return item?.related_no || voucher || "Phiếu liên quan";
}

function relatedVoucherSubLabel(item: any) {
  const voucher = item?.payment_voucher_id;
  const voucherDate =
    voucher && typeof voucher === "object" ? voucher.document_date : null;
  return `Ngày ${item?.related_date || voucherDate || "—"} · Số tiền cấn trừ ${money(item?.amount)} · ${item?.note || "Cấn trừ công nợ"}`;
}

function EditArDocumentDrawer({
  open,
  doc,
  paidAmount,
  setPaidAmount,
  saving,
  saveError,
  onClose,
  onSave,
}: {
  open: boolean;
  doc: ArDocument | null;
  paidAmount: number;
  setPaidAmount: (value: number) => void;
  saving: boolean;
  saveError: string | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const total = Number(doc?.total_amount ?? 0);
  const remaining = Math.max(total - (Number(paidAmount) || 0), 0);
  return (
    <DrawerModal
      open={open}
      title="Sửa chứng từ phải thu"
      onClose={onClose}
      actions={[
        { label: "Hủy", onClick: onClose },
        {
          label: saving ? "Đang lưu..." : "Lưu thanh toán",
          onClick: onSave,
          primary: true,
          loading: saving,
        },
      ]}
    >
      <div className="space-y-4">
        {saveError && (
          <div className="rounded-lg bg-warn-bg p-3 text-sm text-warn-fg">
            {saveError}
          </div>
        )}
        <DrawerSection title="Bổ sung thanh toán">
          <DrawerField label="Số chứng từ">
            <input
              className={inputCls}
              value={doc?.document_no || ""}
              disabled
            />
          </DrawerField>
          <DrawerField label="Đối tượng">
            <input
              className={inputCls}
              value={
                doc?.business_partner_name_snapshot ||
                doc?.business_partner_id ||
                ""
              }
              disabled
            />
          </DrawerField>
          <DrawerField label="Tổng tiền">
            <input className={inputCls} value={money(total)} disabled />
          </DrawerField>
          <DrawerField label="Đã thanh toán/cấn trừ">
            <input
              className={inputCls}
              type="number"
              min="0"
              max={total}
              value={paidAmount}
              onChange={(e) => setPaidAmount(Number(e.target.value))}
            />
          </DrawerField>
          <DrawerField label="Còn lại">
            <input className={inputCls} value={money(remaining)} disabled />
          </DrawerField>
        </DrawerSection>
        <DrawerSection title="Phiếu tiền mặt/tiền gửi đã cấn trừ">
          {(doc?.related_documents?.length ?? 0) === 0 ? (
            <div className="text-xs text-[color:var(--muted-fg)]">
              Chưa có phiếu tiền mặt/tiền gửi cấn trừ chứng từ này.
            </div>
          ) : (
            <div className="space-y-2">
              {doc?.related_documents?.map((item, idx) => (
                <div
                  key={`${item.related_id}-${idx}`}
                  className="rounded-lg border border-[color:var(--border)] p-3 text-sm"
                >
                  <div className="font-medium">{relatedVoucherLabel(item)}</div>
                  <div className="text-xs text-[color:var(--muted-fg)]">
                    {relatedVoucherSubLabel(item)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </DrawerSection>
      </div>
    </DrawerModal>
  );
}

function CoveragePreview({ coverage }: { coverage: ArCoverageItem[] }) {
  return (
    <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] p-4">
      <div className="mb-3 flex items-center gap-2 font-semibold">
        <CheckCircle2 className="h-4 w-4 text-approve-fg" /> Đối chiếu 40 use
        case
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        {coverage.slice(0, 12).map((item) => (
          <div
            key={item.id}
            className="rounded-lg border border-[color:var(--border)] p-3 text-sm"
          >
            <div className="font-medium">
              #{item.id} {item.use_case}
            </div>
            <div className="mt-1 text-xs text-[color:var(--muted-fg)]">
              {item.route}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SalesInvoiceDrawer({
  open,
  mode,
  onClose,
  form,
  setForm,
  saving,
  saveError,
  saveDocument,
  updateLine,
  addLine,
  removeLine,
  partners,
  partnersLoading,
}: {
  open: boolean;
  mode: "INVOICE" | "OTHER";
  onClose: () => void;
  form: CreateArSalesInvoiceDto;
  setForm: React.Dispatch<React.SetStateAction<CreateArSalesInvoiceDto>>;
  saving: boolean;
  saveError: string | null;
  saveDocument: () => void;
  updateLine: (
    index: number,
    patch: Partial<CreateArSalesInvoiceDto["lines"][number]>,
  ) => void;
  addLine: () => void;
  removeLine: (index: number) => void;
  partners: BusinessPartner[];
  partnersLoading: boolean;
}) {
  const total = form.lines.reduce(
    (acc, l) => acc + l.quantity * l.unit_price * (1 + (l.tax_rate ?? 0) / 100),
    0,
  );
  return (
    <DrawerModal
      open={open}
      title={mode === "INVOICE" ? "Tạo hóa đơn" : "Thu khác"}
      onClose={onClose}
      actions={[
        { label: "Hủy", onClick: onClose },
        {
          label: saving ? "Đang lưu..." : "Lưu nháp",
          onClick: saveDocument,
          primary: true,
          loading: saving,
        },
      ]}
    >
      <div className="space-y-4">
        <DrawerSection title="Thông tin chính">
          <DrawerField label="Số chứng từ">
            <input
              className={inputCls}
              value={form.document_no}
              onChange={(e) =>
                setForm({ ...form, document_no: e.target.value })
              }
              required
            />
          </DrawerField>
          <DrawerField label="Khách hàng *">
            {partnersLoading ? (
              <div className="flex items-center gap-2 text-sm text-[color:var(--muted-fg)]">
                <Loader2 className="h-4 w-4 animate-spin" /> Đang tải...
              </div>
            ) : (
              <Combobox
                options={partners.map((p) => ({
                  value: p.id,
                  label: p.display_name ?? p.name,
                }))}
                value={form.business_partner_id}
                onChange={(v) =>
                  setForm({ ...form, business_partner_id: v ?? "" })
                }
                placeholder="Tìm và chọn khách hàng..."
                className="w-full"
              />
            )}
          </DrawerField>
          <DateInput
            label="Ngày chứng từ"
            value={form.document_date}
            onChange={(v) => setForm({ ...form, document_date: v })}
          />
          <DateInput
            label="Ngày hạch toán"
            value={form.posting_date}
            onChange={(v) => setForm({ ...form, posting_date: v })}
          />
          <DateInput
            label="Ngày đến hạn"
            value={form.due_date || ""}
            onChange={(v) => setForm({ ...form, due_date: v })}
          />
          <DrawerField label="Tiền tệ">
            <input
              className={inputCls}
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
              placeholder="VND"
            />
          </DrawerField>
          <DrawerField label="Tỷ giá">
            <input
              className={inputCls}
              type="number"
              min="1"
              value={form.exchange_rate}
              onChange={(e) =>
                setForm({ ...form, exchange_rate: Number(e.target.value) })
              }
            />
          </DrawerField>
          <DrawerField label="Số tham chiếu">
            <input
              className={inputCls}
              value={form.reference_no || ""}
              onChange={(e) =>
                setForm({ ...form, reference_no: e.target.value })
              }
              placeholder="Số hợp đồng / PO / hoá đơn VAT"
            />
          </DrawerField>
          <DrawerField label="Diễn giải">
            <textarea
              className={inputCls}
              value={form.description || ""}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </DrawerField>
        </DrawerSection>
        {mode === "INVOICE" ? (
          <InvoiceLinesTable
            form={form}
            updateLine={updateLine}
            removeLine={removeLine}
          />
        ) : (
          <DrawerSection title="Thông tin khoản thu">
            <DrawerField label="Số tiền">
              <input
                className={inputCls}
                type="number"
                min="0"
                value={form.lines[0]?.unit_price ?? 0}
                onChange={(e) =>
                  updateLine(0, {
                    unit_price: Number(e.target.value),
                    quantity: 1,
                    tax_rate: 0,
                  })
                }
              />
            </DrawerField>
          </DrawerSection>
        )}
        <button
          onClick={addLine}
          className="mt-2 rounded-md border border-dashed border-[color:var(--border)] px-3 py-1.5 text-xs text-[color:var(--muted-fg)] hover:border-[color:var(--primary)] hover:text-[color:var(--primary)]"
        >
          + Thêm dòng
        </button>
        <div className="mt-2 text-right text-sm font-semibold">
          Tổng: {money(total)}
        </div>
        {saveError ? (
          <div className="rounded-lg bg-warn-bg p-3 text-sm text-warn-fg">
            {saveError}
          </div>
        ) : null}
      </div>
    </DrawerModal>
  );
}

function DateInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <DrawerField label={label}>
      <DatePicker value={value} onChange={onChange} className="w-full" />
    </DrawerField>
  );
}

function InvoiceLinesTable({
  form,
  updateLine,
  removeLine,
}: {
  form: CreateArSalesInvoiceDto;
  updateLine: (
    index: number,
    patch: Partial<CreateArSalesInvoiceDto["lines"][number]>,
  ) => void;
  removeLine: (index: number) => void;
}) {
  return (
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
                <td className="py-1 pr-2">
                  <input
                    className={inputCls}
                    value={line.description}
                    onChange={(e) =>
                      updateLine(i, { description: e.target.value })
                    }
                  />
                </td>
                <td className="py-1 pr-2">
                  <input
                    className={cn(inputCls, "text-right")}
                    type="number"
                    min="0"
                    value={line.quantity}
                    onChange={(e) =>
                      updateLine(i, { quantity: Number(e.target.value) })
                    }
                  />
                </td>
                <td className="py-1 pr-2">
                  <input
                    className={cn(inputCls, "text-right")}
                    type="number"
                    min="0"
                    value={line.unit_price}
                    onChange={(e) =>
                      updateLine(i, { unit_price: Number(e.target.value) })
                    }
                  />
                </td>
                <td className="py-1 pr-2">
                  <input
                    className={cn(inputCls, "text-right")}
                    type="number"
                    min="0"
                    max="100"
                    value={line.tax_rate}
                    onChange={(e) =>
                      updateLine(i, { tax_rate: Number(e.target.value) })
                    }
                  />
                </td>
                <td className="py-1 text-right font-semibold">
                  {money(
                    line.quantity *
                      line.unit_price *
                      (1 + (line.tax_rate ?? 0) / 100),
                  )}
                </td>
                <td className="py-1 pl-2">
                  <button
                    onClick={() => removeLine(i)}
                    className="text-[color:var(--muted-fg)] hover:text-red-500"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DrawerSection>
  );
}

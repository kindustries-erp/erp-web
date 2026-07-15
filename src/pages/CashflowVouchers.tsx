import { useEffect, useMemo, useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Wallet } from "lucide-react";
import { PageLayout } from "@/shared/components/PageLayout";
import { Panel } from "@/shared/components/Panel";
import { Attachment } from "@/shared/components/ui/Attachment";
import { Button } from "@/shared/components/ui/Button";
import { StandardTable } from "@/shared/components/StandardTable";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { useT } from "@/core/i18n";
import { useAppStore } from "@/core/config/appStore";
import {
  cancelCashflowVoucherApi,
  createCashflowVoucherApi,
  deleteCashflowVoucherApi,
  getCashflowMoneySourcesApi,
  getCashflowPartiesApi,
  getCashflowVoucherAllocationsApi,
  getCashflowVoucherRelatedDocumentsApi,
  getCashflowVoucherTimelineApi,
  getCashflowVouchersApi,
  postCashflowVoucherApi,
  createCashflowVoucherAttachmentApi,
  deleteCashflowVoucherAttachmentApi,
  getCashflowVoucherAttachmentsApi,
  uploadFileApi,
  getFileViewUrl,
  type CashflowMoneySource,
  type CashflowPartyItem,
  type CashflowPartyScope,
  type CashflowVoucher,
  type CashflowVoucherStatus,
  type CashflowVoucherAttachment,
} from "@/modules/finance/api/financeApi";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { Forbidden } from "@/pages/Forbidden";

const BUSINESS_TYPE_OPTIONS = [
  "CUSTOMER_RECEIPT",
  "SUPPLIER_PAYMENT",
  "DEPOSIT_RECEIVED",
  "DEPOSIT_REFUND",
  "EMPLOYEE_ADVANCE",
  "ADVANCE_REFUND",
  "DEBT_SETTLEMENT_RECEIPT",
  "DEBT_SETTLEMENT_PAYMENT",
  "INTERNAL_TRANSFER",
  "OTHER_RECEIPT",
  "OTHER_PAYMENT",
] as const;

type FormState = {
  voucher_date: string;
  channel_type: "CASH" | "BANK";
  business_type: string;
  party_scope: CashflowPartyScope;
  party_id: string;
  amount: string;
  currency_code: string;
  description: string;
  money_source_id: string;
};

const TODAY = new Date().toISOString().slice(0, 10);

const EMPTY_FORM: FormState = {
  voucher_date: TODAY,
  channel_type: "CASH",
  business_type: "OTHER_RECEIPT",
  party_scope: "EXTERNAL",
  party_id: "",
  amount: "",
  currency_code: "VND",
  description: "",
  money_source_id: "",
};

export function CashflowVouchersPage() {
  const t = useT();
  const { setCustomBreadcrumbs } = useAppStore();
  const canRead = useHasPermission("erp_cashflow_vouchers", "read");
  const canCreate = useHasPermission("erp_cashflow_vouchers", "create");
  const canUpdate = useHasPermission("erp_cashflow_vouchers", "update");
  const canDelete = useHasPermission("erp_cashflow_vouchers", "delete");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<CashflowVoucher | null>(null);
  const [timeline, setTimeline] = useState<unknown[]>([]);
  const [relatedDocs, setRelatedDocs] = useState<unknown[]>([]);
  const [allocations, setAllocations] = useState<unknown[]>([]);
  const [attachments, setAttachments] = useState<CashflowVoucherAttachment[]>(
    [],
  );
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const [attachmentType, setAttachmentType] = useState("OTHER");
  const [attachmentNote, setAttachmentNote] = useState("");
  const [attachmentSaving, setAttachmentSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState<CashflowVoucherStatus | "">(
    "",
  );
  const [search, setSearch] = useState("");
  const [moneySources, setMoneySources] = useState<CashflowMoneySource[]>([]);
  const [parties, setParties] = useState<CashflowPartyItem[]>([]);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const queryClient = useQueryClient();

  const tableState = useTableColumnState("cashflow-vouchers-table");

  const getSortState = (columnKey: string) => {
    const current = tableState.sorts[0];
    if (!current) return "none";
    if (current === columnKey) return "asc";
    if (current === `-${columnKey}`) return "desc";
    return "none";
  };

  const handleSortChange = (
    columnKey: string,
    state: "asc" | "desc" | "none",
  ) => {
    tableState.setSort(columnKey, state);
  };

  const handleSearchChange = (columnKey: string, value: string) => {
    tableState.setColumnSearch(columnKey, value);
    setPage(1);
  };

  const handleFilterChange = (columnKey: string, values: string[]) => {
    tableState.setColumnFilter(columnKey, values);
    setPage(1);
  };

  const renderHeaderFilter = (key: string, title: string) => (
    <TableColumnHeaderFilter
      title={title}
      align="left"
      sortState={getSortState(key)}
      onSortChange={(state) => handleSortChange(key, state)}
      searchValue={tableState.columnSearch[key] || ""}
      onSearchChange={(val) => handleSearchChange(key, val)}
      selectedFilters={tableState.columnFilters[key] || []}
      onFilterChange={(vals) => handleFilterChange(key, vals)}
      columnKey={key}
      allFilters={tableState.columnFilters}
      fetchOptions={async () => ({ items: [], total: 0, next: null })}
      queryKeyPrefix="cashflow-vouchers-column-options"
    />
  );

  const columns = [
    {
      key: "voucher_no",
      header: renderHeaderFilter("voucher_no", "Số phiếu"),
      cell: (row: any) => <span className="font-medium">{row.voucher_no}</span>,
      size: 150,
    },
    {
      key: "voucher_date",
      header: renderHeaderFilter("voucher_date", "Ngày"),
      cell: (row: any) => row.voucher_date,
      size: 120,
    },
    {
      key: "channel_type",
      header: renderHeaderFilter("channel_type", "Kênh"),
      cell: (row: any) => row.channel_type,
      size: 100,
    },
    {
      key: "business_type",
      header: renderHeaderFilter("business_type", "Loại"),
      cell: (row: any) => row.business_type,
      size: 150,
    },
    {
      key: "party_name",
      header: renderHeaderFilter("party_name", "Đối tượng"),
      cell: (row: any) => 
        row.party_scope === "INTERNAL" ? row.employee_name_snapshot : row.counterparty_name_snapshot,
      size: 200,
    },
    {
      key: "amount",
      header: renderHeaderFilter("amount", "Số tiền"),
      cell: (row: any) => row.amount.toLocaleString("vi-VN"),
      size: 150,
      className: "text-right",
      headerClassName: "text-right",
    },
    {
      key: "status",
      header: renderHeaderFilter("status", "Trạng thái"),
      cell: (row: any) => row.status,
      size: 120,
    },
    {
      key: "action",
      header: "Action",
      cell: (row: any) => (
        <div className="flex flex-wrap gap-2">
          {row.status === "DRAFT" && canUpdate && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handlePost(row);
              }}
            >
              POST
            </Button>
          )}
          {row.status === "POSTED" && canUpdate && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleCancel(row);
              }}
            >
              CANCEL
            </Button>
          )}
          {row.status !== "POSTED" && canDelete && (
            <Button
              variant="danger"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(row);
              }}
            >
              DELETE
            </Button>
          )}
        </div>
      ),
      size: 200,
    }
  ];

  useEffect(() => {
    setCustomBreadcrumbs([
      ["breadcrumb.accounting"],
      ["breadcrumb.cashflow", "cashflow"],
      ["breadcrumb.cashflowVouchers"],
    ]);
  }, [setCustomBreadcrumbs]);

  const { data: listData, isFetching: loading, refetch: loadList } = useQuery({
    queryKey: [
      "cashflow-vouchers",
      page,
      pageSize,
      statusFilter,
      search,
      tableState.sorts,
      tableState.columnFilters,
      tableState.columnSearch,
    ],
    queryFn: async () => {
      if (!canRead) return { items: [], total: 0, totalPages: 0 };
      setError(null);
      try {
        const res = await getCashflowVouchersApi({
          page,
          pageSize,
          status: statusFilter || undefined,
          search: search || undefined,
          column_filters: tableState.columnFilters
            ? JSON.stringify(tableState.columnFilters)
            : undefined,
          column_search: tableState.columnSearch
            ? JSON.stringify(tableState.columnSearch)
            : undefined,
          sort: tableState.sorts,
        });
        if (!selected && res.items?.length) {
          setSelected(res.items[0]);
        }
        return res;
      } catch (e: any) {
        setError(
          e?.response?.data?.message ||
            e?.message ||
            "Không tải được danh sách phiếu thu chi",
        );
        return { items: [], total: 0, totalPages: 0 };
      }
    },
    enabled: canRead,
  });

  const vouchers = listData?.items || [];

  const loadAux = async () => {
    try {
      const [moneySourceRes, partyRes] = await Promise.all([
        getCashflowMoneySourcesApi(),
        getCashflowPartiesApi(form.party_scope),
      ]);
      setMoneySources(moneySourceRes ?? []);
      setParties(partyRes ?? []);
    } catch {
      // non-blocking
    }
  };

  const loadDetailSidecars = async (id: string) => {
    try {
      const [tl, rd, al, att] = await Promise.all([
        getCashflowVoucherTimelineApi(id),
        getCashflowVoucherRelatedDocumentsApi(id),
        getCashflowVoucherAllocationsApi(id),
        getCashflowVoucherAttachmentsApi(id),
      ]);
      setTimeline(tl ?? []);
      setRelatedDocs(rd ?? []);
      setAllocations(al ?? []);
      setAttachments(att ?? []);
    } catch {
      setTimeline([]);
      setRelatedDocs([]);
      setAllocations([]);
      setAttachments([]);
    }
  };

  useEffect(() => {
    loadList();
    loadAux();
  }, [statusFilter]);

  useEffect(() => {
    getCashflowPartiesApi(form.party_scope)
      .then((res) => setParties(res ?? []))
      .catch(() => setParties([]));
    setForm((s) => ({ ...s, party_id: "" }));
  }, [form.party_scope]);

  useEffect(() => {
    if (selected?.id) {
      loadDetailSidecars(selected.id);
    }
  }, [selected?.id]);

  const handleUploadAttachments = useCallback(async () => {
    if (!selected?.id || attachmentFiles.length === 0) return;
    setAttachmentSaving(true);
    setError(null);
    try {
      for (const file of attachmentFiles) {
        const uploaded = await uploadFileApi(file);
        await createCashflowVoucherAttachmentApi({
          cashflow_voucher_id: selected.id,
          file: uploaded.id,

          attachment_type: attachmentType as any,
          note: attachmentNote || undefined,
        });
      }
      setAttachmentFiles([]);
      setAttachmentNote("");
      await loadDetailSidecars(selected.id);
    } catch (e: any) {
      setError(
        e?.response?.data?.message || e?.message || "Upload đính kèm thất bại",
      );
    } finally {
      setAttachmentSaving(false);
    }
  }, [selected?.id, attachmentFiles, attachmentType, attachmentNote]);

  const handleDeleteAttachment = useCallback(
    async (attachment: CashflowVoucherAttachment) => {
      if (!selected?.id) return;
      const ok = window.confirm("Xóa file đính kèm này?");
      if (!ok) return;
      setAttachmentSaving(true);
      setError(null);
      try {
        await deleteCashflowVoucherAttachmentApi(attachment.id);
        await loadDetailSidecars(selected.id);
      } catch (e: any) {
        setError(
          e?.response?.data?.message || e?.message || "Xóa đính kèm thất bại",
        );
      } finally {
        setAttachmentSaving(false);
      }
    },
    [selected?.id],
  );

  const selectedChannelName = useMemo(() => {
    if (!selected) return "-";
    const source = moneySources.find((x) => x.id === selected.money_source_id);
    return source?.label || selected.money_source_id || "-";
  }, [selected, moneySources]);

  const submitCreate = async () => {
    setSaving(true);
    setError(null);
    try {
      const dto = {
        voucher_date: form.voucher_date,
        channel_type: form.channel_type,
        business_type: form.business_type,
        party_scope: form.party_scope,
        employee_id:
          form.party_scope === "INTERNAL"
            ? form.party_id || undefined
            : undefined,
        counterparty_id:
          form.party_scope === "EXTERNAL"
            ? form.party_id || undefined
            : undefined,
        amount: Number(form.amount),
        currency_code: form.currency_code,
        description: form.description,
        money_source_id: form.money_source_id,
      };
      const created = await createCashflowVoucherApi(dto);
      setForm(EMPTY_FORM);
      await loadList();
      setSelected(created);
    } catch (e: any) {
      setError(
        e?.response?.data?.message || e?.message || "Tạo phiếu thất bại",
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePost = async (voucher: CashflowVoucher) => {
    try {
      const updated = await postCashflowVoucherApi(voucher.id);
      await loadList();
      setSelected(updated);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Ghi sổ thất bại");
    }
  };

  const handleCancel = async (voucher: CashflowVoucher) => {
    const reason = window.prompt("Lý do hủy phiếu?");
    if (!reason) return;
    try {
      const updated = await cancelCashflowVoucherApi(voucher.id, reason);
      await loadList();
      setSelected(updated);
    } catch (e: any) {
      setError(
        e?.response?.data?.message || e?.message || "Hủy phiếu thất bại",
      );
    }
  };

  const handleDelete = async (voucher: CashflowVoucher) => {
    const ok = window.confirm(`Xóa phiếu ${voucher.voucher_no}?`);
    if (!ok) return;
    try {
      await deleteCashflowVoucherApi(voucher.id);
      if (selected?.id === voucher.id) setSelected(null);
      await loadList();
    } catch (e: any) {
      setError(
        e?.response?.data?.message || e?.message || "Xóa phiếu thất bại",
      );
    }
  };

  if (!canRead) return <Forbidden />;

  return (
    <PageLayout
      title={t("nav.items.cashflowVouchers")}
      desc="Canonical erp_cashflow_vouchers — additive greenfield"
      icon={<Wallet className="h-4 w-4" />}
    >
      <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_1.4fr] gap-4 mt-4">
        <Panel title="Tạo phiếu mới">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Ngày phiếu">
              <input
                className="w-full rounded border px-3 py-2"
                type="date"
                value={form.voucher_date}
                onChange={(e) =>
                  setForm((s) => ({ ...s, voucher_date: e.target.value }))
                }
              />
            </Field>
            <Field label="Kênh">
              <select
                className="w-full rounded border px-3 py-2"
                value={form.channel_type}
                onChange={(e) =>
                  setForm((s) => ({
                    ...s,
                    channel_type: e.target.value as "CASH" | "BANK",
                    money_source_id: "",
                  }))
                }
              >
                <option value="CASH">CASH</option>
                <option value="BANK">BANK</option>
              </select>
            </Field>
            <Field label="Loại nghiệp vụ">
              <select
                className="w-full rounded border px-3 py-2"
                value={form.business_type}
                onChange={(e) =>
                  setForm((s) => ({ ...s, business_type: e.target.value }))
                }
              >
                {BUSINESS_TYPE_OPTIONS.map((x) => (
                  <option key={x} value={x}>
                    {x}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Party scope">
              <select
                className="w-full rounded border px-3 py-2"
                value={form.party_scope}
                onChange={(e) =>
                  setForm((s) => ({
                    ...s,
                    party_scope: e.target.value as CashflowPartyScope,
                  }))
                }
              >
                <option value="EXTERNAL">EXTERNAL</option>
                <option value="INTERNAL">INTERNAL</option>
              </select>
            </Field>
            {form.party_scope === "INTERNAL" ? (
              <Field label="Nhân sự">
                <select
                  className="w-full rounded border px-3 py-2"
                  value={form.party_id}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, party_id: e.target.value }))
                  }
                >
                  <option value="">Chọn nhân sự</option>
                  {parties.map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.display_name || x.code || x.id}
                    </option>
                  ))}
                </select>
              </Field>
            ) : (
              <Field label="Đối tác">
                <select
                  className="w-full rounded border px-3 py-2"
                  value={form.party_id}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, party_id: e.target.value }))
                  }
                >
                  <option value="">Chọn đối tác</option>
                  {parties.map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.display_name || x.code || x.id}
                    </option>
                  ))}
                </select>
              </Field>
            )}
            <Field label="Số tiền">
              <input
                className="w-full rounded border px-3 py-2"
                type="number"
                min="0"
                value={form.amount}
                onChange={(e) =>
                  setForm((s) => ({ ...s, amount: e.target.value }))
                }
              />
            </Field>
            <Field label="Tiền tệ">
              <input
                className="w-full rounded border px-3 py-2"
                value={form.currency_code}
                onChange={(e) =>
                  setForm((s) => ({ ...s, currency_code: e.target.value }))
                }
              />
            </Field>
            <Field label="Nguồn tiền">
              <select
                className="w-full rounded border px-3 py-2"
                value={form.money_source_id}
                onChange={(e) =>
                  setForm((s) => ({ ...s, money_source_id: e.target.value }))
                }
              >
                <option value="">Chọn nguồn tiền</option>
                {moneySources
                  .filter((x) => x.channel === form.channel_type)
                  .map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.label}
                    </option>
                  ))}
              </select>
            </Field>
            <Field label="Diễn giải" full>
              <textarea
                className="w-full rounded border px-3 py-2 min-h-[88px]"
                value={form.description}
                onChange={(e) =>
                  setForm((s) => ({ ...s, description: e.target.value }))
                }
              />
            </Field>
          </div>
          {error && (
            <div className="mt-3 rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          <div className="mt-4 flex gap-2">
            <Button
              variant="primary"
              disabled={!canCreate || saving}
              onClick={submitCreate}
            >
              Tạo phiếu
            </Button>
            <Button
              variant="outline"
              onClick={() => loadList()}
              disabled={loading}
            >
              Refresh
            </Button>
            <input
              className="ml-auto rounded border px-3 py-2"
              placeholder="Tìm theo số phiếu / diễn giải"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && loadList()}
            />
            <select
              className="rounded border px-3 py-2"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as CashflowVoucherStatus | "")
              }
            >
              <option value="">Tất cả trạng thái</option>
              <option value="DRAFT">DRAFT</option>
              <option value="POSTED">POSTED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>
        </Panel>

        <Panel title="Danh sách phiếu thu chi" className="flex flex-col flex-1 min-h-0 min-w-0 h-[600px] overflow-hidden p-0">
          <StandardTable
            columns={columns}
            items={vouchers}
            loading={loading}
            getRowKey={(row: any) => row.id}
            onRowClick={(row: any) => setSelected(row as CashflowVoucher)}
            page={page}
            pageSize={pageSize}
            total={listData?.total || 0}
            onPage={(p) => setPage(p)}
            onPageSize={(s) => setPageSize(s)}
          />
        </Panel>
      </div>

      {selected && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-4">
          <Panel title="Chi tiết phiếu">
            <Detail label="Số phiếu" value={selected.voucher_no} />
            <Detail label="Ngày phiếu" value={selected.voucher_date} />
            <Detail
              label="Kênh"
              value={`${selected.channel_type} / ${selectedChannelName}`}
            />
            <Detail label="Loại nghiệp vụ" value={selected.business_type} />
            <Detail label="Dòng tiền" value={selected.flow_direction} />
            <Detail label="Party scope" value={selected.party_scope} />
            <Detail
              label="Đối tượng"
              value={
                selected.party_scope === "INTERNAL"
                  ? selected.employee_name_snapshot
                  : selected.counterparty_name_snapshot
              }
            />
            <Detail
              label="Số tiền"
              value={selected.amount.toLocaleString("vi-VN")}
            />
            <Detail label="Trạng thái" value={selected.status} />
            <Detail
              label="Allocated / Unallocated"
              value={`${selected.allocated_amount ?? 0} / ${selected.unallocated_amount ?? 0}`}
            />
            <Detail
              label="Journal entry"
              value={
                selected.journal_entry_no_snapshot ||
                String(selected.journal_entry_id || "-")
              }
            />
            <Detail label="Diễn giải" value={selected.description} />
          </Panel>

          <Panel title={`Timeline (${timeline.length})`}>
            <pre className="max-h-[360px] overflow-auto rounded bg-[color:var(--surface-muted)] p-3 text-xs">
              {JSON.stringify(timeline, null, 2)}
            </pre>
          </Panel>

          <div className="grid grid-cols-1 gap-4">
            <Panel title={`Related documents (${relatedDocs.length})`}>
              <pre className="max-h-[160px] overflow-auto rounded bg-[color:var(--surface-muted)] p-3 text-xs">
                {JSON.stringify(relatedDocs, null, 2)}
              </pre>
            </Panel>
            <Panel title={`Allocations (${allocations.length})`}>
              <pre className="max-h-[160px] overflow-auto rounded bg-[color:var(--surface-muted)] p-3 text-xs">
                {JSON.stringify(allocations, null, 2)}
              </pre>
            </Panel>
            <Panel title={`Đính kèm (${attachments.length})`}>
              <div className="space-y-3">
                {attachments.length === 0 ? (
                  <p className="text-xs text-[color:var(--muted-fg)]">
                    Chưa có file đính kèm
                  </p>
                ) : (
                  <div className="divide-y rounded border">
                    {attachments.map((att) => {
                      const fileId =
                        att.file && typeof att.file === "object"
                          ? att.file.id
                          : (att.file as string);
                      const fileName =
                        att.file && typeof att.file === "object"
                          ? (att.file.filename_download ?? att.file.id)
                          : `File ${String(att.file).slice(0, 8)}`;
                      return (
                        <div
                          key={att.id}
                          className="flex items-center gap-2 px-3 py-2"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-xs font-medium">
                              {fileName}
                            </div>
                            <div className="text-[11px] text-[color:var(--muted-fg)]">
                              {att.attachment_type ?? "OTHER"}
                              {att.note ? ` · ${att.note}` : ""}
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={!fileId}
                            onClick={() =>
                              window.open(
                                getFileViewUrl(fileId),
                                "_blank",
                                "noopener,noreferrer",
                              )
                            }
                          >
                            Xem
                          </Button>
                          <Button
                            type="button"
                            variant="danger"
                            size="sm"
                            disabled={attachmentSaving}
                            onClick={() => handleDeleteAttachment(att)}
                          >
                            Xóa
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="space-y-2 border-t pt-3">
                  <Attachment
                    files={attachmentFiles}
                    onFilesChange={setAttachmentFiles}
                    maxSizeMb={10}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="mb-1 text-xs font-medium text-[color:var(--muted-fg)]">
                        Loại đính kèm
                      </div>
                      <select
                        className="w-full rounded border px-2 py-1 text-xs"
                        value={attachmentType}
                        onChange={(e) => setAttachmentType(e.target.value)}
                      >
                        <option value="OTHER">OTHER</option>
                        <option value="INVOICE">INVOICE</option>
                        <option value="CONTRACT">CONTRACT</option>
                        <option value="PROOF">PROOF</option>
                      </select>
                    </div>
                    <div>
                      <div className="mb-1 text-xs font-medium text-[color:var(--muted-fg)]">
                        Ghi chú
                      </div>
                      <input
                        className="w-full rounded border px-2 py-1 text-xs"
                        placeholder="Ghi chú (tùy chọn)"
                        value={attachmentNote}
                        onChange={(e) => setAttachmentNote(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="primary"
                    disabled={attachmentSaving || attachmentFiles.length === 0}
                    onClick={handleUploadAttachments}
                  >
                    {attachmentSaving ? "Đang upload..." : "Upload đính kèm"}
                  </Button>
                </div>
              </div>
            </Panel>
          </div>
        </div>
      )}
    </PageLayout>
  );
}

function Field({
  label,
  children,
  full = false,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={full ? "col-span-2" : ""}>
      <div className="mb-1 text-xs font-medium text-[color:var(--muted-fg)]">
        {label}
      </div>
      {children}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="mb-2 border-b pb-2 last:border-b-0">
      <div className="text-xs text-[color:var(--muted-fg)]">{label}</div>
      <div className="text-sm font-medium break-words">
        {value == null || value === "" ? "-" : String(value)}
      </div>
    </div>
  );
}

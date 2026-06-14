import { useEffect, useMemo, useState, useCallback } from "react";
import { Wallet } from "lucide-react";
import { PageLayout } from "@/shared/components/PageLayout";
import { Panel } from "@/shared/components/Panel";
import { FileUploadBox } from "@/shared/components/FileUploadBox";
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
  const canCreate = useHasPermission("erp_cashflow_vouchers", "create");
  const canUpdate = useHasPermission("erp_cashflow_vouchers", "update");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vouchers, setVouchers] = useState<CashflowVoucher[]>([]);
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

  useEffect(() => {
    setCustomBreadcrumbs([
      ["breadcrumb.accounting"],
      ["breadcrumb.cashflow", "cashflow"],
      ["breadcrumb.cashflowVouchers"],
    ]);
  }, [setCustomBreadcrumbs]);

  const loadList = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getCashflowVouchersApi({
        page: 1,
        pageSize: 50,
        status: statusFilter,
        search: search || undefined,
      });
      setVouchers(res.items ?? []);
      if (!selected && res.items?.length) {
        setSelected(res.items[0]);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setError(
        e?.response?.data?.message ||
          e?.message ||
          "Không tải được danh sách phiếu thu chi",
      );
    } finally {
      setLoading(false);
    }
  };

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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          attachment_type: attachmentType as any,
          note: attachmentNote || undefined,
        });
      }
      setAttachmentFiles([]);
      setAttachmentNote("");
      await loadDetailSidecars(selected.id);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setError(
        e?.response?.data?.message || e?.message || "Xóa phiếu thất bại",
      );
    }
  };

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
            <button
              className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
              disabled={!canCreate || saving}
              onClick={submitCreate}
            >
              Tạo phiếu
            </button>
            <button
              className="rounded border px-4 py-2"
              onClick={() => loadList()}
              disabled={loading}
            >
              Refresh
            </button>
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

        <Panel title="Danh sách phiếu thu chi">
          <div className="overflow-auto">
            <table className="w-full min-w-[920px] text-sm">
              <thead>
                <tr className="border-b bg-[color:var(--surface-muted)] text-left">
                  <th className="px-3 py-2">Số phiếu</th>
                  <th className="px-3 py-2">Ngày</th>
                  <th className="px-3 py-2">Kênh</th>
                  <th className="px-3 py-2">Loại</th>
                  <th className="px-3 py-2">Đối tượng</th>
                  <th className="px-3 py-2">Số tiền</th>
                  <th className="px-3 py-2">Trạng thái</th>
                  <th className="px-3 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="px-3 py-6 text-center" colSpan={8}>
                      Đang tải...
                    </td>
                  </tr>
                ) : vouchers.length === 0 ? (
                  <tr>
                    <td className="px-3 py-6 text-center" colSpan={8}>
                      Chưa có dữ liệu
                    </td>
                  </tr>
                ) : (
                  vouchers.map((voucher) => (
                    <tr
                      key={voucher.id}
                      className={`border-b hover:bg-[color:var(--surface-hover)] ${selected?.id === voucher.id ? "bg-[color:var(--surface-hover)]" : ""}`}
                      onClick={() => setSelected(voucher)}
                    >
                      <td className="px-3 py-2 font-medium">
                        {voucher.voucher_no}
                      </td>
                      <td className="px-3 py-2">{voucher.voucher_date}</td>
                      <td className="px-3 py-2">{voucher.channel_type}</td>
                      <td className="px-3 py-2">{voucher.business_type}</td>
                      <td className="px-3 py-2">
                        {voucher.party_scope === "INTERNAL"
                          ? voucher.employee_name_snapshot
                          : voucher.counterparty_name_snapshot}
                      </td>
                      <td className="px-3 py-2">
                        {voucher.amount.toLocaleString("vi-VN")}
                      </td>
                      <td className="px-3 py-2">{voucher.status}</td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-2">
                          {voucher.status === "DRAFT" && canUpdate && (
                            <button
                              className="rounded border px-2 py-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePost(voucher);
                              }}
                            >
                              POST
                            </button>
                          )}
                          {voucher.status === "POSTED" && canUpdate && (
                            <button
                              className="rounded border px-2 py-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCancel(voucher);
                              }}
                            >
                              CANCEL
                            </button>
                          )}
                          {voucher.status !== "POSTED" && canUpdate && (
                            <button
                              className="rounded border px-2 py-1 text-red-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(voucher);
                              }}
                            >
                              DELETE
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
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
                          <button
                            type="button"
                            disabled={!fileId}
                            onClick={() =>
                              window.open(
                                getFileViewUrl(fileId),
                                "_blank",
                                "noopener,noreferrer",
                              )
                            }
                            className="rounded border px-2 py-1 text-xs disabled:opacity-50"
                          >
                            Xem
                          </button>
                          <button
                            type="button"
                            disabled={attachmentSaving}
                            onClick={() => handleDeleteAttachment(att)}
                            className="rounded border px-2 py-1 text-xs text-red-700 disabled:opacity-50"
                          >
                            Xóa
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="space-y-2 border-t pt-3">
                  <FileUploadBox
                    multiple
                    files={attachmentFiles}
                    onFilesChange={setAttachmentFiles}
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
                  <button
                    type="button"
                    disabled={attachmentSaving || attachmentFiles.length === 0}
                    onClick={handleUploadAttachments}
                    className="rounded bg-black px-4 py-2 text-xs text-white disabled:opacity-50"
                  >
                    {attachmentSaving ? "Đang upload..." : "Upload đính kèm"}
                  </button>
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

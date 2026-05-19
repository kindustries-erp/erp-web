import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, Receipt } from "lucide-react";
import { BtnPrimary } from "@/shared/components/BtnPrimary";
import { Combobox } from "@/shared/components/Combobox";
import {
  DrawerField,
  DrawerModal,
  DrawerSection,
  inputCls,
} from "@/shared/components/DrawerModal";
import { DatePicker } from "@/shared/components/DatePicker";
import { TablePagination } from "@/shared/components/TablePagination";
import { cn } from "@/shared/utils";
import { extractApiError } from "@/shared/utils/apiError";
import {
  createCustomerAdvanceApi,
  getCustomerAdvancesApi,
  getPaymentVoucherLookupBusinessPartnersApi,
  postCustomerAdvanceApi,
  type CreateCustomerAdvanceDto,
  type PaymentMethod,
  type PaymentVoucher,
} from "@/modules/finance/api/financeApi";
import type { BusinessPartner } from "@/modules/partners/api/partnerApi";
import {
  PAYMENT_METHODS,
  VOUCHER_STATUS_LABELS,
  emptyAdvanceForm,
  money,
} from "./shared";

export function CustomerAdvancesTab() {
  const [advances, setAdvances] = useState<PaymentVoucher[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState<CreateCustomerAdvanceDto>(() =>
    emptyAdvanceForm(),
  );
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [partners, setPartners] = useState<BusinessPartner[]>([]);
  const [partnersLoading, setPartnersLoading] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    getCustomerAdvancesApi({ page, pageSize })
      .then((res) => {
        setAdvances(res.items);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      })
      .catch((e) =>
        setError(extractApiError(e, "Không tải được danh sách đặt cọc")),
      )
      .finally(() => setLoading(false));
  }, [page, pageSize]);

  useEffect(() => {
    load();
  }, [load]);

  // Load danh sách đối tác khi mở drawer
  const openDrawer = () => {
    setDrawerOpen(true);
    setPartnersLoading(true);
    getPaymentVoucherLookupBusinessPartnersApi({ pageSize: 200 })
      .then(setPartners)
      .catch(() => setPartners([]))
      .finally(() => setPartnersLoading(false));
  };

  const saveAdvance = () => {
    setSaving(true);
    setSaveError(null);
    createCustomerAdvanceApi({
      ...form,
      counterparty_id: form.counterparty_id.trim(),
      counterparty_name_snapshot:
        form.counterparty_name_snapshot?.trim() || undefined,
      description: form.description?.trim() || undefined,
    })
      .then(() => {
        setDrawerOpen(false);
        setForm(emptyAdvanceForm());
        load();
      })
      .catch((err) =>
        setSaveError(extractApiError(err, "Không tạo được phiếu đặt cọc")),
      )
      .finally(() => setSaving(false));
  };

  const runAdvanceAction = (advance: PaymentVoucher) => {
    setActioningId(advance.id);
    setError(null);
    postCustomerAdvanceApi(advance.id)
      .then(load)
      .catch((e) => setError(extractApiError(e, "Không post được đặt cọc")))
      .finally(() => setActioningId(null));
  };

  const openBalance = advances.reduce(
    (sum, item) => sum + Number(item.ar_advance_remaining_amount ?? 0),
    0,
  );

  return (
    <section className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] p-4">
          <p className="text-xs text-[color:var(--muted-fg)]">
            Tổng phiếu đặt cọc
          </p>
          <p className="text-xl font-semibold">{total}</p>
        </div>
        <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] p-4">
          <p className="text-xs text-[color:var(--muted-fg)]">
            Cọc còn lại trên trang
          </p>
          <p className="text-xl font-semibold">{money(openBalance)} VND</p>
        </div>
        <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] p-4">
          <p className="text-xs text-[color:var(--muted-fg)]">Hạch toán</p>
          <p className="text-sm font-semibold">N111/112/113 / C131 advance</p>
          <p className="text-xs text-[color:var(--muted-fg)]">
            Không ghi nhận doanh thu/VAT khi nhận cọc.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-[color:var(--muted-fg)]">
          Use case #3 — Khách đặt cọc trước
        </p>
        <BtnPrimary onClick={openDrawer}>
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
                  <tr>
                    <td
                      colSpan={8}
                      className="py-8 text-center text-[color:var(--muted-fg)]"
                    >
                      Chưa có phiếu đặt cọc
                    </td>
                  </tr>
                ) : (
                  advances.map((advance) => (
                    <tr
                      key={advance.id}
                      className="border-b border-[color:var(--border)] transition-colors hover:bg-[color:var(--muted)]/40"
                    >
                      <td className="px-3 py-2 font-mono text-xs">
                        {advance.voucher_no ?? advance.id.slice(0, 8)}
                      </td>
                      <td className="px-3 py-2">{advance.document_date}</td>
                      <td className="px-3 py-2">
                        {advance.counterparty_name_snapshot ??
                          advance.counterparty_id ??
                          "—"}
                      </td>
                      <td className="px-3 py-2 text-right font-semibold">
                        {money(
                          advance.ar_advance_original_amount ?? advance.amount,
                        )}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {money(advance.ar_advance_applied_amount ?? 0)}
                      </td>
                      <td className="px-3 py-2 text-right font-semibold">
                        {money(advance.ar_advance_remaining_amount ?? 0)}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-xs font-medium",
                            advance.status === "APPROVED"
                              ? "bg-approve-bg text-approve-fg"
                              : advance.status === "CANCELLED"
                                ? "bg-error-bg text-error-fg"
                                : "bg-[color:var(--muted)] text-[color:var(--muted-fg)]",
                          )}
                        >
                          {VOUCHER_STATUS_LABELS[advance.status]} /{" "}
                          {advance.ar_advance_status ?? "NONE"}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex gap-1">
                          {advance.status === "DRAFT" && (
                            <button
                              disabled={actioningId === advance.id}
                              onClick={() => runAdvanceAction(advance)}
                              className="flex items-center gap-1 rounded bg-approve-bg px-2 py-0.5 text-xs font-medium text-approve-fg hover:opacity-80 disabled:opacity-50"
                            >
                              {actioningId === advance.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <CheckCircle2 className="h-3 w-3" />
                              )}
                              Post
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
        )}
      </div>

      <TablePagination
        page={page}
        totalPages={totalPages}
        pageSize={pageSize}
        total={total}
        onPage={setPage}
        onPageSize={() => {}}
      />

      <DrawerModal
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Tạo phiếu đặt cọc khách hàng"
        actions={[
          {
            label: "Tạo phiếu đặt cọc",
            onClick: saveAdvance,
            primary: true,
            loading: saving,
          },
        ]}
      >
        <div className="space-y-6">
          <DrawerSection title="Thông tin đặt cọc">
            <DrawerField label="Phương thức thu cọc *">
              <Combobox
                options={PAYMENT_METHODS}
                value={form.payment_method}
                onChange={(v) =>
                  setForm((f) => ({ ...f, payment_method: v as PaymentMethod }))
                }
                placeholder="Chọn phương thức"
                className="w-full"
                allowClear={false}
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
                  value={form.counterparty_id}
                  onChange={(v) => {
                    const partner = partners.find((p) => p.id === v);
                    setForm((f) => ({
                      ...f,
                      counterparty_id: v ?? "",
                      counterparty_name_snapshot:
                        partner?.display_name ??
                        partner?.name ??
                        f.counterparty_name_snapshot,
                    }));
                  }}
                  placeholder="Tìm và chọn khách hàng..."
                  className="w-full"
                />
              )}
            </DrawerField>
            <DrawerField label="Ngày chứng từ *">
              <DatePicker
                value={form.document_date}
                onChange={(v) => setForm((f) => ({ ...f, document_date: v }))}
                className="w-full"
              />
            </DrawerField>
            <DrawerField label="Ngày hạch toán">
              <DatePicker
                value={form.posting_date ?? ""}
                onChange={(v) => setForm((f) => ({ ...f, posting_date: v }))}
                className="w-full"
              />
            </DrawerField>
            <DrawerField label="Số tiền đặt cọc *">
              <input
                type="number"
                min={0}
                className={cn(inputCls, "text-right")}
                value={form.amount}
                onChange={(e) =>
                  setForm((f) => ({ ...f, amount: Number(e.target.value) }))
                }
              />
            </DrawerField>
            <DrawerField label="Diễn giải">
              <input
                className={inputCls}
                value={form.description ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Nội dung đặt cọc"
              />
            </DrawerField>
          </DrawerSection>

          {saveError && (
            <div className="rounded-lg bg-warn-bg p-3 text-sm text-warn-fg">
              {saveError}
            </div>
          )}
        </div>
      </DrawerModal>
    </section>
  );
}

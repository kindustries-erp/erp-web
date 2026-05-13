import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, Receipt } from "lucide-react";
import { BtnPrimary } from "@/shared/components/BtnPrimary";
import { Combobox } from "@/shared/components/Combobox";
import { DrawerField, DrawerModal, DrawerSection, inputCls } from "@/shared/components/DrawerModal";
import { DatePicker } from "@/shared/components/DatePicker";
import { TablePagination } from "@/shared/components/TablePagination";
import { cn } from "@/shared/utils";
import { extractApiError } from "@/shared/utils/apiError";
import {
  createPaymentReceiptApi,
  getPaymentVouchersApi,
  getPaymentVoucherLookupBusinessPartnersApi,
  postArPaymentVoucherApi,
  type CreatePaymentReceiptDto,
  type PaymentMethod,
  type PaymentVoucher,
} from "@/modules/finance/api/financeApi";
import type { BusinessPartner } from "@/modules/partners/api/partnerApi";
import { PAYMENT_METHODS, StatusPill, emptyReceiptForm } from "./shared";

export function PaymentReceiptsTab() {
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
  const [partners, setPartners] = useState<BusinessPartner[]>([]);
  const [partnersLoading, setPartnersLoading] = useState(false);

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

  // Load danh sách đối tác khi mở drawer
  const openDrawer = () => {
    setDrawerOpen(true);
    setPartnersLoading(true);
    getPaymentVoucherLookupBusinessPartnersApi({ pageSize: 200 })
      .then(setPartners)
      .catch(() => setPartners([]))
      .finally(() => setPartnersLoading(false));
  };

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

  const runVoucherAction = (v: PaymentVoucher) => {
    setActioningId(v.id);
    setError(null);
    postArPaymentVoucherApi(v.id).then(load)
      .catch((e) => setError(extractApiError(e, "Không post được phiếu thu")))
      .finally(() => setActioningId(null));
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[color:var(--muted-fg)]">Tổng phiếu thu: <span className="font-semibold text-[color:var(--fg)]">{total}</span></p>
        </div>
        <BtnPrimary onClick={openDrawer}>
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
                        {<StatusPill status={v.status} />}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        {v.status === "DRAFT" && (
                          <button
                            disabled={actioningId === v.id}
                            onClick={() => runVoucherAction(v)}
                            className="flex items-center gap-1 rounded bg-approve-bg px-2 py-0.5 text-xs font-medium text-approve-fg hover:opacity-80 disabled:opacity-50"
                          >
                            {actioningId === v.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
                            Post
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
              <Combobox
                options={PAYMENT_METHODS}
                value={form.payment_method}
                onChange={(v) => setForm((f) => ({ ...f, payment_method: v as PaymentMethod }))}
                placeholder="Chọn phương thức"
                className="w-full"
                allowClear={false}
              />
            </DrawerField>
            <DrawerField label="Đối tác *">
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
                      counterparty_name_snapshot: partner?.display_name ?? partner?.name ?? f.counterparty_name_snapshot,
                    }));
                  }}
                  placeholder="Tìm và chọn đối tác..."
                  className="w-full"
                />
              )}
            </DrawerField>
            <DrawerField label="Ngày chứng từ *">
              <DatePicker value={form.document_date} onChange={(v) => setForm((f) => ({ ...f, document_date: v }))} className="w-full" />
            </DrawerField>
            <DrawerField label="Ngày ghi nhận">
              <DatePicker value={form.posting_date ?? ""} onChange={(v) => setForm((f) => ({ ...f, posting_date: v }))} className="w-full" />
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
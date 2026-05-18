import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { BtnPrimary } from "@/shared/components/BtnPrimary";
import { Combobox } from "@/shared/components/Combobox";
import { DrawerField, inputCls } from "@/shared/components/DrawerModal";
import { DatePicker } from "@/shared/components/DatePicker";
import { cn } from "@/shared/utils";
import { extractApiError } from "@/shared/utils/apiError";
import {
  applyAdvanceToInvoiceApi,
  getAdvanceApplicationsApi,
  getArDocumentsApi,
  getCustomerAdvancesApi,
  type AdvanceApplication,
  type ApplyAdvanceToInvoiceDto,
  type ArDocument,
  type PaymentVoucher,
} from "@/modules/finance/api/financeApi";
import { emptyApplyAdvanceForm, money } from "./shared";

export function AdvanceApplicationsTab() {
  const [advances, setAdvances] = useState<PaymentVoucher[]>([]);
  const [invoices, setInvoices] = useState<ArDocument[]>([]);
  const [applications, setApplications] = useState<AdvanceApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<ApplyAdvanceToInvoiceDto>(() =>
    emptyApplyAdvanceForm(),
  );
  const [saving, setSaving] = useState(false);

  const selectedAdvance = advances.find(
    (item) => item.id === form.advance_voucher_id,
  );
  const selectedInvoice = invoices.find(
    (item) => item.id === form.ar_document_id,
  );
  const maxApply = Math.min(
    Number(selectedAdvance?.ar_advance_remaining_amount ?? 0),
    Number(selectedInvoice?.open_amount ?? 0),
  );

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      getCustomerAdvancesApi({ page: 1, pageSize: 100, status: "POSTED" }),
      getArDocumentsApi({
        page: 1,
        pageSize: 100,
        document_type: "INVOICE",
        open_only: true,
        sort: ["-posting_date"],
      }),
      getAdvanceApplicationsApi({ page: 1, pageSize: 50 }),
    ])
      .then(([advanceRes, invoiceRes, appRes]) => {
        setAdvances(
          advanceRes.items.filter(
            (item) => Number(item.ar_advance_remaining_amount ?? 0) > 0,
          ),
        );
        setInvoices(
          invoiceRes.items.filter((item) => Number(item.open_amount ?? 0) > 0),
        );
        setApplications(appRes.items);
      })
      .catch((e) =>
        setError(extractApiError(e, "Không tải được dữ liệu cấn trừ cọc")),
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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
      .then(() => {
        setForm(emptyApplyAdvanceForm());
        load();
      })
      .catch((e) => setError(extractApiError(e, "Không cấn trừ được tiền cọc")))
      .finally(() => setSaving(false));
  };

  return (
    <section className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] p-4">
          <p className="text-xs text-[color:var(--muted-fg)]">
            Advance khả dụng
          </p>
          <p className="text-xl font-semibold">{advances.length}</p>
        </div>
        <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] p-4">
          <p className="text-xs text-[color:var(--muted-fg)]">
            Invoice còn công nợ
          </p>
          <p className="text-xl font-semibold">{invoices.length}</p>
        </div>
        <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] p-4">
          <p className="text-xs text-[color:var(--muted-fg)]">Hạch toán</p>
          <p className="text-sm font-semibold">N131 advance / C131 invoice</p>
          <p className="text-xs text-[color:var(--muted-fg)]">
            Không tạo revenue/VAT mới; chỉ giảm open amount.
          </p>
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
            <p className="text-sm text-[color:var(--muted-fg)]">
              Chọn phiếu cọc POSTED còn số dư và invoice còn open amount.
            </p>
          </div>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-[color:var(--muted-fg)]" />
          ) : null}
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <DrawerField label="Phiếu đặt cọc *">
            <Combobox
              options={advances.map((advance) => ({
                value: advance.id,
                label: `${advance.voucher_no ?? advance.id.slice(0, 8)} — còn ${money(advance.ar_advance_remaining_amount)}`,
              }))}
              value={form.advance_voucher_id}
              onChange={(v) =>
                setForm((current) => ({ ...current, advance_voucher_id: v }))
              }
              placeholder="Chọn advance voucher"
              className="w-full"
            />
          </DrawerField>
          <DrawerField label="Invoice/công nợ *">
            <Combobox
              options={invoices.map((invoice) => ({
                value: invoice.id,
                label: `${invoice.document_no} — còn ${money(invoice.open_amount)}`,
              }))}
              value={form.ar_document_id}
              onChange={(v) =>
                setForm((current) => ({ ...current, ar_document_id: v }))
              }
              placeholder="Chọn invoice"
              className="w-full"
            />
          </DrawerField>
          <DrawerField label="Ngày cấn trừ *">
            <DatePicker
              value={form.application_date}
              onChange={(v) =>
                setForm((current) => ({ ...current, application_date: v }))
              }
              className="w-full"
            />
          </DrawerField>
          <DrawerField
            label={`Số tiền cấn trừ *${maxApply > 0 ? ` (tối đa ${money(maxApply)})` : ""}`}
          >
            <input
              type="number"
              min={0}
              max={maxApply || undefined}
              className={cn(inputCls, "text-right")}
              value={form.amount}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  amount: Number(e.target.value),
                }))
              }
            />
          </DrawerField>
          <div className="md:col-span-2">
            <DrawerField label="Lý do / diễn giải">
              <input
                className={inputCls}
                value={form.reason ?? ""}
                onChange={(e) =>
                  setForm((current) => ({ ...current, reason: e.target.value }))
                }
                placeholder="Cấn trừ tiền cọc vào invoice"
              />
            </DrawerField>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <BtnPrimary onClick={applyAdvance} disabled={saving || maxApply <= 0}>
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}{" "}
            Cấn trừ cọc
          </BtnPrimary>
        </div>
      </div>

      <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--card)]">
        <div className="border-b border-[color:var(--border)] p-3 text-sm font-semibold">
          Lịch sử cấn trừ gần nhất
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-[color:var(--border)] bg-[color:var(--muted)] text-left text-xs uppercase tracking-wider text-[color:var(--muted-fg)]">
              <tr>
                <th className="px-3 py-2">Số cấn trừ</th>
                <th className="px-3 py-2">Ngày</th>
                <th className="px-3 py-2 text-right">Số tiền</th>
                <th className="px-3 py-2">Trạng thái</th>
                <th className="px-3 py-2">Diễn giải</th>
              </tr>
            </thead>
            <tbody>
              {applications.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 text-center text-[color:var(--muted-fg)]"
                  >
                    Chưa có bản ghi cấn trừ cọc
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr
                    key={app.id}
                    className="border-b border-[color:var(--border)]"
                  >
                    <td className="px-3 py-2 font-mono text-xs">
                      {app.application_no}
                    </td>
                    <td className="px-3 py-2">{app.application_date}</td>
                    <td className="px-3 py-2 text-right font-semibold">
                      {money(app.amount)}
                    </td>
                    <td className="px-3 py-2">{app.status}</td>
                    <td className="px-3 py-2 text-[color:var(--muted-fg)]">
                      {app.reason ?? "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

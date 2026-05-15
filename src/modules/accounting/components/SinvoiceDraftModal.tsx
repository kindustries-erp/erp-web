import { useEffect, useMemo, useState } from "react";
import { FileText, Loader2 } from "lucide-react";
import { Combobox } from "@/shared/components/Combobox";
import { DatePicker } from "@/shared/components/DatePicker";
import { DrawerField, DrawerModal, DrawerSection, inputCls } from "@/shared/components/DrawerModal";
import { extractApiError } from "@/shared/utils/apiError";
import { createSinvoiceApi } from "@/modules/accounting/api/sinvoiceApi";
import {
  getPaymentVoucherLookupBusinessPartnersApi,
  type CreateArSalesInvoiceDto,
} from "@/modules/finance/api/financeApi";
import type { BusinessPartner } from "@/modules/partners/api/partnerApi";
import { emptySalesInvoiceForm, money } from "@/modules/finance/components/ArWorkbenchPanel/shared";

function buildDraftPayload(form: CreateArSalesInvoiceDto, partner?: BusinessPartner | null) {
  return {
    documentNo: form.document_no,
    buyerName: partner?.display_name ?? partner?.name ?? form.business_partner_id,
    buyerTaxCode: partner?.tax_code ?? undefined,
    buyerAddress: undefined,
    description: form.description || form.reference_no || "Hóa đơn nháp từ ERP",
    currencyCode: form.currency || "VND",
    lines: form.lines.map((line) => ({
      description: line.description,
      quantity: Number(line.quantity || 0),
      unitPrice: Number(line.unit_price || 0),
      taxRate: Number(line.tax_rate || 0),
    })),
  };
}

export interface SinvoiceDraftModalProps {
  open: boolean;
  onClose: () => void;
  onSaved?: (result: any) => void | Promise<void>;
  initialForm?: Partial<CreateArSalesInvoiceDto>;
  title?: string;
  subtitle?: string;
}

export function SinvoiceDraftModal({
  open,
  onClose,
  onSaved,
  initialForm,
  title = "Tạo hóa đơn điện tử nháp Viettel v2.49",
  subtitle = "Chỉ lưu nháp nội bộ theo surface Viettel v2.49, không ký và không phát hành",
}: SinvoiceDraftModalProps) {
  const [form, setForm] = useState<CreateArSalesInvoiceDto>(() => ({ ...emptySalesInvoiceForm(), ...initialForm }));
  const [partners, setPartners] = useState<BusinessPartner[]>([]);
  const [partnersLoading, setPartnersLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setForm({ ...emptySalesInvoiceForm(), ...initialForm, lines: initialForm?.lines?.length ? initialForm.lines : emptySalesInvoiceForm().lines });
    setError(null);
    setPartnersLoading(true);
    getPaymentVoucherLookupBusinessPartnersApi({ pageSize: 200 })
      .then(setPartners)
      .catch(() => setPartners([]))
      .finally(() => setPartnersLoading(false));
  }, [open, initialForm]);

  const selectedPartner = useMemo(
    () => partners.find((partner) => partner.id === form.business_partner_id) ?? null,
    [partners, form.business_partner_id],
  );

  const total = useMemo(
    () => form.lines.reduce((acc, line) => acc + Number(line.quantity || 0) * Number(line.unit_price || 0) * (1 + Number(line.tax_rate || 0) / 100), 0),
    [form.lines],
  );

  const updateLine = (index: number, patch: Partial<CreateArSalesInvoiceDto["lines"][number]>) => {
    setForm((current) => ({
      ...current,
      lines: current.lines.map((line, lineIndex) => (lineIndex === index ? { ...line, ...patch } : line)),
    }));
  };

  const addLine = () => {
    setForm((current) => ({
      ...current,
      lines: [...current.lines, { line_no: current.lines.length + 1, description: "", quantity: 1, unit_price: 0, tax_rate: 10 }],
    }));
  };

  const removeLine = (index: number) => {
    setForm((current) => ({
      ...current,
      lines: current.lines.length === 1 ? current.lines : current.lines.filter((_, lineIndex) => lineIndex !== index),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const result = await createSinvoiceApi(buildDraftPayload(form, selectedPartner));
      await onSaved?.(result);
      onClose();
    } catch (e) {
      setError(extractApiError(e, "Không lưu được hóa đơn điện tử nháp"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <DrawerModal
      open={open}
      onClose={onClose}
      icon={<FileText className="h-4 w-4" />}
      title={title}
      subtitle={subtitle}
      actions={[
        { label: "Hủy", onClick: onClose, disabled: saving },
        { label: saving ? "Đang lưu..." : "Lưu hóa đơn nháp", onClick: handleSave, primary: true, loading: saving },
      ]}
      panelClassName="max-w-[720px]"
    >
      <div className="space-y-4">
        {error ? <div className="rounded-lg bg-warn-bg p-3 text-sm text-warn-fg">{error}</div> : null}

        <DrawerSection title="Thông tin hóa đơn">
          <DrawerField label="Mã chứng từ nháp">
            <input className={inputCls} value={form.document_no} onChange={(e) => setForm({ ...form, document_no: e.target.value })} />
          </DrawerField>
          <DrawerField label="Khách hàng *">
            {partnersLoading ? (
              <div className="flex items-center gap-2 text-sm text-[color:var(--muted-fg)]"><Loader2 className="h-4 w-4 animate-spin" /> Đang tải...</div>
            ) : (
              <Combobox
                options={partners.map((p) => ({ value: p.id, label: `${p.display_name ?? p.name}${p.tax_code ? ` • ${p.tax_code}` : ""}` }))}
                value={form.business_partner_id}
                onChange={(v) => setForm({ ...form, business_partner_id: v ?? "" })}
                placeholder="Tìm và chọn khách hàng..."
                className="w-full"
              />
            )}
          </DrawerField>
          <DrawerField label="MST khách hàng">
            <input className={inputCls} value={selectedPartner?.tax_code ?? ""} disabled />
          </DrawerField>
          <DrawerField label="Ngày chứng từ">
            <DatePicker value={form.document_date} onChange={(value) => setForm({ ...form, document_date: value })} className="w-full" />
          </DrawerField>
          <DrawerField label="Diễn giải">
            <textarea className={inputCls} value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
          </DrawerField>
          <DrawerField label="Số tham chiếu">
            <input className={inputCls} value={form.reference_no || ""} onChange={(e) => setForm({ ...form, reference_no: e.target.value })} />
          </DrawerField>
        </DrawerSection>

        <DrawerSection title="Danh sách hàng hóa">
          <div className="space-y-3">
            {form.lines.map((line, index) => (
              <div key={`${index}-${line.line_no}`} className="grid gap-2 rounded-lg border border-[color:var(--border)] p-3 md:grid-cols-12">
                <div className="md:col-span-5">
                  <label className="mb-1 block text-xs text-[color:var(--muted-fg)]">Mô tả</label>
                  <input className={inputCls} value={line.description} onChange={(e) => updateLine(index, { description: e.target.value })} />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs text-[color:var(--muted-fg)]">Số lượng</label>
                  <input className={inputCls} type="number" min="0" value={line.quantity} onChange={(e) => updateLine(index, { quantity: Number(e.target.value) })} />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs text-[color:var(--muted-fg)]">Đơn giá</label>
                  <input className={inputCls} type="number" min="0" value={line.unit_price} onChange={(e) => updateLine(index, { unit_price: Number(e.target.value) })} />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs text-[color:var(--muted-fg)]">VAT %</label>
                  <input className={inputCls} type="number" min="0" value={line.tax_rate ?? 0} onChange={(e) => updateLine(index, { tax_rate: Number(e.target.value) })} />
                </div>
                <div className="md:col-span-1 flex items-end">
                  <button type="button" className="w-full rounded-lg border border-red-200 px-2 py-2 text-xs text-red-600 hover:bg-red-50" onClick={() => removeLine(index)}>
                    Xóa
                  </button>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between gap-3">
              <button type="button" className="rounded-lg border border-[color:var(--border)] px-3 py-2 text-sm hover:bg-[color:var(--muted)]" onClick={addLine}>
                + Thêm dòng hàng
              </button>
              <div className="text-sm font-semibold">Tổng tạm tính: {money(total)} VND</div>
            </div>
          </div>
        </DrawerSection>

        <div className="rounded-lg border border-dashed border-[color:var(--border)] p-3 text-sm text-[color:var(--muted-fg)]">
          Chế độ hiện tại: chỉ lưu nháp nội bộ vào ERP. Không ký số, không phát hành, không gửi CQT.
        </div>
      </div>
    </DrawerModal>
  );
}

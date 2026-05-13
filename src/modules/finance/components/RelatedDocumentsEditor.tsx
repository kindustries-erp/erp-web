import { inputCls, DrawerField } from "@/shared/components/DrawerModal";
import type { CashBankRelatedDocumentInput } from "@/modules/finance/api/financeApi";

interface Props {
  value: CashBankRelatedDocumentInput[];
  disabled?: boolean;
  onChange: (value: CashBankRelatedDocumentInput[]) => void;
}

const TYPE_OPTIONS = [
  { value: "payment_vouchers", label: "Phiếu thu/chi" },
  { value: "ar_documents", label: "AR document" },
  { value: "ap_documents", label: "AP document" },
  { value: "sales_invoices", label: "Hóa đơn bán" },
  { value: "purchase_invoices", label: "Hóa đơn mua" },
  { value: "manual", label: "Khác" },
];

const emptyDoc = (): CashBankRelatedDocumentInput => ({
  related_type: "manual",
  related_id: crypto.randomUUID(),
  related_no: "",
  related_date: "",
  amount: undefined,
  note: "",
});

export function RelatedDocumentsEditor({ value, disabled, onChange }: Props) {
  function update(index: number, patch: Partial<CashBankRelatedDocumentInput>) {
    onChange(value.map((item, idx) => (idx === index ? { ...item, ...patch } : item)));
  }
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-fg">
          Liên kết 1-nhiều tới phiếu/hóa đơn/voucher liên quan.
        </div>
        {!disabled && (
          <button
            type="button"
            className="rounded-lg border border-border px-2 py-1 text-xs hover:bg-muted"
            onClick={() => onChange([...value, emptyDoc()])}
          >
            + Thêm chứng từ
          </button>
        )}
      </div>
      {value.length === 0 && <div className="text-xs text-muted-fg">Chưa có chứng từ liên quan.</div>}
      {value.map((doc, index) => (
        <div key={`${doc.related_id}-${index}`} className="rounded-xl border border-border p-3">
          <div className="grid grid-cols-3 max-[760px]:grid-cols-1 gap-x-3">
            <DrawerField label="Loại">
              <select
                className={inputCls}
                disabled={disabled}
                value={doc.related_type}
                onChange={(e) => update(index, { related_type: e.target.value })}
              >
                {TYPE_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </DrawerField>
            <DrawerField label="Số chứng từ">
              <input className={inputCls} disabled={disabled} value={doc.related_no ?? ""} onChange={(e) => update(index, { related_no: e.target.value })} />
            </DrawerField>
            <DrawerField label="Ngày">
              <input type="date" className={inputCls} disabled={disabled} value={doc.related_date ?? ""} onChange={(e) => update(index, { related_date: e.target.value })} />
            </DrawerField>
          </div>
          <div className="grid grid-cols-2 max-[560px]:grid-cols-1 gap-x-3">
            <DrawerField label="Số tiền">
              <input className={inputCls} disabled={disabled} value={doc.amount ?? ""} onChange={(e) => update(index, { amount: e.target.value ? Number(e.target.value) : undefined })} />
            </DrawerField>
            <DrawerField label="Ghi chú">
              <input className={inputCls} disabled={disabled} value={doc.note ?? ""} onChange={(e) => update(index, { note: e.target.value })} />
            </DrawerField>
          </div>
          {!disabled && (
            <button type="button" className="text-xs text-destructive" onClick={() => onChange(value.filter((_, idx) => idx !== index))}>
              Xóa dòng liên quan
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

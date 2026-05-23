import { inputCls, DrawerField } from "@/shared/components/DrawerModal";
import type { CashBankRelatedDocumentInput } from "@/modules/finance/api/financeApi";
import { X } from "lucide-react";

interface Props {
  value: CashBankRelatedDocumentInput[];
  disabled?: boolean;
  counterpartyId?: string;
  maxSettlementAmount?: number;
  onChange: (value: CashBankRelatedDocumentInput[]) => void;
}

const TYPE_OPTIONS = [
  { value: "payment_vouchers", label: "Phiếu thu/chi" },
  { value: "ap_documents", label: "AP document" },
  { value: "sales_invoices", label: "Hóa đơn bán" },
  { value: "purchase_invoices", label: "Hóa đơn mua" },
  { value: "manual", label: "Khác" },
];

export function RelatedDocumentsEditor({ value, disabled, onChange }: Props) {
  const safeValue = Array.isArray(value) ? value : [];

  function update(index: number, patch: Partial<CashBankRelatedDocumentInput>) {
    onChange(
      safeValue.map((item, idx) =>
        idx === index ? { ...item, ...patch } : item,
      ),
    );
  }

  return (
    <div className="space-y-4">
      {safeValue.length === 0 && (
        <div className="text-xs text-muted-fg py-4 border-2 border-dashed border-border rounded-xl text-center">
          Chưa có chứng từ liên quan.
        </div>
      )}

      <div className="space-y-3">
        {safeValue.map((doc, index) => (
          <div
            key={`${doc.related_id}-${index}`}
            className="relative rounded-xl border border-border bg-surface p-4 pt-8"
          >
            <button
              type="button"
              className="absolute top-3 right-3 p-1 rounded-md text-muted-fg hover:text-destructive hover:bg-destructive/5 transition-colors"
              onClick={() =>
                onChange(safeValue.filter((_, idx) => idx !== index))
              }
              title="Gỡ bỏ"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="grid grid-cols-3 max-[760px]:grid-cols-1 gap-x-3">
              <DrawerField label="Loại">
                <select
                  className={inputCls}
                  disabled={disabled}
                  value={doc.related_type}
                  onChange={(e) =>
                    update(index, { related_type: e.target.value })
                  }
                >
                  {TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </DrawerField>
              <DrawerField label="Số chứng từ">
                <input
                  className={inputCls}
                  disabled={disabled}
                  value={doc.related_no ?? ""}
                  onChange={(e) =>
                    update(index, { related_no: e.target.value })
                  }
                />
              </DrawerField>
              <DrawerField label="Ngày">
                <input
                  type="date"
                  className={inputCls}
                  disabled={disabled}
                  value={doc.related_date ?? ""}
                  onChange={(e) =>
                    update(index, { related_date: e.target.value })
                  }
                />
              </DrawerField>
            </div>
            <div className="grid grid-cols-2 max-[560px]:grid-cols-1 gap-x-3">
              <DrawerField label="Số tiền">
                <input
                  type="number"
                  className={inputCls}
                  disabled={disabled}
                  value={doc.amount ?? ""}
                  onChange={(e) =>
                    update(index, {
                      amount: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                />
              </DrawerField>
              <DrawerField label="Ghi chú">
                <input
                  className={inputCls}
                  disabled={disabled}
                  value={doc.note ?? ""}
                  onChange={(e) => update(index, { note: e.target.value })}
                />
              </DrawerField>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

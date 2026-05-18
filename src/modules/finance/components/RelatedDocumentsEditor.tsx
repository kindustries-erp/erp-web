import { useEffect, useMemo, useState } from "react";
import { inputCls, DrawerField } from "@/shared/components/DrawerModal";
import {
  getArDocumentsApi,
  type ArDocument,
  type CashBankRelatedDocumentInput,
} from "@/modules/finance/api/financeApi";
import { Check, X } from "lucide-react";
import { MultiSelect } from "@/shared/components/MultiSelect";

interface Props {
  value: CashBankRelatedDocumentInput[];
  disabled?: boolean;
  counterpartyId?: string;
  maxSettlementAmount?: number;
  onChange: (value: CashBankRelatedDocumentInput[]) => void;
}

const TYPE_OPTIONS = [
  { value: "payment_vouchers", label: "Phiếu thu/chi" },
  { value: "ar_documents", label: "Chứng từ công nợ" },
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

function arDocToRelated(
  doc: ArDocument,
  maxSettlementAmount?: number,
): CashBankRelatedDocumentInput {
  const openAmount = Number(doc.open_amount ?? doc.total_amount ?? 0) || 0;
  const cappedAmount =
    maxSettlementAmount && maxSettlementAmount > 0
      ? Math.min(openAmount, maxSettlementAmount)
      : openAmount;
  return {
    related_type: "ar_documents",
    related_id: doc.id,
    related_no: doc.document_no,
    related_date: doc.document_date,
    amount: cappedAmount || undefined,
    note: doc.description || "Chứng từ công nợ",
  };
}

export function RelatedDocumentsEditor({
  value,
  disabled,
  counterpartyId,
  maxSettlementAmount,
  onChange,
}: Props) {
  const safeValue = Array.isArray(value) ? value : [];
  const [arDocs, setArDocs] = useState<ArDocument[]>([]);

  useEffect(() => {
    if (!counterpartyId) {
      setArDocs([]);
      return;
    }
    getArDocumentsApi({
      page: 1,
      pageSize: 100,
      open_only: true,
      business_partner_id: counterpartyId,
      sort: ["-posting_date"],
    })
      .then((res) => setArDocs(res.items ?? []))
      .catch(() => setArDocs([]));
  }, [counterpartyId]);

  const arDocOpts = useMemo(
    () =>
      arDocs.map((doc) => ({
        value: doc.id,
        label: `${doc.document_no} · ${doc.document_type} · Còn ${Number(doc.open_amount ?? 0).toLocaleString("vi-VN")}`,
        description: `Tổng ${Number(doc.total_amount ?? 0).toLocaleString("vi-VN")}`,
      })),
    [arDocs],
  );

  const selectedArIds = useMemo(
    () =>
      safeValue
        .filter((i) => i.related_type === "ar_documents")
        .map((i) => i.related_id),
    [safeValue],
  );

  function update(index: number, patch: Partial<CashBankRelatedDocumentInput>) {
    onChange(
      safeValue.map((item, idx) =>
        idx === index ? { ...item, ...patch } : item,
      ),
    );
  }

  function handleMultiSelectChange(selectedIds: string[]) {
    const currentArItems = safeValue.filter(
      (item) => item.related_type === "ar_documents",
    );
    const currentManualItems = safeValue.filter(
      (item) => item.related_type !== "ar_documents",
    );

    const newArItems = selectedIds
      .map((id) => {
        const existing = currentArItems.find((item) => item.related_id === id);
        if (existing) return existing;
        const doc = arDocs.find((d) => d.id === id);
        return doc ? arDocToRelated(doc, maxSettlementAmount) : null;
      })
      .filter(Boolean) as CashBankRelatedDocumentInput[];

    onChange([...newArItems, ...currentManualItems]);
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-y-3">
        <div className="text-xs text-muted-fg leading-relaxed">
          Liên kết tới các chứng từ công nợ của đối tượng. Khi lưu, số tiền sẽ
          được cấn trừ tương ứng.
        </div>
        {!disabled && (
          <div className="flex flex-col gap-3">
            <DrawerField label="Chọn chứng từ công nợ">
              <MultiSelect
                options={arDocOpts}
                value={selectedArIds}
                onChange={handleMultiSelectChange}
                disabled={!counterpartyId}
                placeholder={
                  counterpartyId
                    ? "Tìm và chọn chứng từ..."
                    : "Vui lòng chọn đối tượng trước"
                }
              />
            </DrawerField>
            <div className="flex justify-start">
              <button
                type="button"
                className="text-xs font-medium text-primary hover:underline"
                onClick={() => onChange([...safeValue, emptyDoc()])}
              >
                + Thêm chứng từ thủ công
              </button>
            </div>
          </div>
        )}
      </div>

      {safeValue.length === 0 && (
        <div className="text-xs text-muted-fg py-4 border-2 border-dashed border-border rounded-xl text-center">
          {counterpartyId
            ? "Chưa có chứng từ liên quan."
            : "Chọn đối tượng để tải chứng từ công nợ."}
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

            {doc.related_type === "ar_documents" && (
              <div className="mb-3 rounded-lg bg-primary/5 px-3 py-2 text-[11px] text-primary font-medium">
                Chứng từ công nợ hệ thống - Số tiền sẽ được cấn trừ tự động.
              </div>
            )}

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

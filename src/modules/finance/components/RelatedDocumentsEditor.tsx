import { useEffect, useMemo, useState } from "react";
import { inputCls, DrawerField } from "@/shared/components/DrawerModal";
import {
  getArDocumentsApi,
  type ArDocument,
  type CashBankRelatedDocumentInput,
} from "@/modules/finance/api/financeApi";

interface Props {
  value: CashBankRelatedDocumentInput[];
  disabled?: boolean;
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

function arDocToRelated(doc: ArDocument): CashBankRelatedDocumentInput {
  return {
    related_type: "ar_documents",
    related_id: doc.id,
    related_no: doc.document_no,
    related_date: doc.document_date,
    amount: Number(doc.open_amount ?? doc.total_amount ?? 0) || undefined,
    note: doc.description || "Chứng từ công nợ",
  };
}

export function RelatedDocumentsEditor({ value, disabled, onChange }: Props) {
  const safeValue = Array.isArray(value) ? value : [];
  const [arDocs, setArDocs] = useState<ArDocument[]>([]);
  const [arDocId, setArDocId] = useState("");

  useEffect(() => {
    getArDocumentsApi({ page: 1, pageSize: 100, open_only: true, sort: ["-posting_date"] })
      .then((res) => setArDocs(res.items ?? []))
      .catch(() => setArDocs([]));
  }, []);

  const arDocOpts = useMemo(
    () => arDocs.map((doc) => ({ value: doc.id, label: `${doc.document_no} · ${doc.document_type} · ${Number(doc.open_amount ?? doc.total_amount ?? 0).toLocaleString("vi-VN")}` })),
    [arDocs],
  );

  function update(index: number, patch: Partial<CashBankRelatedDocumentInput>) {
    onChange(safeValue.map((item, idx) => (idx === index ? { ...item, ...patch } : item)));
  }

  function addArDoc() {
    const doc = arDocs.find((item) => item.id === arDocId);
    if (!doc) return;
    if (safeValue.some((item) => item.related_type === "ar_documents" && item.related_id === doc.id)) {
      setArDocId("");
      return;
    }
    onChange([...safeValue, arDocToRelated(doc)]);
    setArDocId("");
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 max-[760px]:flex-col max-[760px]:items-stretch">
        <div className="text-xs text-muted-fg">
          Liên kết 1-nhiều tới chứng từ công nợ/voucher liên quan. Chứng từ công nợ chọn ở đây được tạo trong Phải thu.
        </div>
        {!disabled && (
          <div className="flex flex-wrap items-center gap-2">
            <select className={inputCls} value={arDocId} onChange={(e) => setArDocId(e.target.value)}>
              <option value="">Chọn chứng từ công nợ...</option>
              {arDocOpts.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            <button type="button" className="rounded-lg border border-border px-2 py-1 text-xs hover:bg-muted" onClick={addArDoc} disabled={!arDocId}>
              + Link công nợ
            </button>
            <button type="button" className="rounded-lg border border-border px-2 py-1 text-xs hover:bg-muted" onClick={() => onChange([...safeValue, emptyDoc()])}>
              + Thêm thủ công
            </button>
          </div>
        )}
      </div>
      {safeValue.length === 0 && <div className="text-xs text-muted-fg">Chưa có chứng từ liên quan.</div>}
      {safeValue.map((doc, index) => (
        <div key={`${doc.related_id}-${index}`} className="rounded-xl border border-border p-3">
          <div className="grid grid-cols-3 max-[760px]:grid-cols-1 gap-x-3">
            <DrawerField label="Loại">
              <select className={inputCls} disabled={disabled} value={doc.related_type} onChange={(e) => update(index, { related_type: e.target.value })}>
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
            <button type="button" className="text-xs text-destructive" onClick={() => onChange(safeValue.filter((_, idx) => idx !== index))}>
              Xóa dòng liên quan
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

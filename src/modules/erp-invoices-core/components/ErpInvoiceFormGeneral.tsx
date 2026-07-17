import {
  DrawerField,
  inputCls,
  DrawerSection,
} from "@/shared/components/DrawerModal";
import { DatePicker } from "@/shared/components/DatePicker";
import { useTranslation } from "react-i18next";
import { type CreateErpInvoicePayload } from "../api/erpInvoicesCoreApi";

function formatTaxInvoiceType(type?: string | null) {
  if (type === "CASH_REGISTER") return "HĐ Máy tính tiền";
  if (type === "STANDARD") return "HĐ Điện tử";
  return type || "—";
}

function formatTaxInvoiceStatus(val?: number | null) {
  switch (val) {
    case 1:
      return "Mới";
    case 2:
      return "Bị hủy";
    case 3:
      return "Thay thế";
    case 4:
      return "Điều chỉnh";
    case 5:
      return "Bị thay thế";
    case 6:
      return "Bị điều chỉnh";
    default:
      return val?.toString() || "—";
  }
}

function formatTaxProcessStatus(val?: number | null) {
  switch (val) {
    case 0:
      return "Cục Thuế đã nhận";
    case 1:
      return "Đang tiến hành kiểm tra điều kiện cấp mã";
    case 2:
      return "CQT từ chối hóa đơn theo từng lần phát sinh";
    case 3:
      return "Hóa đơn đủ điều kiện cấp mã";
    case 4:
      return "Hóa đơn không đủ điều kiện cấp mã";
    case 5:
      return "Đã cấp mã hóa đơn";
    case 6:
      return "Cục Thuế đã nhận không mã";
    case 7:
      return "Đã kiểm tra định kỳ HĐĐT không có mã";
    case 8:
      return "Cục Thuế đã nhận hóa đơn có mã khởi tạo từ máy tính tiền";
    default:
      return val?.toString() || "—";
  }
}

function Linkify({ text }: { text: string }) {
  if (!text) return null;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return (
    <>
      {parts.map((part, i) => {
        if (part.match(urlRegex)) {
          return (
            <a
              key={i}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {part}
            </a>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

interface Props {
  form: CreateErpInvoicePayload;
  editMode: boolean;
  fieldSet: (key: string, value: unknown) => void;
  /** ID of an existing invoice (null when creating new) */
  invoiceId?: string | null;
}

export function ErpInvoiceFormGeneral({
  form,
  editMode,
  fieldSet,
  invoiceId,
}: Props) {
  const { t } = useTranslation("erpInvoices");

  const canEditCore = editMode && !invoiceId;

  return (
    <>
      <DrawerSection title="THÔNG TIN CHỨNG TỪ">
        <div className="space-y-4">
          <DrawerField label={t("invoiceDate", "Ngày HĐ")}>
            {canEditCore ? (
              <DatePicker
                value={form.invoiceDate || ""}
                onChange={(d) => fieldSet("invoiceDate", d)}
                placeholder="Chọn ngày"
                className="w-full"
              />
            ) : (
              <div>{form.invoiceDate || "—"}</div>
            )}
          </DrawerField>
          <DrawerField label={t("invoiceNo", "Số HĐ")}>
            {canEditCore ? (
              <input
                className={inputCls}
                value={form.invoiceNo}
                onChange={(e) => fieldSet("invoiceNo", e.target.value)}
              />
            ) : (
              <div className="font-medium">{form.invoiceNo || "—"}</div>
            )}
          </DrawerField>
          <DrawerField label={t("serialNo", "Ký hiệu")}>
            {canEditCore ? (
              <input
                className={inputCls}
                value={form.serialNo || ""}
                onChange={(e) => fieldSet("serialNo", e.target.value)}
              />
            ) : (
              <div>{form.serialNo || "—"}</div>
            )}
          </DrawerField>
          {!editMode &&
            (form as CreateErpInvoicePayload & { invoiceType?: string })
              .invoiceType && (
              <DrawerField label={t("invoiceType", "Loại hóa đơn")}>
                <div className="text-sm text-muted-foreground">
                  {
                    (form as CreateErpInvoicePayload & { invoiceType?: string })
                      .invoiceType
                  }
                </div>
              </DrawerField>
            )}
          {!editMode && (
            <>
              <DrawerField label="Loại hóa đơn (GDT)">
                <div className="text-sm font-medium text-slate-800">
                  {formatTaxInvoiceType((form as any).taxInvoiceType)}
                </div>
              </DrawerField>
              <DrawerField label="Trạng thái (GDT)">
                <div className="text-sm text-slate-700">
                  {formatTaxInvoiceStatus((form as any).taxInvoiceStatus)}
                </div>
              </DrawerField>
              <DrawerField label="Kết quả kiểm tra (GDT)">
                <div className="text-sm text-slate-700">
                  {formatTaxProcessStatus((form as any).taxProcessStatus)}
                </div>
              </DrawerField>
            </>
          )}
          <DrawerField label={t("notes", "Ghi chú / Link tra cứu")}>
            {canEditCore ? (
              <textarea
                className={`${inputCls} min-h-[80px] py-2`}
                value={form.notes || ""}
                onChange={(e) => fieldSet("notes", e.target.value)}
              />
            ) : (
              <div className="text-sm whitespace-pre-wrap text-gray-700">
                {form.notes ? <Linkify text={form.notes} /> : "—"}
              </div>
            )}
          </DrawerField>
        </div>
      </DrawerSection>

      <DrawerSection
        title={
          form.direction === "IN"
            ? t("sellerInfo", "Bên bán")
            : t("buyerInfo", "Bên mua")
        }
      >
        <div className="space-y-4">
          <DrawerField label="Tên Đơn vị">
            {canEditCore ? (
              <input
                className={inputCls}
                value={
                  form.direction === "IN"
                    ? form.sellerName || ""
                    : form.buyerName || ""
                }
                onChange={(e) =>
                  fieldSet(
                    form.direction === "IN" ? "sellerName" : "buyerName",
                    e.target.value,
                  )
                }
              />
            ) : (
              <div>
                {form.direction === "IN"
                  ? form.sellerName || "—"
                  : form.buyerName || "—"}
              </div>
            )}
          </DrawerField>
          <DrawerField label={t("taxCode", "MST")}>
            {canEditCore ? (
              <input
                className={inputCls}
                value={
                  form.direction === "IN"
                    ? form.sellerTaxCode || ""
                    : form.buyerTaxCode || ""
                }
                onChange={(e) =>
                  fieldSet(
                    form.direction === "IN" ? "sellerTaxCode" : "buyerTaxCode",
                    e.target.value,
                  )
                }
              />
            ) : (
              <div>
                {form.direction === "IN"
                  ? form.sellerTaxCode || "—"
                  : form.buyerTaxCode || "—"}
              </div>
            )}
          </DrawerField>
          <DrawerField label="Địa chỉ">
            {canEditCore ? (
              <input
                className={inputCls}
                value={
                  form.direction === "IN"
                    ? form.sellerAddress || ""
                    : form.buyerAddress || ""
                }
                onChange={(e) =>
                  fieldSet(
                    form.direction === "IN" ? "sellerAddress" : "buyerAddress",
                    e.target.value,
                  )
                }
              />
            ) : (
              <div className="text-muted-foreground">
                {form.direction === "IN"
                  ? form.sellerAddress || "—"
                  : form.buyerAddress || "—"}
              </div>
            )}
          </DrawerField>
        </div>
      </DrawerSection>
    </>
  );
}

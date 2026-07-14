import {
  DrawerSection,
  DrawerField,
  inputCls,
} from "@/shared/components/DrawerModal";
import { DocumentLineTable } from "@/shared/components/DocumentLineTable";
import { useTranslation } from "react-i18next";
import { type CreateErpInvoicePayload } from "../api/erpInvoicesCoreApi";

type InvoiceItem = NonNullable<CreateErpInvoicePayload["items"]>[number];

interface Props {
  form: CreateErpInvoicePayload;
  editMode: boolean;
  setForm: React.Dispatch<React.SetStateAction<CreateErpInvoicePayload>>;
  fmtAmt: (val: string | null | undefined) => string;
}

export function ErpInvoiceFormItems({
  form,
  editMode,
  setForm,
  fmtAmt,
}: Props) {
  const { t } = useTranslation("erpInvoices");

  const displayItems = form.items || [];

  return (
    <DrawerSection title={t("itemsSection", "Chi tiết hóa đơn")}>
      <div
        className="flex flex-col lg:flex-row lg:items-start gap-6 p-4 bg-white border border-gray-200 rounded-xl mb-4"
        style={{ boxShadow: "var(--panel-shadow)" }}
      >
        {/* Description Field */}
        <div className="flex-1 w-full">
          <DrawerField label={t("description", "Diễn giải")}>
            {editMode ? (
              <input
                className={inputCls}
                value={form.description || ""}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            ) : (
              <div className="text-sm font-medium text-[color:var(--foreground)]">
                {form.description || "—"}
              </div>
            )}
          </DrawerField>
        </div>

        {/* Compact VAT Summary */}
        <div className="flex items-center gap-5 shrink-0 lg:pb-[1px]">
          <div className="flex flex-col text-right">
            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
              {t("preVatAmount", "Trước VAT")}
            </span>
            <span className="text-[13px] font-semibold text-gray-900 leading-tight mt-0.5">
              {fmtAmt(String(form.preVatAmount || 0))}
            </span>
          </div>
          <div className="h-6 w-px bg-gray-200"></div>
          <div className="flex flex-col text-right">
            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
              {t("vatAmount", "Thuế VAT")}
            </span>
            <span className="text-[13px] font-semibold text-gray-900 leading-tight mt-0.5">
              {fmtAmt(String(form.vatAmount || 0))}
            </span>
          </div>
          <div className="h-6 w-px bg-gray-200"></div>
          <div className="flex flex-col text-right">
            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
              {t("totalAmount", "Tổng tiền")}
            </span>
            <span className="text-base font-bold text-primary leading-tight mt-0.5">
              {fmtAmt(String(form.totalAmount || 0))}
            </span>
          </div>
        </div>
      </div>
      <div className="max-h-[400px] overflow-y-auto border border-gray-200 rounded-md">
        <DocumentLineTable<InvoiceItem>
          getRowKey={(row, i) => String(i)}
          columns={[
            {
              key: "description",
              header: t("description", "Diễn giải"),
              minWidth: "250px",
              cell: (row: InvoiceItem, index: number) =>
                editMode ? (
                  <input
                    className={inputCls}
                    value={row.description || ""}
                    onChange={(e) => {
                      const newItems = [...displayItems];
                      newItems[index] = {
                        ...newItems[index],
                        description: e.target.value,
                      };
                      setForm({ ...form, items: newItems });
                    }}
                  />
                ) : (
                  <div>{row.description}</div>
                ),
            },
            {
              key: "unit",
              header: t("unit", "ĐVT"),
              minWidth: "100px",
              cell: (row: InvoiceItem, index: number) =>
                editMode ? (
                  <input
                    className={inputCls}
                    value={row.unit || ""}
                    onChange={(e) => {
                      const newItems = [...displayItems];
                      newItems[index] = {
                        ...newItems[index],
                        unit: e.target.value,
                      };
                      setForm({ ...form, items: newItems });
                    }}
                  />
                ) : (
                  <div>{row.unit}</div>
                ),
            },
            {
              key: "quantity",
              header: t("quantity", "SL"),
              minWidth: "100px",
              align: "right",
              cell: (row: InvoiceItem, index: number) =>
                editMode ? (
                  <input
                    className={`${inputCls} text-right`}
                    type="number"
                    value={row.quantity || ""}
                    onChange={(e) => {
                      const newItems = [...displayItems];
                      newItems[index] = {
                        ...newItems[index],
                        quantity: Number(e.target.value),
                      };
                      setForm({ ...form, items: newItems });
                    }}
                  />
                ) : (
                  <div>
                    {row.quantity != null
                      ? Number(row.quantity).toLocaleString("vi-VN", {
                          minimumFractionDigits: 1,
                          maximumFractionDigits: 1,
                        })
                      : ""}
                  </div>
                ),
            },
            {
              key: "unitPrice",
              header: t("unitPrice", "Đơn giá"),
              minWidth: "150px",
              align: "right",
              cell: (row: InvoiceItem, index: number) =>
                editMode ? (
                  <input
                    className={`${inputCls} text-right`}
                    type="number"
                    value={row.unitPrice || ""}
                    onChange={(e) => {
                      const newItems = [...displayItems];
                      newItems[index] = {
                        ...newItems[index],
                        unitPrice: Number(e.target.value),
                      };
                      setForm({ ...form, items: newItems });
                    }}
                  />
                ) : (
                  <div>{fmtAmt(String(row.unitPrice || 0))}</div>
                ),
            },
            {
              key: "preVatAmount",
              header: t("preVatAmountCol", "Thành tiền trước thuế"),
              minWidth: "150px",
              align: "right",
              cell: (row: InvoiceItem, index: number) =>
                editMode ? (
                  <input
                    className={`${inputCls} text-right`}
                    type="number"
                    value={row.preVatAmount || ""}
                    onChange={(e) => {
                      const newItems = [...displayItems];
                      newItems[index] = {
                        ...newItems[index],
                        preVatAmount: Number(e.target.value),
                      };
                      const preVatAmount = newItems.reduce(
                        (acc, curr) => acc + Number(curr.preVatAmount || 0),
                        0,
                      );
                      setForm({ ...form, items: newItems, preVatAmount });
                    }}
                  />
                ) : (
                  <div className="font-medium text-slate-800">
                    {fmtAmt(String(row.preVatAmount || 0))}
                  </div>
                ),
            },
            {
              key: "vatRate",
              header: t("vatRate", "Thuế suất"),
              minWidth: "120px",
              align: "right",
              cell: (row: InvoiceItem, index: number) =>
                editMode ? (
                  <input
                    className={`${inputCls} text-right`}
                    type="number"
                    step="0.01"
                    value={row.vatRate || ""}
                    onChange={(e) => {
                      const newItems = [...displayItems];
                      newItems[index] = {
                        ...newItems[index],
                        vatRate: Number(e.target.value),
                      };
                      setForm({ ...form, items: newItems });
                    }}
                  />
                ) : (
                  <div>
                    {row.vatRate != null
                      ? `${(Number(row.vatRate) * 100).toFixed(0)}%`
                      : "—"}
                  </div>
                ),
            },
            {
              key: "vatAmount",
              header: t("vatAmount", "Tiền thuế"),
              minWidth: "150px",
              align: "right",
              cell: (row: InvoiceItem, index: number) =>
                editMode ? (
                  <input
                    className={`${inputCls} text-right`}
                    type="number"
                    value={row.vatAmount || ""}
                    onChange={(e) => {
                      const newItems = [...displayItems];
                      newItems[index] = {
                        ...newItems[index],
                        vatAmount: Number(e.target.value),
                      };
                      const vatAmount = newItems.reduce(
                        (acc, curr) => acc + Number(curr.vatAmount || 0),
                        0,
                      );
                      setForm({ ...form, items: newItems, vatAmount });
                    }}
                  />
                ) : (
                  <div>{fmtAmt(String(row.vatAmount || 0))}</div>
                ),
            },
            {
              key: "totalAmount",
              header: t("totalAmount", "Tổng cộng"),
              minWidth: "150px",
              align: "right",
              cell: (row: InvoiceItem, index: number) =>
                editMode ? (
                  <input
                    className={`${inputCls} text-right font-bold text-primary`}
                    type="number"
                    value={row.totalAmount || ""}
                    onChange={(e) => {
                      const newItems = [...displayItems];
                      newItems[index] = {
                        ...newItems[index],
                        totalAmount: Number(e.target.value),
                      };
                      const totalAmount = newItems.reduce(
                        (acc, curr) => acc + Number(curr.totalAmount || 0),
                        0,
                      );
                      setForm({ ...form, items: newItems, totalAmount });
                    }}
                  />
                ) : (
                  <div className="font-semibold text-primary">
                    {fmtAmt(String(row.totalAmount || 0))}
                  </div>
                ),
            },
          ]}
          data={displayItems}
        />
      </div>
    </DrawerSection>
  );
}

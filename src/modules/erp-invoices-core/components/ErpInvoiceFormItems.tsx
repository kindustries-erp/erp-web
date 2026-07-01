import { DrawerSection, inputCls } from "@/shared/components/DrawerModal";
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
      <DocumentLineTable<InvoiceItem>
        tableContainerClassName="max-h-[55vh] overflow-auto"
        getRowKey={(row, i) => String(i)}
        columns={[
          {
            key: "description",
            header: t("description", "Diễn giải"),
            minWidth: "300px",
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
                <div className="min-w-[120px]">{row.description || "—"}</div>
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
                <div>{row.unit || "—"}</div>
              ),
          },
          {
            key: "quantity",
            header: t("quantity", "SL"),
            minWidth: "120px",
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
                <div>{row.quantity || "—"}</div>
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
            header: t("preVatAmount", "Trước VAT"),
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
                <div className="font-medium">
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
    </DrawerSection>
  );
}

import * as React from "react";
import { RotateCw } from "lucide-react";
import { V2Button, V2Textarea } from "@/v2/shared/components/atoms";
import { V2Combobox } from "@/v2/shared/components/molecules/v2-combobox";
import {
  V2ReadValue,
  V2TextField,
} from "@/v2/shared/components/molecules/v2-form-controls";
import {
  GarageGoodsReceiptStatus,
  type GarageGoodsReceiptFormValue,
} from "@/v2/modules/garage-goods-receipts/domain/entities/garageGoodsReceipt";

export interface FormSectionsProps {
  form: GarageGoodsReceiptFormValue;
  viewing: boolean;
  codeEditable: boolean;
  onRegenerateCode: () => void;
  errorField: string | null;
  errorMessage: string;
  t: (key: string, fallback?: string) => string;
  setField: <K extends keyof GarageGoodsReceiptFormValue>(
    key: K,
    value: GarageGoodsReceiptFormValue[K],
  ) => void;
}

export interface FieldConfig {
  key: keyof GarageGoodsReceiptFormValue;
  labelKey: string;
  defaultLabel: string;
  required?: boolean;
  className?: string;
  render: (props: FormSectionsProps) => React.ReactNode;
}

export const GARAGE_RECEIPT_FORM_FIELDS: FieldConfig[] = [
  {
    key: "receiptNo",
    labelKey: "v2.garageGoodsReceipts.columns.receiptNo",
    defaultLabel: "Số phiếu",
    required: true,
    render: ({
      form,
      viewing,
      codeEditable,
      onRegenerateCode,
      t,
      setField,
    }) => (
      <div className="flex gap-2">
        <div className="min-w-0 flex-1">
          <V2TextField
            viewing={viewing}
            value={form.receiptNo}
            className="font-mono"
            disabled={!codeEditable}
            onChange={(v) => setField("receiptNo", v.toUpperCase())}
          />
        </div>
        {!viewing && codeEditable && (
          <V2Button
            variant="outline"
            size="icon-sm"
            aria-label={t(
              "v2.garageGoodsReceipts.form.generateCode",
              "Sinh mã",
            )}
            onClick={onRegenerateCode}
          >
            <RotateCw className="h-4 w-4" />
          </V2Button>
        )}
      </div>
    ),
  },
  {
    key: "receiptDate",
    labelKey: "v2.garageGoodsReceipts.columns.receiptDate",
    defaultLabel: "Ngày nhập",
    required: true,
    render: ({ form, viewing, setField }) => (
      <V2TextField
        viewing={viewing}
        value={form.receiptDate}
        onChange={(v) => setField("receiptDate", v)}
      />
    ),
  },
  {
    key: "supplierName",
    labelKey: "v2.garageGoodsReceipts.columns.supplierName",
    defaultLabel: "Nhà cung cấp",
    render: ({ form, viewing, setField }) => (
      <V2TextField
        viewing={viewing}
        value={form.supplierName}
        onChange={(v) => setField("supplierName", v)}
      />
    ),
  },
  {
    key: "branchName",
    labelKey: "v2.garageGoodsReceipts.columns.branchName",
    defaultLabel: "Chi nhánh",
    render: ({ form, viewing, setField }) => (
      <V2TextField
        viewing={viewing}
        value={form.branchName}
        onChange={(v) => setField("branchName", v)}
      />
    ),
  },
  {
    key: "totalAmount",
    labelKey: "v2.garageGoodsReceipts.columns.totalAmount",
    defaultLabel: "Tổng tiền",
    render: ({ form, viewing, setField }) => (
      <V2TextField
        viewing={viewing}
        value={Number(form.totalAmount || 0).toLocaleString("vi-VN")}
        disabled
        inputMode="decimal"
        onChange={(v) => setField("totalAmount", v)}
      />
    ),
  },
  {
    key: "status",
    labelKey: "v2.garageGoodsReceipts.columns.status",
    defaultLabel: "Trạng thái",
    render: ({ form, viewing, t, setField }) =>
      viewing ? (
        <V2ReadValue
          value={
            form.status === GarageGoodsReceiptStatus.POSTED
              ? t("v2.garageGoodsReceipts.status.posted", "Đã ghi sổ")
              : form.status === GarageGoodsReceiptStatus.CANCELLED
                ? t("v2.garageGoodsReceipts.status.cancelled", "Đã hủy")
                : t("v2.garageGoodsReceipts.status.draft", "Nháp")
          }
        />
      ) : (
        <V2Combobox
          searchable={false}
          clearable={false}
          value={form.status}
          onValueChange={(v) =>
            setField("status", v as GarageGoodsReceiptStatus)
          }
          options={[
            {
              value: GarageGoodsReceiptStatus.DRAFT,
              label: t("v2.garageGoodsReceipts.status.draft", "Nháp"),
            },
            {
              value: GarageGoodsReceiptStatus.POSTED,
              label: t("v2.garageGoodsReceipts.status.posted", "Đã ghi sổ"),
            },
            {
              value: GarageGoodsReceiptStatus.CANCELLED,
              label: t("v2.garageGoodsReceipts.status.cancelled", "Đã hủy"),
            },
          ]}
        />
      ),
  },
  {
    key: "remarks",
    labelKey: "v2.garageGoodsReceipts.columns.remarks",
    defaultLabel: "Ghi chú",
    className: "sm:col-span-2",
    render: ({ form, viewing, setField }) =>
      viewing ? (
        <V2ReadValue value={form.remarks} />
      ) : (
        <V2Textarea
          className="min-h-20"
          value={form.remarks}
          onChange={(e) => setField("remarks", e.target.value)}
        />
      ),
  },
];

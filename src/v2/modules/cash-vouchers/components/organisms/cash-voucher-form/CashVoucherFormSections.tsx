import {
  DrawerField,
  DrawerSection,
  V2Combobox,
  V2DatePicker,
  V2Input,
  V2NumberInput,
  V2Textarea,
} from "@/v2/shared/components";
import type { CashBookDto } from "../../../api/dtos/cashVoucher.dto";
import type {
  CashVoucherFieldError,
  CashVoucherFormValue,
} from "../../../domain/entities/cashVoucher";

export interface CashVoucherFormSectionsProps {
  form: CashVoucherFormValue;
  cashBooks: CashBookDto[];
  errorField: CashVoucherFieldError | null;
  errorMessage: string;
  amountErrorMessage: string;
  t: (key: string, fallback?: string) => string;
  setField: <K extends keyof CashVoucherFormValue>(
    key: K,
    value: CashVoucherFormValue[K],
  ) => void;
}

/** Các mục nhập của phiếu thu/chi: thông tin chung, số tiền và diễn giải */
export function CashVoucherFormSections({
  form,
  cashBooks,
  errorField,
  errorMessage,
  amountErrorMessage,
  t,
  setField,
}: CashVoucherFormSectionsProps) {
  const cashBookOptions = cashBooks.map((cb) => ({
    value: cb.id,
    label: cb.name,
  }));

  return (
    <>
      <DrawerSection
        title={t("v2.cashVouchers.form.general", "Thông tin chung")}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <DrawerField
            label={t("v2.cashVouchers.form.cashBook", "Sổ quỹ")}
            required
            error={errorField === "cashBookId" ? errorMessage : undefined}
          >
            <V2Combobox
              options={cashBookOptions}
              value={form.cashBookId || null}
              onValueChange={(value) => setField("cashBookId", value ?? "")}
              placeholder={t(
                "v2.cashVouchers.form.cashBookPlaceholder",
                "Chọn sổ quỹ",
              )}
              searchable={false}
            />
          </DrawerField>
          <DrawerField
            label={t("v2.cashVouchers.form.transDate", "Ngày giao dịch")}
            required
            error={errorField === "transDate" ? errorMessage : undefined}
          >
            <V2DatePicker
              value={form.transDate || null}
              onValueChange={(value) => setField("transDate", value ?? "")}
              placeholder={t(
                "v2.cashVouchers.form.datePlaceholder",
                "Chọn ngày",
              )}
            />
          </DrawerField>
          <DrawerField
            label={t(
              "v2.cashVouchers.form.correspondentName",
              "Người nộp/nhận",
            )}
            className="sm:col-span-2"
          >
            <V2Input
              value={form.correspondentName}
              placeholder={t(
                "v2.cashVouchers.form.correspondentPlaceholder",
                "Nhập tên người nộp/nhận",
              )}
              onChange={(e) => setField("correspondentName", e.target.value)}
            />
          </DrawerField>
        </div>
      </DrawerSection>

      <DrawerSection title={t("v2.cashVouchers.form.amount", "Số tiền")}>
        <div className="grid gap-3 sm:grid-cols-2">
          <DrawerField
            label={t("v2.cashVouchers.form.debitAmount", "Thu (phát sinh Nợ)")}
            error={errorField === "amount" ? amountErrorMessage : undefined}
          >
            <V2NumberInput
              value={form.debitAmount}
              min={0}
              placeholder="0"
              onValueChange={(value) => setField("debitAmount", value)}
            />
          </DrawerField>
          <DrawerField
            label={t("v2.cashVouchers.form.creditAmount", "Chi (phát sinh Có)")}
          >
            <V2NumberInput
              value={form.creditAmount}
              min={0}
              placeholder="0"
              onValueChange={(value) => setField("creditAmount", value)}
            />
          </DrawerField>
        </div>
      </DrawerSection>

      <DrawerSection title={t("v2.cashVouchers.form.content", "Nội dung")}>
        <DrawerField label={t("v2.cashVouchers.form.description", "Diễn giải")}>
          <V2Textarea
            className="min-h-20"
            value={form.description}
            placeholder={t(
              "v2.cashVouchers.form.descriptionPlaceholder",
              "Nhập diễn giải...",
            )}
            onChange={(e) => setField("description", e.target.value)}
          />
        </DrawerField>
      </DrawerSection>
    </>
  );
}

import {
  AppTooltip,
  DrawerField,
  DrawerRow,
  DrawerSection,
  V2MultiCombobox,
  V2Textarea,
} from "@/v2/shared/components";
import { formatDateTimeParts } from "@/v2/shared/components/atoms/v2-table-date-cell/v2TableDate";
import { BusinessPartnerPicker } from "@/v2/modules/business-partners/components/organisms/business-partner-picker";
import { CashClassificationFields } from "../../molecules/cash-classification-fields";
import type { BankGeneralInfoProps } from "./BankGeneralInfo.type";

const formatAmount = (amount: number): string =>
  new Intl.NumberFormat("vi-VN").format(amount) + " ₫";

/** Cột phải của drawer ngân hàng: 2 DrawerSection độc lập (Thông tin GD & Thiết lập ERP) */
export function BankGeneralInfo(props: BankGeneralInfoProps) {
  const { t, editMode, draft, branchOptions, transaction } = props;
  const empty = t("v2.bankStatements.bankDetail.labels.empty");
  const isCredit = Number(transaction.creditAmount || 0) > 0;
  const amount = isCredit
    ? Number(transaction.creditAmount || 0)
    : Number(transaction.debitAmount || 0);
  const direction = isCredit ? "OUT" : "IN";

  const bankAccountLabel =
    [transaction.bankAccount?.bankName, transaction.bankAccount?.accountNumber]
      .filter(Boolean)
      .join(" - ") || empty;

  const branchLabels = draft.branchIds
    .map((id) => branchOptions.find((b) => b.value === id)?.label)
    .filter(Boolean);

  const dateStr = formatDateTimeParts(transaction.transDate)?.date ?? empty;
  const partnerName =
    transaction.correspondentName ||
    (transaction as any).counterparty ||
    (transaction as any).counterpartyName ||
    empty;

  return (
    <div className="flex flex-col gap-4">
      {/* Khối 1: Thông tin giao dịch ngân hàng gốc (Read-only) */}
      <DrawerSection title={t("v2.bankStatements.bankDetail.labels.txnInfo")}>
        <div className="space-y-1">
          <DrawerRow
            label={t("v2.bankStatements.bankDetail.labels.date")}
            value={dateStr}
          />
          <DrawerRow
            label={t("v2.bankStatements.bankDetail.labels.reference")}
            value={transaction.referenceNumber || empty}
            copyable={Boolean(transaction.referenceNumber)}
          />
          <DrawerRow
            label={t("v2.bankStatements.bankDetail.labels.amount")}
            value={
              <span
                className={`font-mono text-base font-semibold ${
                  isCredit
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {isCredit ? "- " : "+ "}
                {formatAmount(amount)}
              </span>
            }
          />
          <DrawerRow
            label={t("v2.bankStatements.bankDetail.labels.source")}
            value={bankAccountLabel}
          />
          <DrawerRow
            label={t("v2.bankStatements.bankDetail.labels.bankPartner")}
            multiline={3}
            value={
              transaction.description ? (
                <AppTooltip
                  content={
                    <div className="max-w-xs text-xs space-y-1">
                      <div className="font-semibold text-[11px] text-muted-foreground uppercase tracking-wider">
                        {t("v2.bankStatements.bankDetail.labels.description")}
                      </div>
                      <div className="break-words leading-relaxed select-text">
                        {transaction.description}
                      </div>
                    </div>
                  }
                  side="left"
                >
                  <span className="cursor-help underline decoration-dotted decoration-muted-foreground/50 hover:decoration-foreground transition-colors">
                    {partnerName}
                  </span>
                </AppTooltip>
              ) : (
                partnerName
              )
            }
          />
        </div>
      </DrawerSection>

      {/* Khối 2: Thiết lập & Phân loại ERP (Editable) */}
      <DrawerSection
        title={t(
          "v2.bankStatements.bankDetail.labels.settingsAndClassification",
        )}
      >
        {editMode ? (
          <div className="grid gap-3">
            <DrawerField
              label={t("v2.bankStatements.bankDetail.labels.branch")}
            >
              <V2MultiCombobox
                options={branchOptions}
                value={draft.branchIds}
                onValueChange={props.onBranchChange}
              />
            </DrawerField>
            <DrawerField
              label={t("v2.bankStatements.bankDetail.labels.partner")}
            >
              <BusinessPartnerPicker
                direction={direction}
                value={draft.partnerValue}
                selectedLabel={draft.partnerLabel}
                onValueChange={props.onPartnerChange}
              />
            </DrawerField>
            <DrawerField label={t("v2.bankStatements.bankDetail.labels.note")}>
              <V2Textarea
                className="min-h-20"
                value={draft.description}
                onChange={(e) => props.onDescriptionChange(e.target.value)}
              />
            </DrawerField>
            <CashClassificationFields
              classification={draft.classification}
              purpose={draft.purpose}
              editMode
              onClassificationChange={props.onClassificationChange}
              onPurposeChange={props.onPurposeChange}
              t={t}
            />
          </div>
        ) : (
          <div className="space-y-1">
            <DrawerRow
              label={t("v2.bankStatements.bankDetail.labels.branch")}
              value={branchLabels.length ? branchLabels.join(", ") : empty}
            />
            <DrawerRow
              label={t("v2.bankStatements.bankDetail.labels.partner")}
              value={draft.partnerLabel || empty}
            />
            <DrawerRow
              label={t("v2.bankStatements.bankDetail.labels.note")}
              value={draft.description || empty}
            />
            <CashClassificationFields
              classification={draft.classification}
              purpose={draft.purpose}
              editMode={false}
              onClassificationChange={() => undefined}
              onPurposeChange={() => undefined}
              t={t}
            />
          </div>
        )}
      </DrawerSection>
    </div>
  );
}

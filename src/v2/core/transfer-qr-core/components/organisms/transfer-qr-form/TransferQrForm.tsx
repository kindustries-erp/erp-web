import * as React from "react";
import { V2Input, V2NumberInput, V2Text } from "@/v2/shared/components/atoms";
import type { V2ComboboxOption } from "@/v2/shared/components/molecules/v2-combobox";
import { DrawerSection } from "@/v2/shared/components/molecules/v2-drawer-section";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { DEFAULT_BANK_OPTIONS } from "../../../domain/constants/defaultBankOptions";
import {
  MAX_VND_AMOUNT,
  sanitizeTransferContent,
} from "../../../domain/rules/vietQrPayload";
import type {
  TransferQrAccountOption,
  TransferQrErrors,
  TransferQrFormState,
} from "../../../transferQr.types";
import { TransferQrRecipientFields } from "./TransferQrRecipientFields";

export interface TransferQrFormProps {
  form: TransferQrFormState;
  errors: TransferQrErrors;
  accounts: readonly TransferQrAccountOption[];
  onPatch: (patch: Partial<TransferQrFormState>) => void;
  bankOptions?: V2ComboboxOption[];
  onBankScrollBottom?: () => void;
  onBankSearchChange?: (q: string) => void;
  isBanksLoading?: boolean;
}

type TouchedFields = Partial<Record<keyof TransferQrErrors, boolean>>;

const renderErr = (err?: string) =>
  err ? (
    <V2Text variant="body-sm" className="text-destructive">
      {err}
    </V2Text>
  ) : null;

export function TransferQrForm({
  form,
  errors,
  accounts,
  onPatch,
  bankOptions = DEFAULT_BANK_OPTIONS,
  onBankScrollBottom,
  onBankSearchChange,
  isBanksLoading,
}: TransferQrFormProps) {
  const { t } = useV2Translation();
  const [touched, setTouched] = React.useState<TouchedFields>({});
  const touch = (field: keyof TransferQrErrors) =>
    setTouched((prev) => (prev[field] ? prev : { ...prev, [field]: true }));

  const errorText = (field: keyof TransferQrErrors) => {
    const code = errors[field];
    return code ? t(`v2.transferQr.errors.${code}`) : undefined;
  };
  const visibleError = (field: keyof TransferQrErrors) =>
    touched[field] ? errorText(field) : undefined;

  const contentOnQr = sanitizeTransferContent(form.content);

  return (
    <div className="flex flex-col gap-4">
      <TransferQrRecipientFields
        form={form}
        accounts={accounts}
        bankOptions={bankOptions}
        onPatch={onPatch}
        touch={touch}
        visibleError={visibleError}
        renderErr={renderErr}
        onBankScrollBottom={onBankScrollBottom}
        onBankSearchChange={onBankSearchChange}
        isBanksLoading={isBanksLoading}
      />

      <DrawerSection
        title={t("v2.transferQr.sections.amountAndContent")}
        collapsible={false}
      >
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <V2Text variant="body-sm">
              {t("v2.transferQr.fields.amount")}
            </V2Text>
            <V2NumberInput
              value={form.amount}
              onValueChange={(amount) => onPatch({ amount })}
              placeholder={t("v2.transferQr.placeholders.amount")}
              aria-label={t("v2.transferQr.fields.amount")}
              max={MAX_VND_AMOUNT}
              className={
                visibleError("amount") ? "border-destructive" : undefined
              }
            />
            {renderErr(visibleError("amount"))}
          </div>
          <div className="flex flex-col gap-1">
            <V2Text variant="body-sm">
              {t("v2.transferQr.fields.content")}
            </V2Text>
            <V2Input
              value={form.content}
              onChange={(e) => onPatch({ content: e.target.value })}
              placeholder={t("v2.transferQr.placeholders.content")}
              aria-label={t("v2.transferQr.fields.content")}
              maxLength={95}
            />
            <V2Text variant="caption">
              {t("v2.transferQr.hints.contentLimit")}
            </V2Text>
            {contentOnQr !== form.content.trim() && contentOnQr && (
              <V2Text variant="caption">
                {t("v2.transferQr.hints.contentOnQr")} {contentOnQr}
              </V2Text>
            )}
          </div>
        </div>
      </DrawerSection>
    </div>
  );
}

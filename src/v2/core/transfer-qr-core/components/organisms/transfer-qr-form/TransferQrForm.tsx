import * as React from "react";
import { V2Input, V2NumberInput, V2Text } from "@/v2/shared/components/atoms";
import { V2Combobox } from "@/v2/shared/components/molecules/v2-combobox";
import { DrawerSection } from "@/v2/shared/components/molecules/v2-drawer-section";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { VIETQR_BANKS } from "../../../domain/constants/vietQrBanks";
import {
  MAX_VND_AMOUNT,
  sanitizeTransferContent,
} from "../../../domain/rules/vietQrPayload";
import {
  TransferQrMode,
  type TransferQrAccountOption,
  type TransferQrErrors,
  type TransferQrFormState,
} from "../../../transferQr.types";

export interface TransferQrFormProps {
  form: TransferQrFormState;
  errors: TransferQrErrors;
  accounts: readonly TransferQrAccountOption[];
  onPatch: (patch: Partial<TransferQrFormState>) => void;
}

type TouchedFields = Partial<Record<keyof TransferQrErrors, boolean>>;

const BANK_OPTIONS = VIETQR_BANKS.map((bank) => ({
  value: bank.bin,
  label: `${bank.code} - ${bank.shortName}`,
}));

/** Form một lệnh trong section chuẩn V2. Lỗi chỉ hiện sau khi người dùng rời khỏi ô đó. */
export function TransferQrForm({
  form,
  errors,
  accounts,
  onPatch,
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

  const isReceive = form.mode === TransferQrMode.RECEIVE_FROM_CUSTOMER;
  const selectedAccount = accounts.find((item) => item.id === form.accountId);
  const needsBankFallback =
    isReceive && !!selectedAccount && !selectedAccount.bin;
  const contentOnQr = sanitizeTransferContent(form.content);

  return (
    <div className="flex flex-col gap-4">
      <DrawerSection title={t("v2.transferQr.sections.recipient")}>
        {isReceive ? (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <V2Text variant="body-sm">
                {t("v2.transferQr.fields.account")}
              </V2Text>
              <V2Combobox
                options={accounts.map((item) => ({
                  value: item.id,
                  label: item.label,
                }))}
                value={form.accountId}
                onValueChange={(accountId) => onPatch({ accountId })}
                placeholder={t("v2.transferQr.placeholders.account")}
                searchable
              />
            </div>
            {needsBankFallback && (
              <>
                <V2Text variant="body-sm">
                  {t("v2.transferQr.hints.receiveBankFallback")}
                </V2Text>
                <V2Combobox
                  options={BANK_OPTIONS}
                  value={form.bin}
                  onValueChange={(bin) => onPatch({ bin })}
                  placeholder={t("v2.transferQr.placeholders.bank")}
                  searchable
                />
              </>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <V2Text variant="body-sm">
                {t("v2.transferQr.fields.bank")}
              </V2Text>
              <V2Combobox
                options={BANK_OPTIONS}
                value={form.bin}
                onValueChange={(bin) => onPatch({ bin })}
                placeholder={t("v2.transferQr.placeholders.bank")}
                searchable
              />
            </div>
            <V2Input
              value={form.accountNumber}
              onChange={(event) =>
                onPatch({ accountNumber: event.target.value })
              }
              onBlur={() => touch("accountNumber")}
              placeholder={t("v2.transferQr.placeholders.accountNumber")}
              aria-label={t("v2.transferQr.fields.accountNumber")}
              error={visibleError("accountNumber")}
            />
            {visibleError("accountNumber") && (
              <V2Text variant="body-sm" className="text-destructive">
                {visibleError("accountNumber")}
              </V2Text>
            )}
            <V2Input
              value={form.accountName}
              onChange={(event) => onPatch({ accountName: event.target.value })}
              onBlur={() => touch("accountName")}
              placeholder={t("v2.transferQr.placeholders.accountName")}
              aria-label={t("v2.transferQr.fields.accountName")}
              error={visibleError("accountName")}
            />
            {visibleError("accountName") && (
              <V2Text variant="body-sm" className="text-destructive">
                {visibleError("accountName")}
              </V2Text>
            )}
          </div>
        )}
      </DrawerSection>

      <DrawerSection title={t("v2.transferQr.sections.transfer")}>
        <div className="flex flex-col gap-3">
          <V2NumberInput
            value={form.amount}
            max={MAX_VND_AMOUNT}
            onValueChange={(amount) => onPatch({ amount })}
            placeholder={t("v2.transferQr.placeholders.amount")}
            aria-label={t("v2.transferQr.fields.amount")}
            className={errorText("amount") ? "border-destructive" : undefined}
          />
          {errorText("amount") && (
            <V2Text variant="body-sm" className="text-destructive">
              {errorText("amount")}
            </V2Text>
          )}
          <V2Input
            value={form.content}
            onChange={(event) => onPatch({ content: event.target.value })}
            placeholder={t("v2.transferQr.placeholders.content")}
            aria-label={t("v2.transferQr.fields.content")}
          />
          <V2Text variant="body-sm">{t("v2.transferQr.hints.content")}</V2Text>
          {contentOnQr !== form.content.trim() && contentOnQr && (
            <V2Text variant="body-sm">
              {t("v2.transferQr.hints.contentOnQr")} {contentOnQr}
            </V2Text>
          )}
        </div>
      </DrawerSection>
    </div>
  );
}

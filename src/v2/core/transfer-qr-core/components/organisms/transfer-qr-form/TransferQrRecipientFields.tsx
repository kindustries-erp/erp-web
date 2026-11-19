import * as React from "react";
import { V2Image, V2Input, V2Text } from "@/v2/shared/components/atoms";
import {
  V2Combobox,
  type V2ComboboxOption,
} from "@/v2/shared/components/molecules/v2-combobox";
import { DrawerSection } from "@/v2/shared/components/molecules/v2-drawer-section";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { getBankLogoUrl } from "../../../domain/constants/defaultBankOptions";
import {
  TransferQrMode,
  type TransferQrAccountOption,
  type TransferQrFormState,
} from "../../../transferQr.types";

export interface TransferQrRecipientFieldsProps {
  form: TransferQrFormState;
  accounts: readonly TransferQrAccountOption[];
  bankOptions: V2ComboboxOption[];
  onPatch: (patch: Partial<TransferQrFormState>) => void;
  touch: (field: any) => void;
  visibleError: (field: any) => string | undefined;
  renderErr: (err?: string) => React.ReactNode;
  onBankScrollBottom?: () => void;
  onBankSearchChange?: (q: string) => void;
  isBanksLoading?: boolean;
}

const accountIcon = (item: TransferQrAccountOption) =>
  item.logoUrl || item.bankCode ? (
    <V2Image
      src={item.logoUrl || getBankLogoUrl(item.bankCode)}
      alt={item.bankCode}
      className="h-4 w-4 object-contain rounded-sm"
      loading="lazy"
    />
  ) : undefined;

export function TransferQrRecipientFields({
  form,
  accounts,
  bankOptions,
  onPatch,
  touch,
  visibleError,
  renderErr,
  onBankScrollBottom,
  onBankSearchChange,
  isBanksLoading,
}: TransferQrRecipientFieldsProps) {
  const { t } = useV2Translation();
  const isReceive = form.mode === TransferQrMode.RECEIVE_FROM_CUSTOMER;
  const currentAccount = accounts.find((a) => a.id === form.accountId);
  const needsBankFallback = isReceive && !currentAccount?.bin;

  return (
    <DrawerSection
      title={t("v2.transferQr.sections.recipient")}
      collapsible={false}
    >
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
                icon: accountIcon(item),
              }))}
              value={form.accountId}
              onValueChange={(accountId) =>
                onPatch({ accountId: accountId || "" })
              }
              placeholder={t("v2.transferQr.placeholders.account")}
            />
          </div>
          {needsBankFallback && (
            <>
              <V2Text variant="body-sm">
                {t("v2.transferQr.hints.receiveBankFallback")}
              </V2Text>
              <V2Combobox
                options={bankOptions}
                value={form.bin}
                onValueChange={(bin) => onPatch({ bin: bin || "" })}
                placeholder={t("v2.transferQr.placeholders.bank")}
                searchable
                onScrollBottom={onBankScrollBottom}
                onSearchChange={onBankSearchChange}
                loading={isBanksLoading}
              />
            </>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <V2Text variant="body-sm">{t("v2.transferQr.fields.bank")}</V2Text>
            <V2Combobox
              options={bankOptions}
              value={form.bin}
              onValueChange={(bin) => onPatch({ bin: bin || "" })}
              placeholder={t("v2.transferQr.placeholders.bank")}
              searchable
              onScrollBottom={onBankScrollBottom}
              onSearchChange={onBankSearchChange}
              loading={isBanksLoading}
            />
          </div>
          <V2Input
            value={form.accountNumber}
            onChange={(e) => onPatch({ accountNumber: e.target.value })}
            onBlur={() => touch("accountNumber")}
            placeholder={t("v2.transferQr.placeholders.accountNumber")}
            aria-label={t("v2.transferQr.fields.accountNumber")}
            error={visibleError("accountNumber")}
          />
          {renderErr(visibleError("accountNumber"))}
          <V2Input
            value={form.accountName}
            onChange={(e) => onPatch({ accountName: e.target.value })}
            onBlur={() => touch("accountName")}
            placeholder={t("v2.transferQr.placeholders.accountName")}
            aria-label={t("v2.transferQr.fields.accountName")}
            error={visibleError("accountName")}
          />
          {renderErr(visibleError("accountName"))}
        </div>
      )}
    </DrawerSection>
  );
}

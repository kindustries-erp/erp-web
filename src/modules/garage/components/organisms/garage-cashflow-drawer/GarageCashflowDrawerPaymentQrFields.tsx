import React from "react";
import { V2Input, V2NumberInput, V2Text } from "@/v2/shared/components/atoms";
import { V2Combobox } from "@/v2/shared/components/molecules/v2-combobox";
import { useT } from "@/core/i18n";
import type { useGarageCashflowPaymentQr } from "./useGarageCashflowPaymentQr";

export interface GarageCashflowDrawerPaymentQrFieldsProps {
  paymentQr: ReturnType<typeof useGarageCashflowPaymentQr>;
}

export const GarageCashflowDrawerPaymentQrFields: React.FC<
  GarageCashflowDrawerPaymentQrFieldsProps
> = ({ paymentQr }) => {
  const t = useT();
  const {
    isReceipt,
    companyAccounts,
    bankOptions,
    isBanksLoading,
    onScrollBottom,
    onSearchChange,
    accountId,
    handleSelectCompanyAccount,
    bin,
    handleSelectPartnerBank,
    accountNumber,
    setAccountNumber,
    accountName,
    setAccountName,
    amount,
    setAmount,
    content,
    setContent,
  } = paymentQr;

  return (
    <div className="space-y-3">
      {isReceipt ? (
        <div className="space-y-1">
          <V2Text variant="caption" className="text-slate-600 font-medium">
            {t(
              "garage:cashflowDrawer.companyAccount",
              "Tài khoản công ty nhận tiền",
            )}
          </V2Text>
          <V2Combobox
            options={companyAccounts.map((acc) => ({
              value: acc.id,
              label: acc.label,
            }))}
            value={accountId}
            onValueChange={(val) => val && handleSelectCompanyAccount(val)}
            placeholder={t(
              "garage:cashflowDrawer.selectCompanyAccount",
              "Chọn tài khoản nhận",
            )}
          />
        </div>
      ) : (
        <>
          <div className="space-y-1">
            <V2Text variant="caption" className="text-slate-600 font-medium">
              {t("garage:cashflowDrawer.partnerBank", "Ngân hàng thụ hưởng")}
            </V2Text>
            <V2Combobox
              options={bankOptions}
              value={bin}
              onValueChange={(val) => val && handleSelectPartnerBank(val)}
              placeholder={t(
                "garage:cashflowDrawer.selectBank",
                "Chọn ngân hàng",
              )}
              searchable
              onScrollBottom={onScrollBottom}
              onSearchChange={onSearchChange}
              loading={isBanksLoading}
            />
          </div>
          <div className="space-y-1">
            <V2Text variant="caption" className="text-slate-600 font-medium">
              {t(
                "garage:cashflowDrawer.accountNumber",
                "Số tài khoản nhận tiền",
              )}
            </V2Text>
            <V2Input
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder={t(
                "garage:cashflowDrawer.accountNumberPlaceholder",
                "Nhập số tài khoản",
              )}
            />
          </div>
          <div className="space-y-1">
            <V2Text variant="caption" className="text-slate-600 font-medium">
              {t(
                "garage:cashflowDrawer.accountName",
                "Tên người nhận (tùy chọn)",
              )}
            </V2Text>
            <V2Input
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder={t(
                "garage:cashflowDrawer.accountNamePlaceholder",
                "Ví dụ: NGUYEN VAN A",
              )}
            />
          </div>
        </>
      )}

      <div className="space-y-1">
        <V2Text variant="caption" className="text-slate-600 font-medium">
          {t("garage:cashflowDrawer.amountVnd", "Số tiền thanh toán (VND)")}
        </V2Text>
        <V2NumberInput
          value={amount}
          onValueChange={(val) => setAmount(val)}
          placeholder={t(
            "garage:cashflowDrawer.amountPlaceholder",
            "Nhập số tiền",
          )}
        />
      </div>

      <div className="space-y-1">
        <V2Text variant="caption" className="text-slate-600 font-medium">
          {t("garage:cashflowDrawer.transferContent", "Nội dung chuyển khoản")}
        </V2Text>
        <V2Input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onBlur={() => setContent(content.trim())}
          placeholder={t(
            "garage:cashflowDrawer.contentPlaceholder",
            "Nội dung",
          )}
          maxLength={95}
        />
      </div>
    </div>
  );
};

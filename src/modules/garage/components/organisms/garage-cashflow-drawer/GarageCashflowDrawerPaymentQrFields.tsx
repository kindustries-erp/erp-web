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
    content,
    setContent,
    readOnly,
    accountNumberInvalid,
  } = paymentQr;
  const accountNumberError = accountNumberInvalid
    ? t(
        "garage:cashflowDrawer.accountNumberInvalid",
        "Số tài khoản chỉ gồm 1-19 ký tự chữ hoặc số",
      )
    : undefined;

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
            disabled={readOnly}
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
              disabled={readOnly}
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
              disabled={readOnly}
              error={accountNumberError}
              aria-invalid={accountNumberInvalid || undefined}
              placeholder={t(
                "garage:cashflowDrawer.accountNumberPlaceholder",
                "Nhập số tài khoản",
              )}
            />
            {accountNumberError && (
              <V2Text variant="caption" className="text-destructive">
                {accountNumberError}
              </V2Text>
            )}
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
              disabled={readOnly}
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
        {/* Số tiền QR luôn bằng số tiền phiếu, sửa ở phần thông tin chung. */}
        <V2NumberInput
          value={amount}
          onValueChange={() => undefined}
          disabled
          aria-label={t(
            "garage:cashflowDrawer.amountVnd",
            "Số tiền thanh toán (VND)",
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
          disabled={readOnly}
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

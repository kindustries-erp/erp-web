import {
  resolveBankBin,
  getVietQrCdnLogoUrl,
  type TransferQrAccountOption,
} from "@/v2/core/transfer-qr-core";

/** Tài khoản ngân hàng công ty theo dữ liệu ERP (`erp_bank_accounts`). */
export interface TransferQrBankStatementsAccount {
  id: string;
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
}

/**
 * Map tài khoản ERP sang kiểu của lõi. `bankCode` là chuỗi tự do,
 * nên mã BIN được khớp qua `resolveBankBin`; không khớp thì để null.
 */
export function toTransferQrAccountOptions(
  accounts: readonly TransferQrBankStatementsAccount[],
): TransferQrAccountOption[] {
  return accounts.map((account) => {
    const bank = resolveBankBin({
      bankCode: account.bankCode,
      bankName: account.bankName,
    });
    const bankCode = bank?.code ?? account.bankCode;
    const logoUrl =
      bank?.logoUrl ?? (bankCode ? getVietQrCdnLogoUrl(bankCode) : null);
    return {
      id: account.id,
      label: `${bankCode} - ${account.accountNumber}`,
      bankCode,
      bin: bank?.bin ?? null,
      accountNumber: account.accountNumber,
      accountName: account.accountName,
      logoUrl,
    };
  });
}

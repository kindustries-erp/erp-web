import * as React from "react";
import { useCompanyProfile } from "@/core/api/companyProfileApi";
import { TransferQrDrawer } from "@/v2/core/transfer-qr-core";
import {
  toTransferQrAccountOptions,
  type TransferQrBankStatementsAccount,
} from "../transferQrBankStatements.config";

export interface TransferQrBankStatementsDrawerProps {
  open: boolean;
  onClose: () => void;
  accounts: readonly TransferQrBankStatementsAccount[];
}

/** Lớp ghép: đưa tài khoản công ty của sao kê ngân hàng và hồ sơ công ty vào drawer QR của lõi. */
export function TransferQrBankStatementsDrawer({
  open,
  onClose,
  accounts,
}: TransferQrBankStatementsDrawerProps) {
  const { data: companyProfile } = useCompanyProfile();

  const options = React.useMemo(
    () => toTransferQrAccountOptions(accounts),
    [accounts],
  );

  const companyInfo = React.useMemo(() => {
    if (!companyProfile) return undefined;
    return {
      companyName: companyProfile.company_name || undefined,
      taxCode: companyProfile.tax_code ?? undefined,
      logo: companyProfile.logo ?? undefined,
    };
  }, [companyProfile]);

  return (
    <TransferQrDrawer
      open={open}
      onClose={onClose}
      accounts={options}
      companyInfo={companyInfo}
    />
  );
}

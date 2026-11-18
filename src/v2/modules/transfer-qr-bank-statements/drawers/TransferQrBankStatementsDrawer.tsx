import * as React from "react";
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

/** Lớp ghép: đưa tài khoản công ty của sao kê ngân hàng vào drawer QR của lõi. */
export function TransferQrBankStatementsDrawer({
  open,
  onClose,
  accounts,
}: TransferQrBankStatementsDrawerProps) {
  const options = React.useMemo(
    () => toTransferQrAccountOptions(accounts),
    [accounts],
  );
  return <TransferQrDrawer open={open} onClose={onClose} accounts={options} />;
}

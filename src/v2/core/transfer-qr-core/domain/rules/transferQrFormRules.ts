import { VIETQR_BANKS } from "../constants/vietQrBanks";
import { isValidAccountNumber, isValidVndAmount } from "./vietQrPayload";
import {
  TransferQrMode,
  type TransferQrAccountOption,
  type TransferQrErrors,
  type TransferQrFormState,
} from "../../transferQr.types";

export const EMPTY_TRANSFER_QR_FORM: TransferQrFormState = {
  mode: TransferQrMode.PAY_TO_SUPPLIER,
  accountId: null,
  bin: null,
  accountNumber: "",
  accountName: "",
  amount: null,
  content: "",
};

export interface ResolvedTransferTarget {
  bin: string | null;
  bankCode: string;
  accountNumber: string;
  accountName: string;
}

/** Xác định người nhận và mã BIN theo chế độ đang chọn. */
export function resolveTransferTarget(
  form: TransferQrFormState,
  accounts: readonly TransferQrAccountOption[],
  companyName?: string,
): ResolvedTransferTarget | null {
  if (form.mode === TransferQrMode.PAY_TO_SUPPLIER) {
    const bankCode =
      VIETQR_BANKS.find((bank) => bank.bin === form.bin)?.code ?? "";
    return {
      bin: form.bin,
      bankCode,
      accountNumber: form.accountNumber.trim(),
      accountName: form.accountName.trim(),
    };
  }
  const account = accounts.find((item) => item.id === form.accountId);
  if (!account) return null;
  const fallbackCode = VIETQR_BANKS.find((bank) => bank.bin === form.bin)?.code;
  const resolvedAccountName = (companyName || account.accountName).trim();
  return {
    bin: account.bin ?? form.bin,
    bankCode:
      account.bin === null && fallbackCode ? fallbackCode : account.bankCode,
    accountNumber: account.accountNumber.trim(),
    accountName: resolvedAccountName,
  };
}

export function validateTransferQrForm(
  form: TransferQrFormState,
  target: ResolvedTransferTarget | null,
): TransferQrErrors {
  const errors: TransferQrErrors = {};
  if (form.amount !== null && !isValidVndAmount(form.amount))
    errors.amount = "invalidAmount";

  if (form.mode === TransferQrMode.RECEIVE_FROM_CUSTOMER) {
    if (!target) errors.account = "required";
    else if (!target.bin) errors.bin = "required";
    else if (!isValidAccountNumber(target.accountNumber))
      errors.accountNumber = "invalidAccountNumber";
    return errors;
  }

  if (!target?.bin) errors.bin = "required";
  if (!target?.accountNumber) errors.accountNumber = "required";
  else if (!isValidAccountNumber(target.accountNumber))
    errors.accountNumber = "invalidAccountNumber";
  return errors;
}

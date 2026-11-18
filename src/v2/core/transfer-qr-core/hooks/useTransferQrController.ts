import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { VIETQR_BANKS } from "../domain/constants/vietQrBanks";
import {
  buildTransferQrFileName,
  buildVietQrPayload,
  isValidAccountNumber,
  isValidVndAmount,
} from "../domain/rules/vietQrPayload";
import {
  TransferQrMode,
  type TransferQrAccountOption,
  type TransferQrErrors,
  type TransferQrFormState,
} from "../transferQr.types";

export const EMPTY_TRANSFER_QR_FORM: TransferQrFormState = {
  mode: TransferQrMode.PAY_TO_SUPPLIER,
  accountId: null,
  bin: null,
  accountNumber: "",
  accountName: "",
  amount: null,
  content: "",
};

interface ResolvedTarget {
  bin: string | null;
  bankCode: string;
  accountNumber: string;
  accountName: string;
}

/** Xác định người nhận và mã BIN theo chế độ đang chọn. */
export function resolveTransferTarget(
  form: TransferQrFormState,
  accounts: readonly TransferQrAccountOption[],
): ResolvedTarget | null {
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
  // BIN dự phòng do người dùng chọn tay thì mã viết tắt phải theo BIN đó.
  const fallbackCode = VIETQR_BANKS.find((bank) => bank.bin === form.bin)?.code;
  return {
    bin: account.bin ?? form.bin,
    bankCode:
      account.bin === null && fallbackCode ? fallbackCode : account.bankCode,
    accountNumber: account.accountNumber.trim(),
    accountName: account.accountName.trim(),
  };
}

export function validateTransferQrForm(
  form: TransferQrFormState,
  target: ResolvedTarget | null,
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
  if (!target?.accountName) errors.accountName = "required";
  return errors;
}

/**
 * Điều khiển toàn bộ drawer QR: giữ form, kiểm tra, tạo chuỗi VietQR,
 * render ảnh QR bằng thư viện `qrcode` (chạy hoàn toàn trên trình duyệt) và tải PNG.
 */
export function useTransferQrController({
  open,
  accounts,
}: {
  open: boolean;
  accounts: readonly TransferQrAccountOption[];
}) {
  const [form, setForm] = useState<TransferQrFormState>(EMPTY_TRANSFER_QR_FORM);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!open) setForm(EMPTY_TRANSFER_QR_FORM);
  }, [open]);

  // Đổi chế độ thì xóa BIN cũ: BIN của chế độ trả tiền không được rò sang chế độ nhận tiền.
  const patchForm = (patch: Partial<TransferQrFormState>) =>
    setForm((prev) => {
      const modeChanged = patch.mode !== undefined && patch.mode !== prev.mode;
      const base = modeChanged ? { ...prev, bin: null } : prev;
      return { ...base, ...patch };
    });

  const target = useMemo(
    () => resolveTransferTarget(form, accounts),
    [form, accounts],
  );
  const errors = useMemo(
    () => validateTransferQrForm(form, target),
    [form, target],
  );
  const isValid = Object.keys(errors).length === 0 && !!target?.bin;

  const numericAmount = form.amount;

  const payload =
    isValid && target?.bin
      ? buildVietQrPayload({
          bin: target.bin,
          accountNumber: target.accountNumber,
          amount: numericAmount,
          content: form.content,
        })
      : null;

  useEffect(() => {
    let cancelled = false;
    if (!payload) {
      setQrDataUrl(null);
      return;
    }
    QRCode.toDataURL(payload, {
      margin: 1,
      width: 320,
      errorCorrectionLevel: "M",
    })
      .then((url: string) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl(null);
      });
    return () => {
      cancelled = true;
    };
  }, [payload]);

  const fileName =
    target && payload
      ? buildTransferQrFileName({
          bankCode: target.bankCode || target.bin || "BANK",
          accountNumber: target.accountNumber,
          amount: numericAmount,
        })
      : null;

  const download = () => {
    if (!qrDataUrl || !fileName) return;
    const anchor = document.createElement("a");
    anchor.href = qrDataUrl;
    anchor.download = fileName;
    anchor.click();
  };

  return {
    form,
    patchForm,
    target,
    errors,
    qrDataUrl,
    canDownload: !!qrDataUrl,
    download,
  };
}

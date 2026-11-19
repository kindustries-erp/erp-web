import { useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";
import {
  buildTransferQrFileName,
  buildVietQrPayload,
} from "../domain/rules/vietQrPayload";
import {
  EMPTY_TRANSFER_QR_FORM,
  resolveTransferTarget,
  validateTransferQrForm,
} from "../domain/rules/transferQrFormRules";
import {
  buildPaymentCardFileName,
  exportCardImage,
} from "../helpers/exportCardImage";
import type {
  TransferQrAccountOption,
  TransferQrFormState,
} from "../transferQr.types";

export {
  EMPTY_TRANSFER_QR_FORM,
  resolveTransferTarget,
  validateTransferQrForm,
};

/**
 * Điều khiển toàn bộ drawer QR: giữ form, kiểm tra, tạo chuỗi VietQR,
 * render ảnh QR bằng thư viện `qrcode` (chạy hoàn toàn trên trình duyệt) và tải PNG.
 */
export function useTransferQrController({
  open,
  accounts,
  companyName,
}: {
  open: boolean;
  accounts: readonly TransferQrAccountOption[];
  companyName?: string;
}) {
  const [form, setForm] = useState<TransferQrFormState>(EMPTY_TRANSFER_QR_FORM);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

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
    () => resolveTransferTarget(form, accounts, companyName),
    [form, accounts, companyName],
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

  const rawFileName =
    target && payload
      ? buildTransferQrFileName({
          bankCode: target.bankCode || target.bin || "BANK",
          accountNumber: target.accountNumber,
          amount: numericAmount,
        })
      : null;

  const cardFileName =
    target && payload
      ? buildPaymentCardFileName({
          bankCode: target.bankCode || target.bin || "BANK",
          accountNumber: target.accountNumber,
          amount: numericAmount,
          mode: form.mode,
        })
      : null;

  const downloadRaw = () => {
    if (!qrDataUrl || !rawFileName) return;
    const anchor = document.createElement("a");
    anchor.href = qrDataUrl;
    anchor.download = rawFileName;
    anchor.click();
  };

  const downloadCard = async (el?: HTMLElement | null): Promise<boolean> => {
    const targetEl = el ?? cardRef.current;
    if (!targetEl || !cardFileName) return false;
    setIsExporting(true);
    try {
      return await exportCardImage({
        cardElement: targetEl,
        fileName: cardFileName,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const download = async (el?: HTMLElement | null) => {
    const targetEl = el ?? cardRef.current;
    if (targetEl) {
      const ok = await downloadCard(targetEl);
      if (ok) return;
    }
    downloadRaw();
  };

  return {
    form,
    patchForm,
    target,
    errors,
    qrDataUrl,
    cardRef,
    isExporting,
    canDownload: !!qrDataUrl && !isExporting,
    download,
    downloadCard,
    downloadRaw,
  };
}

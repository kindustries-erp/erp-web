import { toPng } from "html-to-image";
import { downloadDataUrl } from "./downloadBlob";
import { TransferQrMode } from "../transferQr.types";

export interface ExportCardImageOptions {
  cardElement: HTMLElement;
  fileName: string;
}

export function buildPaymentCardFileName(parts: {
  bankCode: string;
  accountNumber: string;
  amount?: number | null;
  mode?: TransferQrMode;
}): string {
  const amountPart = parts.amount ? `_${parts.amount}` : "";
  const prefix =
    parts.mode === TransferQrMode.RECEIVE_FROM_CUSTOMER
      ? "The_Nhan_Tien"
      : "Lenh_Thanh_Toan";
  return `${prefix}_${parts.bankCode}_${parts.accountNumber}${amountPart}.png`;
}

const IMAGE_WAIT_TIMEOUT_MS = 1500;

/** Đợi các thẻ <img> bên trong DOM thẻ tải/decode xong (tối đa 1.5s) trước khi chụp PNG. */
async function waitForCardImages(cardElement: HTMLElement): Promise<void> {
  const imgs = Array.from(cardElement.querySelectorAll("img"));
  if (imgs.length === 0) return;

  await Promise.race([
    Promise.all(
      imgs.map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise<void>((resolve) => {
          img.addEventListener("load", () => resolve(), { once: true });
          img.addEventListener("error", () => resolve(), { once: true });
        });
      }),
    ),
    new Promise<void>((resolve) => setTimeout(resolve, IMAGE_WAIT_TIMEOUT_MS)),
  ]);
}

/** Chuyển phần tử HTML thẻ thanh toán thành data URL ảnh PNG chất lượng cao (2x DPI). */
export async function cardElementToPng(
  cardElement: HTMLElement,
): Promise<string> {
  await waitForCardImages(cardElement);
  return toPng(cardElement, {
    quality: 0.95,
    pixelRatio: 2,
    backgroundColor: "#ffffff",
    cacheBust: true,
  });
}

/** Xuất phần tử HTML của Thẻ thanh toán thành file ảnh PNG độ nét cao (2x DPI). */
export async function exportCardImage({
  cardElement,
  fileName,
}: ExportCardImageOptions): Promise<boolean> {
  try {
    const dataUrl = await cardElementToPng(cardElement);
    downloadDataUrl(dataUrl, fileName);
    return true;
  } catch (error) {
    console.error("Export card image failed:", error);
    return false;
  }
}

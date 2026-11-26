import { useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";
import {
  buildBatchRowView,
  isEmptyBatchRow,
  type TransferQrBatchRowView,
} from "../domain/rules/batchRowView";
import {
  createBatchRow,
  MAX_BATCH_ROWS,
  type TransferQrBatchRow,
} from "../domain/rules/batchRows";
import { parsePastedRows } from "../domain/rules/parsePastedRows";
import {
  downloadBatchPdf,
  downloadBatchZip,
  downloadRowCard,
  type BatchDownloadItem,
} from "../helpers/batchDownloads";

export type { TransferQrBatchRowView } from "../domain/rules/batchRowView";

export interface TransferQrPasteNotice {
  skippedHeader: boolean;
  /** Có dòng bị bỏ vì vượt giới hạn số lệnh */
  truncated: boolean;
}

const QR_OPTIONS = {
  margin: 1,
  width: 320,
  errorCorrectionLevel: "H" as const,
};

/**
 * Điều khiển drawer nhiều lệnh: danh sách dòng, dán từ Excel, mã QR theo từng dòng
 * (cache theo chuỗi VietQR) và tải PNG / ZIP / PDF. Mọi dữ liệu chỉ nằm trong state.
 */
export function useTransferQrBatchController({ open }: { open: boolean }) {
  const [rows, setRows] = useState<TransferQrBatchRow[]>([]);
  const [qrCache, setQrCache] = useState<Record<string, string>>({});
  const [pasteNotice, setPasteNotice] = useState<TransferQrPasteNotice | null>(
    null,
  );
  const [downloadFailed, setDownloadFailed] = useState(false);
  const cacheRef = useRef<Record<string, string>>({});
  const seqRef = useRef(0);
  // Tăng khi đóng drawer; kết quả QR của thế hệ cũ bị bỏ, không ghi lại vào cache.
  const generationRef = useRef(0);
  // Payload đang chờ QRCode: không gọi lại khi views đổi trong lúc chờ.
  const inFlightRef = useRef<Set<string>>(new Set());
  const cardElementsRef = useRef<Map<string, HTMLElement>>(new Map());
  const nextId = () => `batch-row-${++seqRef.current}`;

  useEffect(() => {
    if (open) return;
    generationRef.current += 1;
    inFlightRef.current = new Set();
    cacheRef.current = {};
    cardElementsRef.current.clear();
    setRows([]);
    setQrCache({});
    setPasteNotice(null);
    setDownloadFailed(false);
  }, [open]);

  const views = useMemo(
    () =>
      rows.map((row, position) => buildBatchRowView(row, position, qrCache)),
    [rows, qrCache],
  );

  // Tạo QR cho payload mới; payload đã có trong cache thì không tạo lại.
  useEffect(() => {
    if (!open) return;
    const generation = generationRef.current;
    const pending = new Set<string>();
    for (const view of views) {
      if (
        view.payload &&
        !cacheRef.current[view.payload] &&
        !inFlightRef.current.has(view.payload)
      )
        pending.add(view.payload);
    }
    pending.forEach((payload) => {
      const inFlight = inFlightRef.current;
      inFlight.add(payload);
      QRCode.toDataURL(payload, QR_OPTIONS)
        .then((url: string) => {
          inFlight.delete(payload);
          if (generation !== generationRef.current) return;
          cacheRef.current = { ...cacheRef.current, [payload]: url };
          setQrCache(cacheRef.current);
        })
        .catch(() => inFlight.delete(payload));
    });
  }, [views, open]);

  const canAddRow = rows.length < MAX_BATCH_ROWS;
  const addRow = () =>
    setRows((prev) =>
      prev.length >= MAX_BATCH_ROWS
        ? prev
        : [...prev, createBatchRow(nextId())],
    );
  const removeRow = (id: string) =>
    setRows((prev) => prev.filter((r) => r.id !== id));
  const patchRow = (
    id: string,
    patch: Partial<Omit<TransferQrBatchRow, "id">>,
  ) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const clearRows = () => setRows([]);

  const applyPaste = (text: string) => {
    const parsed = parsePastedRows(text);
    const kept = rows.filter((r) => !isEmptyBatchRow(r));
    const room = MAX_BATCH_ROWS - kept.length;
    setPasteNotice({
      skippedHeader: parsed.skippedHeader,
      truncated: parsed.truncated || parsed.rows.length > room,
    });
    setRows((prev) => {
      const base = prev.filter((r) => !isEmptyBatchRow(r));
      const space = Math.max(0, MAX_BATCH_ROWS - base.length);
      const added = parsed.rows
        .slice(0, space)
        .map((r) => createBatchRow(nextId(), r));
      return [...base, ...added];
    });
  };

  const readyItems: BatchDownloadItem[] = views
    .filter((view) => view.valid && view.qrDataUrl !== null)
    .map((view) => ({
      fileName: view.fileName,
      qrDataUrl: view.qrDataUrl as string,
      caption: view.caption,
    }));

  const downloadRow = (view: TransferQrBatchRowView) => {
    void downloadRowCard(
      { fileName: view.fileName, qrDataUrl: view.qrDataUrl ?? "" },
      cardElementsRef.current.get(view.fileName),
    );
  };

  /** Chạy một thao tác tải hàng loạt; lỗi được ghi nhận để hiện thông báo, không để rơi thành promise bị nuốt. */
  const runBulkDownload = async (task: () => Promise<void>) => {
    try {
      await task();
      setDownloadFailed(false);
    } catch {
      setDownloadFailed(true);
    }
  };

  return {
    views,
    validCount: readyItems.length,
    canAddRow,
    pasteNotice,
    downloadFailed,
    addRow,
    removeRow,
    patchRow,
    clearRows,
    applyPaste,
    registerCardElement: (key: string, el: HTMLElement) =>
      cardElementsRef.current.set(key, el),
    unregisterCardElement: (key: string) => cardElementsRef.current.delete(key),
    downloadRow,
    downloadZip: () =>
      runBulkDownload(() =>
        downloadBatchZip(readyItems, new Date(), (fn) =>
          cardElementsRef.current.get(fn),
        ),
      ),
    downloadPdf: () => runBulkDownload(() => downloadBatchPdf(readyItems)),
  };
}

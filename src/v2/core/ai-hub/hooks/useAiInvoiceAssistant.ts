import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { extractV2ApiError } from "@/v2/shared/utils/v2ApiError";
import type {
  AiCreateRequestResult,
  AiInvoiceApi,
  AiInvoiceDraftLine,
  AiInvoicePreview,
  AiInvoiceStep,
} from "../aiHub.type";
import {
  type AiRequestContext,
  isValidDraftLine,
  toCreateRequestPayload,
  toDraftLines,
} from "./aiInvoiceDraft.helper";

export interface UseAiInvoiceAssistantOptions {
  api: AiInvoiceApi;
  /** Chi nhánh và ngày đề nghị gắn vào phiếu được tạo */
  context?: AiRequestContext;
  onCreated?: (result: AiCreateRequestResult) => void;
}

/** Trạng thái trợ lý hóa đơn: chờ file -> đang đọc -> rà soát -> đang tạo -> xong. */
export function useAiInvoiceAssistant({
  api,
  context,
  onCreated,
}: UseAiInvoiceAssistantOptions) {
  const { t } = useV2Translation();
  const [fileName, setFileName] = React.useState<string | null>(null);
  const [preview, setPreview] = React.useState<AiInvoicePreview | null>(null);
  const [lines, setLines] = React.useState<AiInvoiceDraftLine[]>([]);
  const [result, setResult] = React.useState<AiCreateRequestResult | null>(
    null,
  );
  const [error, setError] = React.useState<string | null>(null);

  const read = useMutation({
    mutationFn: (file: File) => api.previewInvoice(file),
    onSuccess: (data) => {
      setPreview(data);
      setLines(toDraftLines(data));
    },
    onError: (err) =>
      setError(
        extractV2ApiError(
          err,
          t(
            "v2.aiHub.invoice.readError",
            "Không đọc được hóa đơn. Vui lòng thử lại.",
          ),
        ),
      ),
  });

  const create = useMutation({
    mutationFn: api.createRequest,
    onSuccess: (data) => {
      setResult(data);
      onCreated?.(data);
    },
    onError: (err) =>
      setError(
        extractV2ApiError(
          err,
          t(
            "v2.aiHub.invoice.createError",
            "Không tạo được đề nghị mua. Vui lòng thử lại.",
          ),
        ),
      ),
  });

  const selectFile = (file: File) => {
    setError(null);
    setPreview(null);
    setLines([]);
    setResult(null);
    setFileName(file.name);
    read.mutate(file);
  };

  const confirm = () => {
    if (!preview || create.isPending) return;
    if (!lines.some(isValidDraftLine)) {
      setError(
        t(
          "v2.aiHub.invoice.noLines",
          "Cần ít nhất một dòng hàng để tạo đề nghị mua.",
        ),
      );
      return;
    }
    setError(null);
    create.mutate(toCreateRequestPayload(preview, lines, context));
  };

  const step: AiInvoiceStep = read.isPending
    ? "reading"
    : create.isPending
      ? "creating"
      : result
        ? "done"
        : preview
          ? "review"
          : "idle";

  return {
    step,
    fileName,
    preview,
    lines,
    result,
    error,
    selectFile,
    confirm,
    setError,
    updateLine: (key: string, patch: Partial<AiInvoiceDraftLine>) =>
      setLines((current) =>
        current.map((line) =>
          line.key === key ? { ...line, ...patch } : line,
        ),
      ),
    removeLine: (key: string) =>
      setLines((current) => current.filter((line) => line.key !== key)),
    reset: () => {
      setError(null);
      setPreview(null);
      setLines([]);
      setResult(null);
      setFileName(null);
    },
  };
}

export type AiInvoiceAssistantState = ReturnType<typeof useAiInvoiceAssistant>;

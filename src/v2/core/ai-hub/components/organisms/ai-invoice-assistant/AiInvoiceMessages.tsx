import * as React from "react";
import { V2ChatBubble, V2TypingIndicator } from "@/v2/shared/components/atoms";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { formatAmount } from "@/v2/shared/utils/v2TableFormat";
import type { AiInvoiceAssistantState } from "../../../hooks/useAiInvoiceAssistant";
import { AiInvoiceLineList } from "../../molecules/ai-invoice-line-list";

/** Chuỗi tin nhắn của trợ lý hóa đơn theo trạng thái hiện tại. */
export const AiInvoiceMessages: React.FC<{
  state: AiInvoiceAssistantState;
}> = ({ state }) => {
  const { t } = useV2Translation();
  const { step, preview, result } = state;
  const header = preview?.invoice;
  const facts = header
    ? [
        [t("v2.aiHub.invoice.seller", "Nhà cung cấp"), header.sellerName],
        [t("v2.aiHub.invoice.invoiceNo", "Số hóa đơn"), header.invoiceNo],
        [
          t("v2.aiHub.invoice.total", "Tổng tiền"),
          header.total !== null ? formatAmount(header.total) : null,
        ],
      ].filter(([, value]) => Boolean(value))
    : [];

  return (
    <>
      <V2ChatBubble>
        {t(
          "v2.aiHub.invoice.greeting",
          "Gửi ảnh hoặc file PDF hóa đơn. Tôi sẽ đọc các dòng hàng, đối chiếu mã hàng trong danh mục và lập đề nghị mua nháp để bạn kiểm tra.",
        )}
      </V2ChatBubble>
      {state.fileName && (
        <V2ChatBubble role="user">{state.fileName}</V2ChatBubble>
      )}
      {step === "reading" && (
        <V2TypingIndicator
          label={t("v2.aiHub.invoice.reading", "Đang đọc hóa đơn")}
        />
      )}
      {preview && (
        <>
          <V2ChatBubble>
            {t("v2.aiHub.invoice.summary", {
              defaultValue:
                "Đã đọc {{count}} dòng hàng. Kiểm tra mã và số lượng rồi xác nhận.",
              count: preview.lines.length,
            })}
            {facts.map(([label, value]) => `\n${label}: ${value}`).join("")}
          </V2ChatBubble>
          {preview.warnings.map((code) => (
            <V2ChatBubble
              key={code}
              className="border-[var(--warn-fg,currentColor)] bg-[var(--warn-bg,transparent)] text-[var(--warn-fg,inherit)]"
            >
              {t(`v2.aiHub.warning.${code}`, code)}
            </V2ChatBubble>
          ))}
          <V2ChatBubble plain>
            <AiInvoiceLineList
              lines={state.lines}
              disabled={step !== "review"}
              onChange={state.updateLine}
              onRemove={state.removeLine}
            />
          </V2ChatBubble>
        </>
      )}
      {step === "creating" && (
        <V2TypingIndicator
          label={t("v2.aiHub.invoice.creating", "Đang tạo đề nghị mua")}
        />
      )}
      {result && (
        <V2ChatBubble>
          {t("v2.aiHub.invoice.done", {
            defaultValue: "Đã tạo đề nghị mua {{requestNo}}.",
            requestNo: result.requestNo,
          })}
          {result.createdItems.length > 0 &&
            `\n${t("v2.aiHub.invoice.createdItems", {
              defaultValue: "Mã hàng mới: {{codes}}",
              codes: result.createdItems.map((i) => i.itemCode).join(", "),
            })}`}
        </V2ChatBubble>
      )}
      {state.error && (
        <V2ChatBubble
          role="assistant"
          aria-live="assertive"
          className="border-destructive/50 text-destructive"
        >
          {state.error}
        </V2ChatBubble>
      )}
    </>
  );
};
AiInvoiceMessages.displayName = "AiInvoiceMessages";

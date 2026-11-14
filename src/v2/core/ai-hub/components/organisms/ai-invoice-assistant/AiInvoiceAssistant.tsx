import * as React from "react";
import { Sparkles } from "lucide-react";
import { V2Button } from "@/v2/shared/components/atoms";
import { V2ChatComposer } from "@/v2/shared/components/molecules/v2-chat-composer";
import { V2FloatingChat } from "@/v2/shared/components/organisms/v2-floating-chat";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { AI_INVOICE_ACCEPT, AI_INVOICE_MAX_BYTES } from "../../../aiHub.api";
import { useAiInvoiceAssistant } from "../../../hooks/useAiInvoiceAssistant";
import { AiInvoiceMessages } from "./AiInvoiceMessages";
import type { AiInvoiceAssistantProps } from "./AiInvoiceAssistant.type";

/** Chatbot nổi: nhận ảnh/PDF hóa đơn, cho rà soát dòng hàng rồi tạo đề nghị mua. */
export const AiInvoiceAssistant: React.FC<AiInvoiceAssistantProps> = ({
  api,
  context,
  onCreated,
}) => {
  const { t } = useV2Translation();
  const [open, setOpen] = React.useState(false);
  const state = useAiInvoiceAssistant({ api, context, onCreated });
  const { step } = state;
  const busy = step === "reading" || step === "creating";

  const composer = (
    <V2ChatComposer
      accept={AI_INVOICE_ACCEPT}
      maxSizeBytes={AI_INVOICE_MAX_BYTES}
      disabled={busy}
      attachLabel={
        step === "idle"
          ? t("v2.aiHub.invoice.attach", "Chọn ảnh hoặc file hóa đơn")
          : t("v2.aiHub.invoice.attachAnother", "Đọc hóa đơn khác")
      }
      onAttach={([file]) => state.selectFile(file)}
      onReject={(reason) =>
        state.setError(
          reason === "size"
            ? t("v2.aiHub.invoice.rejectSize", "File vượt quá 10MB.")
            : t(
                "v2.aiHub.invoice.rejectType",
                "Chỉ nhận ảnh JPG, PNG, WEBP hoặc file PDF.",
              ),
        )
      }
    />
  );

  const footer =
    step === "review" || step === "creating" ? (
      <div className="flex items-center gap-2">
        <V2Button
          variant="outline"
          size="lg"
          disabled={busy}
          onClick={state.reset}
          className="min-h-11"
        >
          {t("v2.aiHub.invoice.reset", "Làm lại")}
        </V2Button>
        <V2Button
          size="lg"
          fullWidth
          isLoading={step === "creating"}
          disabled={busy}
          onClick={state.confirm}
          className="min-h-11"
        >
          {t("v2.aiHub.invoice.confirm", "Tạo đề nghị mua")}
        </V2Button>
      </div>
    ) : (
      composer
    );

  return (
    <V2FloatingChat
      open={open}
      onOpenChange={setOpen}
      title={t("v2.aiHub.invoice.title", "Trợ lý hóa đơn")}
      subtitle={t(
        "v2.aiHub.invoice.subtitle",
        "Đọc hóa đơn và lập đề nghị mua",
      )}
      launcherLabel={t("v2.aiHub.invoice.launcher", "Trợ lý AI đọc hóa đơn")}
      launcherIcon={<Sparkles className="h-5 w-5" />}
      footer={footer}
      scrollKey={`${step}-${state.lines.length}-${state.error ?? ""}`}
    >
      <AiInvoiceMessages state={state} />
    </V2FloatingChat>
  );
};
AiInvoiceAssistant.displayName = "AiInvoiceAssistant";

import * as React from "react";
import { V2Button, V2Text, V2Textarea } from "@/v2/shared/components/atoms";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type { TransferQrPasteNotice } from "../../../hooks/useTransferQrBatchController";

export interface TransferQrBatchPasteBoxProps {
  onApply: (text: string) => void;
  notice: TransferQrPasteNotice | null;
}

/** Ô dán vùng copy từ Excel (cột phân cách bằng tab) rồi thêm vào danh sách. */
export function TransferQrBatchPasteBox({
  onApply,
  notice,
}: TransferQrBatchPasteBoxProps) {
  const { t } = useV2Translation();
  const [text, setText] = React.useState("");

  const apply = () => {
    if (!text.trim()) return;
    onApply(text);
    setText("");
  };

  return (
    <div className="flex flex-col gap-2">
      <V2Text variant="body-sm">{t("v2.transferQr.batch.pasteHint")}</V2Text>
      <V2Textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        rows={4}
        placeholder={t("v2.transferQr.batch.pastePlaceholder")}
        aria-label={t("v2.transferQr.batch.pasteTitle")}
      />
      <div className="flex items-center justify-between gap-2">
        <V2Button variant="outline" onClick={apply} disabled={!text.trim()}>
          {t("v2.transferQr.batch.pasteButton")}
        </V2Button>
        {notice?.skippedHeader && (
          <V2Text variant="body-sm">
            {t("v2.transferQr.batch.notice.headerSkipped")}
          </V2Text>
        )}
      </div>
      {notice?.truncated && (
        <V2Text variant="body-sm" className="text-destructive">
          {t("v2.transferQr.batch.notice.truncated")}
        </V2Text>
      )}
    </div>
  );
}

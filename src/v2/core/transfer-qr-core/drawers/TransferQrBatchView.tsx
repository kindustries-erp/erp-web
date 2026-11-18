import * as React from "react";
import { V2Text } from "@/v2/shared/components/atoms";
import { DrawerSection } from "@/v2/shared/components/molecules/v2-drawer-section";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { TransferQrBatchActions } from "../components/molecules/transfer-qr-batch-grid/TransferQrBatchActions";
import { TransferQrBatchGrid } from "../components/molecules/transfer-qr-batch-grid/TransferQrBatchGrid";
import { TransferQrBatchPasteBox } from "../components/molecules/transfer-qr-batch-paste-box/TransferQrBatchPasteBox";
import { TransferQrBatchEditor } from "../components/organisms/transfer-qr-batch-editor/TransferQrBatchEditor";
import type {
  TransferQrBatchRowView,
  useTransferQrBatchController,
} from "../hooks/useTransferQrBatchController";

export type TransferQrBatchController = ReturnType<
  typeof useTransferQrBatchController
>;

export interface TransferQrBatchViewProps {
  batch: TransferQrBatchController;
}

/** Cột trái tab "Nhiều lệnh thanh toán": ô dán Excel và bảng dòng. */
export function TransferQrBatchContent({ batch }: TransferQrBatchViewProps) {
  const { t } = useV2Translation();
  return (
    <div className="flex flex-col gap-4">
      <DrawerSection title={t("v2.transferQr.batch.pasteTitle")}>
        <TransferQrBatchPasteBox
          onApply={batch.applyPaste}
          notice={batch.pasteNotice}
        />
      </DrawerSection>
      <DrawerSection title={t("v2.transferQr.batch.tableLabel")}>
        <TransferQrBatchEditor
          views={batch.views}
          canAddRow={batch.canAddRow}
          onAdd={batch.addRow}
          onRemove={batch.removeRow}
          onPatch={batch.patchRow}
          onClear={batch.clearRows}
        />
      </DrawerSection>
    </div>
  );
}

/** Cột phải tab "Nhiều lệnh thanh toán": tổng hợp và lưới QR các dòng hợp lệ. */
export function TransferQrBatchSidePanel({ batch }: TransferQrBatchViewProps) {
  const validViews = React.useMemo(
    () =>
      batch.views.filter(
        (view): view is TransferQrBatchRowView & { qrDataUrl: string } =>
          view.valid && view.qrDataUrl !== null,
      ),
    [batch.views],
  );

  const { t } = useV2Translation();

  return (
    <div className="flex flex-col gap-4">
      <TransferQrBatchActions
        validCount={batch.validCount}
        totalCount={batch.views.length}
      />
      {batch.downloadFailed && (
        <V2Text variant="body-sm" className="text-destructive">
          {t("v2.transferQr.batch.downloadFailed")}
        </V2Text>
      )}
      <TransferQrBatchGrid
        views={validViews}
        onDownloadRow={batch.downloadRow}
      />
    </div>
  );
}

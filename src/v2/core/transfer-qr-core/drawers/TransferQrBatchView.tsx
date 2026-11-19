import * as React from "react";
import { V2Text } from "@/v2/shared/components/atoms";
import { DrawerSection } from "@/v2/shared/components/molecules/v2-drawer-section";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { TransferQrPaymentCard } from "../components/molecules/transfer-qr-payment-card/TransferQrPaymentCard";
import { TransferQrBatchActions } from "../components/molecules/transfer-qr-batch-grid/TransferQrBatchActions";
import { TransferQrBatchGrid } from "../components/molecules/transfer-qr-batch-grid/TransferQrBatchGrid";
import { TransferQrBatchPasteBox } from "../components/molecules/transfer-qr-batch-paste-box/TransferQrBatchPasteBox";
import { TransferQrBatchEditor } from "../components/organisms/transfer-qr-batch-editor/TransferQrBatchEditor";
import {
  TransferQrMode,
  type TransferQrCompanyInfo,
} from "../transferQr.types";
import type {
  TransferQrBatchRowView,
  useTransferQrBatchController,
} from "../hooks/useTransferQrBatchController";

export type TransferQrBatchController = ReturnType<
  typeof useTransferQrBatchController
>;

export interface TransferQrBatchViewProps {
  batch: TransferQrBatchController;
  companyInfo?: TransferQrCompanyInfo;
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

/** Cột phải tab "Nhiều lệnh thanh toán": tổng hợp và danh sách QR các dòng hợp lệ. */
export function TransferQrBatchSidePanel({
  batch,
  companyInfo,
}: TransferQrBatchViewProps) {
  const validViews = React.useMemo(
    () =>
      batch.views.filter(
        (view): view is TransferQrBatchRowView & { qrDataUrl: string } =>
          view.valid && view.qrDataUrl !== null,
      ),
    [batch.views],
  );

  const totalAmount = React.useMemo(
    () => validViews.reduce((sum, v) => sum + (v.row.amount || 0), 0),
    [validViews],
  );

  const { t } = useV2Translation();

  return (
    <div className="flex flex-col gap-4">
      <TransferQrBatchActions
        validCount={batch.validCount}
        totalCount={batch.views.length}
        totalAmount={totalAmount}
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

      {/* Vùng DOM ngầm: render Thẻ thanh toán hoàn chỉnh phục vụ xuất ảnh PNG / ZIP chất lượng cao */}
      <div
        className="fixed -left-[9999px] top-0 pointer-events-none opacity-0 select-none"
        aria-hidden="true"
      >
        {validViews.map((view) => (
          <div
            key={view.row.id}
            ref={(el) => {
              if (el) batch.registerCardElement(view.fileName, el);
              else batch.unregisterCardElement(view.fileName);
            }}
          >
            <TransferQrPaymentCard
              qrDataUrl={view.qrDataUrl}
              mode={TransferQrMode.PAY_TO_SUPPLIER}
              target={{
                bin: view.row.bin,
                bankCode: view.row.bankCode,
                accountNumber: view.row.accountNumber,
                accountName: view.row.accountName,
              }}
              amount={view.row.amount}
              content={view.caption.content}
              companyInfo={companyInfo}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

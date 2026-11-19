import * as React from "react";
import { QrCode, V2Text } from "@/v2/shared/components/atoms";
import {
  V2DrawerLayout,
  V2DrawerSize,
  V2StandardDrawer,
} from "@/v2/shared/components/organisms/v2-standard-drawer";
import { DrawerSection } from "@/v2/shared/components/molecules/v2-drawer-section";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { TransferQrForm } from "../components/organisms/transfer-qr-form/TransferQrForm";
import { TransferQrPreview } from "../components/molecules/transfer-qr-preview/TransferQrPreview";
import { useTransferQrBatchController } from "../hooks/useTransferQrBatchController";
import { useTransferQrController } from "../hooks/useTransferQrController";
import {
  TRANSFER_QR_MODE_LABEL_KEY,
  TransferQrDrawerTab,
  TransferQrMode,
  type TransferQrAccountOption,
  type TransferQrCompanyInfo,
} from "../transferQr.types";
import {
  TransferQrBatchContent,
  TransferQrBatchSidePanel,
} from "./TransferQrBatchView";
import "../transferQr.locale";

export interface TransferQrDrawerProps {
  open: boolean;
  onClose: () => void;
  accounts: readonly TransferQrAccountOption[];
  companyInfo?: TransferQrCompanyInfo;
}

/** Chuỗi key của V2TabBar về enum; key lạ thì rơi về tab một mã. */
const toTab = (key: string): TransferQrDrawerTab =>
  Object.values(TransferQrDrawerTab).find((value) => value === key) ??
  TransferQrDrawerTab.SINGLE;

/** Chuỗi key của tab trái về enum; key lạ thì rơi về chế độ trả tiền. */
const toMode = (key: string): TransferQrMode =>
  Object.values(TransferQrMode).find((value) => value === key) ??
  TransferQrMode.PAY_TO_SUPPLIER;

/** Drawer QR chuyển khoản theo chuẩn V2: 2 cột, tab đầu drawer, tab con bên trái, nút ở footer. */
export function TransferQrDrawer({
  open,
  onClose,
  accounts,
  companyInfo,
}: TransferQrDrawerProps) {
  const { t } = useV2Translation();
  const vm = useTransferQrController({
    open,
    accounts,
    companyName: companyInfo?.companyName,
  });
  const batch = useTransferQrBatchController({ open });
  const [tab, setTab] = React.useState<TransferQrDrawerTab>(
    TransferQrDrawerTab.SINGLE,
  );

  React.useEffect(() => {
    if (!open) setTab(TransferQrDrawerTab.SINGLE);
  }, [open]);

  const isBatch = tab === TransferQrDrawerTab.BATCH;
  const hasSingleData =
    vm.form.accountNumber !== "" ||
    vm.form.accountName !== "" ||
    vm.form.amount !== null ||
    vm.form.content !== "";
  const hasData = isBatch ? batch.views.length > 0 : hasSingleData;

  const tabs = [
    {
      key: TransferQrDrawerTab.SINGLE,
      label: t("v2.transferQr.batch.tabSingle"),
      content: (
        <TransferQrForm
          form={vm.form}
          errors={vm.errors}
          accounts={accounts}
          onPatch={vm.patchForm}
        />
      ),
      rightPanel: (
        <DrawerSection title={t("v2.transferQr.sections.qrPreview")}>
          <div className="flex flex-col items-center gap-3">
            <TransferQrPreview
              qrDataUrl={vm.qrDataUrl}
              companyInfo={companyInfo}
              target={vm.target}
              amount={vm.form.amount}
              content={vm.form.content}
              mode={vm.form.mode}
              cardRef={vm.cardRef}
            />
            <V2Text variant="body-sm">{t("v2.transferQr.privacyNote")}</V2Text>
          </div>
        </DrawerSection>
      ),
    },
    {
      key: TransferQrDrawerTab.BATCH,
      label: t("v2.transferQr.batch.tabBatch"),
      content: <TransferQrBatchContent batch={batch} />,
      rightPanel: (
        <DrawerSection title={t("v2.transferQr.sections.qrPreview")}>
          <TransferQrBatchSidePanel batch={batch} companyInfo={companyInfo} />
        </DrawerSection>
      ),
    },
  ];

  const leftTabs = isBatch
    ? undefined
    : Object.values(TransferQrMode).map((mode) => ({
        key: mode,
        label: t(TRANSFER_QR_MODE_LABEL_KEY[mode]),
      }));

  const actions = isBatch
    ? [
        {
          label: t("v2.transferQr.batch.actions.zip"),
          disabled: batch.validCount === 0,
          onClick: () => void batch.downloadZip(),
        },
        {
          label: t("v2.transferQr.batch.actions.pdf"),
          disabled: batch.validCount === 0,
          onClick: () => void batch.downloadPdf(),
        },
      ]
    : [
        {
          label: t("v2.transferQr.actions.download"),
          primary: true,
          disabled: !vm.canDownload,
          onClick: () => void vm.download(),
        },
      ];

  return (
    <V2StandardDrawer
      open={open}
      onClose={onClose}
      title={t("v2.transferQr.title")}
      subtitle={t("v2.transferQr.subtitle")}
      icon={<QrCode className="h-4 w-4" />}
      size={V2DrawerSize.LG}
      confirmOnClose={hasData}
      layout={V2DrawerLayout.TWO_COLUMNS}
      tabs={tabs}
      activeTabKey={tab}
      onTabChange={(key) => setTab(toTab(key))}
      leftTabs={leftTabs}
      activeLeftTabKey={vm.form.mode}
      onLeftTabChange={(key) => vm.patchForm({ mode: toMode(key) })}
      actions={actions}
    />
  );
}

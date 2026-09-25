import React from "react";
import { useTranslation } from "react-i18next";
import { GarageCaseStandaloneDrawer } from "../../GarageCaseStandaloneDrawer";
import { GarageCaseSettlementDrawerModal } from "../../GarageCaseSettlementDrawerModal";
import { InvoiceSelectionDrawer } from "../../InvoiceSelectionDrawer";
import { garageApi } from "../../../api/garageApi";
import { toast } from "react-hot-toast";

interface CustomerAuxiliaryModalsProps {
  selectedCaseCode: string | null;
  drawerEditMode: boolean;
  onCloseCaseDetail: () => void;
  settlementCase: any | null;
  onCloseSettlement: () => void;
  invoiceLinkingCase: any | null;
  onCloseInvoiceLinking: () => void;
  onRefresh: () => void;
}

export const CustomerAuxiliaryModals = React.memo(
  function CustomerAuxiliaryModals({
    selectedCaseCode,
    drawerEditMode,
    onCloseCaseDetail,
    settlementCase,
    onCloseSettlement,
    invoiceLinkingCase,
    onCloseInvoiceLinking,
    onRefresh,
  }: CustomerAuxiliaryModalsProps) {
    const { t } = useTranslation(["garage", "common"]);

    return (
      <>
        {selectedCaseCode && (
          <GarageCaseStandaloneDrawer
            isOpen={Boolean(selectedCaseCode)}
            onClose={onCloseCaseDetail}
            caseCode={selectedCaseCode}
            initialEditMode={drawerEditMode}
          />
        )}

        {settlementCase && (
          <GarageCaseSettlementDrawerModal
            open={Boolean(settlementCase)}
            onClose={onCloseSettlement}
            caseId={settlementCase.id}
            caseCode={settlementCase.soChungTu}
            remainingReceivable={
              Number(settlementCase.tienConPhaiThanhToan) || 0
            }
            onSubmit={async (items) => {
              try {
                for (const item of items) {
                  await garageApi.addCaseSettlement(settlementCase.id, item);
                }
                toast.success(
                  t(
                    "cases.settlementSuccess",
                    "Đã ghi nhận cấn trừ sao kê thành công",
                  ),
                );
                onCloseSettlement();
                onRefresh();
              } catch (err: any) {
                toast.error(
                  err?.response?.data?.message ||
                    t("cases.settlementError", "Lỗi ghi nhận cấn trừ sao kê"),
                );
              }
            }}
          />
        )}

        {invoiceLinkingCase && (
          <InvoiceSelectionDrawer
            open={Boolean(invoiceLinkingCase)}
            onClose={onCloseInvoiceLinking}
            caseId={invoiceLinkingCase.id}
            caseCode={invoiceLinkingCase.soChungTu}
            defaultLinkType="OUT"
            onSuccess={onRefresh}
          />
        )}
      </>
    );
  },
);

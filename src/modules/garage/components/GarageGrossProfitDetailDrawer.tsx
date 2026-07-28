import React, { useMemo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { DrawerSection } from "@/shared/components/DrawerModal";
import {
  useGarageGrossProfitLinkedInvoices,
  useMutateGrossProfitLinkedInvoices,
  useGarageCaseByCode,
} from "../hooks/useGarage";
import { GarageCaseLinkedDocuments } from "./GarageCaseLinkedDocuments";
import { GarageCasePreview } from "./GarageCasePreview";
import { KgaraCaseStatusBadge } from "./KgaraCaseStatusBadge";

interface GarageGrossProfitDetailDrawerProps {
  isOpen: boolean;
  grossProfitData: any | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function GarageGrossProfitDetailDrawer({
  isOpen,
  grossProfitData,
  onClose,
  onSuccess,
}: GarageGrossProfitDetailDrawerProps) {
  const { t } = useTranslation("garage");
  const { data: caseByCode } = useGarageCaseByCode(grossProfitData?.VuViecCode);

  const [drawerMode, setDrawerMode] = useState<"view" | "edit">("view");
  const [pendingChanges, setPendingChanges] = useState<any[]>([]);

  const {
    data: linkedInvoices,
    isLoading: isLoadingLinked,
    refetch,
  } = useGarageGrossProfitLinkedInvoices(grossProfitData?.id);

  const { addMutation, removeMutation } = useMutateGrossProfitLinkedInvoices();

  const linkedDocs = useMemo(() => {
    if (!linkedInvoices) return [];
    return linkedInvoices.map((inv: any) => ({
      id: inv.id,
      type: inv.linkType === "IN" ? "HĐ Đầu vào" : "HĐ Đầu ra",
      refNo: inv.invoiceNo
        ? `${inv.invoiceNo} - ${inv.buyerName || inv.sellerName || "---"}`
        : "Không tìm thấy hóa đơn",
      refId: inv.invoiceId,
      detail: inv.note,
    }));
  }, [linkedInvoices]);

  useEffect(() => {
    if (isOpen) {
      setDrawerMode("view");
      setPendingChanges([]);
    }
  }, [isOpen, grossProfitData?.id]);

  if (!grossProfitData) return null;

  const caseData = caseByCode || grossProfitData.caseData;

  return (
    <StandardFormDrawer
      open={isOpen}
      mode={drawerMode}
      onToggleEdit={() =>
        setDrawerMode(drawerMode === "view" ? "edit" : "view")
      }
      onClose={onClose}
      title={`Chi tiết Lợi nhuận: ${grossProfitData.VuViecCode || ""}`}
      titleExtra={
        caseData ? (
          <KgaraCaseStatusBadge status={caseData.tenTinhTrangDichVu} />
        ) : undefined
      }
      rightPanelTitle={t("cases.drawer.overview")}
      actions={
        drawerMode === "edit"
          ? [
              {
                label: "Hủy",
                variant: "outline" as const,
                onClick: () => {
                  setPendingChanges([]);
                  setDrawerMode("view");
                },
                disabled: addMutation.isPending || removeMutation.isPending,
              },
              {
                label: "Lưu thay đổi",
                onClick: async () => {
                  if (grossProfitData?.id) {
                    for (const change of pendingChanges) {
                      if (change.action === "ADD") {
                        await addMutation.mutateAsync({
                          grossProfitId: grossProfitData.id,
                          invoiceId: change.refId,
                          linkType: change.linkType,
                        });
                      } else if (change.action === "REMOVE") {
                        await removeMutation.mutateAsync({
                          grossProfitId: grossProfitData.id,
                          linkedId: change.id,
                        });
                      }
                    }
                  }
                  setPendingChanges([]);
                  setDrawerMode("view");
                  refetch();
                  if (onSuccess) onSuccess();
                },
                loading: addMutation.isPending || removeMutation.isPending,
              },
            ]
          : []
      }
      leftPanel={
        <div className="space-y-4 pt-2">
          <GarageCaseLinkedDocuments
            linkedDocs={linkedDocs}
            editMode={drawerMode === "edit"}
            pendingChanges={pendingChanges}
            setPendingChanges={setPendingChanges}
            isLoading={isLoadingLinked}
          />
          {drawerMode === "view" && caseData && (
            <GarageCasePreview
              caseData={caseData}
              grossProfit={grossProfitData}
            />
          )}
        </div>
      }
      rightPanel={
        <div className="space-y-4">
          <DrawerSection
            title={t("cases.drawer.customerAndVehicle")}
            collapsible
          >
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-[100px_1fr] gap-2">
                <span className="text-gray-500">
                  {t("cases.drawer.customer")}:
                </span>
                <span className="font-medium text-gray-900">
                  {grossProfitData.TenKhachHang || "-"}
                </span>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-2">
                <span className="text-gray-500">
                  {t("cases.drawer.licensePlate")}:
                </span>
                <span className="font-medium text-gray-900">
                  {caseData?.bienSoXe || "-"}
                </span>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-2">
                <span className="text-gray-500">{t("cases.drawer.car")}:</span>
                <span className="font-medium text-gray-900">
                  {caseData?.loaiXe || "-"}
                </span>
              </div>
            </div>
          </DrawerSection>
        </div>
      }
    />
  );
}

import React, { useState, useEffect } from "react";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { DrawerSection, DrawerRow } from "@/shared/components/DrawerModal";
import { useTranslation } from "react-i18next";
import { useGarageStore } from "../store/garageStore";
import {
  useGarageCaseGrossProfit,
  useSyncGarageCaseDetail,
  useGarageCaseByCode,
} from "../hooks/useGarage";
import { GarageCasePreview } from "./GarageCasePreview";

import { KgaraCaseStatusBadge } from "./KgaraCaseStatusBadge";

interface GarageCaseStandaloneDrawerProps {
  isOpen: boolean;
  caseCode?: string | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function GarageCaseStandaloneDrawer({
  isOpen,
  caseCode,
  onClose,
}: GarageCaseStandaloneDrawerProps) {
  const { t } = useTranslation("garage");
  const { selectedBranchId } = useGarageStore();

  const { data: selectedCase, isLoading: isLoadingCase } = useGarageCaseByCode(
    isOpen && caseCode ? caseCode : undefined,
  );

  const { mutate: syncCaseDetail, isPending: isSyncingDetail } =
    useSyncGarageCaseDetail();

  const [drawerMode, setDrawerMode] = useState<"view" | "edit">("view");

  const { data: grossProfit } = useGarageCaseGrossProfit(caseCode || undefined);

  // Reset state when caseId changes or drawer opens
  useEffect(() => {
    if (isOpen) {
      setDrawerMode("view");
    }
  }, [isOpen, caseCode]);

  return (
    <StandardFormDrawer
      open={isOpen}
      mode={drawerMode}
      onToggleEdit={() =>
        setDrawerMode(drawerMode === "view" ? "edit" : "view")
      }
      onClose={onClose}
      title={`${t("cases.drawer.caseDetails", "Sổ báo giá:")} ${selectedCase?.soChungTu || ""}`}
      titleExtra={
        <KgaraCaseStatusBadge status={selectedCase?.tenTinhTrangDichVu} />
      }
      rightPanelTitle={t("cases.drawer.overview")}
      actions={
        drawerMode === "edit"
          ? [
              {
                label: "Hủy",
                variant: "outline" as const,
                onClick: () => {
                  setDrawerMode("view");
                },
              },
            ]
          : [
              {
                label: t("cases.actions.syncDetails", "Đồng bộ chi tiết"),
                onClick: () => {
                  if (selectedBranchId && selectedCase?.hdPhieuDichVuId) {
                    syncCaseDetail({
                      branchId: selectedBranchId,
                      caseId: selectedCase.hdPhieuDichVuId,
                    });
                  }
                },
                variant: "outline" as const,
                loading: isSyncingDetail,
                disabled:
                  isSyncingDetail ||
                  !selectedBranchId ||
                  !selectedCase?.hdPhieuDichVuId,
              },
            ]
      }
      leftPanel={
        isLoadingCase || isSyncingDetail ? (
          <div className="space-y-4 animate-pulse pt-2 px-2 w-full">
            <div className="h-48 bg-slate-100 rounded-lg w-full"></div>
            <div className="h-64 bg-slate-100 rounded-lg w-full"></div>
          </div>
        ) : selectedCase ? (
          <div className="space-y-4 pt-2">
            {drawerMode === "view" && (
              <GarageCasePreview
                caseData={selectedCase}
                grossProfit={grossProfit}
              />
            )}
          </div>
        ) : null
      }
      rightPanel={
        isLoadingCase || isSyncingDetail ? (
          <div className="space-y-4 animate-pulse px-2 w-full">
            <div className="h-40 bg-slate-100 rounded-lg w-full"></div>
            <div className="h-40 bg-slate-100 rounded-lg w-full"></div>
          </div>
        ) : selectedCase ? (
          <div className="space-y-4">
            <DrawerSection
              title={t("cases.drawer.customerAndVehicle")}
              collapsible
            >
              <DrawerRow
                label={t("cases.drawer.customerName")}
                value={
                  selectedCase.rawData?.KhachHangName ||
                  selectedCase.khachHangName
                }
              />
              <DrawerRow
                label={t("cases.drawer.customerCode")}
                value={
                  selectedCase.rawData?.KhachHangCode ||
                  selectedCase.khachHangCode
                }
              />
              <DrawerRow
                label={t("cases.drawer.phone")}
                value={selectedCase.rawData?.DienThoaiKhachHang}
              />
              <DrawerRow
                label={t("cases.drawer.email")}
                value={selectedCase.rawData?.EmailKhachHang}
              />
              <DrawerRow
                label={t("cases.drawer.address")}
                value={selectedCase.rawData?.DiaChiKhachHang}
              />
              <DrawerRow
                label={t("cases.drawer.licensePlate")}
                value={selectedCase.bienSoXe}
              />
              <DrawerRow
                label={t("cases.drawer.mileage")}
                value={
                  selectedCase.rawData?.SoKMTruoc || selectedCase.rawData?.SoKM
                }
              />
              <DrawerRow
                label={t("cases.drawer.isOwner")}
                value={
                  selectedCase.rawData?.LaChuXe
                    ? t("cases.common.yes")
                    : t("cases.common.no")
                }
              />
              <DrawerRow
                label={t("cases.drawer.customerSource")}
                value={selectedCase.rawData?.NguonGocKhachHangName}
              />
              <DrawerRow
                label={t("cases.drawer.insuranceClaim")}
                value={
                  selectedCase.rawData?.XeLamBaoHiem
                    ? t("cases.common.yes")
                    : t("cases.common.no")
                }
              />
              <DrawerRow
                label={t("cases.drawer.insuranceApproved")}
                value={
                  selectedCase.rawData?.DaDuyetBaoHiem
                    ? t("cases.common.yes")
                    : t("cases.common.no")
                }
              />
            </DrawerSection>

            <DrawerSection
              title={t("cases.drawer.generalAndAdvisor")}
              collapsible
            >
              <DrawerRow
                label={t("cases.drawer.serviceAdvisor")}
                value={selectedCase.rawData?.NhanVienCoVanDichVuName}
              />
              <DrawerRow
                label={t("cases.drawer.surveyor")}
                value={selectedCase.rawData?.GiamDinhVienName}
              />
              <DrawerRow
                label={t("cases.drawer.broker")}
                value={selectedCase.rawData?.NguoiMoiGioiName}
              />
              <DrawerRow
                label={t("cases.drawer.warehouse")}
                value={selectedCase.rawData?.KhoXuatName}
              />
              <DrawerRow
                label={t("cases.columns.status")}
                value={selectedCase.tenTinhTrangDichVu}
              />
              <DrawerRow
                label={t("cases.drawer.docType")}
                value={selectedCase.rawData?.LoaiChungTuName}
              />
              <DrawerRow
                label={t("cases.drawer.startDate")}
                value={
                  selectedCase.rawData?.NgayBatDauSuaChua
                    ? new Date(
                        selectedCase.rawData.NgayBatDauSuaChua,
                      ).toLocaleString()
                    : null
                }
              />
              <DrawerRow
                label={t("cases.drawer.completionDate")}
                value={
                  selectedCase.rawData?.NgayHoanThanhCongViec
                    ? new Date(
                        selectedCase.rawData.NgayHoanThanhCongViec,
                      ).toLocaleString()
                    : null
                }
              />
              <DrawerRow
                label={t("cases.drawer.payer")}
                value={selectedCase.rawData?.DoiTuongThanhToanName}
              />
            </DrawerSection>

            <DrawerSection
              title={t("cases.drawer.financialSummary")}
              collapsible
            >
              <DrawerRow
                label={t("cases.drawer.totalGoods")}
                value={new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(Number(selectedCase.rawData?.TongTienHang || 0))}
              />
              <DrawerRow
                label={t("cases.drawer.amountBeforeTax")}
                value={new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(Number(selectedCase.rawData?.TienChuaThue || 0))}
              />
              <DrawerRow
                label={t("cases.drawer.tax")}
                value={new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(Number(selectedCase.rawData?.TienThue || 0))}
              />
              <DrawerRow
                label={t("cases.drawer.discount")}
                value={new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(Number(selectedCase.rawData?.TienChietKhau || 0))}
              />
              <DrawerRow
                label={t("cases.drawer.insuranceDeductible")}
                value={new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(
                  Number(selectedCase.rawData?.TienKhauTruBaoHiem || 0),
                )}
              />
              <DrawerRow
                label={t("cases.drawer.sanctionCost")}
                value={new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(Number(selectedCase.rawData?.TienChiPhiCheTai || 0))}
              />
              <div className="my-2 border-t border-gray-100"></div>
              <DrawerRow
                label={t("cases.columns.totalAmount")}
                cls="text-blue-600 font-bold"
                value={new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(
                  Number(
                    selectedCase.rawData?.TongTienThanhToan ||
                      selectedCase.tienCoThue,
                  ) || 0,
                )}
              />
              <DrawerRow
                label={t("cases.drawer.paidAmount")}
                cls="text-green-600 font-bold"
                value={new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(
                  Number(selectedCase.rawData?.TienThanhToanKH || 0) +
                    Number(selectedCase.rawData?.TienThanhToanBH || 0),
                )}
              />
              <DrawerRow
                label={t("cases.drawer.paidAmountKH")}
                cls="text-gray-600 text-xs italic"
                value={new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(Number(selectedCase.rawData?.TienThanhToanKH || 0))}
              />
              <DrawerRow
                label={t("cases.drawer.paidAmountBH")}
                cls="text-gray-600 text-xs italic"
                value={new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(Number(selectedCase.rawData?.TienThanhToanBH || 0))}
              />
              <DrawerRow
                label={t("cases.drawer.balance")}
                cls="text-red-600 font-bold"
                value={new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(Number(selectedCase.tienConPhaiThanhToan) || 0)}
              />
            </DrawerSection>
          </div>
        ) : null
      }
    />
  );
}

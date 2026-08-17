import React, { useState, useEffect } from "react";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { DrawerSection, DrawerRow } from "@/shared/components/DrawerModal";
import { useTranslation } from "react-i18next";
import { money, formatGMT7 } from "@/shared/utils/format";
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
            <div className="h-36 bg-slate-100 dark:bg-slate-800 rounded-lg w-full"></div>
            <div className="h-36 bg-slate-100 dark:bg-slate-800 rounded-lg w-full"></div>
            <div className="h-36 bg-slate-100 dark:bg-slate-800 rounded-lg w-full"></div>
          </div>
        ) : selectedCase ? (
          <div className="space-y-3">
            {/* Section 1: Thông tin khách hàng */}
            <DrawerSection
              title={t("cases.drawer.customerInfo", "Thông tin khách hàng")}
              collapsible
            >
              <DrawerRow
                label={t("cases.drawer.customerName", "Tên khách hàng")}
                value={
                  selectedCase.rawData?.KhachHangName ||
                  selectedCase.khachHangName
                }
              />
              <DrawerRow
                label={t("cases.drawer.customerCode", "Mã khách hàng")}
                value={
                  selectedCase.rawData?.KhachHangCode ||
                  selectedCase.khachHangCode
                }
              />
              <DrawerRow
                label={t("cases.drawer.phone", "Số điện thoại")}
                value={selectedCase.rawData?.DienThoaiKhachHang}
              />
              <DrawerRow
                label={t("cases.drawer.email", "Email")}
                value={selectedCase.rawData?.EmailKhachHang}
              />
              <DrawerRow
                label={t("cases.drawer.address", "Địa chỉ")}
                value={selectedCase.rawData?.DiaChiKhachHang}
              />
              <DrawerRow
                label={t("cases.drawer.customerSource", "Nguồn gốc")}
                value={selectedCase.rawData?.NguonGocKhachHangName}
              />
              <DrawerRow
                label={t("cases.drawer.isOwner", "Là chủ xe")}
                value={
                  selectedCase.rawData?.LaChuXe != null
                    ? selectedCase.rawData.LaChuXe
                      ? t("cases.common.yes", "Có")
                      : t("cases.common.no", "Không")
                    : undefined
                }
              />
            </DrawerSection>

            {/* Section 2: Thông tin xe & Bảo hiểm */}
            <DrawerSection
              title={t("cases.drawer.vehicleInfo", "Thông tin xe & Bảo hiểm")}
              collapsible
            >
              <DrawerRow
                label={t("cases.drawer.licensePlate", "Biển số xe")}
                value={selectedCase.bienSoXe}
                cls="text-primary font-bold"
              />
              <DrawerRow
                label={t("cases.drawer.brandAndModel", "Hãng & Dòng xe")}
                value={
                  [
                    selectedCase.rawData?.HangXeName,
                    selectedCase.rawData?.DongXeName,
                    selectedCase.rawData?.NamSanXuat
                      ? `(${selectedCase.rawData.NamSanXuat})`
                      : null,
                  ]
                    .filter(Boolean)
                    .join(" ") || undefined
                }
              />
              <DrawerRow
                label={t("cases.drawer.mileage", "Số KM")}
                value={
                  selectedCase.rawData?.SoKM || selectedCase.rawData?.SoKMTruoc
                    ? `${Number(selectedCase.rawData?.SoKM || selectedCase.rawData?.SoKMTruoc || 0).toLocaleString("vi-VN")} km`
                    : undefined
                }
              />
              <DrawerRow
                label={t("cases.drawer.vin", "Số khung (VIN)")}
                value={selectedCase.rawData?.SoKhung || selectedCase.soKhung}
              />
              <DrawerRow
                label={t("cases.drawer.engineNo", "Số máy")}
                value={selectedCase.rawData?.SoMay}
              />
              <DrawerRow
                label={t("cases.drawer.insuranceClaim", "Làm bảo hiểm")}
                value={
                  selectedCase.rawData?.XeLamBaoHiem != null
                    ? selectedCase.rawData.XeLamBaoHiem
                      ? t("cases.common.yes", "Có")
                      : t("cases.common.no", "Không")
                    : undefined
                }
              />
              <DrawerRow
                label={t("cases.drawer.insuranceApproved", "Đã duyệt BH")}
                value={
                  selectedCase.rawData?.DaDuyetBaoHiem != null
                    ? selectedCase.rawData.DaDuyetBaoHiem
                      ? t("cases.common.yes", "Có")
                      : t("cases.common.no", "Không")
                    : undefined
                }
              />
            </DrawerSection>

            {/* Section 3: Cố vấn & Phân công */}
            <DrawerSection
              title={t("cases.drawer.advisorAndStaff", "Cố vấn & Phân công")}
              collapsible
            >
              <DrawerRow
                label={t("cases.drawer.serviceAdvisor", "Cố vấn dịch vụ")}
                value={selectedCase.rawData?.NhanVienCoVanDichVuName}
              />
              <DrawerRow
                label={t("cases.drawer.surveyor", "Giám định viên")}
                value={selectedCase.rawData?.GiamDinhVienName}
              />
              <DrawerRow
                label={t("cases.drawer.broker", "Người môi giới")}
                value={selectedCase.rawData?.NguoiMoiGioiName}
              />
              <DrawerRow
                label={t("cases.drawer.warehouse", "Kho xuất")}
                value={selectedCase.rawData?.KhoXuatName}
              />
              <DrawerRow
                label={t("cases.drawer.payer", "Đối tượng thanh toán")}
                value={selectedCase.rawData?.DoiTuongThanhToanName}
              />
            </DrawerSection>

            {/* Section 4: Tiến độ & Chứng từ */}
            <DrawerSection
              title={t("cases.drawer.timelineAndDoc", "Tiến độ & Chứng từ")}
              collapsible
            >
              <DrawerRow
                label={t("cases.drawer.docCode", "Số chứng từ")}
                value={selectedCase.soChungTu}
              />
              <DrawerRow
                label={t("cases.drawer.docType", "Loại chứng từ")}
                value={selectedCase.rawData?.LoaiChungTuName}
              />
              <DrawerRow
                label={t("cases.columns.status", "Trạng thái")}
                value={selectedCase.tenTinhTrangDichVu}
              />
              <DrawerRow
                label={t("cases.drawer.receptionDate", "Ngày tiếp nhận")}
                value={
                  selectedCase.rawData?.NgayTiepNhan
                    ? formatGMT7(selectedCase.rawData.NgayTiepNhan, "datetime")
                    : selectedCase.ngayPhatSinh
                      ? formatGMT7(selectedCase.ngayPhatSinh, "datetime")
                      : undefined
                }
              />
              <DrawerRow
                label={t("cases.drawer.startDate", "Ngày bắt đầu")}
                value={
                  selectedCase.rawData?.NgayBatDauSuaChua
                    ? formatGMT7(
                        selectedCase.rawData.NgayBatDauSuaChua,
                        "datetime",
                      )
                    : undefined
                }
              />
              <DrawerRow
                label={t("cases.drawer.completionDate", "Ngày kết thúc")}
                value={
                  selectedCase.rawData?.NgayHoanThanhCongViec
                    ? formatGMT7(
                        selectedCase.rawData.NgayHoanThanhCongViec,
                        "datetime",
                      )
                    : selectedCase.ngayHoanThanhCongViec
                      ? formatGMT7(
                          selectedCase.ngayHoanThanhCongViec,
                          "datetime",
                        )
                      : undefined
                }
              />
              <DrawerRow
                label={t("cases.drawer.deliveryDate", "Ngày giao xe")}
                value={
                  selectedCase.rawData?.NgayGiaoXeFull
                    ? formatGMT7(
                        selectedCase.rawData.NgayGiaoXeFull,
                        "datetime",
                      )
                    : selectedCase.ngayGiaoXeFull
                      ? formatGMT7(selectedCase.ngayGiaoXeFull, "datetime")
                      : undefined
                }
              />
            </DrawerSection>

            {/* Section 5: Tình trạng & Ghi chú (nếu có dữ liệu) */}
            {(selectedCase.rawData?.YeuCauDichVu ||
              selectedCase.rawData?.ChanDoan ||
              selectedCase.rawData?.TinhTrangTiepNhan ||
              selectedCase.rawData?.ThongTinBenhXe ||
              selectedCase.rawData?.GhiChu ||
              selectedCase.rawData?.GhiChuGiaoXe) && (
              <DrawerSection
                title={t(
                  "cases.drawer.conditionAndNotes",
                  "Tình trạng & Ghi chú",
                )}
                collapsible
              >
                {selectedCase.rawData?.YeuCauDichVu && (
                  <DrawerRow
                    label={t("cases.drawer.customerRequest", "Yêu cầu của KH")}
                    value={selectedCase.rawData.YeuCauDichVu}
                  />
                )}
                {selectedCase.rawData?.ChanDoan && (
                  <DrawerRow
                    label={t("cases.drawer.diagnosis", "Chẩn đoán")}
                    value={selectedCase.rawData.ChanDoan}
                  />
                )}
                {selectedCase.rawData?.TinhTrangTiepNhan && (
                  <DrawerRow
                    label={t(
                      "cases.drawer.receptionCondition",
                      "Tình trạng tiếp nhận",
                    )}
                    value={selectedCase.rawData.TinhTrangTiepNhan}
                  />
                )}
                {selectedCase.rawData?.ThongTinBenhXe && (
                  <DrawerRow
                    label={t("cases.drawer.vehicleIssues", "Thông tin bệnh xe")}
                    value={selectedCase.rawData.ThongTinBenhXe}
                  />
                )}
                {selectedCase.rawData?.GhiChu && (
                  <DrawerRow
                    label={t("cases.drawer.notes", "Ghi chú")}
                    value={selectedCase.rawData.GhiChu}
                  />
                )}
                {selectedCase.rawData?.GhiChuGiaoXe && (
                  <DrawerRow
                    label={t("cases.drawer.deliveryNotes", "Ghi chú giao xe")}
                    value={selectedCase.rawData.GhiChuGiaoXe}
                  />
                )}
              </DrawerSection>
            )}

            {/* Section 6: Tổng hợp tài chính */}
            <DrawerSection
              title={t("cases.drawer.financialSummary", "Tổng hợp tài chính")}
              collapsible
            >
              <DrawerRow
                label={t("cases.drawer.totalGoods", "Tổng tiền hàng")}
                value={money(Number(selectedCase.rawData?.TongTienHang || 0))}
              />
              <DrawerRow
                label={t("cases.drawer.amountBeforeTax", "Tiền chưa thuế")}
                value={money(Number(selectedCase.rawData?.TienChuaThue || 0))}
              />
              <DrawerRow
                label={t("cases.drawer.tax", "Tiền thuế")}
                value={money(Number(selectedCase.rawData?.TienThue || 0))}
              />
              <DrawerRow
                label={t("cases.drawer.discount", "Tiền chiết khấu")}
                value={money(Number(selectedCase.rawData?.TienChietKhau || 0))}
              />
              <DrawerRow
                label={t(
                  "cases.drawer.insuranceDeductible",
                  "Khấu trừ bảo hiểm",
                )}
                value={money(
                  Number(selectedCase.rawData?.TienKhauTruBaoHiem || 0),
                )}
              />
              <DrawerRow
                label={t("cases.drawer.sanctionCost", "Chi phí chế tài")}
                value={money(
                  Number(selectedCase.rawData?.TienChiPhiCheTai || 0),
                )}
              />
            </DrawerSection>

            {/* Section 7: Thanh toán & Công nợ */}
            <DrawerSection
              title={t(
                "cases.drawer.paymentAndReceivable",
                "Thanh toán & Công nợ",
              )}
              collapsible
            >
              <DrawerRow
                label={t("cases.columns.totalAmount", "Tổng tiền thanh toán")}
                cls="text-blue-600 font-bold"
                value={money(
                  Number(
                    selectedCase.rawData?.TongTienThanhToan ||
                      selectedCase.tienCoThue,
                  ) || 0,
                )}
              />
              <DrawerRow
                label={t("cases.drawer.paidAmount", "Đã thanh toán (KH & BH)")}
                cls="text-emerald-600 font-bold"
                value={money(
                  Number(selectedCase.rawData?.TienThanhToanKH || 0) +
                    Number(selectedCase.rawData?.TienThanhToanBH || 0),
                )}
              />
              <DrawerRow
                label={t("cases.drawer.paidAmountKH", "Khách hàng TT")}
                cls="text-slate-500 text-xs"
                value={money(
                  Number(selectedCase.rawData?.TienThanhToanKH || 0),
                )}
              />
              <DrawerRow
                label={t("cases.drawer.paidAmountBH", "Bảo hiểm TT")}
                cls="text-slate-500 text-xs"
                value={money(
                  Number(selectedCase.rawData?.TienThanhToanBH || 0),
                )}
              />
              <DrawerRow
                label={t("cases.drawer.balance", "Còn phải thu")}
                cls="text-rose-600 font-bold"
                value={money(Number(selectedCase.tienConPhaiThanhToan) || 0)}
              />
            </DrawerSection>

            {/* Section 8: Lợi nhuận gộp & Chi phí (nếu có dữ liệu) */}
            {grossProfit && (
              <DrawerSection
                title={t(
                  "cases.drawer.grossProfitSection",
                  "Lợi nhuận gộp & Chi phí",
                )}
                collapsible
              >
                <DrawerRow
                  label={t("cases.drawer.revenue", "Doanh thu")}
                  value={money(
                    Number(grossProfit.DoanhThu || selectedCase.doanhThu || 0),
                  )}
                  cls="font-semibold"
                />
                <DrawerRow
                  label={t("cases.drawer.costOfGoods", "Giá vốn phụ tùng")}
                  value={money(
                    Number(grossProfit.TongGiaVon || selectedCase.chiPhi || 0),
                  )}
                />
                {Number(grossProfit.ChiPhiHoaHong || 0) > 0 && (
                  <DrawerRow
                    label={t(
                      "cases.drawer.commissionAdvisor",
                      "Hoa hồng Cố vấn",
                    )}
                    value={money(Number(grossProfit.ChiPhiHoaHong || 0))}
                  />
                )}
                {Number(grossProfit.ChiPhiHoaHongGDV || 0) > 0 && (
                  <DrawerRow
                    label={t(
                      "cases.drawer.commissionSurveyor",
                      "Hoa hồng Giám định viên",
                    )}
                    value={money(Number(grossProfit.ChiPhiHoaHongGDV || 0))}
                  />
                )}
                {Number(grossProfit.ChiPhiHoaHongMG || 0) > 0 && (
                  <DrawerRow
                    label={t(
                      "cases.drawer.commissionBroker",
                      "Hoa hồng Môi giới",
                    )}
                    value={money(Number(grossProfit.ChiPhiHoaHongMG || 0))}
                  />
                )}
                <DrawerRow
                  label={t("cases.drawer.grossProfit", "Lãi tạm tính")}
                  cls="text-emerald-600 font-bold"
                  value={money(
                    Number(grossProfit.LoiNhuan || selectedCase.loiNhuan || 0),
                  )}
                />
                {grossProfit.LoiNhuanCoThue != null && (
                  <DrawerRow
                    label={t(
                      "cases.drawer.grossProfitTax",
                      "Lãi tạm tính có thuế",
                    )}
                    cls="text-emerald-700 font-bold"
                    value={money(Number(grossProfit.LoiNhuanCoThue || 0))}
                  />
                )}
              </DrawerSection>
            )}
          </div>
        ) : null
      }
    />
  );
}

import React from "react";
import { useTranslation } from "react-i18next";
import { Receipt, FileSpreadsheet } from "lucide-react";
import { DrawerSection, DrawerRow } from "@/shared/components/DrawerModal";
import { formatGMT7 } from "@/shared/utils/format";
import { formatNumber } from "../../garage-case-preview/GarageCasePreview.helper";
import type { CaseLinePaymentDrawerProps } from "../CaseLinePaymentDrawer.type";

interface CaseLinePaymentRightPanelProps {
  props: CaseLinePaymentDrawerProps;
  targetAmount: number;
  lineTypeLabel: string;
  payerLabel: string;
  isCost?: boolean;
  selectedAmount?: number;
  remainingAmount?: number;
  progressPercent?: number;
  realSettledAmount?: number;
}

export function CaseLinePaymentRightPanel({
  props,
  targetAmount,
  lineTypeLabel,
  payerLabel,
}: CaseLinePaymentRightPanelProps) {
  const { t } = useTranslation(["garage", "common"]);

  const caseData = props.caseData;
  const rawData = caseData?.rawData;
  const caseCode =
    caseData?.soChungTu || props.caseCode || rawData?.SoPhieu || "—";
  const plate = caseData?.bienSoXe || rawData?.BienSoXe || "—";
  const customer = caseData?.khachHangName || rawData?.KhachHangName || "—";
  const carModel = rawData?.HangXeName
    ? `${rawData.HangXeName} ${rawData.DongXeName || ""}${
        rawData.NamSanXuat ? ` (${rawData.NamSanXuat})` : ""
      }`.trim()
    : undefined;
  const status =
    caseData?.tenTinhTrangDichVu || rawData?.TinhTrangDichVuName || "—";
  const dateStr = caseData?.ngayPhatSinh
    ? formatGMT7(caseData.ngayPhatSinh, "date")
    : rawData?.NgayTiepNhan
      ? formatGMT7(rawData.NgayTiepNhan, "date")
      : "—";
  const totalPayable = Number(
    rawData?.TongTienThanhToan ??
      caseData?.tienCoThue ??
      caseData?.tongTien ??
      0,
  );
  const customerPay = Number(rawData?.TienThanhToanKH ?? 0);
  const insurancePay = Number(rawData?.TienThanhToanBH ?? 0);

  return (
    <div className="space-y-4">
      {/* 1. Thông tin dòng đang cấn trừ */}
      <DrawerSection
        title={
          <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
            <Receipt className="w-3.5 h-3.5 text-primary" />
            {t("cases.quotePreview.paymentTargetInfo", "Khoản mục cấn trừ")}
          </span>
        }
      >
        <div className="space-y-2 text-xs">
          <div className="flex justify-between py-1 border-b border-border/50">
            <span className="text-muted-foreground">
              {t("cases.quotePreview.typeCol", "Phân loại")}:
            </span>
            <span className="font-semibold">{lineTypeLabel}</span>
          </div>
          {props.lineCode && (
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted-foreground">
                {t("cases.quotePreview.partCode", "Mã")}:
              </span>
              <span className="font-mono">{props.lineCode}</span>
            </div>
          )}
          <div className="flex justify-between py-1 border-b border-border/50">
            <span className="text-muted-foreground">
              {t("cases.quotePreview.partName", "Tên")}:
            </span>
            <span className="font-medium text-right max-w-[180px] truncate">
              {props.lineName || "---"}
            </span>
          </div>
          <div className="flex justify-between py-1 border-b border-border/50">
            <span className="text-muted-foreground">
              {t("cases.quotePreview.fin.payerCol", "Bên thanh toán")}:
            </span>
            <span className="font-semibold text-emerald-700 dark:text-emerald-300">
              {payerLabel}
            </span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-muted-foreground">
              {t("cases.quotePreview.fin.amountCol", "Số tiền cần cấn trừ")}:
            </span>
            <span className="font-mono font-bold text-foreground">
              {formatNumber(targetAmount)} ₫
            </span>
          </div>
        </div>
      </DrawerSection>

      {/* 2. Thông tin sổ báo giá */}
      <DrawerSection
        title={
          <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
            <FileSpreadsheet className="w-3.5 h-3.5 text-primary" />
            {t("cases.drawer.quoteInfo", "Thông tin sổ báo giá")}
          </span>
        }
        collapsible
        defaultCollapsed={false}
      >
        <DrawerRow
          label={t("cases.drawer.caseCode", "Số chứng từ")}
          value={<span className="font-mono font-semibold">{caseCode}</span>}
        />
        <DrawerRow
          label={t("cases.drawer.plate", "Biển số xe")}
          value={
            <span className="font-mono font-bold text-primary">{plate}</span>
          }
        />
        <DrawerRow
          label={t("cases.drawer.customer", "Khách hàng")}
          value={customer}
        />
        {carModel && (
          <DrawerRow
            label={t("cases.quotePreview.carModel", "Hãng / Dòng")}
            value={carModel}
          />
        )}
        <DrawerRow
          label={t("cases.drawer.serviceStatus", "Trạng thái")}
          value={status}
        />
        <DrawerRow
          label={t("cases.drawer.creationDate", "Ngày phát sinh")}
          value={dateStr}
        />
        <DrawerRow
          label={t("cases.quotePreview.totalPayable", "Tổng tiền báo giá")}
          value={
            <span className="font-mono font-bold text-foreground">
              {formatNumber(totalPayable)} ₫
            </span>
          }
        />
        {customerPay > 0 && insurancePay > 0 && (
          <>
            <DrawerRow
              label={t("cases.quotePreview.customerPay", "Khách hàng TT")}
              value={
                <span className="font-mono text-emerald-700 dark:text-emerald-300">
                  {formatNumber(customerPay)} ₫
                </span>
              }
            />
            <DrawerRow
              label={t("cases.quotePreview.insurancePay", "Bảo hiểm TT")}
              value={
                <span className="font-mono text-sky-700 dark:text-sky-300">
                  {formatNumber(insurancePay)} ₫
                </span>
              }
            />
          </>
        )}
      </DrawerSection>
    </div>
  );
}

import React from "react";
import { useT } from "@/core/i18n";
import {
  Wallet,
  Car,
  Users,
  ReceiptText,
  Package,
  ClipboardList,
} from "lucide-react";
import { NavSection, NavItem } from "../SidebarPrimitives";
import type { GarageNavSectionProps } from "./GarageNavSection.type";
import { useGarageNavSection } from "./GarageNavSection.hook";

export function GarageNavSection({
  collapsed,
  currentPage,
  navTo,
}: GarageNavSectionProps) {
  const t = useT();
  const {
    canReadGarageCashflow,
    canReadGarageCases,
    canReadGarageGoodsReceipts,
    canReadGarageProcurementRequests,
    canReadGaragePurchaseOrders,
    canReadGarageDebts,
    canReadGarageOpex,
    isCashflowActive,
    isCasesActive,
    isGoodsReceiptsActive,
    isProcurementRequestsActive,
    isDebtsActive,
    isOpexActive,
    handleNavCashflow,
    handleNavCases,
    handleNavGoodsReceipts,
    handleNavProcurementRequests,
    handleNavDebts,
    handleNavOpex,
  } = useGarageNavSection({
    currentPage,
    navTo,
  });

  if (
    !canReadGarageCashflow &&
    !canReadGarageCases &&
    !canReadGarageGoodsReceipts &&
    !canReadGarageProcurementRequests &&
    !canReadGaragePurchaseOrders &&
    !canReadGarageDebts &&
    !canReadGarageOpex
  ) {
    return null;
  }

  return (
    <NavSection
      collapsed={collapsed}
      label={t("nav.sections.garage", "GARAGE")}
    >
      {canReadGarageCases && (
        <NavItem
          collapsed={collapsed}
          icon={<Car className="w-4 h-4 opacity-65 flex-shrink-0" />}
          label={t("nav.items.garageCases", "Hoạt động garage")}
          active={isCasesActive}
          onClick={handleNavCases}
          contextPage="garage-cases"
        />
      )}
      {canReadGarageGoodsReceipts && (
        <NavItem
          collapsed={collapsed}
          icon={<Package className="w-4 h-4 opacity-65 flex-shrink-0" />}
          label={t("nav.items.garageGoodsReceipts", "Nhập kho Garage")}
          active={isGoodsReceiptsActive}
          onClick={handleNavGoodsReceipts}
          contextPage="garage-goods-receipts"
        />
      )}
      {canReadGarageProcurementRequests && (
        <NavItem
          collapsed={collapsed}
          icon={<ClipboardList className="w-4 h-4 opacity-65 flex-shrink-0" />}
          label={t(
            "nav.items.garageProcurement",
            t("nav.items.garageProcurementRequests", "Mua hàng Garage"),
          )}
          active={isProcurementRequestsActive}
          onClick={handleNavProcurementRequests}
          contextPage="garage-procurement"
        />
      )}
      {canReadGarageCashflow && (
        <NavItem
          collapsed={collapsed}
          icon={<Wallet className="w-4 h-4 opacity-65 flex-shrink-0" />}
          label={t("nav.items.garageCashflow", "Thu chi garage")}
          active={isCashflowActive}
          onClick={handleNavCashflow}
          contextPage="garage-cashflow"
        />
      )}
      {canReadGarageDebts && (
        <NavItem
          collapsed={collapsed}
          icon={<Users className="w-4 h-4 opacity-65 flex-shrink-0" />}
          label={t("nav.items.garageDebts", "Công nợ garage")}
          active={isDebtsActive}
          onClick={handleNavDebts}
          contextPage="garage-debts"
        />
      )}
      {canReadGarageOpex && (
        <NavItem
          collapsed={collapsed}
          icon={<ReceiptText className="w-4 h-4 opacity-65 flex-shrink-0" />}
          label={t("nav.items.garageOpex", "Chi phí vận hành Garage")}
          active={isOpexActive}
          onClick={handleNavOpex}
          contextPage="garage-opex"
        />
      )}
    </NavSection>
  );
}

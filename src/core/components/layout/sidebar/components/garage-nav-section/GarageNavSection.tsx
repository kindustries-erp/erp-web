import React from "react";
import { useT } from "@/core/i18n";
import {
  Wallet,
  Car,
  Users,
  ReceiptText,
  Package,
  ShoppingCart,
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
    canReadGaragePurchaseOrders,
    canReadGarageDebts,
    canReadGarageOpex,
    isCashflowActive,
    isCasesActive,
    isGoodsReceiptsActive,
    isPurchaseOrdersActive,
    isDebtsActive,
    isOpexActive,
    handleNavCashflow,
    handleNavCases,
    handleNavGoodsReceipts,
    handleNavPurchaseOrders,
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
      {canReadGaragePurchaseOrders && (
        <NavItem
          collapsed={collapsed}
          icon={<ShoppingCart className="w-4 h-4 opacity-65 flex-shrink-0" />}
          label={t("nav.items.garagePurchaseOrders", "Đơn mua hàng Garage")}
          active={isPurchaseOrdersActive}
          onClick={handleNavPurchaseOrders}
          contextPage="garage-purchase-orders"
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

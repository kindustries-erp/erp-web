import React from "react";
import { useT } from "@/core/i18n";
import {
  Wallet,
  Car,
  Users,
  ReceiptText,
  Package,
  Warehouse,
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
    canReadGarageStockVouchers,
    canReadGarageStockLedger,
    canReadGarageProcurementRequests,
    canReadGaragePurchaseOrders,
    canReadGarageDebts,
    canReadGarageOpex,
    isCashflowActive,
    isCasesActive,
    isStockVouchersActive,
    isStockBalancesActive,
    isProcurementRequestsActive,
    isDebtsActive,
    isOpexActive,
    handleNavCashflow,
    handleNavCases,
    handleNavStockVouchers,
    handleNavStockBalances,
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
    !canReadGarageStockVouchers &&
    !canReadGarageStockLedger &&
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
      {canReadGarageStockVouchers && (
        <NavItem
          collapsed={collapsed}
          icon={<Package className="w-4 h-4 opacity-65 flex-shrink-0" />}
          label={t("nav.items.garageStockVouchers", "Chứng từ kho Garage")}
          active={isStockVouchersActive}
          onClick={handleNavStockVouchers}
          contextPage="garage-stock-vouchers"
        />
      )}
      {canReadGarageStockLedger && (
        <NavItem
          collapsed={collapsed}
          icon={<Warehouse className="w-4 h-4 opacity-65 flex-shrink-0" />}
          label={t("nav.items.garageStockBalances", "Tồn kho Garage")}
          active={isStockBalancesActive}
          onClick={handleNavStockBalances}
          contextPage="garage-stock-balances"
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

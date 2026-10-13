import React from "react";
import { useT } from "@/core/i18n";
import { Car, Users, ReceiptText } from "lucide-react";
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
    canReadGarageCases,
    canReadGarageDebts,
    canReadGarageOpex,
    isCasesActive,
    isDebtsActive,
    isOpexActive,
    handleNavCases,
    handleNavDebts,
    handleNavOpex,
  } = useGarageNavSection({
    currentPage,
    navTo,
  });

  if (!canReadGarageCases && !canReadGarageDebts && !canReadGarageOpex) {
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
          label={t("nav.items.garageCases", "Phiếu dịch vụ")}
          active={isCasesActive}
          onClick={handleNavCases}
          contextPage="garage-cases"
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

import React from "react";
import { useT } from "@/core/i18n";
import { Car } from "lucide-react";
import { NavGroup, NavGroupItem } from "../SidebarPrimitives";
import type { GarageNavGroupProps } from "./GarageNavGroup.type";
import { useGarageNavGroup } from "./GarageNavGroup.hook";

export function GarageNavGroup({
  collapsed,
  currentPage,
  navTo,
  canReadGarage,
}: GarageNavGroupProps) {
  const t = useT();
  const {
    shouldShowGroup,
    isGroupActive,
    isCasesActive,
    isDebtsActive,
    handleNavCases,
    handleNavDebts,
  } = useGarageNavGroup({
    currentPage,
    navTo,
    canReadGarage,
  });

  if (!shouldShowGroup) {
    return null;
  }

  return (
    <NavGroup
      collapsed={collapsed}
      icon={<Car className="w-4 h-4 opacity-65 flex-shrink-0" />}
      label={t("nav.items.garageServicesGroup", "Dịch vụ Garage")}
      active={isGroupActive}
    >
      <NavGroupItem
        label={t("nav.items.garageCases", "Phiếu dịch vụ")}
        active={isCasesActive}
        onClick={handleNavCases}
        contextPage="garage-cases"
      />
      <NavGroupItem
        label={t("nav.items.garageDebts", "Công nợ garage")}
        active={isDebtsActive}
        onClick={handleNavDebts}
        contextPage="garage-debts"
      />
    </NavGroup>
  );
}

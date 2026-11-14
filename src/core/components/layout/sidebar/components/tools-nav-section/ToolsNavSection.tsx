import React from "react";
import { Calculator } from "lucide-react";
import { useT } from "@/core/i18n";
import { NavItem, NavSection } from "../SidebarPrimitives";
import type { ToolsNavSectionProps } from "./ToolsNavSection.type";
import { useToolsNavSection } from "./ToolsNavSection.hook";

export function ToolsNavSection({
  collapsed,
  currentPage,
  navTo,
}: ToolsNavSectionProps) {
  const t = useT();
  const { showTools, showLoans, isLoansActive, handleNavLoans } =
    useToolsNavSection({ currentPage, navTo });

  if (!showTools) return null;

  return (
    <NavSection
      collapsed={collapsed}
      label={t("nav.sections.tools", "CÔNG CỤ")}
    >
      {showLoans && (
        <NavItem
          collapsed={collapsed}
          icon={<Calculator className="w-4 h-4 opacity-65 flex-shrink-0" />}
          label={t("nav.items.loans", "Khoản vay & Lãi suất")}
          active={isLoansActive}
          onClick={handleNavLoans}
          contextPage="loans"
        />
      )}
    </NavSection>
  );
}

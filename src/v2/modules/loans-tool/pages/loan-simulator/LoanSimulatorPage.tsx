import React from "react";
import { useViewport } from "@/v2/shared/hooks/useViewport";
import type { LoanSimulatorPageProps } from "./LoanSimulatorPage.type";
import { LoanSimulatorPageDesktop } from "./LoanSimulatorPage.desktop";
import { LoanSimulatorPageMobile } from "./LoanSimulatorPage.mobile";

export const LoanSimulatorPage: React.FC<LoanSimulatorPageProps> = (props) => {
  const { isMobile } = useViewport();
  return isMobile ? (
    <LoanSimulatorPageMobile {...props} />
  ) : (
    <LoanSimulatorPageDesktop {...props} />
  );
};
LoanSimulatorPage.displayName = "LoanSimulatorPage";

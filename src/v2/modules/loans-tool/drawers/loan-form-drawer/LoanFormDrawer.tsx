import React from "react";
import { useViewport } from "@/v2/shared/hooks/useViewport";
import { LoanFormDrawerProps } from "./LoanFormDrawer.type";
import { LoanFormDrawerDesktop } from "./LoanFormDrawer.desktop";
import { LoanFormDrawerMobile } from "./LoanFormDrawer.mobile";

export const LoanFormDrawer: React.FC<LoanFormDrawerProps> = (props) => {
  const { isMobile } = useViewport();
  return isMobile ? (
    <LoanFormDrawerMobile {...props} />
  ) : (
    <LoanFormDrawerDesktop {...props} />
  );
};
LoanFormDrawer.displayName = "LoanFormDrawer";

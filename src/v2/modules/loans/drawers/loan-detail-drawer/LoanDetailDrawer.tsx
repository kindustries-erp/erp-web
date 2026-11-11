import React from "react";
import { useViewport } from "@/v2/shared/hooks/useViewport";
import type { LoanDetailDrawerProps } from "./LoanDetailDrawer.type";
import { LoanDetailDrawerDesktop } from "./LoanDetailDrawer.desktop";
import { LoanDetailDrawerMobile } from "./LoanDetailDrawer.mobile";

export const LoanDetailDrawer: React.FC<LoanDetailDrawerProps> = (props) => {
  const { isMobile } = useViewport();
  return isMobile ? (
    <LoanDetailDrawerMobile {...props} />
  ) : (
    <LoanDetailDrawerDesktop {...props} />
  );
};
LoanDetailDrawer.displayName = "LoanDetailDrawer";

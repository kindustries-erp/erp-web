import React from "react";
import { useViewport } from "@/v2/shared/hooks/useViewport";
import type { LoansListPageProps } from "./LoansListPage.type";
import { LoansListPageDesktop } from "./LoansListPage.desktop";
import { LoansListPageMobile } from "./LoansListPage.mobile";

export const LoansListPage: React.FC<LoansListPageProps> = (props) => {
  const { isMobile } = useViewport();
  return isMobile ? (
    <LoansListPageMobile {...props} />
  ) : (
    <LoansListPageDesktop {...props} />
  );
};
LoansListPage.displayName = "LoansListPage";

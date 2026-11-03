import React from "react";
import { useViewport } from "@/v2/shared/hooks/useViewport";
import { V2AdminDashboardPageDesktop } from "./V2AdminDashboardPage.desktop";
import { V2AdminDashboardPageMobile } from "./V2AdminDashboardPage.mobile";
import type { V2AdminDashboardPageProps } from "./V2AdminDashboardPage.type";

export const V2AdminDashboardPage: React.FC<V2AdminDashboardPageProps> = (
  props,
) => {
  const { isMobile } = useViewport();
  return isMobile ? (
    <V2AdminDashboardPageMobile {...props} />
  ) : (
    <V2AdminDashboardPageDesktop {...props} />
  );
};

import * as React from "react";
import { useViewport } from "@/v2/shared/hooks/useViewport";
import { V2LoginPageDesktop } from "./V2LoginPage.desktop";
import { V2LoginPageMobile } from "./V2LoginPage.mobile";

export const V2LoginPage: React.FC<{ onSuccess?: () => void }> = ({
  onSuccess,
}) => {
  const { isMobile } = useViewport();
  return isMobile ? (
    <V2LoginPageMobile onSuccess={onSuccess} />
  ) : (
    <V2LoginPageDesktop onSuccess={onSuccess} />
  );
};

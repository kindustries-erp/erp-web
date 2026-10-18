import React from "react";
import { useViewport } from "@/v2/shared/hooks/useViewport";
import { V2ConfirmModalDesktop } from "./V2ConfirmModal.desktop";
import { V2ConfirmModalMobile } from "./V2ConfirmModal.mobile";
import type { V2ConfirmModalProps } from "./V2ConfirmModal.type";

export const V2ConfirmModal: React.FC<V2ConfirmModalProps> = (props) => {
  const { isMobile } = useViewport();
  return isMobile ? (
    <V2ConfirmModalMobile {...props} />
  ) : (
    <V2ConfirmModalDesktop {...props} />
  );
};

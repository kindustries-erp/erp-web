import React from "react";
import { useViewport } from "@/v2/shared/hooks/useViewport";
import { V2ModalDesktop } from "./V2Modal.desktop";
import { V2ModalMobile } from "./V2Modal.mobile";
import type { V2ModalProps } from "./V2Modal.type";

export const V2Modal: React.FC<V2ModalProps> = (props) => {
  const { isMobile } = useViewport();
  return isMobile ? (
    <V2ModalMobile {...props} />
  ) : (
    <V2ModalDesktop {...props} />
  );
};

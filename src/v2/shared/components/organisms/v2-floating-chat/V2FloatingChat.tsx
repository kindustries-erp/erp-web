import * as React from "react";
import { useViewport } from "@/v2/shared/hooks/useViewport";
import { V2FloatingChatDesktop } from "./V2FloatingChat.desktop";
import { V2FloatingChatMobile } from "./V2FloatingChat.mobile";
import type { V2FloatingChatProps } from "./V2FloatingChat.type";

/** Khung chat nổi: panel góc phải trên desktop, bottom sheet trên mobile. */
export const V2FloatingChat: React.FC<V2FloatingChatProps> = (props) => {
  const { isMobile } = useViewport();
  return isMobile ? (
    <V2FloatingChatMobile {...props} />
  ) : (
    <V2FloatingChatDesktop {...props} />
  );
};
V2FloatingChat.displayName = "V2FloatingChat";

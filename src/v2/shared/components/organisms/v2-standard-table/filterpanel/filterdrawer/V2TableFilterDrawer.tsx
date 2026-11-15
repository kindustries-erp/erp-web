import * as React from "react";
import { useViewport } from "@/v2/shared/hooks/useViewport";
import { V2TableFilterDrawerDesktop } from "./V2TableFilterDrawer.desktop";
import { V2TableFilterDrawerMobile } from "./V2TableFilterDrawer.mobile";
import type { V2TableFilterDrawerProps } from "./V2TableFilterDrawer.type";

/** Switcher: chọn bản desktop (Sheet nổi) hoặc mobile (bottom sheet) theo viewport */
export function V2TableFilterDrawer<T>(props: V2TableFilterDrawerProps<T>) {
  const { isMobile } = useViewport();
  return isMobile ? (
    <V2TableFilterDrawerMobile {...props} />
  ) : (
    <V2TableFilterDrawerDesktop {...props} />
  );
}

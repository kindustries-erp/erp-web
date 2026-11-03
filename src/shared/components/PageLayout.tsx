import * as React from "react";
import {
  V2PageLayout,
  type V2PageLayoutProps,
} from "@/v2/shared/components/templates/v2-page-layout";
import { V2MobileTabMode } from "@/v2/shared/types";

export interface TabItem {
  value: string;
  label: React.ReactNode;
  icon?: any;
  badge?: React.ReactNode;
  badgeCount?: number;
  disabled?: boolean;
}

export interface PageLayoutProps extends Omit<
  V2PageLayoutProps,
  "tabs" | "title"
> {
  /** Page title shown in the header */
  title: string;
  /** Tab definitions — if provided, renders a sticky tab bar */
  tabs?: TabItem[];
  /** Sticky offset for the tab bar (legacy compatibility) */
  stickyOffset?: string;
}

/**
 * Standard page layout wrapper for all ERP pages.
 * Acts as a backward-compatible adapter delegating to V2PageLayout template.
 */
export function PageLayout({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  stickyOffset,
  mobileTabMode = V2MobileTabMode.DROPDOWN,
  ...props
}: PageLayoutProps) {
  return <V2PageLayout mobileTabMode={mobileTabMode} {...props} />;
}

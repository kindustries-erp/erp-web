import type { ReactNode } from "react";

export interface AdminRouteGuardProps {
  children?: ReactNode;
  fallback?: ReactNode;
}

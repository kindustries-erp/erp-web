import type { ReactNode } from "react";

export interface AppProvidersProps {
  children: ReactNode;
  /** Cho phép truy cập không cần đăng nhập cho các công cụ public */
  allowAnonymous?: boolean;
}

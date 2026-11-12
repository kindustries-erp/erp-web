import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { Calculator } from "lucide-react";

const LoanSimulatorPage = React.lazy(() =>
  import("@/v2/modules/loans-tool/pages/loan-simulator").then((m) => ({
    default: m.LoanSimulatorPage,
  })),
);

export interface V2PublicToolDef {
  id: string;
  path: string;
  aliasPaths?: string[];
  sectionId: "tools";
  labelKey: string;
  fallback: string;
  icon: LucideIcon;
  component: React.ComponentType;
}

/**
 * Registry các công cụ public của ERP (chuẩn URL `/tools/*`).
 * Trong tương lai, muốn thêm công cụ public mới chỉ cần khai báo một mục vào mảng này.
 */
export const PUBLIC_TOOLS: V2PublicToolDef[] = [
  {
    id: "loans",
    path: "/tools/loans",
    aliasPaths: ["/loans"],
    sectionId: "tools",
    labelKey: "v2.nav.items.loans",
    fallback: "Khoản vay & Dòng tiền",
    icon: Calculator,
    component: LoanSimulatorPage,
  },
];

/**
 * Khớp đường dẫn URL với danh mục công cụ public khi chưa đăng nhập.
 * - Khi chưa đăng nhập: `/tools/loans` và alias `/loans` khớp công cụ loans.
 * - Khi đã đăng nhập: trả về null để ERP Shell (`V2ShellLayout`) xử lý tại chính URL `/tools/loans`.
 */
export function resolvePublicTool(
  pathname: string,
  isLoggedIn: boolean,
): V2PublicToolDef | null {
  if (typeof window === "undefined" || isLoggedIn) return null;
  const normalized = pathname.replace(/\/+$/, "") || "/";

  for (const tool of PUBLIC_TOOLS) {
    if (tool.path === normalized || tool.aliasPaths?.includes(normalized)) {
      return tool;
    }
  }

  return null;
}

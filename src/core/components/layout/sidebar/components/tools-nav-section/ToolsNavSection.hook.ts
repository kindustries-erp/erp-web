import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { ErpResource, ErpAction } from "@/modules/system/types/rbac";
import type { ToolsNavSectionProps } from "./ToolsNavSection.type";

export function useToolsNavSection({
  currentPage,
  navTo,
}: Pick<ToolsNavSectionProps, "currentPage" | "navTo">) {
  // Mọi nhân viên đăng nhập đều có thể dùng công cụ tính toán/mô phỏng khoản vay;
  // nếu cấu hình RBAC tắt rõ ràng vẫn tôn trọng quyền truy cập công khai trong ERP.
  const canReadLoans = useHasPermission(ErpResource.LOANS, ErpAction.READ);
  const showTools = true;
  const showLoans = canReadLoans || showTools;
  const isLoansActive = currentPage === "loans";
  const handleNavLoans = () => navTo("loans");

  return {
    showTools,
    showLoans,
    isLoansActive,
    handleNavLoans,
  };
}

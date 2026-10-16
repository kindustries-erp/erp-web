import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { ErpResource, ErpAction } from "@/modules/system/types/rbac";
import type { GarageNavSectionProps } from "./GarageNavSection.type";

export function useGarageNavSection({
  currentPage,
  navTo,
}: Pick<GarageNavSectionProps, "currentPage" | "navTo">) {
  const canReadGarageCashflow = useHasPermission(
    ErpResource.GARAGE_CASHFLOW,
    ErpAction.READ,
  );
  const canReadGarageCases = useHasPermission(
    ErpResource.GARAGE,
    ErpAction.READ,
  );
  const canReadGarageDebts = useHasPermission(
    ErpResource.GARAGE_DEBTS,
    ErpAction.READ,
  );
  const canReadGarageOpex = canReadGarageCases;

  const isCashflowActive = currentPage === "garage-cashflow";

  const isCasesActive =
    currentPage === "garage-cases" || currentPage === "garage-dashboard";

  const isDebtsActive =
    currentPage === "garage-debts" ||
    currentPage === "garage-partners" ||
    currentPage === "garage-customers";

  const isOpexActive = currentPage === "garage-opex";

  const handleNavCashflow = () => navTo("garage-cashflow");
  const handleNavCases = () => navTo("garage-cases");
  const handleNavDebts = () => navTo("garage-debts");
  const handleNavOpex = () => navTo("garage-opex");

  return {
    canReadGarageCashflow,
    canReadGarageCases,
    canReadGarageDebts,
    canReadGarageOpex,
    isCashflowActive,
    isCasesActive,
    isDebtsActive,
    isOpexActive,
    handleNavCashflow,
    handleNavCases,
    handleNavDebts,
    handleNavOpex,
  };
}

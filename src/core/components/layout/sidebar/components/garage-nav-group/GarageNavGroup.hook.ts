import { useCallback, useMemo } from "react";
import type { GarageNavGroupProps } from "./GarageNavGroup.type";

export function useGarageNavGroup({
  currentPage,
  navTo,
  canReadGarage,
}: Pick<GarageNavGroupProps, "currentPage" | "navTo" | "canReadGarage">) {
  const isCasesActive = useMemo(() => {
    return currentPage === "garage-cases" || currentPage === "garage-dashboard";
  }, [currentPage]);

  const isDebtsActive = useMemo(() => {
    return (
      currentPage === "garage-debts" ||
      currentPage === "garage-partners" ||
      currentPage === "garage-customers"
    );
  }, [currentPage]);

  const isGroupActive = isCasesActive || isDebtsActive;
  const shouldShowGroup = canReadGarage;

  const handleNavCases = useCallback(() => {
    navTo("garage-cases");
  }, [navTo]);

  const handleNavDebts = useCallback(() => {
    navTo("garage-debts");
  }, [navTo]);

  return {
    shouldShowGroup,
    isGroupActive,
    isCasesActive,
    isDebtsActive,
    handleNavCases,
    handleNavDebts,
  };
}

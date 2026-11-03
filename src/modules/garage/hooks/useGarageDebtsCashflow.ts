import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { InitialCashflowData } from "../components/organisms/garage-cashflow-drawer/GarageCashflowDrawer.type";

export function useGarageDebtsCashflow() {
  const queryClient = useQueryClient();
  const [cashflowDrawerState, setCashflowDrawerState] = useState<{
    open: boolean;
    initialData?: InitialCashflowData;
  }>({ open: false });

  const handleOpenCreateCashflow = useCallback(
    (params: InitialCashflowData) => {
      setCashflowDrawerState({
        open: true,
        initialData: params,
      });
    },
    [],
  );

  const handleCloseCashflowDrawer = useCallback(() => {
    setCashflowDrawerState((prev) => ({ ...prev, open: false }));
  }, []);

  const handleCashflowSuccess = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["garage-customers-debt"] });
    queryClient.invalidateQueries({ queryKey: ["garage-suppliers-debt"] });
    queryClient.invalidateQueries({ queryKey: ["garage-debts-analytics"] });
    queryClient.invalidateQueries({ queryKey: ["garage-dashboard-stats"] });
    queryClient.invalidateQueries({ queryKey: ["garage", "customers"] });
    queryClient.invalidateQueries({ queryKey: ["garage", "suppliers"] });
  }, [queryClient]);

  return {
    cashflowDrawerState,
    handleOpenCreateCashflow,
    handleCloseCashflowDrawer,
    handleCashflowSuccess,
  };
}

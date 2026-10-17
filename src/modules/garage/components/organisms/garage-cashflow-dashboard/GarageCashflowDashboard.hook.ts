import { useState, useMemo, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useT } from "@/core/i18n";
import { useGarageStore } from "../../../store/garageStore";
import {
  garageCashflowApi,
  type GarageCashflowTopTransactionItem,
} from "../../../api/garageCashflowApi";

export function useGarageCashflowDashboard(
  onOpenCaseDetailProp?: (caseCode: string) => void,
  onExportClickProp?: () => void,
) {
  const t = useT();
  const queryClient = useQueryClient();
  const { selectedBranchId } = useGarageStore();

  const [selectedCaseCode, setSelectedCaseCode] = useState<string | null>(null);
  const [selectedVoucher, setSelectedVoucher] = useState<any | null>(null);
  const [exportDrawerOpen, setExportDrawerOpen] = useState(false);

  const queryParams = useMemo(() => {
    return {
      branchId: selectedBranchId || undefined,
    };
  }, [selectedBranchId]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["garage-cashflow-dashboard", queryParams],
    queryFn: () => garageCashflowApi.getDashboard(queryParams),
  });

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["garage-cashflow-dashboard"] });
  }, [queryClient]);

  const handleOpenExport = useCallback(() => {
    if (onExportClickProp) {
      onExportClickProp();
    } else {
      setExportDrawerOpen(true);
    }
  }, [onExportClickProp]);

  const handleOpenItem = useCallback(
    (item: GarageCashflowTopTransactionItem) => {
      setSelectedVoucher({
        id: item.id,
        voucherCode: item.voucherCode,
        amount: item.amount,
        transDate: item.transDate,
        partnerName: item.partnerName,
        licensePlate: item.licensePlate,
        paymentMethod: item.paymentMethod,
        paymentContent: item.paymentContent,
        paymentStatus: item.paymentStatus,
      });
    },
    [],
  );

  const handleOpenCase = useCallback(
    (caseCode: string) => {
      if (onOpenCaseDetailProp) {
        onOpenCaseDetailProp(caseCode);
      } else {
        setSelectedCaseCode(caseCode);
      }
    },
    [onOpenCaseDetailProp],
  );

  return {
    t,
    data,
    isLoading: isLoading || isFetching,
    isFetching,
    handleRefresh,
    selectedVoucher,
    setSelectedVoucher,
    selectedCaseCode,
    setSelectedCaseCode,
    exportDrawerOpen,
    setExportDrawerOpen,
    handleOpenExport,
    handleOpenItem,
    handleOpenCase,
  };
}

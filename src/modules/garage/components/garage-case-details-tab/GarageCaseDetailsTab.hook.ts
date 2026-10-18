import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { garageApi } from "../../api/garageApi";
import type {
  GarageCaseDetailViewMode,
  GarageCaseDetailsTabProps,
} from "./GarageCaseDetailsTab.type";

export function useGarageCaseDetailsTab(props: GarageCaseDetailsTabProps) {
  const {
    selectedCase,
    selectedBranchId,
    defaultViewMode = "details",
    viewMode: controlledViewMode,
    onViewModeChange,
  } = props;

  const [internalViewMode, setInternalViewMode] =
    useState<GarageCaseDetailViewMode>(defaultViewMode);

  const activeViewMode = controlledViewMode ?? internalViewMode;

  const handleViewModeChange = useCallback(
    (mode: GarageCaseDetailViewMode) => {
      if (controlledViewMode === undefined) {
        setInternalViewMode(mode);
      }
      onViewModeChange?.(mode);
    },
    [controlledViewMode, onViewModeChange],
  );

  const branchId = selectedCase?.branchExternalId || selectedBranchId || "";
  const customerCode = selectedCase?.khachHangCode;

  const { data: partnerCases = [], isLoading: isLoadingPartnerCases } =
    useQuery({
      queryKey: ["garage-cases-by-customer", branchId, customerCode],
      queryFn: () => {
        if (!customerCode) return Promise.resolve([]);
        return garageApi.getCasesByCustomer(branchId, customerCode);
      },
      enabled: Boolean(customerCode),
      staleTime: 30000,
    });

  const partnerCasesCount = Array.isArray(partnerCases)
    ? partnerCases.length
    : 0;

  return {
    activeViewMode,
    handleViewModeChange,
    partnerCasesCount,
    isLoadingPartnerCases,
    branchId,
  };
}

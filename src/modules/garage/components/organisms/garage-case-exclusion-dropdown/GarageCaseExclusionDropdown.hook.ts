import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useUpdateGarageCaseConfig } from "../../../hooks/useGarage";
import type { GarageCaseExclusionItem } from "./GarageCaseExclusionDropdown.type";

export function useGarageCaseExclusionDropdown(
  caseItem: GarageCaseExclusionItem,
  canUpdate: boolean = true,
  onOpenDrawer?: () => void,
) {
  const { t } = useTranslation("garage");
  const [open, setOpen] = useState(false);

  // Local state for instant optimistic UI feedback
  const [excludeFromReports, setExcludeFromReports] = useState<boolean>(() =>
    Boolean(caseItem.excludeFromReports),
  );
  const [excludeFromDebt, setExcludeFromDebt] = useState<boolean>(() =>
    Boolean(caseItem.excludeFromDebt),
  );

  // Synchronize local state with caseItem changes
  useEffect(() => {
    setExcludeFromReports(Boolean(caseItem.excludeFromReports));
    setExcludeFromDebt(Boolean(caseItem.excludeFromDebt));
  }, [caseItem.excludeFromReports, caseItem.excludeFromDebt]);

  const updateMutation = useUpdateGarageCaseConfig();

  const handleToggle = useCallback(
    (key: "excludeFromReports" | "excludeFromDebt") => {
      if (!canUpdate || updateMutation.isPending) return;

      const nextReports =
        key === "excludeFromReports" ? !excludeFromReports : excludeFromReports;
      const nextDebt =
        key === "excludeFromDebt" ? !excludeFromDebt : excludeFromDebt;

      // Optimistic update
      if (key === "excludeFromReports") setExcludeFromReports(nextReports);
      if (key === "excludeFromDebt") setExcludeFromDebt(nextDebt);

      updateMutation.mutate(
        {
          caseId: caseItem.id,
          payload: {
            excludeFromReports: nextReports,
            excludeFromDebt: nextDebt,
          },
        },
        {
          onError: () => {
            // Revert on failure
            setExcludeFromReports(Boolean(caseItem.excludeFromReports));
            setExcludeFromDebt(Boolean(caseItem.excludeFromDebt));
          },
        },
      );
    },
    [
      canUpdate,
      updateMutation,
      caseItem.id,
      caseItem.excludeFromReports,
      caseItem.excludeFromDebt,
      excludeFromReports,
      excludeFromDebt,
    ],
  );

  const handleTriggerClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!canUpdate) {
        onOpenDrawer?.();
        return;
      }
      setOpen((prev) => !prev);
    },
    [canUpdate, onOpenDrawer],
  );

  const hasAnyExclusion = useMemo(() => {
    return excludeFromReports || excludeFromDebt;
  }, [excludeFromReports, excludeFromDebt]);

  return {
    open,
    setOpen,
    excludeFromReports,
    excludeFromDebt,
    hasAnyExclusion,
    handleToggle,
    handleTriggerClick,
    isUpdating: updateMutation.isPending,
    t,
  };
}

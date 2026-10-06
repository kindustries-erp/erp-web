import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { moduleConfigApi } from "@/core/api/moduleConfigApi";
import { useAppStore } from "@/core/config/appStore";
import { useUpdateGarageCaseConfig } from "../../../hooks/useGarage";
import {
  GARAGE_CASE_CLASSIFICATIONS,
  type ClassificationMeta,
} from "../../GarageCaseClassificationBadge";
import type {
  GarageCaseClassificationItem,
  ClassificationOptionItem,
} from "./GarageCaseClassificationDropdown.type";

export function useGarageCaseClassificationDropdown(
  caseItem: GarageCaseClassificationItem,
  canUpdate: boolean = true,
  onOpenDrawer?: () => void,
) {
  const { t } = useTranslation("garage");
  const locale = useAppStore((s) => s.locale);
  const [open, setOpen] = useState(false);

  const updateMutation = useUpdateGarageCaseConfig();

  // Fetch Module Categories for GARAGE_CASE
  const { data: categories = [] } = useQuery({
    queryKey: ["module-config-categories", "GARAGE_CASE"],
    queryFn: () => moduleConfigApi.getCategories("GARAGE_CASE"),
    staleTime: 60000,
  });

  // Build options list
  const options = useMemo<ClassificationOptionItem[]>(() => {
    const list: ClassificationOptionItem[] = [];

    // 1. Map 4 default classifications
    const standardCodes = ["SUA_CHUA_CHUNG", "KY_GUI_NOI_BO", "OJ", "KHAC"];
    for (const code of standardCodes) {
      const meta: ClassificationMeta | undefined =
        GARAGE_CASE_CLASSIFICATIONS[code];
      const matchedCat = categories.find((c: any) => c.code === code);
      const label = matchedCat
        ? locale === "en" && matchedCat.nameEn
          ? matchedCat.nameEn
          : matchedCat.name
        : meta?.label || code;

      list.push({
        id: matchedCat?.id || code,
        code,
        categoryId: matchedCat?.id || null,
        label,
        subLabel: matchedCat?.description || meta?.subLabel,
        icon: meta?.icon,
        colorClass: meta?.colorClass,
      });
    }

    // 2. Add extra categories from ModuleConfig not in standard list
    for (const cat of categories) {
      if (!standardCodes.includes(cat.code) && cat.code !== "OJ_NGOAI") {
        list.push({
          id: cat.id,
          code: cat.code,
          categoryId: cat.id,
          label: locale === "en" && cat.nameEn ? cat.nameEn : cat.name,
          subLabel: cat.description || undefined,
          colorClass:
            "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/50 dark:text-slate-300 dark:border-slate-800/40",
        });
      }
    }

    // 3. Add Unclassified option
    list.push({
      id: "unclassified",
      code: null,
      categoryId: null,
      label: t("cases.classification.unclassified", "Chưa phân loại"),
      subLabel: t(
        "cases.classification.clearHint",
        "Xóa phân loại hiện tại của phiếu",
      ),
      isUnclassified: true,
    });

    return list;
  }, [categories, locale, t]);

  // Determine current active option
  const activeOption = useMemo(() => {
    if (caseItem.categoryId) {
      const byCat = options.find((o) => o.categoryId === caseItem.categoryId);
      if (byCat) return byCat;
    }
    const currentCode =
      caseItem.category?.code || caseItem.classification || "";
    const normalized = currentCode === "OJ_NGOAI" ? "OJ" : currentCode;
    return options.find((o) => o.code === normalized) || null;
  }, [caseItem, options]);

  const handleSelect = useCallback(
    (option: ClassificationOptionItem) => {
      if (!canUpdate || updateMutation.isPending) return;

      const currentCode =
        caseItem.category?.code || caseItem.classification || null;
      const normalizedCurrent = currentCode === "OJ_NGOAI" ? "OJ" : currentCode;

      // If choosing same option, just close
      if (
        (option.code === normalizedCurrent &&
          (!option.categoryId || option.categoryId === caseItem.categoryId)) ||
        (option.code === null && !normalizedCurrent && !caseItem.categoryId)
      ) {
        setOpen(false);
        return;
      }

      setOpen(false);

      const payload: {
        categoryId?: string | null;
        classification?: string | null;
        excludeFromDebt?: boolean;
      } = {};

      if (option.isUnclassified) {
        payload.categoryId = null;
        payload.classification = null;
      } else {
        payload.classification = option.code;
        if (option.categoryId) {
          payload.categoryId = option.categoryId;
        }
      }

      // Giữ nguyên trạng thái excludeFromDebt hiện có của phiếu để tránh backend tự kích hoạt khi chọn OJ
      if (caseItem.excludeFromDebt !== undefined) {
        payload.excludeFromDebt = Boolean(caseItem.excludeFromDebt);
      }

      updateMutation.mutate({
        caseId: caseItem.id,
        payload,
      });
    },
    [canUpdate, updateMutation, caseItem],
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

  return {
    open,
    setOpen,
    options,
    activeOption,
    handleSelect,
    handleTriggerClick,
    isUpdating: updateMutation.isPending,
  };
}

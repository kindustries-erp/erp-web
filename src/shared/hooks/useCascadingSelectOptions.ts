import { useMemo } from "react";
import type { ComboboxOption } from "@/shared/components/Combobox";
import {
  resolveOptionLabel,
  type ModuleAttributeDef,
} from "@/core/api/moduleConfigApi";

interface UseCascadingSelectOptionsParams {
  attr: ModuleAttributeDef;
  parentDef?: ModuleAttributeDef;
  allAttributes?: Record<string, any>;
  categoryCode?: string | null;
  displayName: string;
  parentDisplayName?: string | null;
  locale: string;
  t: (key: string, fallback: string) => string;
}

export function useCascadingSelectOptions({
  attr,
  parentDef,
  allAttributes,
  categoryCode,
  displayName,
  parentDisplayName,
  locale,
  t,
}: UseCascadingSelectOptionsParams) {
  return useMemo(() => {
    let rawOptions = attr.options || [];

    let selectedParent = "";
    if (parentDef) {
      selectedParent =
        allAttributes?.[parentDef.id] || allAttributes?.[parentDef.code] || "";
    }
    if (!selectedParent && attr.parentAttrCode) {
      selectedParent = allAttributes?.[attr.parentAttrCode] || "";
    }
    if (!selectedParent) {
      selectedParent =
        allAttributes?.category ||
        allAttributes?.type_invoice_in ||
        allAttributes?.type_invoice_out ||
        allAttributes?.type_inventory_receipt ||
        categoryCode ||
        "";
    }

    const hasParentConstraint =
      Boolean(attr.parentAttrCode) ||
      rawOptions.some((opt) => Boolean(opt.parentValue));

    if (hasParentConstraint) {
      if (selectedParent) {
        rawOptions = rawOptions.filter(
          (opt) => !opt.parentValue || opt.parentValue === selectedParent,
        );
      } else if (attr.parentAttrCode) {
        rawOptions = [];
      }
    }

    const optList: ComboboxOption[] = rawOptions.map((opt) => ({
      value: opt.value,
      label: resolveOptionLabel(opt, locale, t),
      code: opt.value,
    }));

    const selectPlaceholder =
      attr.parentAttrCode && !selectedParent
        ? `-- ${t("moduleConfig.selectParentFirst", "Vui lòng chọn")} ${parentDisplayName} ${t("moduleConfig.first", "trước")} --`
        : `-- ${t("common.select", "Chọn")} ${displayName} --`;

    const disabled = Boolean(attr.parentAttrCode && !selectedParent);

    return {
      optList,
      selectPlaceholder,
      disabled,
    };
  }, [
    attr,
    parentDef,
    allAttributes,
    categoryCode,
    displayName,
    parentDisplayName,
    locale,
    t,
  ]);
}

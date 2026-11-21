import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { ViewModeComboboxProps } from "./ViewModeCombobox.type";
import { getPresetLabel } from "./ViewModeCombobox.helper";

export function useViewModeCombobox<TFilter extends string = string>(
  props: ViewModeComboboxProps<TFilter>,
) {
  const {
    presets,
    activePresetKey,
    onSelect,
    onCreateView,
    onEditView,
    onDeleteView,
    i18nNamespace,
    filterGroup,
  } = props;

  const { t } = useTranslation(
    i18nNamespace ? [i18nNamespace, "common"] : "common",
  );

  const [open, setOpen] = useState(false);
  const [pendingDeleteKey, setPendingDeleteKey] = useState<string | null>(null);

  const activePreset = useMemo(() => {
    return presets.find((p) => p.key === activePresetKey) || presets[0];
  }, [presets, activePresetKey]);

  const activePresetLabel = useMemo(() => {
    if (!activePreset) {
      return t("viewMode", {
        defaultValue: t("cases.viewMode", { defaultValue: "Chế độ xem" }),
      });
    }
    return getPresetLabel(activePreset, t);
  }, [activePreset, t]);

  const pendingDeletePreset = useMemo(() => {
    return presets.find((p) => p.key === pendingDeleteKey);
  }, [presets, pendingDeleteKey]);

  const pendingDeleteLabel = useMemo(() => {
    return pendingDeletePreset ? getPresetLabel(pendingDeletePreset, t) : "";
  }, [pendingDeletePreset, t]);

  const activeFilterItem = useMemo(() => {
    if (!filterGroup) return null;
    return filterGroup.items.find((item) => item.value === filterGroup.value);
  }, [filterGroup]);

  const isFilterActive = useMemo(() => {
    if (!filterGroup) return false;
    const allVal = filterGroup.allValue ?? ("all" as TFilter);
    return (
      filterGroup.value !== allVal && filterGroup.value !== ("ALL" as TFilter)
    );
  }, [filterGroup]);

  const triggerLabel = useMemo(() => {
    if (isFilterActive && activeFilterItem) {
      return `${activePresetLabel} • ${activeFilterItem.label}`;
    }
    return activePresetLabel;
  }, [isFilterActive, activeFilterItem, activePresetLabel]);

  return {
    t,
    open,
    setOpen,
    pendingDeleteKey,
    setPendingDeleteKey,
    activePreset,
    activePresetLabel,
    pendingDeleteLabel,
    activeFilterItem,
    isFilterActive,
    triggerLabel,
    handleSelectPreset: (preset: typeof activePreset) => {
      onSelect(preset);
      setOpen(false);
    },
    handleSelectFilter: (val: TFilter) => {
      filterGroup?.onChange(val);
      setOpen(false);
    },
    handleOpenEdit: (preset: typeof activePreset) => {
      onEditView(preset);
      setOpen(false);
    },
    handleOpenCreate: () => {
      onCreateView();
      setOpen(false);
    },
    handleConfirmDelete: () => {
      if (pendingDeleteKey) {
        onDeleteView(pendingDeleteKey);
        setPendingDeleteKey(null);
      }
    },
    handleCancelDelete: () => {
      setPendingDeleteKey(null);
    },
  };
}

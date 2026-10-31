import * as React from "react";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { getActiveItem } from "./V2TabCombobox.helper";
import type {
  V2TabComboboxItem,
  V2TabComboboxProps,
} from "./V2TabCombobox.type";

export interface UseV2TabComboboxParams {
  items: V2TabComboboxItem[];
  activeKey?: string;
  onSelect?: (key: string) => void;
  labelPrefix?: string;
}

export function useV2TabCombobox({
  items,
  activeKey,
  onSelect,
  labelPrefix,
}: UseV2TabComboboxParams) {
  const { t } = useV2Translation();
  const [open, setOpen] = React.useState(false);

  const activeItem = React.useMemo(
    () => getActiveItem(items, activeKey),
    [items, activeKey],
  );

  const prefix = labelPrefix ?? t("v2.table.viewMode", "Chế độ xem");

  const handleSelect = React.useCallback(
    (key: string) => {
      onSelect?.(key);
      setOpen(false);
    },
    [onSelect],
  );

  return {
    open,
    setOpen,
    activeItem,
    prefix,
    handleSelect,
  };
}

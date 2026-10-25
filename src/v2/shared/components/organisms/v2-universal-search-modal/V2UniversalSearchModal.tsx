import React from "react";
import { useViewport } from "@/v2/shared/hooks/useViewport";
import { useV2UniversalSearch } from "./V2UniversalSearchModal.hook";
import { useV2NavItems } from "./useV2NavItems";
import { V2UniversalSearchModalDesktop } from "./V2UniversalSearchModal.desktop";
import { V2UniversalSearchModalMobile } from "./V2UniversalSearchModal.mobile";
import type { V2UniversalSearchModalProps } from "./V2UniversalSearchModal.type";

export const V2UniversalSearchModal: React.FC<V2UniversalSearchModalProps> = ({
  open,
  onClose,
  onSelect,
  items,
}) => {
  const { isMobile } = useViewport();
  const defaultItems = useV2NavItems();
  const effectiveItems = items ?? defaultItems;

  const searchState = useV2UniversalSearch({
    items: effectiveItems,
    open,
    onClose,
    onSelect,
  });

  if (!open) return null;

  return isMobile ? (
    <V2UniversalSearchModalMobile
      {...searchState}
      open={open}
      onClose={onClose}
    />
  ) : (
    <V2UniversalSearchModalDesktop
      {...searchState}
      open={open}
      onClose={onClose}
    />
  );
};
V2UniversalSearchModal.displayName = "V2UniversalSearchModal";

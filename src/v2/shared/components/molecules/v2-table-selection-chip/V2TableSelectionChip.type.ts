import type * as React from "react";

export interface V2TableSelectionChipProps {
  count: number;
  onClear: () => void;
  /** Bọc trigger `☑ (N) ▾` bằng dropdown của consumer */
  renderMenu?: (trigger: React.ReactElement) => React.ReactNode;
  className?: string;
}

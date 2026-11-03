import type React from "react";
import type { V2BaseProps } from "@/v2/shared/types";

export interface V2SearchItem {
  id: string;
  title: string;
  category?: string;
  group?: string;
  keywords?: string[];
  icon?: React.ReactNode;
}

export interface V2UniversalSearchModalProps extends Omit<
  V2BaseProps,
  "onSelect"
> {
  open: boolean;
  onClose: () => void;
  onSelect: (item: V2SearchItem) => void;
  items?: V2SearchItem[];
}

export interface V2UniversalSearchViewProps {
  open: boolean;
  onClose: () => void;
  query: string;
  setQuery: (q: string) => void;
  results: V2SearchItem[];
  selectedIndex: number;
  setSelectedIndex: (idx: number) => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  handleSelect: (item: V2SearchItem) => void;
  inputRef: React.RefObject<HTMLInputElement>;
}

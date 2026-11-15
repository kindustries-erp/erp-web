import * as React from "react";
import { Search } from "lucide-react";
import { V2Button, V2Icon } from "@/v2/shared/components/atoms";
import { V2Input } from "@/v2/shared/components/atoms/v2-input";
import { V2BottomSheet } from "@/v2/shared/components/molecules/v2-bottom-sheet";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { V2ComboboxList } from "./V2ComboboxList";
import type { V2ComboboxOption } from "./V2Combobox.type";

export interface V2ComboboxSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  searchable: boolean;
  searchPlaceholder: string;
  query: string;
  onQueryChange: (query: string) => void;
  onKeyDown: (event: React.KeyboardEvent) => void;
  options: V2ComboboxOption[];
  value: string | null;
  activeIndex: number;
  loading?: boolean;
  emptyLabel: string;
  loadingText: string;
  onSelect: (option: V2ComboboxOption) => void;
  onHoverIndex: (index: number) => void;
  onScroll?: (e: React.UIEvent<HTMLUListElement>) => void;
}

export const V2ComboboxSheet: React.FC<V2ComboboxSheetProps> = ({
  open,
  onOpenChange,
  title,
  searchable,
  searchPlaceholder,
  query,
  onQueryChange,
  onKeyDown,
  options,
  value,
  activeIndex,
  loading = false,
  emptyLabel,
  loadingText,
  onSelect,
  onHoverIndex,
  onScroll,
}) => {
  const { t } = useV2Translation();

  return (
    <V2BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      icon={<V2Icon icon={Search} size={16} />}
      maxHeightClass="max-h-[85dvh] h-auto"
      bodyClassName="px-4 py-3 overflow-y-auto"
      footer={
        <div className="pb-[calc(env(safe-area-inset-bottom)+0.25rem)]">
          <V2Button
            type="button"
            variant="outline"
            fullWidth
            className="h-11 rounded-xl"
            onClick={() => onOpenChange(false)}
          >
            {t("v2.common.close", "Đóng")}
          </V2Button>
        </div>
      }
    >
      <div
        className="flex flex-col gap-3"
        data-v2-combobox-panel=""
        onKeyDown={onKeyDown}
      >
        {searchable && (
          <V2Input
            sizeVariant="lg"
            value={query}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            onChange={(event) => onQueryChange(event.target.value)}
          />
        )}
        <V2ComboboxList
          isMobile
          options={options}
          value={value}
          activeIndex={activeIndex}
          loading={loading}
          emptyLabel={emptyLabel}
          loadingText={loadingText}
          onSelect={onSelect}
          onHoverIndex={onHoverIndex}
          onScroll={onScroll}
        />
      </div>
    </V2BottomSheet>
  );
};
V2ComboboxSheet.displayName = "V2ComboboxSheet";

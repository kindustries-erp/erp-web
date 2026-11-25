import * as React from "react";
import { V2Input } from "@/v2/shared/components/atoms";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { useViewport } from "@/v2/shared/hooks/useViewport";
import { cn } from "@/v2/shared/utils/cn";
import { V2ComboboxList } from "../v2-combobox/V2ComboboxList";
import { useV2AutocompleteInput } from "./V2AutocompleteInput.hook";
import type { V2AutocompleteInputProps } from "./V2AutocompleteInput.type";

/**
 * Ô nhập chữ có danh sách gợi ý thả xuống ngay dưới ô (không mở sheet riêng để giữ bàn phím trên mobile).
 * Chọn gợi ý để điền nhanh; gõ chữ không có trong gợi ý thì giữ nguyên như ô nhập thường.
 */
export const V2AutocompleteInput: React.FC<V2AutocompleteInputProps> = ({
  value,
  onChange,
  options,
  onSelect,
  onSearchChange,
  loading = false,
  maxSuggestions = 8,
  placeholder,
  disabled,
  className,
  inputClassName,
  "aria-label": ariaLabel,
}) => {
  const { t } = useV2Translation();
  const { isMobile } = useViewport();
  const listId = React.useId();
  const a = useV2AutocompleteInput({
    value,
    options,
    maxSuggestions,
    onChange,
    onSelect,
    onSearchChange,
  });

  return (
    <div className={cn("relative w-full", className)}>
      <V2Input
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={a.open}
        aria-controls={listId}
        aria-label={ariaLabel ?? placeholder}
        autoComplete="off"
        sizeVariant="lg"
        inputClassName={cn("text-base md:text-sm", inputClassName)}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => a.type(e.target.value)}
        onFocus={() => a.setOpen(true)}
        onBlur={() => a.setOpen(false)}
        onKeyDown={a.onKeyDown}
      />
      {a.open ? (
        <div
          id={listId}
          data-v2-autocomplete-panel=""
          // Giữ focus ở ô nhập khi bấm gợi ý (không để blur đóng danh sách trước khi chọn).
          onMouseDown={(e) => e.preventDefault()}
          className="absolute left-0 right-0 top-full z-50 mt-1 rounded-md border border-border bg-popover p-1 shadow-lg"
        >
          <V2ComboboxList
            options={a.suggestions}
            value={null}
            activeIndex={a.activeIndex}
            loading={loading && a.suggestions.length === 0}
            isMobile={isMobile}
            emptyLabel=""
            loadingText={t("v2.form.searching", "Đang tìm...")}
            onSelect={a.pick}
            onHoverIndex={a.setActiveIndex}
          />
        </div>
      ) : null}
    </div>
  );
};
V2AutocompleteInput.displayName = "V2AutocompleteInput";

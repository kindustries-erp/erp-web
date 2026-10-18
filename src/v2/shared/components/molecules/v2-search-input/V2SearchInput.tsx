import * as React from "react";
import { Search, X } from "lucide-react";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { Input } from "@/v2/shared/ui";
import { cn } from "@/v2/shared/utils/cn";
import { useV2SearchInput } from "./V2SearchInput.hook";
import type { V2SearchInputProps } from "./V2SearchInput.type";

export const V2SearchInput: React.FC<V2SearchInputProps> = ({
  value = "",
  onChange,
  placeholder,
  debounceMs = 300,
  className,
}) => {
  const { t } = useV2Translation();
  const { draft, setDraft, commit } = useV2SearchInput({
    value,
    onChange,
    debounceMs,
  });
  const label = placeholder ?? t("v2.table.search", "Tìm kiếm...");

  return (
    <div className={cn("relative w-56", className)}>
      <Search
        aria-hidden
        className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        type="text"
        value={draft}
        placeholder={label}
        aria-label={label}
        className="h-8 pl-8 pr-8 text-sm"
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") commit(draft);
          if (event.key === "Escape") commit("");
        }}
      />
      {draft !== "" && (
        <V2Button
          variant="ghost"
          size="xs"
          aria-label={t("v2.table.clearSearch", "Xóa tìm kiếm")}
          className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0"
          onClick={() => commit("")}
        >
          <X className="h-3.5 w-3.5" />
        </V2Button>
      )}
    </div>
  );
};
V2SearchInput.displayName = "V2SearchInput";

import * as React from "react";
import { Search, X } from "lucide-react";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { Input } from "@/v2/shared/ui";

export interface V2FilterColumnSearchProps {
  value: string;
  onChange: (text: string) => void;
}

/** Ô tìm cột cần lọc, dùng chung cho panel bên phải và editor trong hộp thoại bộ lọc */
export const V2FilterColumnSearch: React.FC<V2FilterColumnSearchProps> = ({
  value,
  onChange,
}) => {
  const { t } = useV2Translation();
  const placeholder = t("v2.table.filterSearchColumns", "Tìm cột cần lọc...");
  return (
    <div className="relative flex shrink-0 items-center">
      <Search className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-muted-fg" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-8 pl-8 pr-7 text-xs"
      />
      {value && (
        <V2Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label={t("v2.table.clearSearch", "Xóa tìm kiếm")}
          onClick={() => onChange("")}
          className="absolute right-1"
        >
          <X className="h-3 w-3" />
        </V2Button>
      )}
    </div>
  );
};

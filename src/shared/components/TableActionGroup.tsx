import { RefreshCcw, Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { FilterButton } from "@/shared/components/FilterPanel";
import { BtnPrimary } from "@/shared/components/BtnPrimary";
import { cn } from "@/shared/utils";
import { useT } from "@/core/i18n";

interface TableActionGroupProps {
  onRefresh?: () => void;
  loading?: boolean;

  onFilterToggle?: () => void;
  activeFilterCount?: number;

  onCreate?: () => void;
  createLabel?: string;

  children?: React.ReactNode;
}

export function TableActionGroup({
  onRefresh,
  loading,
  onFilterToggle,
  activeFilterCount = 0,
  onCreate,
  createLabel = "Tạo mới",
  children,
}: TableActionGroupProps) {
  const t = useT();
  return (
    <div className="flex items-center gap-2 w-full justify-end">
      {onRefresh && (
        <Button
          variant="secondary"
          size="sm"
          className="px-3 py-2"
          onClick={onRefresh}
          disabled={loading}
        >
          <RefreshCcw
            className={cn("h-3.5 w-3.5", loading && "animate-spin")}
          />
          <span>{t("Tải lại")}</span>
        </Button>
      )}

      {onFilterToggle && (
        <FilterButton
          onClick={onFilterToggle}
          activeCount={activeFilterCount}
        />
      )}

      {children}

      {onCreate && (
        <BtnPrimary onClick={onCreate}>
          <Plus className="h-4 w-4 mr-1" />
          {t(createLabel)}
        </BtnPrimary>
      )}
    </div>
  );
}

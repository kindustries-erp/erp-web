import * as React from "react";
import { Car, Layers, CircleDollarSign } from "lucide-react";
import { V2SearchInput } from "@/v2/shared/components/molecules/v2-search-input";
import { V2Badge } from "@/v2/shared/components/atoms/v2-badge";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { money } from "@/shared/utils/format";

export interface GarageCasesKanbanToolbarProps {
  search: string;
  onSearchChange: (val: string) => void;
  totalVehiclesCount: number;
  totalCasesCount: number;
  totalRevenue: number;
}

export const GarageCasesKanbanToolbar: React.FC<
  GarageCasesKanbanToolbarProps
> = ({
  search,
  onSearchChange,
  totalVehiclesCount,
  totalCasesCount,
  totalRevenue,
}) => {
  const { t } = useV2Translation();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1">
      <div className="flex items-center gap-2 flex-wrap">
        <V2Badge
          variant="outline"
          className="h-7 px-3 rounded-full bg-surface/70 dark:bg-zinc-900/60 border-border/40 dark:border-white/[0.08] text-foreground font-medium gap-1.5 shadow-2xs"
        >
          <Car className="w-3.5 h-3.5 text-muted-fg" />
          <V2Text variant="caption" className="font-semibold text-foreground">
            {totalVehiclesCount}{" "}
            {t("v2.garageCases.kanban.totalVehicles", "xe")}
          </V2Text>
        </V2Badge>

        <V2Badge
          variant="outline"
          className="h-7 px-3 rounded-full bg-surface/70 dark:bg-zinc-900/60 border-border/40 dark:border-white/[0.08] text-foreground font-medium gap-1.5 shadow-2xs"
        >
          <Layers className="w-3.5 h-3.5 text-muted-fg" />
          <V2Text variant="caption" className="font-semibold text-foreground">
            {totalCasesCount} {t("v2.garageCases.kanban.totalCases", "phiếu")}
          </V2Text>
        </V2Badge>

        {totalRevenue > 0 && (
          <V2Badge
            variant="outline"
            className="h-7 px-3 rounded-full bg-surface/70 dark:bg-zinc-900/60 border-border/40 dark:border-white/[0.08] text-foreground font-mono font-bold gap-1.5 shadow-2xs"
          >
            <CircleDollarSign className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{money(totalRevenue)}</span>
          </V2Badge>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <V2SearchInput
          value={search}
          onChange={onSearchChange}
          placeholder={t(
            "v2.garageCases.kanban.searchPlaceholder",
            "Tìm số phiếu, xe...",
          )}
          debounceMs={150}
          className="w-48 sm:w-64"
        />
      </div>
    </div>
  );
};

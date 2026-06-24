import { RefreshCcw, Plus, MoreHorizontal } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Button } from "@/shared/components/ui/Button";
import { FilterButton } from "@/shared/components/FilterPanel";
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

import { setGlobalPortalTarget } from "./portalStore";

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
      {children}

      {onFilterToggle && (
        <FilterButton
          onClick={onFilterToggle}
          activeCount={activeFilterCount}
        />
      )}

      <div
        ref={setGlobalPortalTarget}
        className="empty:hidden flex items-center justify-center"
      />

      {onRefresh && (
        <Button
          variant="secondary"
          size="icon"
          className="h-8 w-8 px-0"
          onClick={onRefresh}
          disabled={loading}
          title={t("Tải lại")}
        >
          <RefreshCcw className={cn("h-4 w-4", loading && "animate-spin")} />
        </Button>
      )}

      {onCreate && (
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <Button variant="secondary" size="icon" className="h-8 w-8 px-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={12}
              className="z-[9999] min-w-[160px] rounded-lg bg-surface border border-border shadow-md p-1 popup-content"
            >
              <DropdownMenu.Item
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none hover:bg-[color:var(--popup-bg-hover)] focus:bg-[color:var(--popup-bg-hover)]"
                onClick={onCreate}
              >
                <Plus className="h-4 w-4 text-emerald-600" />
                <span className="font-medium">{t(createLabel)}</span>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      )}
    </div>
  );
}

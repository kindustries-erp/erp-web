import * as React from "react";
import { Filter } from "lucide-react";
import { V2ToolbarIconButton } from "@/v2/shared/components/atoms/v2-toolbar-icon-button";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type { V2TableFilterButtonProps } from "./V2TableFilterButton.type";

export const V2TableFilterButton: React.FC<V2TableFilterButtonProps> = ({
  activeCount = 0,
  onClick,
  className,
}) => {
  const { t } = useV2Translation();
  return (
    <V2ToolbarIconButton
      label={t("v2.table.filter", "Bộ lọc")}
      icon={<Filter className="h-4 w-4" />}
      active={activeCount > 0}
      badge={activeCount}
      onClick={onClick}
      className={className}
    />
  );
};

import * as React from "react";
import { Building2 } from "lucide-react";
import { cn } from "@/v2/shared/utils/cn";
import { V2Button, V2Text } from "@/v2/shared/components/atoms";
import { V2BranchBadgeProps } from "./V2BranchBadge.type";

export const V2BranchBadge: React.FC<V2BranchBadgeProps> = ({
  branchName = "Chi nhánh chính",
  companyName,
  onClick,
  className,
  ...props
}) => {
  return (
    <V2Button
      type="button"
      variant="ghost"
      size="xs"
      onClick={onClick}
      aria-label={`Chi nhánh: ${branchName}`}
      className={cn(
        "v2-branch-badge flex items-center gap-1.5 h-6 px-2 rounded-md border border-border bg-surface text-[11px] font-medium text-muted-fg hover:text-foreground hover:bg-surface-hover cursor-pointer select-none transition-all shadow-2xs",
        className,
      )}
      {...props}
    >
      <Building2 size={12} className="opacity-70 flex-shrink-0" />
      <V2Text
        as="span"
        variant="caption"
        truncate
        className="text-inherit font-medium max-w-[120px] sm:max-w-[160px]"
      >
        {branchName}
      </V2Text>
      {companyName && (
        <V2Text
          as="span"
          variant="caption"
          truncate
          className="hidden lg:inline text-[10px] text-faint opacity-80 border-l border-border pl-1.5 ml-0.5 max-w-[120px]"
        >
          {companyName}
        </V2Text>
      )}
    </V2Button>
  );
};

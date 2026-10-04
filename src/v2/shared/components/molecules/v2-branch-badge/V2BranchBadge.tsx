import * as React from "react";
import { Building2 } from "lucide-react";
import { cn } from "@/v2/shared/utils/cn";
import { V2BranchBadgeProps } from "./V2BranchBadge.type";

export const V2BranchBadge: React.FC<V2BranchBadgeProps> = ({
  branchName = "Chi nhánh chính",
  companyName,
  onClick,
  className,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Chi nhánh: ${branchName}`}
      className={cn(
        "v2-branch-badge flex items-center gap-1.5 h-6 px-2 rounded-md border border-border bg-surface text-[11px] font-medium text-[color:var(--muted-fg,hsl(var(--muted-foreground)))] hover:text-foreground hover:bg-surface-hover cursor-pointer select-none transition-all shadow-2xs",
        className,
      )}
    >
      <Building2 size={12} className="opacity-70 flex-shrink-0" />
      <span className="truncate max-w-[120px] sm:max-w-[160px]">
        {branchName}
      </span>
      {companyName && (
        <span className="hidden lg:inline text-[10px] text-[color:var(--faint,hsl(var(--muted-foreground)))] opacity-80 border-l border-border pl-1.5 ml-0.5 truncate max-w-[120px]">
          {companyName}
        </span>
      )}
    </button>
  );
};

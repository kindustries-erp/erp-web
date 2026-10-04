import * as React from "react";
import { cn } from "@/v2/shared/utils/cn";
import { V2Breadcrumb } from "../v2-breadcrumb";
import { V2QuickSearch } from "../v2-quick-search";
import { V2BranchBadge } from "../v2-branch-badge";
import { V2TopbarProps } from "./V2Topbar.type";

export const V2Topbar: React.FC<V2TopbarProps> = ({
  breadcrumbs = [],
  branchName,
  companyName,
  onSearchClick,
  onBranchClick,
  actions,
  className,
}) => {
  return (
    <header
      data-testid="v2-topbar"
      className={cn(
        "v2-topbar flex h-9 min-h-[36px] items-center justify-between gap-3 border-b border-border bg-card/60 px-3 select-none flex-shrink-0 transition-colors",
        className,
      )}
    >
      {/* Left: Breadcrumbs navigation */}
      <div className="flex items-center min-w-0 flex-1 overflow-hidden">
        <V2Breadcrumb items={breadcrumbs} />
      </div>

      {/* Right: Quick actions (Search, Branch, Custom actions) */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <V2QuickSearch onClick={onSearchClick} />
        {branchName && (
          <V2BranchBadge
            branchName={branchName}
            companyName={companyName}
            onClick={onBranchClick}
          />
        )}
        {actions}
      </div>
    </header>
  );
};

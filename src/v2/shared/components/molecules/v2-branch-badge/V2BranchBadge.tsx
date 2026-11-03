import * as React from "react";
import { Building2 } from "lucide-react";
import { cn } from "@/v2/shared/utils/cn";
import { V2Button, V2Text } from "@/v2/shared/components/atoms";
import { V2BranchBadgeProps } from "./V2BranchBadge.type";

export const V2BranchBadge: React.FC<V2BranchBadgeProps> = ({
  branchName = "Chi nhánh chính",
  companyName,
  logoUrl,
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
        "v2-branch-badge flex items-center gap-1.5 h-6 px-2 rounded-md border border-border dark:border-white/[0.08] bg-surface dark:bg-white/[0.05] text-[11px] font-medium text-muted-fg dark:text-zinc-200 hover:text-foreground dark:hover:text-white hover:bg-surface-hover dark:hover:bg-white/[0.1] cursor-pointer select-none transition-all shadow-2xs",
        className,
      )}
      {...props}
    >
      {logoUrl ? (
        <img
          src={logoUrl}
          alt="Branch logo"
          className="w-[18px] h-[18px] object-contain rounded-xs flex-shrink-0"
        />
      ) : (
        <Building2 size={12} className="opacity-70 flex-shrink-0" />
      )}
      <V2Text
        as="span"
        variant="caption"
        truncate
        className="text-inherit font-medium max-w-[200px] md:max-w-[320px] lg:max-w-none"
      >
        {branchName}
      </V2Text>
      {companyName && companyName !== branchName && (
        <V2Text
          as="span"
          variant="caption"
          truncate
          className="hidden lg:inline text-[10px] text-faint dark:text-zinc-400 opacity-80 border-l border-border dark:border-white/[0.08] pl-1.5 ml-0.5 max-w-[160px]"
        >
          {companyName}
        </V2Text>
      )}
    </V2Button>
  );
};

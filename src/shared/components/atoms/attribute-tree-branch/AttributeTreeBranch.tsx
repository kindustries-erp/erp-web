import React from "react";
import { cn } from "@/shared/utils";

export interface AttributeTreeBranchProps {
  children: React.ReactNode;
  className?: string;
}

export function AttributeTreeBranch({
  children,
  className,
}: AttributeTreeBranchProps) {
  return (
    <div
      className={cn(
        "ml-3.5 pl-3 border-l-2 border-primary/30 py-0.5 space-y-1",
        className,
      )}
    >
      {children}
    </div>
  );
}

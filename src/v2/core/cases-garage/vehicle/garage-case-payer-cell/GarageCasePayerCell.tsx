import React from "react";
import { cn } from "@/shared/utils";

export interface GarageCasePayerCellProps {
  name: string | null | undefined;
  code?: string | null;
  className?: string;
}

/** Ô đối tượng thanh toán: tên đậm, mã nhỏ bên dưới; rỗng hiện "—". */
export function GarageCasePayerCell({
  name,
  code,
  className,
}: GarageCasePayerCellProps) {
  if (!name && !code) {
    return <span className="text-muted-foreground/50 select-none">—</span>;
  }
  return (
    <div className={cn("flex min-w-0 flex-col leading-tight", className)}>
      <span
        title={name ?? code ?? undefined}
        className="truncate text-xs font-semibold text-slate-800 dark:text-slate-200 select-text"
      >
        {name ?? code}
      </span>
      {name && code && (
        <span className="truncate font-mono text-[11px] text-muted-foreground select-text">
          {code}
        </span>
      )}
    </div>
  );
}

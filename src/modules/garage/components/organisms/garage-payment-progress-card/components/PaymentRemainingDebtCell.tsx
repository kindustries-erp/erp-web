import React from "react";
import { money } from "@/shared/utils/format";
import { Tooltip } from "@/core/components/ui/Tooltip";

export const renderDebtAmount = (val: number) => (
  <span
    className={
      val > 0
        ? "font-mono font-bold text-foreground text-[12px] tabular-nums"
        : "font-mono text-muted-foreground/60 text-[11px]"
    }
  >
    {val > 0 ? money(val) : "—"}
  </span>
);

export function PaymentRemainingDebtCell({
  val,
  prefix,
}: {
  val: number;
  prefix: string;
}) {
  return (
    <Tooltip
      content={val > 0 ? `${prefix}: ${money(val)}` : undefined}
      side="top"
    >
      <span
        className={
          val > 0
            ? "font-mono font-bold text-foreground text-[12px] tabular-nums cursor-default"
            : "font-mono text-muted-foreground/60 text-[11px] cursor-default"
        }
      >
        {val > 0 ? money(val) : "—"}
      </span>
    </Tooltip>
  );
}

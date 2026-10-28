import React from "react";
import { useTranslation } from "react-i18next";
import { LedgerDisplayRow } from "./fifoTransform";

interface FifoRowBadgesProps {
  row: LedgerDisplayRow;
}

/**
 * Nhãn trạng thái của dòng FIFO: hàng trả về kho và phần xuất vượt tồn.
 */
export function FifoRowBadges({ row }: FifoRowBadgesProps) {
  const { t } = useTranslation(["vinfastParts"]);

  if (!row.isReturn && row.shortageDelta <= 0) return null;

  return (
    <span className="mr-1 inline-flex flex-wrap gap-1">
      {row.isReturn && (
        <span className="rounded bg-amber-100 dark:bg-amber-950/60 px-1.5 text-[11px] text-amber-800 dark:text-amber-300">
          {t("vinfastParts:FIFO_RETURN", "Trả hàng")}
        </span>
      )}
      {row.shortageDelta > 0 && (
        <span className="rounded bg-red-100 dark:bg-red-950/60 px-1.5 text-[11px] text-red-700 dark:text-red-300">
          {t("vinfastParts:FIFO_SHORTAGE", "Thiếu hàng")}{" "}
          {row.shortageDelta.toLocaleString(undefined, {
            maximumFractionDigits: 2,
          })}
        </span>
      )}
    </span>
  );
}

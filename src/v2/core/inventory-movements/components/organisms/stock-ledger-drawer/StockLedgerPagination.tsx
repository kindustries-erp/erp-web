import * as React from "react";
import { V2Button, V2Text } from "@/v2/shared/components";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";

export interface StockLedgerPaginationProps {
  page: number;
  totalPages: number;
  onChangePage: (page: number) => void;
}

export function StockLedgerPagination({
  page,
  totalPages,
  onChangePage,
}: StockLedgerPaginationProps) {
  const { t } = useV2Translation();

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between pt-3">
      <V2Button
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={() => onChangePage(page - 1)}
      >
        {t("v2.common.previous", "Trước")}
      </V2Button>
      <V2Text as="span" variant="body-sm" className="text-muted-fg">
        {page} / {totalPages}
      </V2Text>
      <V2Button
        variant="outline"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onChangePage(page + 1)}
      >
        {t("v2.common.next", "Sau")}
      </V2Button>
    </div>
  );
}

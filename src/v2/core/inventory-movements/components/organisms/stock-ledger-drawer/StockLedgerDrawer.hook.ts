import * as React from "react";
import { useStockTransactionsQuery } from "../../../api/queries/useStockTransactionsQuery";
import {
  calculateStockLedger,
  type CostingMethod,
} from "./stockLedgerCalculator";
import { exportStockLedgerToExcel } from "./stockLedgerExcel";
import type {
  StockLedgerDrawerItemInfo,
  StockLedgerDrawerProps,
} from "./StockLedgerDrawer";

const PAGE_SIZE = 50;

export function useStockLedgerDrawer(props: StockLedgerDrawerProps) {
  const { config, itemCode, itemName, itemInfo, onOpenDocument } = props;
  const [costingMethod, setCostingMethod] =
    React.useState<CostingMethod>("WEIGHTED_AVG");
  const [isSwitching, setIsSwitching] = React.useState(false);
  const switchTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const [page, setPage] = React.useState(1);
  const [activeVoucher, setActiveVoucher] = React.useState<{
    type: string;
    id: string;
  } | null>(null);

  const { data, isLoading } = useStockTransactionsQuery({
    api: config.api,
    keys: config.keys,
    itemCode,
    page: 1,
    pageSize: 200,
  });

  const rawItems = data?.items ?? [];
  const calculated = React.useMemo(
    () => calculateStockLedger(rawItems, costingMethod),
    [rawItems, costingMethod],
  );

  const totalRows = calculated.rows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / PAGE_SIZE));
  const pagedRows = React.useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return calculated.rows.slice(start, start + PAGE_SIZE);
  }, [calculated.rows, page]);

  const handleChangeMethod = React.useCallback(
    (method: CostingMethod) => {
      if (method === costingMethod) return;
      setIsSwitching(true);
      setCostingMethod(method);
      if (switchTimerRef.current) clearTimeout(switchTimerRef.current);
      switchTimerRef.current = setTimeout(() => {
        setIsSwitching(false);
      }, 160);
    },
    [costingMethod],
  );

  React.useEffect(() => {
    return () => {
      if (switchTimerRef.current) clearTimeout(switchTimerRef.current);
    };
  }, []);

  const handleOpenDoc = (docType: string, docId: string) => {
    if (onOpenDocument) {
      onOpenDocument(docType, docId);
    } else {
      setActiveVoucher({ type: docType, id: docId });
    }
  };

  const handleExport = () => {
    exportStockLedgerToExcel(calculated.rows, {
      itemCode,
      itemName,
      costingMethod,
    });
  };

  const itemDetails: StockLedgerDrawerItemInfo = {
    itemCode: itemInfo?.itemCode || itemCode,
    itemName: itemInfo?.itemName || itemName,
    unit: itemInfo?.unit,
    avgCost: itemInfo?.avgCost,
    qtyOnHand: itemInfo?.qtyOnHand,
  };

  return {
    costingMethod,
    isSwitching,
    page,
    setPage,
    activeVoucher,
    setActiveVoucher,
    isLoading,
    showSkeleton: isLoading || isSwitching,
    totalRows,
    totalPages,
    pagedRows,
    totals: calculated.totals,
    itemDetails,
    handleChangeMethod,
    handleOpenDoc,
    handleExport,
  };
}

import { useMemo } from "react";
import {
  Package,
  PackagePlus,
  PackageMinus,
  Activity,
  ArrowRight,
  ArrowDownLeft,
  ArrowUpRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/Button";
import { fmtQty } from "@/shared/utils/format";
import { useT } from "@/core/i18n";
import { StandardTable } from "@/shared/components/StandardTable";
import {
  type DataTableColumn,
  TableDateCell,
  TableText,
} from "@/shared/components/DataTable";
import type { InventoryMovement } from "../api/inventoryCoreApi";
import {
  buildInventoryLedgerRows,
  buildInventoryTrendData,
  type InventoryLedgerRow,
} from "../utils/inventoryLedgerTransform";
import { InventoryItemTrendChart } from "./InventoryItemTrendChart";

export interface DocTypeStats {
  receiptCount: number;
  issueCount: number;
  adjustCount: number;
  prodCount: number;
}

export function computeDocTypeStats(
  movements: InventoryMovement[] = [],
): DocTypeStats {
  let receiptCount = 0;
  let issueCount = 0;
  let adjustCount = 0;
  let prodCount = 0;

  movements.forEach((m) => {
    const type = (m.documentType || "").toUpperCase();
    const no = (m.documentNo || "").toUpperCase();
    if (type === "GOODS_RECEIPT" || no.startsWith("NK-")) receiptCount++;
    else if (type === "GOODS_ISSUE" || no.startsWith("XK-")) issueCount++;
    else if (type === "INVENTORY_ADJUSTMENT" || no.startsWith("DC-"))
      adjustCount++;
    else if (type === "PRODUCTION_ORDER" || no.startsWith("MO-")) prodCount++;
  });

  return { receiptCount, issueCount, adjustCount, prodCount };
}

export function InventoryDocTypeBreakdownSection({
  stats,
}: {
  stats: DocTypeStats;
}) {
  const t = useT();

  return (
    <DrawerSection
      title={t("inventory.overview.typeBreakdown", "CƠ CẤU CHỨNG TỪ")}
      collapsible={true}
      defaultCollapsed={false}
    >
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between p-2 rounded-lg bg-orange-500/5 border border-orange-500/15">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-orange-500" />
            <span className="text-xs font-medium text-foreground">
              {t("inventory.overview.docTypeReceipt", "Phiếu Nhập (NK)")}
            </span>
          </div>
          <span className="text-xs font-bold text-orange-700 dark:text-orange-300 tabular-nums">
            {stats.receiptCount} {t("inventory.overview.vouchersUnit", "phiếu")}
          </span>
        </div>

        <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/15">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600" />
            <span className="text-xs font-medium text-foreground">
              {t("inventory.overview.docTypeIssue", "Phiếu Xuất (XK)")}
            </span>
          </div>
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">
            {stats.issueCount} {t("inventory.overview.vouchersUnit", "phiếu")}
          </span>
        </div>

        <div className="flex items-center justify-between p-2 rounded-lg bg-purple-500/5 border border-purple-500/15">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-purple-600" />
            <span className="text-xs font-medium text-foreground">
              {t("inventory.overview.docTypeMo", "Lệnh Sản Xuất (MO)")}
            </span>
          </div>
          <span className="text-xs font-bold text-purple-700 dark:text-purple-300 tabular-nums">
            {stats.prodCount} {t("inventory.overview.ordersUnit", "lệnh")}
          </span>
        </div>

        <div className="flex items-center justify-between p-2 rounded-lg bg-blue-500/5 border border-blue-500/15">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-600" />
            <span className="text-xs font-medium text-foreground">
              {t("inventory.overview.docTypeAdjustment", "Điều Chỉnh Kho (DC)")}
            </span>
          </div>
          <span className="text-xs font-bold text-blue-700 dark:text-blue-300 tabular-nums">
            {stats.adjustCount} {t("inventory.overview.vouchersUnit", "phiếu")}
          </span>
        </div>
      </div>
    </DrawerSection>
  );
}

interface InventoryItemOverviewSectionProps {
  itemId: string;
  loading: boolean;
  error: string | null;
  movements?: InventoryMovement[];
  itemInfo: {
    sku: string;
    itemName: string;
    uom?: string;
  };
  onOpenDocument?: (docId: string, docType: string) => void;
  onNavigateToLedger?: () => void;
}

export function InventoryItemOverviewSection({
  loading,
  error,
  movements = [],
  itemInfo,
  onOpenDocument,
  onNavigateToLedger,
}: InventoryItemOverviewSectionProps) {
  const t = useT();

  // 1. Build chronological ledger rows and trend data
  const allRows = useMemo(() => {
    return buildInventoryLedgerRows(movements);
  }, [movements]);

  const trendData = useMemo(() => {
    return buildInventoryTrendData(allRows);
  }, [allRows]);

  // 2. Computed KPI metrics
  const totalInQty = useMemo(() => {
    return allRows.reduce((sum, r) => sum + (r.inQty || 0), 0);
  }, [allRows]);

  const totalOutQty = useMemo(() => {
    return allRows.reduce((sum, r) => sum + (r.outQty || 0), 0);
  }, [allRows]);

  const currentOnHand = useMemo(() => {
    return allRows.length > 0 ? allRows[allRows.length - 1].balanceQty : 0;
  }, [allRows]);

  const inCount = useMemo(() => {
    return allRows.filter((r) => r.inQty && r.inQty > 0).length;
  }, [allRows]);

  const outCount = useMemo(() => {
    return allRows.filter((r) => r.outQty && r.outQty > 0).length;
  }, [allRows]);

  // 5 most recent transactions (newest first)
  const recentRows = useMemo(() => {
    return [...allRows].reverse().slice(0, 5);
  }, [allRows]);

  // Standard columns for 5 recent transactions
  const recentColumns: DataTableColumn<InventoryLedgerRow>[] = useMemo(
    () => [
      {
        key: "index",
        size: 40,
        enableResizing: false,
        headerClassName: "text-center w-[40px] min-w-[40px]",
        className: "text-center w-[40px] min-w-[40px]",
        header: <span className="w-full block text-center">#</span>,
        cell: (_, idx) => (
          <span className="w-full block text-center">{idx}</span>
        ),
      },
      {
        key: "transactionDate",
        size: 140,
        className: "text-right",
        header: t("inventory.overview.date", "Ngày GD"),
        cell: (row) => (
          <TableDateCell
            date={row.transactionDate}
            className="justify-end w-full"
          />
        ),
      },
      {
        key: "documentNo",
        size: 160,
        header: t("inventory.overview.docNo", "Số chứng từ"),
        cell: (row) => (
          <div className="flex items-center gap-1.5 w-full min-w-0">
            <TableText
              className="flex-1 min-w-0"
              text={row.documentNo || "—"}
              enableCopy={Boolean(row.documentNo)}
              tooltip={true}
              onDetailClick={
                onOpenDocument && row.documentId && row.documentType
                  ? (e) => {
                      e?.stopPropagation?.();
                      onOpenDocument(row.documentId!, row.documentType!);
                    }
                  : undefined
              }
            />
          </div>
        ),
      },
      {
        key: "typeLabel",
        size: 160,
        header: t("inventory.overview.docType", "Loại chứng từ"),
        cell: (row) => (
          <span className="text-foreground text-xs font-medium">
            {row.typeLabel}
          </span>
        ),
      },
      {
        key: "movement",
        size: 120,
        className: "text-right",
        header: t("inventory.overview.movement", "Biến động"),
        cell: (row) =>
          row.direction === "IN" ? (
            <span className="font-mono font-semibold text-orange-600 dark:text-orange-400 tabular-nums">
              +{fmtQty(row.inQty || 0)}
            </span>
          ) : (
            <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
              -{fmtQty(row.outQty || 0)}
            </span>
          ),
      },
      {
        key: "balanceQty",
        size: 130,
        className: "text-right",
        header: t("inventory.overview.balance", "Tồn sau GD"),
        cell: (row) => (
          <span className="font-mono font-bold text-foreground tabular-nums">
            {fmtQty(row.balanceQty)}
          </span>
        ),
      },
    ],
    [onOpenDocument, t],
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground border border-dashed rounded-xl bg-muted/10 my-2">
        <Loader2 className="w-7 h-7 animate-spin text-primary" />
        <span className="text-xs font-medium">
          {t("inventory.loadingLedger", "Đang tải dữ liệu tổng quan kho...")}
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl border border-destructive/30 bg-destructive/5 text-destructive text-xs my-2">
        <AlertCircle className="w-5 h-5 shrink-0" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* ── 1. HÀNG 4 THẺ KPI TỔNG QUAN (MỖI CARD LÀ 1 DRAWER SECTION RIÊNG) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {/* Card 1: Tồn Kho Cuối Kỳ */}
        <DrawerSection
          hideHeader={true}
          className="mb-0 h-full flex flex-col justify-between p-3.5 sm:p-4 hover:border-primary/40 transition-all"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {t("inventory.overview.currentOnHand", "Tồn kho thực tế")}
            </span>
            <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Package className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="my-2.5 flex items-baseline justify-between gap-2">
            <span className="text-2xl font-extrabold text-foreground tabular-nums tracking-tight">
              {fmtQty(currentOnHand)}
            </span>
            {itemInfo.uom && (
              <span className="text-xs font-semibold text-muted-foreground">
                {itemInfo.uom}
              </span>
            )}
          </div>
          <div className="pt-2 border-t border-border/60 flex items-center justify-between">
            {currentOnHand > 0 ? (
              <Badge
                variant="outline"
                className="text-[10px] font-medium text-emerald-700 bg-emerald-50 border-emerald-300 dark:text-emerald-400 dark:bg-emerald-950/30 gap-1 py-0 px-1.5"
              >
                <CheckCircle2 className="w-2.5 h-2.5" />
                {t("inventory.status.inStock", "Còn hàng")}
              </Badge>
            ) : currentOnHand === 0 ? (
              <Badge
                variant="outline"
                className="text-[10px] font-medium text-muted-foreground bg-muted border-border py-0 px-1.5"
              >
                {t("inventory.status.outOfStock", "Hết hàng")}
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="text-[10px] font-medium text-rose-700 bg-rose-50 border-rose-300 dark:text-rose-400 dark:bg-rose-950/30 py-0 px-1.5"
              >
                {t("inventory.status.negativeStock", "Tồn âm")}
              </Badge>
            )}
            <span className="text-[10px] text-muted-foreground">
              {allRows.length} {t("inventory.overview.txnCount", "lượt GD")}
            </span>
          </div>
        </DrawerSection>

        {/* Card 2: Tổng Nhập Kho */}
        <DrawerSection
          hideHeader={true}
          className="mb-0 h-full flex flex-col justify-between p-3.5 sm:p-4 hover:border-orange-500/40 transition-all"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400">
              {t("inventory.overview.totalReceived", "Tổng nhập kho")}
            </span>
            <div className="w-7 h-7 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
              <PackagePlus className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="my-2.5 flex items-baseline justify-between gap-2">
            <span className="text-2xl font-bold text-orange-700 dark:text-orange-300 tabular-nums tracking-tight">
              +{fmtQty(totalInQty)}
            </span>
            {itemInfo.uom && (
              <span className="text-xs font-semibold text-muted-foreground">
                {itemInfo.uom}
              </span>
            )}
          </div>
          <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <ArrowDownLeft className="w-2.5 h-2.5 text-orange-600" />
              {inCount} {t("inventory.overview.receiptCount", "phiếu nhập")}
            </span>
            <span>{t("common.allTime", "Toàn thời gian")}</span>
          </div>
        </DrawerSection>

        {/* Card 3: Tổng Xuất Kho */}
        <DrawerSection
          hideHeader={true}
          className="mb-0 h-full flex flex-col justify-between p-3.5 sm:p-4 hover:border-emerald-500/40 transition-all"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              {t("inventory.overview.totalIssued", "Tổng xuất kho")}
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <PackageMinus className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="my-2.5 flex items-baseline justify-between gap-2">
            <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 tabular-nums tracking-tight">
              -{fmtQty(totalOutQty)}
            </span>
            {itemInfo.uom && (
              <span className="text-xs font-semibold text-muted-foreground">
                {itemInfo.uom}
              </span>
            )}
          </div>
          <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <ArrowUpRight className="w-2.5 h-2.5 text-emerald-600" />
              {outCount} {t("inventory.overview.issueCount", "phiếu xuất")}
            </span>
            <span>{t("common.allTime", "Toàn thời gian")}</span>
          </div>
        </DrawerSection>

        {/* Card 4: Tổng Số Giao Dịch */}
        <DrawerSection
          hideHeader={true}
          className="mb-0 h-full flex flex-col justify-between p-3.5 sm:p-4 hover:border-primary/40 transition-all"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {t("inventory.overview.totalMovements", "Lượt phát sinh")}
            </span>
            <div className="w-7 h-7 rounded-lg bg-muted text-muted-foreground flex items-center justify-center shrink-0">
              <Activity className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="my-2.5 flex items-baseline justify-between gap-2">
            <span className="text-2xl font-bold text-foreground tabular-nums tracking-tight">
              {allRows.length}
            </span>
            <span className="text-xs font-medium text-muted-foreground">
              {t("inventory.overview.transactionsUnit", "giao dịch")}
            </span>
          </div>
          <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[10px] text-muted-foreground">
            <span>
              {t(
                "inventory.overview.turnoverFrequency",
                "Tần suất luân chuyển",
              )}
            </span>
            <span className="font-semibold text-primary">
              {allRows.length > 0
                ? t("common.active", "Hoạt động")
                : t("common.none", "Chưa có")}
            </span>
          </div>
        </DrawerSection>
      </div>

      {/* ── 2. BIỂU ĐỒ BIẾN ĐỘNG XU HƯỚNG TỒN KHO TOÀN MÀN HÌNH (NO WRAPPER DIV) ── */}
      <InventoryItemTrendChart
        trendData={trendData}
        chartHeight={260}
        uomName={itemInfo.uom}
        title={t(
          "inventory.overview.trendChartTitle",
          "BIỂU ĐỒ BIẾN ĐỘNG XU HƯỚNG TỒN KHO & NHẬP / XUẤT",
        )}
      />

      {/* ── 3. BẢNG 5 GIAO DỊCH GẦN NHẤT (CHUẨN STANDARDIZE TABLE) ────────── */}
      <DrawerSection
        title={`${t("inventory.overview.recentActivity", "Giao dịch gần nhất")} (${recentRows.length})`}
        titleExtra={
          onNavigateToLedger && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onNavigateToLedger}
              className="h-7 text-xs font-semibold text-primary hover:bg-primary/5 gap-1 p-0 px-2 cursor-pointer"
            >
              <span>
                {t(
                  "inventory.overview.viewAllLedger",
                  "Xem toàn bộ sổ thẻ kho",
                )}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          )
        }
        collapsible={true}
        defaultCollapsed={false}
      >
        <StandardTable<InventoryLedgerRow>
          items={recentRows}
          columns={recentColumns}
          getRowKey={(r) => r.id}
          emptyLabel={t(
            "inventory.overview.noRecentActivity",
            "Chưa có giao dịch phát sinh",
          )}
          variant="spreadsheet"
          enableRowHoverActions={false}
        />
      </DrawerSection>
    </div>
  );
}

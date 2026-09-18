import React, { useMemo } from "react";
import { useT } from "@/core/i18n";
import {
  Trash2,
  ExternalLink,
  Edit3,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/shared/utils";
import { Badge } from "@/shared/components/ui/badge";
import { money, formatGMT7 } from "@/shared/utils/format";
import { StandardTable } from "@/shared/components/StandardTable";
import { TableText } from "@/shared/components/DataTable/TableText";
import type { DataTableColumn } from "@/shared/components/DataTable";
import type {
  TraceabilityGraphData,
  TraceabilityNode,
} from "@/shared/types/traceability";
import {
  getNodeVisualMeta,
  openGlobalErpDocument,
  isManualSettlementNode,
} from "../constants";

interface TraceabilityTableViewProps {
  graphData: TraceabilityGraphData;
  allowEdit?: boolean;
  onUnlinkNode?: (node: TraceabilityNode) => void;
  onEditManualSettlement?: (node: TraceabilityNode) => void;
}

export function TraceabilityTableView({
  graphData,
  allowEdit,
  onUnlinkNode,
  onEditManualSettlement,
}: TraceabilityTableViewProps) {
  const t = useT();

  const directNodes = useMemo(
    () => graphData.nodes.filter((n) => !n.isCurrent && n.depth === 1),
    [graphData],
  );

  const transitiveNodes = useMemo(
    () => graphData.nodes.filter((n) => !n.isCurrent && n.depth > 1),
    [graphData],
  );

  const handleOpenDoc = (row: TraceabilityNode) => {
    if (row.restricted || row.hasPermission === false) return;
    if (row.docType === "JOURNAL_ENTRY") return;

    if (isManualSettlementNode(row)) {
      if (!allowEdit) return;

      if (onEditManualSettlement) {
        onEditManualSettlement(row);
      } else {
        window.dispatchEvent(
          new CustomEvent("open_manual_settlement_editor", {
            detail: { node: row },
          }),
        );
      }
      return;
    }

    openGlobalErpDocument(row.docType, row.id);
  };

  const columns: DataTableColumn<TraceabilityNode>[] = useMemo(
    () => [
      {
        key: "index",
        header: <span className="w-full block text-center">#</span>,
        size: 40,
        minSize: 40,
        maxSize: 40,
        enableResizing: false,
        headerClassName: "text-center w-[40px] min-w-[40px]",
        className: "text-center w-[40px] min-w-[40px]",
        cell: (_: any, idx: number) => (
          <span className="w-full block text-center text-xs text-muted-foreground font-mono">
            {idx}
          </span>
        ),
      },
      {
        key: "docType",
        header: t("Loại"),
        size: 110,
        minSize: 90,
        cell: (row: TraceabilityNode) => {
          const visualMeta = getNodeVisualMeta(row);
          return (
            <span
              className={cn(
                "font-mono font-semibold text-[10px] px-1.5 py-0.5 rounded border inline-flex items-center gap-1",
                visualMeta.badgeCls,
              )}
              title={visualMeta.fullTitle}
            >
              {visualMeta.isInvoiceIn && (
                <ArrowDownLeft className="w-2.5 h-2.5 opacity-70" />
              )}
              {visualMeta.isInvoiceOut && (
                <ArrowUpRight className="w-2.5 h-2.5 opacity-70" />
              )}
              {visualMeta.label}
            </span>
          );
        },
      },
      {
        key: "date",
        header: <span className="w-full block text-right">{t("Ngày")}</span>,
        size: 110,
        minSize: 90,
        className: "text-right",
        headerClassName: "text-right",
        cell: (row: TraceabilityNode) => (
          <span className="text-xs font-mono text-slate-500">
            {row.date ? formatGMT7(row.date, "date") : "—"}
          </span>
        ),
      },
      {
        key: "docNo",
        header: t("Số chứng từ"),
        size: 160,
        minSize: 130,
        cell: (row: TraceabilityNode) => {
          const isJournal = row.docType === "JOURNAL_ENTRY";
          const isManual = isManualSettlementNode(row);
          const canClick =
            !row.restricted &&
            row.hasPermission &&
            !isJournal &&
            (!isManual || allowEdit);

          return (
            <TableText
              text={row.docNo || "—"}
              enableCopy={true}
              tooltip={row.docNo}
              onDetailClick={
                canClick
                  ? (e) => {
                      e.stopPropagation();
                      handleOpenDoc(row);
                    }
                  : undefined
              }
              textClassName={cn(
                "font-mono text-xs font-medium",
                canClick
                  ? "text-primary hover:underline cursor-pointer"
                  : "text-slate-900 dark:text-slate-100",
              )}
            />
          );
        },
      },
      {
        key: "partner",
        header: t("Đối tác / Tiêu đề"),
        size: 260,
        minSize: 180,
        cell: (row: TraceabilityNode) => {
          if (row.restricted) {
            return (
              <span className="italic text-slate-400 text-xs">
                {t("Chứng từ bảo mật")}
              </span>
            );
          }
          const text = row.partnerName || row.title || "—";
          return (
            <TableText
              text={text}
              tooltip={text}
              enableCopy={true}
              className="text-xs text-slate-700 dark:text-slate-300"
            />
          );
        },
      },
      {
        key: "amount",
        header: <span className="w-full block text-right">{t("Giá trị")}</span>,
        size: 140,
        minSize: 110,
        className: "text-right",
        headerClassName: "text-right",
        cell: (row: TraceabilityNode) => {
          if (row.restricted) {
            return (
              <span className="font-mono text-xs text-slate-400">***</span>
            );
          }
          const visualMeta = getNodeVisualMeta(row);
          const amtNumber = Number(row.amount || 0);
          const formattedAmt = money(amtNumber);

          if (visualMeta.isReceipt) {
            return (
              <span className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">
                +{formattedAmt}
              </span>
            );
          }
          if (visualMeta.isPayment) {
            return (
              <span className="font-mono font-bold text-xs text-[#ea580c] dark:text-orange-400">
                -{formattedAmt}
              </span>
            );
          }
          return (
            <span className="font-mono font-semibold text-xs text-slate-900 dark:text-slate-100">
              {formattedAmt}
            </span>
          );
        },
      },
      {
        key: "netOffAmount",
        header: (
          <span className="w-full block text-right">{t("Đã cấn trừ")}</span>
        ),
        size: 140,
        minSize: 110,
        className: "text-right",
        headerClassName: "text-right",
        cell: (row: TraceabilityNode) => {
          if (row.restricted) {
            return (
              <span className="font-mono text-xs text-slate-400">***</span>
            );
          }
          if (!row.netOffAmount) {
            return <span className="text-muted-foreground/60 text-xs">—</span>;
          }
          const visualMeta = getNodeVisualMeta(row);
          const netOffAmt = Number(row.netOffAmount || 0);
          const formattedNetOff = money(netOffAmt);

          if (visualMeta.isReceipt) {
            return (
              <span className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">
                +{formattedNetOff}
              </span>
            );
          }
          if (visualMeta.isPayment) {
            return (
              <span className="font-mono font-bold text-xs text-[#ea580c] dark:text-orange-400">
                -{formattedNetOff}
              </span>
            );
          }
          return (
            <span className="font-mono font-semibold text-xs text-emerald-700 dark:text-emerald-400">
              {formattedNetOff}
            </span>
          );
        },
      },
    ],
    [t, allowEdit],
  );

  const getRowActions = (row: TraceabilityNode, isDirect: boolean) => {
    const isJournal = row.docType === "JOURNAL_ENTRY";
    const isManual = isManualSettlementNode(row);
    const canOpen =
      !row.restricted &&
      row.hasPermission &&
      !isJournal &&
      (!isManual || allowEdit);

    const traCuuItems: any[] = [];
    const thaoTacItems: any[] = [];

    if (canOpen) {
      traCuuItems.push({
        label: isManual ? t("Chỉnh sửa thu / chi ngoài") : t("Xem chi tiết"),
        icon: isManual ? (
          <Edit3 className="w-3.5 h-3.5 text-primary" />
        ) : (
          <ExternalLink className="w-3.5 h-3.5" />
        ),
        onClick: () => handleOpenDoc(row),
      });
    }

    if (
      allowEdit &&
      isDirect &&
      onUnlinkNode &&
      !row.isCurrent &&
      !row.restricted
    ) {
      thaoTacItems.push({
        label: t("Gỡ liên kết"),
        icon: <Trash2 className="w-3.5 h-3.5 text-red-500" />,
        variant: "danger" as const,
        onClick: () => onUnlinkNode(row),
      });
    }

    const groups: any[] = [];
    if (traCuuItems.length > 0) {
      groups.push({
        groupLabel: t("TRA CỨU"),
        items: traCuuItems,
      });
    }
    if (thaoTacItems.length > 0) {
      groups.push({
        groupLabel: t("THAO TÁC"),
        items: thaoTacItems,
      });
    }
    return groups;
  };

  const buildSummaryRow = (list: TraceabilityNode[]) => {
    if (!list || list.length === 0) return undefined;

    const totalAmt = list.reduce(
      (sum, n) => sum + (n.restricted ? 0 : Number(n.amount || 0)),
      0,
    );
    const totalNetOff = list.reduce(
      (sum, n) => sum + (n.restricted ? 0 : Number(n.netOffAmount || 0)),
      0,
    );

    return {
      partner: (
        <span className="text-xs font-bold text-foreground block text-right">
          {t("Tổng cộng")}:
        </span>
      ),
      amount: (
        <span className="font-mono font-bold text-xs text-foreground block text-right">
          {money(totalAmt)}
        </span>
      ),
      netOffAmount: (
        <span className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400 block text-right">
          {money(totalNetOff)}
        </span>
      ),
    };
  };

  const renderSection = (
    title: string,
    list: TraceabilityNode[],
    isDirect: boolean,
  ) => {
    const summaryRow = buildSummaryRow(list);

    return (
      <div className="space-y-2.5">
        <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>{title}</span>
            {list.length > 0 && (
              <Badge
                variant="secondary"
                className="text-[10px] font-bold px-1.5 py-0.5 bg-primary/10 text-primary border-primary/20"
              >
                {list.length}
              </Badge>
            )}
          </div>
        </div>

        <StandardTable<TraceabilityNode>
          variant="spreadsheet"
          items={list}
          columns={columns}
          actions={(row) => getRowActions(row, isDirect)}
          hideLegacyActionColumn={true}
          enableRowHoverActions={true}
          enableRowContextMenu={true}
          getRowKey={(row) => row.id}
          summaryRow={summaryRow}
          minWidth={780}
          emptyLabel={t("Không có chứng từ liên kết")}
        />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {renderSection(
        t("Chứng từ liên kết trực tiếp (1-hop)"),
        directNodes,
        true,
      )}
      {renderSection(
        t("Chứng từ liên kết trung gian / gián tiếp (Multi-hops)"),
        transitiveNodes,
        false,
      )}
    </div>
  );
}

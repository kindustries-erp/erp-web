import React, { useMemo } from "react";
import { useT } from "@/core/i18n";
import { Trash2, ExternalLink, Lock, Edit3 } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { money, formatGMT7 } from "@/shared/utils/format";
import type {
  TraceabilityGraphData,
  TraceabilityNode,
} from "@/shared/types/traceability";
import { DOC_TYPE_META, openGlobalErpDocument } from "../constants";
import { isManualSettlementNode } from "./DocNode";

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

  const renderTableSection = (
    title: string,
    list: TraceabilityNode[],
    isDirect: boolean,
  ) => {
    return (
      <div className="space-y-2">
        <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
          <span>{title}</span>
          <span className="text-[11px] font-mono text-slate-400">
            ({list.length})
          </span>
        </div>

        {list.length === 0 ? (
          <div className="py-4 text-center text-xs text-slate-400 border border-dashed rounded-lg border-slate-200">
            {t("Không có chứng từ")}
          </div>
        ) : (
          <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-500 uppercase">
                <tr>
                  <th className="px-3 py-2">{t("Loại")}</th>
                  <th className="px-3 py-2">{t("Số chứng từ")}</th>
                  <th className="px-3 py-2">{t("Ngày")}</th>
                  <th className="px-3 py-2">{t("Đối tác / Tiêu đề")}</th>
                  <th className="px-3 py-2 text-right">{t("Giá trị")}</th>
                  <th className="px-3 py-2 text-right">{t("Đã cấn trừ")}</th>
                  <th className="px-3 py-2 text-right w-20">{t("Thao tác")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {list.map((row) => {
                  const isJournal = row.docType === "JOURNAL_ENTRY";
                  const isManual = isManualSettlementNode(row);

                  return (
                    <tr
                      key={row.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-900/50 transition-colors"
                    >
                      <td className="px-3 py-2">
                        <span className="font-mono font-semibold text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border">
                          {DOC_TYPE_META[row.docType]?.label || row.docType}
                        </span>
                      </td>
                      <td className="px-3 py-2 font-mono font-medium text-slate-900 dark:text-slate-100">
                        {row.docNo}
                      </td>
                      <td className="px-3 py-2 text-slate-500 font-sans">
                        {row.date ? formatGMT7(row.date, "date") : "—"}
                      </td>
                      <td className="px-3 py-2 text-slate-600 dark:text-slate-400">
                        {row.restricted ? (
                          <span className="italic text-slate-400">
                            {t("Chứng từ bảo mật")}
                          </span>
                        ) : (
                          row.partnerName || row.title || "—"
                        )}
                      </td>
                      <td className="px-3 py-2 text-right font-mono font-medium">
                        {row.restricted ? "***" : money(row.amount || 0)}
                      </td>
                      <td className="px-3 py-2 text-right font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                        {row.restricted
                          ? "***"
                          : row.netOffAmount
                            ? money(row.netOffAmount)
                            : "—"}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {allowEdit && isDirect && onUnlinkNode && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              className="h-6 w-6 text-slate-400 hover:text-red-600 hover:bg-red-50"
                              onClick={() => onUnlinkNode(row)}
                              title={t("Gỡ liên kết")}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}

                          {!row.restricted &&
                          row.hasPermission &&
                          !isJournal &&
                          (!isManual || allowEdit) ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              className="h-6 w-6 text-slate-400 hover:text-slate-900"
                              onClick={() => handleOpenDoc(row)}
                              title={
                                isManual
                                  ? t("Chỉnh sửa thu / chi ngoài")
                                  : t("Mở chi tiết")
                              }
                            >
                              {isManual ? (
                                <Edit3 className="w-3.5 h-3.5 text-primary" />
                              ) : (
                                <ExternalLink className="w-3.5 h-3.5" />
                              )}
                            </Button>
                          ) : (
                            <Lock className="w-3.5 h-3.5 text-slate-300" />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {renderTableSection(
        t("Chứng từ liên kết trực tiếp (1-hop)"),
        directNodes,
        true,
      )}
      {renderTableSection(
        t("Chứng từ liên kết trung gian / gián tiếp (Multi-hops)"),
        transitiveNodes,
        false,
      )}
    </div>
  );
}

import * as React from "react";
import { ExternalLink } from "lucide-react";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { money } from "@/shared/utils/format";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { KgaraCaseStatusBadge } from "@/modules/garage/components/KgaraCaseStatusBadge";
import type { GarageVehicleKanbanItem } from "../../kanban";

export interface GarageVehicleCasesTableProps {
  item: GarageVehicleKanbanItem;
  vehicleName: string;
  onOpenCase: (caseCode: string) => void;
}

const COLUMNS: Array<{ key: string; label: string; className?: string }> = [
  { key: "colCaseCode", label: "Số phiếu" },
  { key: "colLicensePlate", label: "Biển số xe" },
  { key: "colChassis", label: "Số khung" },
  { key: "colVehicleType", label: "Loại xe" },
  { key: "colModelYear", label: "Đời xe", className: "text-center" },
  { key: "colStatus", label: "Trạng thái", className: "text-center" },
  { key: "colAmount", label: "Số tiền", className: "text-right" },
  { key: "colRemaining", label: "Còn nợ", className: "text-right" },
];

/** Bảng các phiếu của một xe trong popover thẻ Kanban. */
export const GarageVehicleCasesTable: React.FC<
  GarageVehicleCasesTableProps
> = ({ item, vehicleName, onOpenCase }) => {
  const { t } = useV2Translation();

  return (
    <div
      onWheel={(e) => e.stopPropagation()}
      className="overflow-x-auto max-h-64 overflow-y-auto rounded-lg border border-border/50 dark:border-white/[0.08] overscroll-contain"
    >
      <table className="w-full text-left border-collapse text-xs">
        <thead className="bg-surface-hover/70 dark:bg-zinc-800/60 sticky top-0 z-10 border-b border-border/50 dark:border-white/[0.08]">
          <tr className="text-[11px] text-muted-fg font-semibold uppercase tracking-wider">
            <th className="py-2 px-2.5 text-center w-10">#</th>
            {COLUMNS.map((col) => (
              <th
                key={col.key}
                className={`py-2 px-2.5 ${col.className ?? ""}`}
              >
                {t(`v2.garageCases.kanban.${col.key}`, col.label)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40 dark:divide-white/[0.05] bg-surface/30">
          {item.cases.map((c, idx) => (
            <tr
              key={c.id || c.rowKey}
              className="hover:bg-surface-hover/60 transition-colors"
            >
              <td className="py-2 px-2.5 text-center text-muted-fg font-mono">
                {idx + 1}
              </td>
              <td className="py-2 px-2.5 whitespace-nowrap">
                <V2Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 font-mono font-bold text-xs text-primary hover:underline inline-flex items-center gap-1"
                  onClick={() => onOpenCase(c.soChungTu || c.id)}
                >
                  <span>{c.soChungTu}</span>
                  <ExternalLink className="w-3 h-3 text-muted-fg shrink-0" />
                </V2Button>
              </td>
              <td className="py-2 px-2.5 font-mono font-medium text-foreground whitespace-nowrap">
                {c.bienSoXe || item.licensePlate}
              </td>
              <td className="py-2 px-2.5 font-mono text-[11px] text-muted-fg whitespace-nowrap">
                {c.soKhung || item.chassisNumber || "—"}
              </td>
              <td className="py-2 px-2.5 text-foreground whitespace-nowrap">
                {[c.hangXeName, c.dongXeName].filter(Boolean).join(" ") ||
                  vehicleName ||
                  "—"}
              </td>
              <td className="py-2 px-2.5 text-center font-mono text-muted-fg whitespace-nowrap">
                {c.namSanXuat || item.modelYear || "—"}
              </td>
              <td className="py-2 px-2.5 text-center whitespace-nowrap">
                {c.serviceStatus ? (
                  <KgaraCaseStatusBadge status={c.serviceStatus} />
                ) : (
                  "—"
                )}
              </td>
              <td className="py-2 px-2.5 text-right font-mono font-semibold text-foreground whitespace-nowrap">
                {money(c.billed)}
              </td>
              <td className="py-2 px-2.5 text-right font-mono font-semibold whitespace-nowrap">
                {c.remaining > 0 ? (
                  <span className="text-amber-600 dark:text-amber-400">
                    {money(c.remaining)}
                  </span>
                ) : (
                  <span className="text-emerald-600 dark:text-emerald-400">
                    0 ₫
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

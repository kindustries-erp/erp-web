import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/v2/shared/ui";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { formatAmount, formatNumber } from "@/v2/shared/utils/v2TableFormat";
import type { CasesDashboardClassRowView } from "../casesDashboard.type";

export interface CasesDashboardClassificationTableProps {
  rows: CasesDashboardClassRowView[];
}

/** Bảng theo phân loại: xe, lệnh và tiền. Một xe ở nhiều phân loại được đếm ở mỗi phân loại. */
export function CasesDashboardClassificationTable({
  rows,
}: CasesDashboardClassificationTableProps) {
  const { t } = useV2Translation();
  const col = (key: string, fallback: string) =>
    t(`v2.garageCasesDashboard.classification.columns.${key}`, fallback);

  return (
    <Table data-testid="cases-dashboard-classification">
      <TableHeader>
        <TableRow>
          <TableHead>{col("classification", "Phân loại")}</TableHead>
          <TableHead className="text-right">{col("vehicles", "Xe")}</TableHead>
          <TableHead className="text-right">{col("cases", "Lệnh")}</TableHead>
          <TableHead className="text-right">{col("amount", "Tiền")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.key}>
            <TableCell>
              {t(`v2.garageCasesDashboard.classification.${row.key}`, row.key)}
            </TableCell>
            <TableCell className="text-right">
              {formatNumber(row.vehicles)}
            </TableCell>
            <TableCell className="text-right">
              {formatNumber(row.cases)}
            </TableCell>
            <TableCell className="text-right">
              {formatAmount(row.amount)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

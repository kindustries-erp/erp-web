import { V2Button, V2Stack, V2Text } from "@/v2/shared/components/atoms";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type { V2PaginationMeta } from "@/v2/shared/types/v2-pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/v2/shared/ui";
import { formatAmount } from "@/v2/shared/utils/v2TableFormat";
import type { CasesDashboardVehicleItem } from "../domain/casesDashboard.type";
import { toVehicleRows } from "../domain/casesDashboard.view";

export interface CasesDashboardCasesListProps {
  title: string;
  items: CasesDashboardVehicleItem[];
  pagination?: V2PaginationMeta;
  loading: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onClose: () => void;
}

/** Danh sách XE (drill-down) của một giai đoạn, mỗi xe một dòng, có phân trang trước/sau. */
export function CasesDashboardCasesList({
  title,
  items,
  pagination,
  loading,
  onPrevious,
  onNext,
  onClose,
}: CasesDashboardCasesListProps) {
  const { t } = useV2Translation();
  const c = (key: string, fallback: string) =>
    t(`v2.casesDashboardGarage.columns.${key}`, fallback);

  return (
    <V2Stack gap="sm" data-testid="cases-dashboard-cases-list">
      <div className="flex items-center justify-between gap-2">
        <V2Text variant="label" weight="bold">
          {title}
        </V2Text>
        <V2Button variant="ghost" size="sm" onClick={onClose}>
          {t("v2.casesDashboardGarage.close", "Đóng")}
        </V2Button>
      </div>
      {items.length === 0 && !loading ? (
        <V2Text variant="body-sm" color="muted">
          {t(
            "v2.casesDashboardGarage.emptyVehicles",
            "Không có xe nào trong giai đoạn này.",
          )}
        </V2Text>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{c("plate", "Biển số")}</TableHead>
              <TableHead className="text-right">
                {c("caseCount", "Số lệnh")}
              </TableHead>
              <TableHead>{c("caseCode", "Số phiếu")}</TableHead>
              <TableHead>{c("customer", "Khách hàng")}</TableHead>
              <TableHead className="text-right">
                {c("amount", "Tiền")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {toVehicleRows(items).map((row) => (
              <TableRow key={row.key}>
                <TableCell>{row.licensePlate}</TableCell>
                <TableCell className="text-right">{row.caseCount}</TableCell>
                <TableCell>{row.caseCodes}</TableCell>
                <TableCell>{row.customerName}</TableCell>
                <TableCell className="text-right">
                  {formatAmount(row.amount)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      {pagination && pagination.totalPages > 1 ? (
        <div className="flex items-center justify-between gap-2">
          <V2Button
            variant="outline"
            size="sm"
            disabled={pagination.previous === null}
            onClick={onPrevious}
          >
            {t("v2.casesDashboardGarage.previous", "Trước")}
          </V2Button>
          <V2Text variant="caption" color="muted">
            {t("v2.casesDashboardGarage.pageInfo", {
              defaultValue: "Trang {{page}} / {{total}}",
              page: pagination.page,
              total: pagination.totalPages,
            })}
          </V2Text>
          <V2Button
            variant="outline"
            size="sm"
            disabled={pagination.next === null}
            onClick={onNext}
          >
            {t("v2.casesDashboardGarage.next", "Sau")}
          </V2Button>
        </div>
      ) : null}
    </V2Stack>
  );
}

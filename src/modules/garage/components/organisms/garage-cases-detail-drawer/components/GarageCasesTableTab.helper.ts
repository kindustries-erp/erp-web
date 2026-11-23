import type { GarageCaseDetailRow } from "./GarageCasesTableTab.type";
import { normalizeClassificationKey } from "./GarageCasesTableTab.cells";

export interface FilterGarageCasesOptions {
  showProfitMetrics?: boolean;
  isPayable: boolean;
  categoryFilter: string;
  search: string;
  isFunnelStatusFilter?: boolean;
}

export function matchFunnelStatus(
  c: GarageCaseDetailRow,
  statusKey: string,
): boolean {
  if (statusKey === "ALL" || statusKey === "all") return true;

  const isCompleted = Boolean(c.ngayHoanThanh && c.tinhTrangDichVu !== 9);
  const isCancelled =
    c.tinhTrangDichVu === 9 ||
    Boolean(c.serviceStatus && c.serviceStatus.toLowerCase().includes("hủy"));

  const isQuotation =
    !c.ngayHoanThanh &&
    !isCancelled &&
    (c.tinhTrangDichVu === 1 ||
      Boolean(
        c.serviceStatus &&
        (c.serviceStatus.toLowerCase().includes("báo giá") ||
          c.serviceStatus.toLowerCase().includes("nháp") ||
          c.serviceStatus.toLowerCase().includes("chờ")),
      ));

  const isInProgress = !c.ngayHoanThanh && !isCancelled && !isQuotation;

  switch (statusKey) {
    case "QUOTATION":
      return isQuotation;
    case "IN_PROGRESS":
      return isInProgress;
    case "COMPLETED":
      return isCompleted;
    case "CANCELLED":
      return isCancelled;
    default:
      return true;
  }
}

/** Khóa xe của một dòng lệnh; dòng không có khóa xe tính là một xe riêng (theo id). */
export function rowVehicleKey(c: GarageCaseDetailRow): string {
  return c.vehicleKey ?? c.id;
}

/** Số xe khác nhau trong danh sách lệnh. */
export function countDistinctVehicles(cases: GarageCaseDetailRow[]): number {
  return new Set(cases.map(rowVehicleKey)).size;
}

/** Đếm XE theo từng giai đoạn: mỗi giai đoạn đếm riêng, xe có lệnh ở 2 giai đoạn tính ở cả hai. */
export function calculateFunnelStatusCounts(cases: GarageCaseDetailRow[]) {
  const buckets = {
    quotation: new Set<string>(),
    inProgress: new Set<string>(),
    completed: new Set<string>(),
    cancelled: new Set<string>(),
  };

  for (const c of cases) {
    const key = rowVehicleKey(c);
    if (matchFunnelStatus(c, "QUOTATION")) buckets.quotation.add(key);
    else if (matchFunnelStatus(c, "IN_PROGRESS")) buckets.inProgress.add(key);
    else if (matchFunnelStatus(c, "COMPLETED")) buckets.completed.add(key);
    else if (matchFunnelStatus(c, "CANCELLED")) buckets.cancelled.add(key);
  }

  return {
    total: countDistinctVehicles(cases),
    quotation: buckets.quotation.size,
    inProgress: buckets.inProgress.size,
    completed: buckets.completed.size,
    cancelled: buckets.cancelled.size,
  };
}

const sumBy = (
  rows: GarageCaseDetailRow[],
  pick: (r: GarageCaseDetailRow) => number | undefined,
) => rows.reduce((total, r) => total + (pick(r) ?? 0), 0);

/**
 * Gom các dòng lệnh thành một dòng mỗi xe (theo khóa xe), giữ thứ tự xuất hiện đầu tiên.
 * Tiền cộng theo lệnh; biển/khách/phân loại/trạng thái lấy từ lệnh đầu (mới nhất); `childCases` giữ từng lệnh.
 */
export function groupCasesByVehicle(
  cases: GarageCaseDetailRow[],
): GarageCaseDetailRow[] {
  const groups = new Map<string, GarageCaseDetailRow[]>();
  for (const c of cases) {
    const key = rowVehicleKey(c);
    const bucket = groups.get(key);
    if (bucket) bucket.push(c);
    else groups.set(key, [c]);
  }

  return [...groups.entries()].map(([key, rows]) => {
    const first = rows[0];
    const latestDone = rows
      .map((r) => r.ngayHoanThanh)
      .filter((d): d is string => Boolean(d))
      .reduce<string | undefined>(
        (acc, d) =>
          !acc || new Date(d).getTime() > new Date(acc).getTime() ? d : acc,
        undefined,
      );
    return {
      ...first,
      rowKey: `vehicle_${key}`,
      vehicleKey: key,
      soChungTu: rows.map((r) => r.soChungTu).join(", "),
      ngayHoanThanh: latestDone,
      bienSoXe: rows.find((r) => r.bienSoXe)?.bienSoXe ?? first.bienSoXe,
      khachHangName:
        rows.find((r) => r.khachHangName)?.khachHangName ?? first.khachHangName,
      invoiceNo: rows.find((r) => r.invoiceNo)?.invoiceNo,
      hasInvoice: rows.some((r) => r.hasInvoice || r.invoiceNo),
      vatWarning: rows.some((r) => r.vatWarning),
      billed: sumBy(rows, (r) => r.billed),
      paid: sumBy(rows, (r) => r.paid),
      remaining: sumBy(rows, (r) => r.remaining),
      cost: sumBy(rows, (r) => r.cost),
      paidCost: sumBy(rows, (r) => r.paidCost),
      remainingCost: sumBy(rows, (r) => r.remainingCost),
      revenue: sumBy(rows, (r) => r.revenue),
      profit: sumBy(rows, (r) => r.profit),
      caseCount: rows.length,
      childCases: rows,
    };
  });
}

export function filterGarageCases(
  cases: GarageCaseDetailRow[],
  options: FilterGarageCasesOptions,
) {
  const {
    showProfitMetrics,
    isPayable,
    categoryFilter,
    search,
    isFunnelStatusFilter,
  } = options;

  // Với Debt mode: chỉ lọc các phiếu còn công nợ
  // Với Checkpoint mode: hiển thị tất cả vụ việc trong kỳ
  const baseList = showProfitMetrics
    ? cases
    : cases.filter((c) => (isPayable ? c.remainingCost > 0 : c.remaining > 0));

  const q = search.trim().toLowerCase();

  const filteredCases = baseList.filter((c) => {
    if (isFunnelStatusFilter) {
      if (!matchFunnelStatus(c, categoryFilter)) return false;
    } else if (categoryFilter !== "all" && categoryFilter !== "ALL") {
      if (showProfitMetrics) {
        if (normalizeClassificationKey(c.classification) !== categoryFilter)
          return false;
      } else {
        if (c.partnerType !== categoryFilter) return false;
      }
    }

    if (!q) return true;
    return (
      c.soChungTu?.toLowerCase().includes(q) ||
      c.bienSoXe?.toLowerCase().includes(q) ||
      c.khachHangName?.toLowerCase().includes(q) ||
      c.debtorName?.toLowerCase().includes(q)
    );
  });

  const totalRemaining = filteredCases.reduce(
    (sum, c) => sum + (isPayable ? c.remainingCost : c.remaining),
    0,
  );

  const totalBilled = filteredCases.reduce(
    (sum, c) => sum + (isPayable ? c.cost : c.billed),
    0,
  );

  return { filteredCases, totalRemaining, totalBilled };
}

export interface GarageCasesTableState {
  sorts: string[];
  columnSearch: Record<string, string>;
  columnFilters: Record<string, string[]>;
}

export interface GarageCasesDateRanges {
  [columnKey: string]: {
    from?: string;
    to?: string;
  };
}

function normalizeString(value?: string | null) {
  return (value ?? "").toString().trim().toLowerCase();
}

function getCellValue(item: Record<string, any>, key: string) {
  switch (key) {
    case "statusName":
      return item.tenTinhTrangDichVu || "";
    case "classification":
      return item.classification || "";
    case "caseCode":
      return item.soChungTu || "";
    case "licensePlate":
      return item.bienSoXe || "";
    case "customerCode":
      return item.khachHangCode || "";
    case "customerName":
      return item.khachHangName || "";
    case "isInsuranceClaim":
      return item.rawData?.XeLamBaoHiem ? "yes" : "no";
    case "caseDate":
    case "ngayPhatSinh":
      return item.ngayPhatSinh || item.ngayTiepNhan || "";
    case "ngayTiepNhan":
      return item.ngayTiepNhan || item.ngayPhatSinh || "";
    case "updatedAt":
      return item.updatedAt || "";
    case "createdAt":
      return item.createdAt || "";
    case "ngayHoanThanhCongViec":
    case "completionDate":
      return item.ngayHoanThanhCongViec || "";
    case "dataAsOf":
      return item.dataAsOf || "";
    case "totalAmount":
      return item.tienCoThue || 0;
    case "balanceAmount":
      return item.tienConPhaiThanhToan || 0;
    case "doanhThu":
      return item.doanhThu ?? item.rawData?.DoanhThu ?? 0;
    case "chiPhi":
      return item.chiPhi ?? item.rawData?.ChiPhi ?? 0;
    case "loiNhuan":
      return item.loiNhuan ?? item.rawData?.LoiNhuan ?? 0;
    case "margin": {
      const rev = Number(item.doanhThu ?? item.rawData?.DoanhThu ?? 0);
      const profit = Number(item.loiNhuan ?? item.rawData?.LoiNhuan ?? 0);
      return rev > 0 ? (profit / rev) * 100 : 0;
    }
    case "collectionProgress": {
      const paid = Number(item.tienDaThanhToan) || 0;
      const bal = Number(item.tienConPhaiThanhToan) || 0;
      if (bal <= 0 && paid > 0) return "PAID";
      if (paid > 0 && bal > 0) return "PARTIAL";
      if (paid <= 0 && bal > 0) return "UNPAID";
      return "";
    }
    case "costProgress": {
      const cost = Number(item.chiPhi ?? item.rawData?.ChiPhi ?? 0);
      const paidCost = Number(item.tienDaChi ?? item.rawData?.TienDaChi ?? 0);
      const balCost = Math.max(0, cost - paidCost);
      if (balCost <= 0 && paidCost > 0) return "PAID";
      if (paidCost > 0 && balCost > 0) return "PARTIAL";
      if (paidCost <= 0 && cost > 0) return "UNPAID";
      return "";
    }
    case "hasLinkedInvoice":
      return Number(item.linkedInvoiceCount || 0) > 0 ? "YES" : "NO";
    default:
      return item[key] ?? "";
  }
}

function isNumericLike(value: string) {
  if (!value) return false;
  const normalized = value.replace(/,/g, "").trim();
  if (!normalized) return false;
  return !Number.isNaN(Number(normalized));
}

function parseDateValue(value: unknown): Date | null {
  if (!value) return null;
  const parsed = new Date(String(value));
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

import {
  isQuotationStatus,
  isInProgressStatus,
  isCompletedStatus,
} from "./garageCaseViewPresets";

export function applyGarageCasesTableState(
  items: Record<string, any>[],
  tableState: GarageCasesTableState,
  globalSearch = "",
  dateRanges: GarageCasesDateRanges = {},
  statusTab = "all",
) {
  const searchText = normalizeString(globalSearch);

  const filtered = items.filter((item) => {
    // 0. Filter theo statusTab (PillTabs: all, quotation, in_progress, completed)
    const effectiveStatusTab =
      statusTab !== "all"
        ? statusTab
        : tableState.columnFilters?.["statusTab"]?.[0] || "all";

    if (effectiveStatusTab && effectiveStatusTab !== "all") {
      const statusName = item.tenTinhTrangDichVu;
      const statusCode = item.tinhTrangDichVu;
      if (
        effectiveStatusTab === "quotation" &&
        !isQuotationStatus(statusName, statusCode)
      ) {
        return false;
      }
      if (
        effectiveStatusTab === "in_progress" &&
        !isInProgressStatus(statusName, statusCode)
      ) {
        return false;
      }
      if (
        effectiveStatusTab === "completed" &&
        !isCompletedStatus(statusName, statusCode)
      ) {
        return false;
      }
    }

    if (searchText) {
      const searchable = [
        item.soChungTu,
        item.bienSoXe,
        item.khachHangCode,
        item.khachHangName,
        item.classification,
        item.tenTinhTrangDichVu,
        item.rawData?.XeLamBaoHiem ? "yes" : "no",
      ]
        .filter(Boolean)
        .join(" ");

      if (!normalizeString(searchable).includes(searchText)) {
        return false;
      }
    }

    for (const [columnKey, searchValue] of Object.entries(
      tableState.columnSearch,
    )) {
      const value = normalizeString(getCellValue(item, columnKey));
      if (searchValue && !value.includes(normalizeString(searchValue))) {
        return false;
      }
    }

    for (const [columnKey, filters] of Object.entries(
      tableState.columnFilters,
    )) {
      if (!filters || filters.length === 0) continue;

      const rawValue = getCellValue(item, columnKey);
      const isBlank =
        rawValue == null ||
        rawValue === "" ||
        rawValue === undefined ||
        (typeof rawValue === "number" && isNaN(rawValue));

      if (filters[0] === "__ALL_MATCHING__") {
        const rawSearch = (filters[1] || "").trim();
        if (!rawSearch) continue;
        const val = normalizeString(rawValue);
        const keywords = rawSearch
          .split(";")
          .map((k) => k.trim())
          .filter(Boolean);
        if (keywords.length === 0) continue;

        const matchesAnyKw = keywords.some((kw) => {
          let isExact = false;
          let cleanKw = kw;
          if (kw.startsWith('"') && kw.endsWith('"') && kw.length >= 2) {
            isExact = true;
            cleanKw = kw.slice(1, -1);
          }
          const normKw = normalizeString(cleanKw);
          if (isExact) {
            return val === normKw;
          }
          return val.includes(normKw);
        });

        if (!matchesAnyKw) {
          return false;
        }
        continue;
      }

      // Handler riêng cho cột margin (Biên LN)
      if (columnKey === "margin" || columnKey === "bienLoiNhuan") {
        const rev = Number(item.doanhThu ?? item.rawData?.DoanhThu ?? 0);
        const profit = Number(item.loiNhuan ?? item.rawData?.LoiNhuan ?? 0);
        const hasRev = rev > 0;
        const marginPct = hasRev ? (profit / rev) * 100 : null;

        const matches = filters.some((f) => {
          if (f === "__BLANK__") return marginPct == null;
          if (marginPct == null) return false;
          if (f === "HIGH") return marginPct >= 50;
          if (f === "MID") return marginPct >= 20 && marginPct < 50;
          if (f === "LOW") return marginPct >= 0 && marginPct < 20;
          if (f === "NEGATIVE") return marginPct < 0;
          if (isNumericLike(f))
            return (
              Math.round(marginPct * 10) / 10 ===
              Math.round(Number(f) * 10) / 10
            );
          return false;
        });
        if (!matches) return false;
        continue;
      }

      // Handler riêng cho các cột số tiền doanh thu, chi phí, lợi nhuận
      if (
        columnKey === "doanhThu" ||
        columnKey === "chiPhi" ||
        columnKey === "loiNhuan"
      ) {
        const numVal = Number(rawValue) || 0;
        const isBlankNum = rawValue == null || numVal === 0;

        const matches = filters.some((f) => {
          if (f === "__BLANK__") return isBlankNum;
          if (isNumericLike(f)) return numVal === Number(f);
          return normalizeString(f) === normalizeString(String(numVal));
        });
        if (!matches) return false;
        continue;
      }

      const hasBlank = filters.includes("__BLANK__");
      if (hasBlank && isBlank) {
        continue;
      }

      if (isBlank) {
        return false;
      }

      const value = normalizeString(rawValue);
      const matches = filters.some((filter) => {
        if (filter === "__BLANK__") return isBlank;
        const normalizedFilter = normalizeString(filter);
        if (isNumericLike(value) && isNumericLike(normalizedFilter)) {
          return Number(value) === Number(normalizedFilter);
        }
        return value === normalizedFilter;
      });
      if (!matches) return false;
    }

    for (const [columnKey, range] of Object.entries(dateRanges)) {
      if (!range) continue;
      const hasRange = !!(range.from || range.to);
      if (!hasRange) continue;

      const itemDate = parseDateValue(getCellValue(item, columnKey));
      if (!itemDate) return false;

      if (range.from) {
        const fromDate = parseDateValue(`${range.from}T00:00:00`);
        if (fromDate && itemDate < fromDate) return false;
      }

      if (range.to) {
        const toDate = parseDateValue(`${range.to}T23:59:59.999`);
        if (toDate && itemDate > toDate) return false;
      }
    }

    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (tableState.sorts.length === 0) {
      const timeB =
        parseDateValue(b.ngayPhatSinh || b.ngayTiepNhan)?.getTime() ?? 0;
      const timeA =
        parseDateValue(a.ngayPhatSinh || a.ngayTiepNhan)?.getTime() ?? 0;
      if (timeB !== timeA) return timeB - timeA;
      return (b.soChungTu || "").localeCompare(a.soChungTu || "", undefined, {
        numeric: true,
      });
    }

    for (const sortExpr of tableState.sorts) {
      const isDesc = sortExpr.startsWith("-");
      const key = isDesc ? sortExpr.slice(1) : sortExpr;
      const left = getCellValue(a, key);
      const right = getCellValue(b, key);

      if (left == null || right == null) {
        const result = (left == null ? 1 : 0) - (right == null ? 1 : 0);
        if (result !== 0) {
          return isDesc ? -result : result;
        }
      } else if (typeof left === "number" && typeof right === "number") {
        const result = left - right;
        if (result !== 0) {
          return isDesc ? -result : result;
        }
      } else if (left instanceof Date || right instanceof Date) {
        const result =
          new Date(left as Date).getTime() - new Date(right as Date).getTime();
        if (result !== 0) {
          return isDesc ? -result : result;
        }
      } else {
        // Check if both left and right are parsable date strings
        const dateLeft = parseDateValue(left);
        const dateRight = parseDateValue(right);
        if (dateLeft && dateRight) {
          const result = dateLeft.getTime() - dateRight.getTime();
          if (result !== 0) {
            return isDesc ? -result : result;
          }
        }

        const result = String(left).localeCompare(String(right), undefined, {
          sensitivity: "base",
          numeric: true,
        });
        if (result !== 0) {
          return isDesc ? -result : result;
        }
      }
    }

    const timeB =
      parseDateValue(b.ngayPhatSinh || b.ngayTiepNhan)?.getTime() ?? 0;
    const timeA =
      parseDateValue(a.ngayPhatSinh || a.ngayTiepNhan)?.getTime() ?? 0;
    if (timeB !== timeA) return timeB - timeA;
    return (b.soChungTu || "").localeCompare(a.soChungTu || "", undefined, {
      numeric: true,
    });
  });

  return sorted;
}

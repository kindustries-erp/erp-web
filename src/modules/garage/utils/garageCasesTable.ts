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
      return item.ngayPhatSinh || "";
    case "updatedAt":
      return item.updatedAt || "";
    case "createdAt":
      return item.createdAt || "";
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

export function applyGarageCasesTableState(
  items: Record<string, any>[],
  tableState: GarageCasesTableState,
  globalSearch = "",
  dateRanges: GarageCasesDateRanges = {},
) {
  const searchText = normalizeString(globalSearch);

  const filtered = items.filter((item) => {
    if (searchText) {
      const searchable = [
        item.soChungTu,
        item.bienSoXe,
        item.khachHangCode,
        item.khachHangName,
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
      const value = normalizeString(rawValue);
      const matches = filters.some((filter) => {
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
      return (
        new Date(b.updatedAt || 0).getTime() -
        new Date(a.updatedAt || 0).getTime()
      );
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
        const result = String(left).localeCompare(String(right), undefined, {
          sensitivity: "base",
        });
        if (result !== 0) {
          return isDesc ? -result : result;
        }
      }
    }

    return (
      new Date(b.updatedAt || 0).getTime() -
      new Date(a.updatedAt || 0).getTime()
    );
  });

  return sorted;
}

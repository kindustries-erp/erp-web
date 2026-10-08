import type { V2TableQuery } from "@/v2/shared/types/v2-table";

const omitKey = <T>(
  record: Record<string, T>,
  exceptKey: string,
): Record<string, T> =>
  Object.fromEntries(
    Object.entries(record).filter(([key]) => key !== exceptKey),
  );

/** Bộ lọc của các cột khác, dùng để server thu hẹp danh sách options của một cột */
export const serializeOtherFilters = (
  query: V2TableQuery,
  exceptKey: string,
): string | undefined => {
  const payload = {
    columnFilters: omitKey(query.columnFilters, exceptKey),
    columnSearch: omitKey(query.columnSearch, exceptKey),
    columnOperators: omitKey(query.columnOperators, exceptKey),
    dateRanges: omitKey(query.dateRanges, exceptKey),
  };
  const isEmpty = Object.values(payload).every(
    (record) => Object.keys(record).length === 0,
  );
  return isEmpty ? undefined : JSON.stringify(payload);
};

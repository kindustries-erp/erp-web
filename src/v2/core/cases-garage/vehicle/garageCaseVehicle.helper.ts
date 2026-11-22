import type {
  GarageCaseVehicleFields,
  GarageCaseVehicleInfoRow,
} from "./garageCaseVehicle.type";
import { GARAGE_CASE_VEHICLE_COLUMNS } from "./garageCaseVehicle.columns";

const clean = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed || null;
};

/** Hãng xe: ưu tiên tên, thiếu thì mã; rỗng trả null. */
export const formatVehicleBrand = (c: GarageCaseVehicleFields) =>
  clean(c.hangXeName) ?? clean(c.hangXeCode);

/** Dòng xe: ưu tiên tên, thiếu thì mã; rỗng trả null. */
export const formatVehicleModel = (c: GarageCaseVehicleFields) =>
  clean(c.dongXeName) ?? clean(c.dongXeCode);

/** Đối tượng thanh toán: ưu tiên tên, thiếu thì mã; rỗng trả null. */
export const formatPayer = (c: GarageCaseVehicleFields) =>
  clean(c.doiTuongThanhToanName) ?? clean(c.doiTuongThanhToanCode);

/** Năm sản xuất hợp lệ (1900-2099) dạng chuỗi, còn lại null. */
export const formatModelYear = (c: GarageCaseVehicleFields) => {
  const n = Number(c.namSanXuat);
  return Number.isInteger(n) && n >= 1900 && n <= 2099 ? String(n) : null;
};

/** Mã phụ hiển thị dưới/cạnh tên; null khi trùng tên hoặc không có. */
const secondaryCode = (name: string | null, code: unknown) => {
  const c = clean(code);
  return c && c !== name ? c : null;
};

/** Dựng các dòng thông tin xe cho drawer; module chỉ việc render. */
export const buildVehicleInfoRows = (
  c: GarageCaseVehicleFields,
): GarageCaseVehicleInfoRow[] => {
  const values = {
    soKhung: { value: clean(c.soKhung), code: null },
    hangXe: {
      value: formatVehicleBrand(c),
      code: secondaryCode(formatVehicleBrand(c), c.hangXeCode),
    },
    dongXe: {
      value: formatVehicleModel(c),
      code: secondaryCode(formatVehicleModel(c), c.dongXeCode),
    },
    namSanXuat: { value: formatModelYear(c), code: null },
    doiTuongThanhToan: {
      value: formatPayer(c),
      code: secondaryCode(formatPayer(c), c.doiTuongThanhToanCode),
    },
  } as const;
  return GARAGE_CASE_VEHICLE_COLUMNS.map((col) => ({
    key: col.key,
    localeKey: col.localeKey,
    defaultLabel: col.defaultLabel,
    ...values[col.key],
  }));
};

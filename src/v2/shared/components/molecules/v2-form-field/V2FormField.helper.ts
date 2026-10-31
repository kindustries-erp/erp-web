import {
  V2FormFieldType,
  type V2FieldOption,
  type V2FormFieldTypeInput,
} from "./V2FormField.type";

/** Tạo Map O(1) tra cứu nhãn nhanh từ danh sách options */
export function buildOptionMap(options?: V2FieldOption[]): Map<string, string> {
  const map = new Map<string, string>();
  if (!options) return map;
  for (const opt of options) {
    map.set(opt.value, opt.label);
  }
  return map;
}

/** Format chuỗi ngày ISO (YYYY-MM-DD) sang chuẩn hiển thị DD/MM/YYYY */
export function formatIsoDateForDisplay(isoString?: string | null): string {
  if (!isoString) return "";
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(isoString);
  if (!match) return isoString;
  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
}

/** Chuyển đổi giá trị sang chuỗi hiển thị tối ưu cho chế độ View */
export function resolveDisplayValue(
  type: V2FormFieldTypeInput = V2FormFieldType.TEXT,
  value: any,
  optionMap: Map<string, string>,
  emptyDisplay = "—",
  switchLabels?: { on: string; off: string },
): string {
  if (value === null || value === undefined || value === "") {
    return emptyDisplay;
  }

  switch (type) {
    case V2FormFieldType.SELECT:
    case V2FormFieldType.RADIO:
      return optionMap.get(String(value)) || String(value) || emptyDisplay;

    case V2FormFieldType.MULTI_SELECT: {
      if (!Array.isArray(value) || value.length === 0) return emptyDisplay;
      return value
        .map((val) => optionMap.get(String(val)) || String(val))
        .join(", ");
    }

    case V2FormFieldType.NUMBER: {
      if (typeof value !== "number" && isNaN(Number(value)))
        return emptyDisplay;
      return new Intl.NumberFormat("vi-VN").format(Number(value));
    }

    case V2FormFieldType.DATE:
      return formatIsoDateForDisplay(String(value)) || emptyDisplay;

    case V2FormFieldType.SWITCH: {
      const onLabel = switchLabels?.on || "Hoạt động";
      const offLabel = switchLabels?.off || "Ngưng hoạt động";
      return value ? onLabel : offLabel;
    }

    default:
      return String(value);
  }
}

/** Xác định xem có nên bật nút Copy trong chế độ xem hay không */
export function resolveShouldCopy(
  copyable?: boolean,
  type?: V2FormFieldTypeInput,
  inputType?: string,
  uppercase?: boolean,
): boolean {
  if (copyable !== undefined) return copyable;
  if (
    type === V2FormFieldType.NUMBER ||
    type === V2FormFieldType.SWITCH ||
    type === V2FormFieldType.DATE
  ) {
    return false;
  }
  return inputType === "email" || Boolean(uppercase);
}

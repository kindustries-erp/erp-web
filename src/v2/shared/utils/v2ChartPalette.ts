/**
 * Bảng màu biểu đồ V2: 5 màu phân loại, không có xanh dương (No Blue Mandate) và không dùng đỏ
 * (đỏ dành cho trạng thái lỗi). Thứ tự cố định đã chạy `validate_palette.js` (skill dataviz):
 * qua đủ các ngưỡng, kể cả khoảng cách với người mù màu, ở cả hai chế độ.
 * Màu sáng có vài ô dưới 3:1 so với nền (lục lam, vàng, hồng) nên luôn kèm legend và chế độ xem dạng bảng.
 */
export type V2ChartMode = "light" | "dark";

export const V2_CHART_SERIES: Record<V2ChartMode, readonly string[]> = {
  light: ["#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#008300"],
  dark: ["#d95926", "#199e70", "#c98500", "#d55181", "#008300"],
};

export const V2_CHART_MAX_SERIES = V2_CHART_SERIES.light.length;

/** Màu theo thứ tự cố định, không xoay vòng. Vượt quá số màu thì gộp vào "Khác" bằng `capV2Series` */
export const getV2SeriesColor = (index: number, mode: V2ChartMode): string => {
  const color = V2_CHART_SERIES[mode][index];
  if (!color) {
    throw new RangeError(
      `Chỉ có ${V2_CHART_MAX_SERIES} màu cho biểu đồ, hãy gộp phần còn lại bằng capV2Series`,
    );
  }
  return color;
};

export interface V2CappableSeries {
  key: string;
  label: string;
  data: number[];
}

/** Giữ tối đa `max` chuỗi: các chuỗi cuối được cộng dồn thành một chuỗi "Khác" */
export const capV2Series = <S extends V2CappableSeries>(
  series: S[],
  otherLabel: string,
  max: number = V2_CHART_MAX_SERIES,
): V2CappableSeries[] => {
  if (series.length <= max) return series;
  const head = series.slice(0, max - 1);
  const tail = series.slice(max - 1);
  const length = Math.max(...tail.map((s) => s.data.length));
  const data = Array.from({ length }, (_, i) =>
    tail.reduce((sum, s) => sum + (s.data[i] ?? 0), 0),
  );
  return [...head, { key: "__other", label: otherLabel, data }];
};

/** Màu nền trong suốt ~10% để tô vùng dưới đường (area) */
export const withAlpha = (hex: string, alpha: number): string => {
  const a = Math.round(Math.min(1, Math.max(0, alpha)) * 255)
    .toString(16)
    .padStart(2, "0");
  return `${hex}${a}`;
};

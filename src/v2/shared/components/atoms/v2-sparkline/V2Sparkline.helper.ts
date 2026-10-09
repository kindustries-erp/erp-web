export interface V2SparklinePoint {
  x: number;
  y: number;
}

/**
 * Đổi dãy số thành tọa độ SVG: điểm đầu sát trái, điểm cuối sát phải,
 * giá trị lớn nhất ở trên. Chừa `padding` để chấm cuối không bị cắt.
 */
export const buildSparklinePoints = (
  values: number[],
  width: number,
  height: number,
  padding = 5,
): V2SparklinePoint[] => {
  if (values.length < 2) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;
  return values.map((value, index) => ({
    x: padding + (index / (values.length - 1)) * innerW,
    y: span === 0 ? height / 2 : padding + (1 - (value - min) / span) * innerH,
  }));
};

export const toPolylinePoints = (points: V2SparklinePoint[]): string =>
  points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

import { useQuery } from "@tanstack/react-query";
import { garageOpexApi } from "../api/garageOpexApi";

/** P&L 12 tháng kết thúc ở kỳ đang chọn, dùng cho 2 chart của Dashboard Garage. */
export function useGaragePnlTrend(year: number, month: number) {
  return useQuery({
    queryKey: ["garage-pnl-trend", year, month],
    queryFn: () => garageOpexApi.getPnlTrend({ year, month, count: 12 }),
  });
}

import * as React from "react";
import { WORKSHOP_CLOCK_TICK_MS } from "../../workshop";

/** Thời điểm hiện tại, cập nhật theo chu kỳ (mặc định mỗi phút) để đồng hồ công đoạn tự nhích, không gọi API. */
export function useNowTick(intervalMs = WORKSHOP_CLOCK_TICK_MS): Date {
  const [now, setNow] = React.useState(() => new Date());
  React.useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}

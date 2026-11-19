import type { V2StatusChipTone } from "./V2TabBar.type";

/** Chấm nhãn: trang trí, không có atom chấm sẵn nên giữ span kèm aria-hidden */
export const DOT_CLASS: Record<V2StatusChipTone, string> = {
  neutral: "bg-faint",
  success: "bg-up-fg",
  muted: "bg-faint opacity-70",
  warning: "bg-warn-fg",
};

/** Màu thanh hairline progress theo tone */
export const PROGRESS_BAR_CLASS: Record<V2StatusChipTone, string> = {
  neutral: "bg-muted-fg/40",
  success: "bg-up-fg",
  muted: "bg-muted-fg/30",
  warning: "bg-warn-fg",
};

export const numberFormatter = new Intl.NumberFormat("vi-VN");

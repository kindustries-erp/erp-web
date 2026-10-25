/** Mặt nổi chung cho Sheet (drawer) và Dialog mobile: nền kính, blur, shadow */
export const FLOATING_SURFACE_CLASS =
  "bg-[var(--drawer-bg,rgba(255,255,255,0.85))] backdrop-blur-[var(--drawer-blur,20px)] backdrop-saturate-[190%] backdrop-contrast-[102%] shadow-[var(--drawer-shadow,var(--panel-shadow,0_12px_30px_rgba(15,23,42,0.16)))]";

/** Thanh kính (header, footer, hàng tổng) dùng chung với V2 Standard Table */
export const GLASS_BAR_CLASS =
  "bg-[var(--table-header-bg,rgba(244,246,248,0.65))] backdrop-blur-[16px] backdrop-saturate-200";

/** Lớp phủ nền dùng chung. Giá trị trong suốt, không blur (token trong v2-theme.css) */
export const FLOATING_OVERLAY_CLASS =
  "bg-[var(--overlay-bg,transparent)] backdrop-blur-[var(--overlay-blur,0px)]";

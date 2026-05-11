import type { ReactNode } from "react";

/* ── per-page meta ── */
export type PageMeta = {
  icon: ReactNode;
  nameVi: string;
  nameEn: string;
  descVi: string;
  descEn: string;
  featuresVi: [ReactNode, string][];
  featuresEn: [ReactNode, string][];
  progress: number;
};

export const SvgIcon = ({ children }: { children: ReactNode }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    className="w-8 h-8"
  >
    {children}
  </svg>
);

// small monochrome icon for feature cards
export const FI = (d: ReactNode) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    className="w-4 h-4"
  >
    {d}
  </svg>
);

export const DEFAULT_META: PageMeta = {
  icon: (
    <SvgIcon>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </SvgIcon>
  ),
  nameVi: "Sắp ra mắt",
  nameEn: "Coming Soon",
  descVi: "Tính năng đang được phát triển.",
  descEn: "This feature is under development.",
  featuresVi: [],
  featuresEn: [],
  progress: 15,
};

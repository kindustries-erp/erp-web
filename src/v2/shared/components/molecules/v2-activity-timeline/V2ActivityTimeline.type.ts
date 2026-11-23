import * as React from "react";

/**
 * Enum các biến thể màu ngữ nghĩa chuẩn V2 (No Blue mandate)
 * Dùng chung giữa các component Activity Timeline, Card và Row.
 */
export enum V2ActivityVariant {
  DEFAULT = "default",
  SUCCESS = "success",
  WARNING = "warning",
  DANGER = "danger",
}

export type V2ActivityVariantType = V2ActivityVariant | `${V2ActivityVariant}`;

export interface V2ActivitySubItem {
  key?: string;
  label: string;
  value?: string | React.ReactNode;
}

export interface V2ActivityItem {
  id: string | number;
  action: string;
  actor?: string;
  timestamp: string;
  rawTimestamp?: string | Date;
  details?: string | React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  variant?: V2ActivityVariantType;
  featured?: boolean;
  subItems?: V2ActivitySubItem[];
}

export interface V2ActivityTimelineProps {
  items: V2ActivityItem[];
  emptyMessage?: string;
  className?: string;
  /** Vị trí item hiển thị dạng card nổi bật (mặc định item đầu tiên: 0) */
  featuredIndex?: number;
}

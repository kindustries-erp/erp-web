import type { ReactNode } from "react";

/** Một ô trong lưới trường của drawer: nhãn, lỗi và phần render nội dung */
export interface V2DrawerFieldItem {
  key: string;
  label: string;
  required?: boolean;
  error?: string;
  /** Class riêng của ô (ví dụ `sm:col-span-2`); bị bỏ khi lưới chỉ có 1 cột */
  className?: string;
  render: () => ReactNode;
}

export interface V2DrawerFieldGridProps {
  fields: V2DrawerFieldItem[];
  columns?: 1 | 2;
}

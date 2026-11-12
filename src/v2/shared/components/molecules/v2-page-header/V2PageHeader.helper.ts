import { V2PageHeaderVariant } from "./V2PageHeader.type";

export interface V2PageHeaderStyleConfig {
  container: string;
  title: string;
  description: string;
  icon: string;
  actions: string;
  toolbar: string;
}

/** Bảng cấu hình class cho từng biến thể V2PageHeader theo token ngữ cảnh Light/Dark */
export const V2_PAGE_HEADER_STYLES: Record<
  V2PageHeaderVariant,
  V2PageHeaderStyleConfig
> = {
  [V2PageHeaderVariant.FLAT]: {
    container:
      "flex shrink-0 items-center justify-between gap-2 sm:gap-3 flex-wrap sm:flex-nowrap",
    title: "text-sm sm:text-base font-semibold",
    description: "hidden sm:block",
    icon: "hidden sm:inline-flex",
    actions: "order-2 sm:order-3 shrink-0 ml-auto sm:ml-0",
    toolbar:
      "order-3 sm:order-2 flex w-full sm:w-auto shrink-0 items-center justify-between sm:justify-end gap-1.5 sm:gap-2 sm:ml-auto",
  },
  [V2PageHeaderVariant.CARD]: {
    container:
      "flex shrink-0 flex-col items-stretch sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 rounded-2xl border border-border/80 dark:border-white/[0.08] bg-card p-4 sm:p-6 shadow-xs",
    title: "text-base sm:text-xl font-bold tracking-tight",
    description: "mt-0.5 sm:mt-1 text-xs sm:text-sm line-clamp-2",
    icon: "inline-flex shrink-0",
    actions:
      "order-2 sm:order-3 shrink-0 flex items-center justify-end gap-2 flex-wrap",
    toolbar:
      "order-3 sm:order-2 flex w-full sm:w-auto shrink-0 items-center justify-between sm:justify-end gap-1.5 sm:gap-2 sm:ml-auto",
  },
};

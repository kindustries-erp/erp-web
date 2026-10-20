import type React from "react";

/**
 * V2BaseProps — Base props cho mọi Container / Presentational component trong V2.
 * Kế thừa toàn bộ HTMLAttributes<T> (className, id, style, aria-*, data-*, onClick, v.v.)
 * Mặc định T = HTMLDivElement, có thể tùy biến: V2BaseProps<HTMLSpanElement>, etc.
 */
export type V2BaseProps<T extends HTMLElement = HTMLDivElement> =
  React.HTMLAttributes<T>;

/**
 * V2ButtonBaseProps — Base props cho mọi Button / Interactive element trong V2.
 * Kế thừa toàn bộ ButtonHTMLAttributes<HTMLButtonElement> (disabled, type, form, aria-pressed, v.v.)
 */
export type V2ButtonBaseProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

/**
 * V2AnchorBaseProps — Base props cho thẻ liên kết <a> trong V2.
 */
export type V2AnchorBaseProps = React.AnchorHTMLAttributes<HTMLAnchorElement>;

/**
 * V2InputBaseProps — Base props cho form input components.
 */
export type V2InputBaseProps = React.InputHTMLAttributes<HTMLInputElement>;

/**
 * V2Size — Kích thước chuẩn hoá xuyên suốt hệ thống V2
 */
export type V2Size = "xs" | "sm" | "md" | "lg";

/**
 * V2SizedProps — Props cho component có hỗ trợ kích thước chuẩn
 */
export interface V2SizedProps<
  T extends HTMLElement = HTMLDivElement,
> extends V2BaseProps<T> {
  size?: V2Size;
}

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function fmtMoney(n: number): string {
  return n.toLocaleString("vi-VN");
}

export function bangChu(n: number): string {
  if (!n) return "Không đồng chẵn";
  const m = n / 1_000_000;
  const u = ["", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
  const label = Number.isInteger(m)
    ? (m < 10 ? u[m] || String(m) : String(m)) + " triệu"
    : fmtMoney(n);
  return label + " đồng chẵn";
}

import React from "react";
import { Badge } from "@/shared/components/ui/badge";

interface KgaraCaseStatusBadgeProps {
  status?: string;
}

export function KgaraCaseStatusBadge({ status }: KgaraCaseStatusBadgeProps) {
  if (!status) return null;

  const s = status.toLowerCase();

  // Mặc định là outline
  let variant: "default" | "secondary" | "destructive" | "outline" | "ghost" =
    "outline";

  if (
    s.includes("kết thúc") ||
    s.includes("hoàn thành") ||
    s.includes("giao xe") ||
    s.includes("xong")
  ) {
    variant = "default"; // Màu chính (xanh primary)
  } else if (s.includes("hủy") || s.includes("từ chối")) {
    variant = "destructive"; // Màu đỏ
  } else if (
    s.includes("báo giá") ||
    s.includes("chờ") ||
    s.includes("phụ tùng")
  ) {
    variant = "secondary"; // Màu xám (muted)
  } else if (
    s.includes("đang sửa") ||
    s.includes("đang làm") ||
    s.includes("tiếp nhận")
  ) {
    variant = "outline"; // Viền
  }

  return <Badge variant={variant}>{status}</Badge>;
}

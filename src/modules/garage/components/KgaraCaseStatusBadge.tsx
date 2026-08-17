import React from "react";
import { Badge } from "@/shared/components/ui/badge";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { cn } from "@/shared/utils";

interface KgaraCaseStatusBadgeProps {
  status?: string;
  className?: string;
}

export function KgaraCaseStatusBadge({
  status,
  className,
}: KgaraCaseStatusBadgeProps) {
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

  return (
    <Tooltip content={status}>
      <Badge
        variant={variant}
        className={cn(
          "w-[88px] inline-flex items-center justify-center text-center truncate text-xs shrink-0",
          className,
        )}
      >
        {status}
      </Badge>
    </Tooltip>
  );
}

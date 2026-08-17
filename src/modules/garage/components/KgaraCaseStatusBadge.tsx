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

  let variant:
    | "default"
    | "success"
    | "secondary"
    | "destructive"
    | "warning"
    | "info"
    | "outline"
    | "ghost";

  if (
    s.includes("kết thúc") ||
    s.includes("hoàn thành") ||
    s.includes("giao xe") ||
    s.includes("xong") ||
    s.includes("đã thanh toán")
  ) {
    variant = "success"; // Xanh ngọc pastel dịu mắt
  } else if (
    s.includes("hủy") ||
    s.includes("từ chối") ||
    s.includes("không duyệt")
  ) {
    variant = "destructive"; // Đỏ hồng pastel dịu mắt
  } else if (
    s.includes("báo giá") ||
    s.includes("chờ") ||
    s.includes("phụ tùng") ||
    s.includes("nháp") ||
    s.includes("khách")
  ) {
    variant = "warning"; // Hổ phách pastel dịu mắt
  } else if (
    s.includes("đang sửa") ||
    s.includes("đang làm") ||
    s.includes("tiếp nhận") ||
    s.includes("đang xử lý") ||
    s.includes("kiểm tra")
  ) {
    variant = "info"; // Xanh dương pastel dịu mắt
  } else {
    variant = "secondary";
  }

  return (
    <Tooltip content={status}>
      <Badge
        variant={variant}
        className={cn(
          "w-[88px] inline-flex items-center justify-center text-center truncate text-xs shrink-0 font-medium",
          className,
        )}
      >
        {status}
      </Badge>
    </Tooltip>
  );
}

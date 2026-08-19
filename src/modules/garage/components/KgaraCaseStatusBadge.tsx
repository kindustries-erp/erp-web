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
    variant = "success"; // Xanh lá pastel dịu mắt (Hoàn thành / Đã thanh toán)
  } else if (
    s.includes("hủy") ||
    s.includes("từ chối") ||
    s.includes("không duyệt")
  ) {
    variant = "destructive"; // Đỏ pastel dịu mắt (Hủy / Từ chối)
  } else if (
    s.includes("đang sửa") ||
    s.includes("đang làm") ||
    s.includes("tiếp nhận") ||
    s.includes("đang xử lý") ||
    s.includes("kiểm tra") ||
    s.includes("sửa chữa") ||
    s.includes("xử lý")
  ) {
    variant = "warning"; // Hổ phách / Vàng (Đang làm / Đang xử lý - WIP)
  } else if (
    s.includes("báo giá") ||
    s.includes("chờ") ||
    s.includes("phụ tùng") ||
    s.includes("nháp") ||
    s.includes("khách")
  ) {
    variant = "secondary"; // Màu xám trung tính dịu mắt (Báo giá / Nháp / Chờ duyệt)
  } else {
    variant = "secondary"; // Màu xám mặc định cho các trạng thái thông thường
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

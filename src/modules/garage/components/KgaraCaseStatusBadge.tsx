import React from "react";
import { Badge } from "@/shared/components/ui/badge";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { cn } from "@/shared/utils";

export interface KgaraCaseStatusBadgeProps {
  status?: string | number | null;
  className?: string;
}

export function getKgaraStatusLabel(status?: string | number | null): string {
  if (status === null || status === undefined || status === "") return "";

  if (typeof status === "number") {
    switch (status) {
      case 1:
        return "Tiếp nhận";
      case 2:
        return "Báo giá";
      case 3:
        return "Kết thúc";
      case 4:
        return "Đã hủy";
      default:
        return `Trạng thái ${status}`;
    }
  }

  if (typeof status !== "string") {
    return String(status);
  }

  return status.trim();
}

export function KgaraCaseStatusBadge({
  status,
  className,
}: KgaraCaseStatusBadgeProps) {
  const displayStatus = getKgaraStatusLabel(status);
  if (!displayStatus) return null;

  const s = displayStatus.toLowerCase();

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
    s.includes("hoàn tất") ||
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
    <Tooltip content={displayStatus}>
      <Badge
        variant={variant}
        className={cn(
          "w-[88px] inline-flex items-center justify-center text-center truncate text-xs shrink-0 font-medium",
          className,
        )}
      >
        {displayStatus}
      </Badge>
    </Tooltip>
  );
}

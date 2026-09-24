import { Wrench, Building2, Zap, HelpCircle } from "lucide-react";

export const CLASSIFICATION_CONFIG: Record<
  string,
  {
    defaultName: string;
    dot: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  SUA_CHUA_CHUNG: {
    defaultName: "Sửa chữa chung",
    dot: "#10b981",
    icon: Wrench,
  },
  KY_GUI_NOI_BO: {
    defaultName: "Ký gửi / Nội bộ",
    dot: "#6366f1",
    icon: Building2,
  },
  OJ_NGOAI: {
    defaultName: "OJ Ngoài",
    dot: "#f59e0b",
    icon: Zap,
  },
  KHAC: {
    defaultName: "Khác",
    dot: "#64748b",
    icon: HelpCircle,
  },
};

export const ORDERED_KEYS = [
  "SUA_CHUA_CHUNG",
  "KY_GUI_NOI_BO",
  "OJ_NGOAI",
  "KHAC",
] as const;

export const formatMonthLabel = (m: string) => {
  const parts = m.split("-");
  if (parts.length === 2) {
    return `Tháng ${parts[1]}/${parts[0]}`;
  }
  return m;
};

export const getStatusColor = (name: string, index: number) => {
  const lower = name.toLowerCase();
  if (
    lower.includes("kết thúc") ||
    lower.includes("hoàn tất") ||
    lower.includes("xong")
  ) {
    return "#10b981"; // Emerald
  }
  if (
    lower.includes("đang thực hiện") ||
    lower.includes("đang sửa") ||
    lower.includes("tiến hành")
  ) {
    return "#6366f1"; // Indigo
  }
  if (lower.includes("tiếp nhận") || lower.includes("mới")) {
    return "#3b82f6"; // Blue
  }
  if (lower.includes("báo giá") || lower.includes("chờ duyệt")) {
    return "#f59e0b"; // Amber
  }
  if (lower.includes("hủy") || lower.includes("từ chối")) {
    return "#ef4444"; // Red
  }
  const fallbackColors = [
    "#8b5cf6",
    "#06b6d4",
    "#ec4899",
    "#64748b",
    "#84cc16",
  ];
  return fallbackColors[index % fallbackColors.length];
};

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
    dot: "#059669",
    icon: Wrench,
  },
  KY_GUI_NOI_BO: {
    defaultName: "Ký gửi / Nội bộ",
    dot: "#0D9488",
    icon: Building2,
  },
  OJ_NGOAI: {
    defaultName: "OJ Ngoài",
    dot: "#EA580C",
    icon: Zap,
  },
  KHAC: {
    defaultName: "Khác",
    dot: "#475569",
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
    return "#059669"; // Emerald
  }
  if (
    lower.includes("đang thực hiện") ||
    lower.includes("đang sửa") ||
    lower.includes("tiến hành")
  ) {
    return "#475569"; // Slate
  }
  if (lower.includes("tiếp nhận") || lower.includes("mới")) {
    return "#0D9488"; // Teal
  }
  if (lower.includes("báo giá") || lower.includes("chờ duyệt")) {
    return "#7C3AED"; // Violet
  }
  if (lower.includes("hủy") || lower.includes("từ chối")) {
    return "#E11D48"; // Rose
  }
  const fallbackColors = [
    "#CA8A04",
    "#64748B",
    "#0D9488",
    "#D97706",
    "#9333EA",
  ];
  return fallbackColors[index % fallbackColors.length];
};

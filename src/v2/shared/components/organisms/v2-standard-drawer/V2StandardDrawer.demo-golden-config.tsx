import type { V2TabItemData } from "./V2StandardDrawer.type";
import { V2TabBar } from "@/v2/shared/components/molecules/v2-tab-bar";
import {
  FileText,
  RefreshCw,
  FileSpreadsheet,
  Paperclip,
  Boxes,
  TrendingUp,
} from "lucide-react";

export const goldenLeftTabs: V2TabItemData[] = [
  {
    key: "detail",
    label: "1. Chi tiết",
    icon: <FileText className="w-3.5 h-3.5" />,
  },
  {
    key: "target",
    label: "2. Chi tiết theo đối tượng",
    icon: <FileText className="w-3.5 h-3.5" />,
    badgeCount: 20,
  },
  {
    key: "items",
    label: "3. Chi tiết HHDV",
    icon: <Boxes className="w-3.5 h-3.5" />,
  },
  {
    key: "analysis",
    label: "4. Biến động & Phân tích",
    icon: <TrendingUp className="w-3.5 h-3.5" />,
  },
];

export const goldenActionGroups = [
  {
    groupLabel: "ĐỒNG BỘ",
    items: [
      {
        key: "sync-gdt",
        label: "Đồng bộ từ GDT",
        icon: <RefreshCw className="w-3.5 h-3.5" />,
        onClick: () => alert("Đang đồng bộ từ Tổng cục thuế (GDT)..."),
      },
    ],
  },
  {
    groupLabel: "XUẤT DỮ LIỆU",
    items: [
      {
        key: "export-excel",
        label: "Xuất Excel hóa đơn",
        icon: <FileSpreadsheet className="w-3.5 h-3.5" />,
        onClick: () => alert("Đang xuất file Excel hóa đơn..."),
      },
    ],
  },
];

export const GoldenPreviewToggle = ({
  value,
  onChange,
}: {
  value: "template" | "pdf";
  onChange: (value: "template" | "pdf") => void;
}) => (
  <V2TabBar
    variant="button-group"
    tabs={[
      {
        key: "template",
        label: "Xem trước HĐ thuần",
        icon: <FileText className="w-3.5 h-3.5" />,
      },
      {
        key: "pdf",
        label: "Tài liệu & PDF",
        icon: <Paperclip className="w-3.5 h-3.5" />,
      },
    ]}
    activeTabKey={value}
    onTabChange={(key) => onChange(key as "template" | "pdf")}
  />
);

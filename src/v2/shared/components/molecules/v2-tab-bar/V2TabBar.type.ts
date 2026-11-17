import type * as React from "react";
import type { LucideIcon } from "lucide-react";
import type { V2BaseProps } from "@/v2/shared/types";

/** Biến thể thanh tab chuẩn V2 */
export enum V2TabBarVariant {
  APP = "app",
  HEADER = "header",
  SUB = "sub",
  BUTTON_GROUP = "button-group",
  PAGE = "page",
  PILL = "pill",
  /** Chip bo tròn có chấm màu theo `tone`, không có track bao quanh */
  STATUS_CHIP = "status-chip",
}

export type V2TabBarPillVariant =
  | V2TabBarVariant.HEADER
  | V2TabBarVariant.BUTTON_GROUP
  | V2TabBarVariant.SUB;

/** Tông màu chấm của chip trạng thái (chỉ dùng cho V2TabBarVariant.STATUS_CHIP) */
export type V2StatusChipTone = "neutral" | "success" | "muted" | "warning";

/** Chỉ số đo lường phụ hiển thị trên tab trạng thái */
export interface V2TabMetric {
  /** Nhãn ngắn (ví dụ: "Tồn", "Trị giá", "Chờ", "Nợ") */
  label?: string;
  /** Giá trị số hoặc text đã format (ví dụ: "95 sp", "500k ₫", "1.2 tỷ") */
  value: React.ReactNode;
  /** Icon hiển thị kèm chỉ số (ví dụ: Package, Coins, AlertCircle) */
  icon?: LucideIcon | React.ReactNode;
  /** Nội dung tooltip chi tiết khi hover trên desktop */
  tooltip?: string;
  /** Tông màu nổi bật nếu cần (neutral, success, warning, danger) */
  tone?: "neutral" | "success" | "warning" | "danger";
}

export interface V2TabItemData {
  /** Định danh của tab (hỗ trợ cả id và key) */
  id?: string;
  key?: string;
  /** Nhãn hiển thị của tab */
  label: React.ReactNode;
  /** Icon hiển thị cạnh nhãn */
  icon?: LucideIcon | React.ReactNode;
  /** Số lượng đếm badge hiển thị cạnh nhãn */
  badgeCount?: number;
  /** Hậu tố số đếm (ví dụ: "mã", "mã hàng", "đơn", "phiếu") */
  badgeCountSuffix?: string;
  /** Giá trị phụ trực tiếp (ví dụ: "95 cái", "500.000 ₫", "1.25M ₫") */
  subValue?: React.ReactNode;
  /** Nhãn của giá trị phụ (ví dụ: "Tồn:", "Trị giá:", "Tổng tiền:") */
  subLabel?: string;
  /** Danh sách metric phụ chi tiết (1-2 item gọn) */
  metrics?: V2TabMetric[];
  /** Tỷ lệ phần trăm tuỳ chọn (ví dụ: 82.5). Nếu bỏ trống sẽ tự tính theo badgeCount / total */
  percentage?: number;
  /** Tùy chọn ẩn thanh hairline progress bar */
  hideProgress?: boolean;
  /** Trạng thái vô hiệu hóa tab */
  disabled?: boolean;
  /** Cho phép đóng tab (chỉ dùng cho V2TabBarVariant.APP) */
  isClosable?: boolean;
  /** Nội dung panel tương ứng của tab */
  content?: React.ReactNode;
  /** Nội dung panel phải riêng của tab; fallback về rightPanel của drawer nếu bỏ trống */
  rightPanel?: React.ReactNode;
  /** Nút hoặc nội dung phụ hiển thị bên phải khi tab đang active */
  headerExtra?: React.ReactNode;
  /** Ẩn cột thông tin bên phải khi tab này active */
  hideRightPanel?: boolean;
  /** Hiển thị chấm tròn trạng thái (dot) */
  dot?: boolean;
  /** Màu sắc chấm tròn trạng thái */
  dotColor?: "emerald" | "amber" | "rose" | "primary";
  /** Luôn hiển thị icon ngay cả khi tab không active (dành cho V2TabBarVariant.SUB) */
  alwaysShowIcon?: boolean;
  /** Tông màu chấm chip (chỉ dành cho V2TabBarVariant.STATUS_CHIP); mặc định neutral */
  tone?: V2StatusChipTone;
}

export type V2TabEntry = V2TabItemData;

export interface V2TabBarProps extends V2BaseProps<HTMLElement> {
  /** Danh sách các tab */
  tabs: V2TabItemData[];
  /** Tab đang được chọn (theo id) */
  activeTabId?: string;
  /** Tab đang được chọn (theo key, tương đương activeTabId) */
  activeTabKey?: string;
  /** Callback khi chọn tab (trả về id/key) */
  onTabSelect?: (id: string) => void;
  /** Callback khi chọn tab (tương đương onTabSelect) */
  onTabChange?: (key: string) => void;
  /** Callback khi đóng tab (V2TabBarVariant.APP) */
  onTabClose?: (id: string) => void;
  /** Biến thể giao diện của tab bar theo enum V2TabBarVariant */
  variant?: V2TabBarVariant;
  /** Cụm nút tiện ích hoặc actions hiển thị bên phải thanh tab */
  extra?: React.ReactNode;
  /** ClassName bổ sung cho container wrapper bên ngoài */
  containerClassName?: string;
  /** Nhãn aria-label hỗ trợ accessibility */
  ariaLabel?: string;
  /** Chỉ với V2TabBarVariant.SUB: các tab chia đều toàn bộ chiều ngang */
  stretch?: boolean;
  /** Mật độ hiển thị cho tab STATUS_CHIP: 'compact' (mặc định) hoặc 'comfortable' */
  density?: "compact" | "comfortable";
  /** Kiểu chỉ báo chân thẻ: 'active-bar' (thanh gạch chân tab active tím) hoặc 'progress' (thanh hairline progress bar) */
  indicator?: "active-bar" | "progress";
  /** Kiểu hiển thị chỉ số phụ của chip: 'stacked' (3 hàng rõ ràng), 'inline' (2 hàng có text), 'icon' (2 hàng dùng micro-icon) */
  metricMode?: "stacked" | "inline" | "icon";
  /** Chiều rộng các tab card bằng nhau (mặc định true cho STATUS_CHIP) */
  equalWidth?: boolean;
}

export interface TabBarPillViewProps {
  tabs: V2TabItemData[];
  variant: V2TabBarPillVariant;
  activeKey: string;
  onSelect: (key: string) => void;
  extra?: React.ReactNode;
  className?: string;
  ariaLabel?: string;
  stretch?: boolean;
}

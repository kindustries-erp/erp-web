import {
  Wrench,
  Cpu,
  ArrowDownToLine,
  ArrowUpFromLine,
  Scale,
  LayoutDashboard,
  Cloud,
  RefreshCw,
  Car,
  Wallet,
  Receipt,
  BarChart3,
  Settings,
  type LucideIcon,
} from "lucide-react";

import type { GarageWorkflowIconName } from "./garageWorkflowTypes";

/** Icon đi kèm tên bộ phận/module, giúp đọc nhanh sơ đồ. */
export const WORKFLOW_ICONS: Record<GarageWorkflowIconName, LucideIcon> = {
  wrench: Wrench,
  cpu: Cpu,
  arrowIn: ArrowDownToLine,
  arrowOut: ArrowUpFromLine,
  scale: Scale,
  dashboard: LayoutDashboard,
  cloud: Cloud,
  refresh: RefreshCw,
  car: Car,
  wallet: Wallet,
  receipt: Receipt,
  chart: BarChart3,
  settings: Settings,
};

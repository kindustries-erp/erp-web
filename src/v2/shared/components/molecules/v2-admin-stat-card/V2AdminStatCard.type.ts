import type { LucideIcon } from "lucide-react";
import { V2AdminStatVariant } from "@/v2/shared/types";

export type AdminStatVariant =
  | V2AdminStatVariant
  | "default"
  | "success"
  | "warning"
  | "danger";

export interface V2AdminStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  growthRate?: number;
  icon?: LucideIcon;
  variant?: AdminStatVariant;
  className?: string;
}

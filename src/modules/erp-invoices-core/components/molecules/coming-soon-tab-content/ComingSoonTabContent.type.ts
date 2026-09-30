import type { LucideIcon } from "lucide-react";

export interface ComingSoonFeature {
  icon: LucideIcon;
  title: string;
  desc: string;
  iconColor?: string;
  bgColor?: string;
}

export interface ComingSoonTabContentProps {
  title?: string;
  description?: string;
  badge?: string;
  className?: string;
  features?: ComingSoonFeature[];
  releaseNote?: string;
}

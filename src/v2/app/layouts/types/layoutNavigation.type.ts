import type { LucideIcon } from "lucide-react";

export interface RawNavDef {
  id: string;
  sectionId: string;
  labelKey: string;
  fallback: string;
  icon: LucideIcon;
  href: string;
}

export interface RawSectionDef {
  id: string;
  labelKey: string;
  fallback: string;
}

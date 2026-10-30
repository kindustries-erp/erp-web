import type { V2SidebarSectionData } from "@/v2/shared/components";
import { ADMIN_NAV_DEFS, ADMIN_SECTION_DEFS } from "./v2AdminNavigation.config";

export type TranslationFn = (key: string, fallback?: string) => string;

export function getV2AdminNavigationSections(
  t: TranslationFn,
): V2SidebarSectionData[] {
  return ADMIN_SECTION_DEFS.map((sec) => ({
    id: sec.id,
    label: t(sec.labelKey, sec.fallback),
    items: ADMIN_NAV_DEFS.filter((item) => item.sectionId === sec.id).map(
      (item) => ({
        id: item.id,
        label: t(item.labelKey, item.fallback),
        icon: item.icon,
        href: item.href,
      }),
    ),
  })).filter((sec) => sec.items.length > 0);
}

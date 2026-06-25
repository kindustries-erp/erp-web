import { PageKey } from "@/shared/types";

export const ALL_PAGE_KEYS: PageKey[] = [
  "dashboard",

  "purchasing",
  "erp-inventory-stock",
  "erp-inventory-tracking",
  "erp-inventory-vouchers",
  "mfg-items",
  "mfg-purchase-orders",
  "mfg-vehicles",
  "erp-bom",
  "erp-inventory-items",
  "erp-inventory-uom",
  "erp-inventory-item-types",
  "erp-inventory-tracking-categories",
  "erp-suppliers",
  "erp-customers",
  "erp-users",
  "erp-activity-logs",
  "erp-permissions-core",
  "erp-invoices",
];

const LEGACY_SLUGS: Record<string, PageKey> = {
  "mua-hang": "purchasing",
  kho: "erp-inventory-stock",
};

export function pageToPath(page: PageKey, tab?: string): string {
  const slug = page === "purchasing" ? "" : page;
  const base = slug ? `/${slug}` : "/";
  return tab ? `${base}?tab=${encodeURIComponent(tab)}` : base;
}

export function pageToUrl(page: PageKey, tab?: string): string {
  return window.location.origin + pageToPath(page, tab);
}

export function pathToPage(
  pathname: string,
  search: string,
): { page: PageKey; tab?: string } | null {
  const slug = pathname.replace(/^\//, "");
  let page: PageKey | undefined;

  if (slug === "") {
    page = "purchasing";
  } else {
    page = ALL_PAGE_KEYS.includes(slug as PageKey)
      ? (slug as PageKey)
      : LEGACY_SLUGS[slug];
  }

  if (page === undefined) return null;
  const tab = new URLSearchParams(search).get("tab") ?? undefined;
  return { page, tab };
}

import { PageKey } from "@/shared/types";

export const ALL_PAGE_KEYS: PageKey[] = [
  "dashboard",
  "sales",
  "purchasing",
  "inventory",
  "mfg-items",
  "mfg-purchase-orders",
  "mfg-vehicles",
  "erp-bom",
  "erp-goods-receipts",
  "erp-production",
  "erp-sales-orders",
  "erp-goods-issues",
];

const LEGACY_SLUGS: Record<string, PageKey> = {
  "ban-hang": "sales",
  "mua-hang": "purchasing",
  kho: "inventory",
};

export function pageToPath(page: PageKey, tab?: string): string {
  const slug = page === "dashboard" ? "" : page;
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
    page = "dashboard";
  } else {
    page = ALL_PAGE_KEYS.includes(slug as PageKey)
      ? (slug as PageKey)
      : LEGACY_SLUGS[slug];
  }

  if (page === undefined) return null;
  const tab = new URLSearchParams(search).get("tab") ?? undefined;
  return { page, tab };
}

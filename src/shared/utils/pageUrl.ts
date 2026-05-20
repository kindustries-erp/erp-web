import { PageKey } from "@/shared/types";

/** All valid page keys — used to validate URL paths */
export const ALL_PAGE_KEYS: PageKey[] = [
  "dashboard",
  "cashflow",
  "cash-fund",
  "bank-deposit",
  "attachments",
  "settings-cash-fund",
  "settings-bank",
  "settings-accounts",
  "receivables",
  "payables",
  "ledger",
  "journal",
  "employees",
  "departments",
  "positions",
  "sales",
  "customers",
  "purchasing",
  "suppliers",
  "activity-log",
  "partners",
  "permissions",
  "e-invoice",
  "workflow",
];

/**
 * PageKey → URL slug.
 * Only keys whose slug differs from the key itself need an entry.
 */
const PAGE_SLUG: Partial<Record<PageKey, string>> = {
  "settings-cash-fund": "settings/cash-fund",
  "settings-bank": "settings/bank",
  "settings-accounts": "settings/accounts",
};

/** Slug → PageKey (reverse of PAGE_SLUG) */
const SLUG_TO_PAGE: Record<string, PageKey> = Object.fromEntries(
  (Object.entries(PAGE_SLUG) as [PageKey, string][]).map(([k, v]) => [v, k]),
);

/**
 * Legacy Vietnamese slugs → new PageKey.
 * Allows old bookmarks/URLs to still resolve correctly.
 */
const LEGACY_SLUGS: Record<string, PageKey> = {
  "dong-tien": "cashflow",
  "tien-mat": "cash-fund",
  "tien-gui": "bank-deposit",
  "tai-lieu": "attachments",
  "thiet-lap": "settings-cash-fund",
  "thiet-lap-ngan-hang": "settings-bank",
  "thiet-lap-tai-khoan": "settings-accounts",
  "cong-no": "receivables",
  "phai-tra": "payables",
  "so-cat": "ledger",
  "bao-cao": "journal",
  "nhan-su": "employees",
  "phong-ban": "departments",
  "chuc-vu": "positions",
  "ban-hang": "sales",
  "khach-hang": "customers",
  "mua-hang": "purchasing",
  "nha-cung-cap": "suppliers",
  "doi-tac": "partners",
  "phan-quyen": "permissions",
  "hoa-don": "e-invoice",
};

/** PageKey → relative URL path (e.g. cash-fund → /cash-fund, dashboard → /) */
export function pageToPath(page: PageKey, tab?: string): string {
  const slug = PAGE_SLUG[page] ?? (page === "dashboard" ? "" : page);
  const base = slug ? `/${slug}` : "/";
  return tab ? `${base}?tab=${encodeURIComponent(tab)}` : base;
}

/** PageKey → absolute URL for window.open (includes origin) */
export function pageToUrl(page: PageKey, tab?: string): string {
  return window.location.origin + pageToPath(page, tab);
}

/** URL pathname+search → { page, tab } or null if unknown */
export function pathToPage(
  pathname: string,
  search: string,
): { page: PageKey; tab?: string } | null {
  const slug = pathname.replace(/^\//, "");
  let page: PageKey | undefined;

  if (slug === "") {
    page = "dashboard";
  } else {
    page =
      SLUG_TO_PAGE[slug] ??
      (ALL_PAGE_KEYS.includes(slug as PageKey)
        ? (slug as PageKey)
        : LEGACY_SLUGS[slug]);
  }

  // If a legacy slug was detected, redirect to the new canonical URL
  if (page !== undefined && LEGACY_SLUGS[slug] !== undefined) {
    const newPath = pageToPath(page);
    history.replaceState(null, "", newPath + search);
  }

  if (page === undefined) return null;
  const tab = new URLSearchParams(search).get("tab") ?? undefined;
  return { page, tab };
}

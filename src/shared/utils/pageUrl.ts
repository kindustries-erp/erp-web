import { PageKey } from "@/shared/types";
import { ErpUrlQueryParam } from "@/shared/constants/urlParams";

export const ALL_PAGE_KEYS: PageKey[] = [
  "dashboard",
  "opex",

  "purchasing",
  "erp-inventory-stock",
  "erp-inventory-tracking",
  "erp-inventory-tracking-parts",
  "erp-inventory-tracking-lot",
  "erp-inventory-tracking-custom",
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
  "inventory-dashboard",
  "inventory-dashboard",
  "invoice-dashboard",
  "erp-invoices",
  "erp-invoices-draft",
  "bank-statement",
  "cash-statement",
  "email-inbox",
  "settings-bank",
  "settings-cash-fund",
  "settings-branch",
  "erp-production",
  "erp-finished-goods",
  "erp-sales-orders",
  "sales-report-dashboard",
  "erp-goods-issues",
  "erp-employees",
  "sys-tags",
  "garage-dashboard",
  "garage-cases",
  "garage-opex",
  "garage-receivables",
  "garage-payables",
  "garage-customers",
  "garage-partners",
  "after-sales",
  "purchasing-report-dashboard",
];

const LEGACY_SLUGS: Record<string, PageKey> = {
  "mua-hang": "purchasing",
  kho: "erp-inventory-stock",
  "email-hop-thu": "email-inbox",
  "erp-invoices-in": "erp-invoices",
  "erp-invoices-out": "erp-invoices",
  "garage-customers": "garage-partners",
};

export interface PageUrlParsedState {
  page: PageKey;
  tab?: string;
  instanceIndex: 1 | 2;
  view?: string;
  drawerId?: string;
  drawerMode?: "view" | "edit";
  filters: Record<string, string>;
  columnFilters: Record<string, string[]>;
  columnSearch: Record<string, string>;
  pageNumber?: number;
  pageSize?: number;
  sorts: string[];
}

import { escapeParamToken, unescapeParamToken } from "./urlParamHelper";

export function encodeStateParam(obj: unknown): string {
  if (!obj) return "";
  try {
    // 1. Array (e.g. sorts: ['-date', 'name'])
    if (Array.isArray(obj)) {
      if (obj.length === 0) return "";
      return obj.map((item) => escapeParamToken(String(item))).join(",");
    }

    // 2. Object (e.g. columnFilters: { status: ['A', 'B'] } or columnSearch: { name: 'vin' })
    if (typeof obj === "object" && obj !== null) {
      const entries = Object.entries(obj as Record<string, unknown>).filter(
        ([, v]) => {
          if (v === undefined || v === null || v === "") return false;
          if (Array.isArray(v) && v.length === 0) return false;
          return true;
        },
      );

      if (entries.length === 0) return "";

      const segments: string[] = [];
      for (const [key, val] of entries) {
        const escapedKey = escapeParamToken(key);
        if (Array.isArray(val)) {
          const escapedValues = val
            .map((item) => escapeParamToken(String(item)))
            .join(",");
          segments.push(`${escapedKey}:[${escapedValues}]`);
        } else {
          segments.push(`${escapedKey}:${escapeParamToken(String(val))}`);
        }
      }
      return segments.join("|");
    }

    return String(obj);
  } catch {
    return "";
  }
}

export function decodeStateParam<T = unknown>(str: string): T | null {
  if (!str) return null;
  const trimmed = str.trim();
  if (!trimmed) return null;

  try {
    // 1. Base64 legacy payload (starts with ey...)
    if (
      trimmed.startsWith("ey") &&
      typeof window !== "undefined" &&
      typeof window.atob === "function"
    ) {
      try {
        const json = decodeURIComponent(escape(window.atob(trimmed)));
        return JSON.parse(json) as T;
      } catch {
        // Fall through
      }
    }

    // 2. Standard JSON payload (starts with { or [)
    if (
      (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
      (trimmed.startsWith("[") && trimmed.endsWith("]"))
    ) {
      try {
        return JSON.parse(trimmed) as T;
      } catch {
        // Fall through
      }
    }

    // 3. Compact Key-Value pipeline format (contains :)
    if (trimmed.includes(":")) {
      const result: Record<string, any> = {};
      const pairs = trimmed.split("|");
      for (const pair of pairs) {
        if (!pair) continue;
        const colonIdx = pair.indexOf(":");
        if (colonIdx === -1) continue;
        const key = unescapeParamToken(pair.slice(0, colonIdx).trim());
        const rawVal = pair.slice(colonIdx + 1).trim();
        if (!key) continue;

        if (rawVal.startsWith("[") && rawVal.endsWith("]")) {
          const inner = rawVal.slice(1, -1);
          result[key] = inner
            ? inner.split(",").map((v) => unescapeParamToken(v.trim()))
            : [];
        } else if (rawVal.includes(",")) {
          result[key] = rawVal
            .split(",")
            .map((v) => unescapeParamToken(v.trim()));
        } else {
          result[key] = unescapeParamToken(rawVal);
        }
      }
      return result as T;
    }

    // 4. Comma-separated array (e.g. sorts "-invoiceDate,invoiceNo")
    if (trimmed.includes(",")) {
      return trimmed.split(",").map((v) => unescapeParamToken(v.trim())) as T;
    }

    return null;
  } catch {
    return null;
  }
}

export function pageToPath(
  page: PageKey,
  tab?: string,
  extraParams?: Record<string, string | number | boolean | undefined | null>,
): string {
  const slug = page === "dashboard" ? "" : page;
  const base = slug ? `/${slug}` : "/";
  const searchParams = new URLSearchParams();

  const effectiveTab = tab || (page === "erp-invoices" ? "in" : undefined);
  if (effectiveTab) {
    searchParams.set(ErpUrlQueryParam.TAB, effectiveTab);
  }

  if (extraParams) {
    Object.entries(extraParams).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") {
        searchParams.set(k, String(v));
      }
    });
  }

  const query = searchParams.toString();
  return query ? `${base}?${query}` : base;
}

export function pageToUrl(
  page: PageKey,
  tab?: string,
  extraParams?: Record<string, string | number | boolean | undefined | null>,
): string {
  const origin =
    typeof window !== "undefined" ? window.location.origin : "http://localhost";
  return origin + pageToPath(page, tab, extraParams);
}

export function pathToPage(
  pathname: string,
  search: string,
): {
  page: PageKey;
  tab?: string;
  instanceIndex: 1 | 2;
  searchParams: URLSearchParams;
} | null {
  const slug = pathname.replace(/^\//, "");
  let page: PageKey | undefined;

  if (slug === "") {
    page = "dashboard";
  } else if (slug === "erp-invoices-out" || slug === "erp-invoices-in") {
    page = "erp-invoices";
  } else {
    page = ALL_PAGE_KEYS.includes(slug as PageKey)
      ? (slug as PageKey)
      : LEGACY_SLUGS[slug];
  }

  if (page === undefined) return null;
  const searchParams = new URLSearchParams(search);
  let tab = searchParams.get(ErpUrlQueryParam.TAB) ?? undefined;
  const viewParam = searchParams.get(ErpUrlQueryParam.VIEW);

  // Normalize tab for erp-invoices / erp-invoices-in / erp-invoices-out
  if (slug === "erp-invoices-out") {
    if (tab === "lines" || viewParam === "lines" || tab === "out-lines") {
      tab = "out-lines";
    } else {
      tab = "out";
    }
  } else if (slug === "erp-invoices-in" || page === "erp-invoices") {
    if (tab === "lines" || viewParam === "lines") {
      tab = "in-lines";
    } else if (tab === "header" || !tab) {
      tab = "in";
    }
  }

  const instanceParam = searchParams.get(ErpUrlQueryParam.INSTANCE_INDEX);
  const instanceIndex: 1 | 2 = instanceParam === "2" ? 2 : 1;

  return { page, tab, instanceIndex, searchParams };
}

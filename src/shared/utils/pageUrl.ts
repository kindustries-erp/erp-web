import { PageKey } from "@/shared/types";

/** All valid page keys — used to validate URL paths */
export const ALL_PAGE_KEYS: PageKey[] = [
  "dashboard",
  "dongtien",
  "tienmat",
  "tiengui",
  "dinhkem",
  "thietlap-quy",
  "thietlap-nh",
  "thietlap-tk",
  "phaithu",
  "phaittra",
  "socat",
  "nhatkyechung",
  "nhansu",
  "phongban",
  "chucvu",
  "banhang",
  "khachhang",
  "muahang",
  "nhacungcap",
  "activitylog",
  "doitac",
  "phanquyen",
];

/** PageKey → hyphenated URL slug */
const PAGE_SLUG: Partial<Record<PageKey, string>> = {
  dongtien: "dong-tien",
  tienmat: "tien-mat",
  tiengui: "tien-gui",
  dinhkem: "dinh-kem",
  "thietlap-quy": "thiet-lap-quy",
  "thietlap-nh": "thiet-lap-ngan-hang",
  "thietlap-tk": "thiet-lap-tai-khoan",
  phaithu: "phai-thu",
  phaittra: "phai-tra",
  socat: "so-cat",
  nhatkyechung: "nhat-ky-chung",
  nhansu: "nhan-su",
  phongban: "phong-ban",
  chucvu: "chuc-vu",
  banhang: "ban-hang",
  khachhang: "khach-hang",
  muahang: "mua-hang",
  nhacungcap: "nha-cung-cap",
  activitylog: "activity-log",
  doitac: "doi-tac",
  phanquyen: "phan-quyen",
};

/** Slug → PageKey (reverse of PAGE_SLUG) */
const SLUG_TO_PAGE: Record<string, PageKey> = Object.fromEntries(
  (Object.entries(PAGE_SLUG) as [PageKey, string][]).map(([k, v]) => [v, k]),
);

/** PageKey → relative URL path (e.g. tienmat → /tien-mat, dashboard → /) */
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
  const page: PageKey | undefined =
    slug === ""
      ? "dashboard"
      : (SLUG_TO_PAGE[slug] ??
        (ALL_PAGE_KEYS.includes(slug as PageKey)
          ? (slug as PageKey)
          : undefined));
  if (page === undefined) return null;
  const tab = new URLSearchParams(search).get("tab") ?? undefined;
  return { page, tab };
}

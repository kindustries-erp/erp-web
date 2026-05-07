import { useState, useEffect, useRef } from "react";
import { Activity, RefreshCw } from "lucide-react";
import { useT } from "@/core/i18n";
import { DataTable, type DataTableColumn } from "@/shared/components/DataTable";
import { PageHeader } from "@/shared/components/PageHeader";
import { SearchInput } from "@/shared/components/SearchInput";
import { Combobox } from "@/shared/components/Combobox";
import { DatePicker } from "@/shared/components/DatePicker";
import { cn } from "@/shared/utils";
import {
  getActivityLogsApi,
  getUsersMapApi,
  type ActivityLog,
  type ActivityLogParams,
} from "@/modules/system/api/activityLogApi";

// ── UUID helpers ──────────────────────────────────────────────────────────────

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function isUuid(s: string) {
  return UUID_RE.test(s);
}
function shortId(s: string) {
  return s.slice(0, 8) + "\u2026";
}

// ── Action config ─────────────────────────────────────────────────────────────

const ACTION_OPTIONS = [
  { value: "create", labelKey: "activitylog.actions.create" },
  { value: "update", labelKey: "activitylog.actions.update" },
  { value: "delete", labelKey: "activitylog.actions.delete" },
  { value: "login", labelKey: "activitylog.actions.login" },
  { value: "logout", labelKey: "activitylog.actions.logout" },
  { value: "authenticate", labelKey: "activitylog.actions.authenticate" },
  { value: "upload", labelKey: "activitylog.actions.upload" },
  { value: "comment", labelKey: "activitylog.actions.comment" },
  { value: "run", labelKey: "activitylog.actions.run" },
  { value: "revert", labelKey: "activitylog.actions.revert" },
];

const ACTION_STYLE: Record<string, string> = {
  create: "bg-[color:var(--approve-bg)] text-[color:var(--approve-fg)]",
  update: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  delete: "bg-[color:var(--warn-bg)] text-[color:var(--warn-fg)]",
  login:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  logout: "bg-[color:var(--muted)] text-[color:var(--muted-fg)]",
  authenticate:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  upload:
    "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  comment: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
  run: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  revert:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
};

function ActionBadge({ action }: { action: string }) {
  const t = useT();
  const labelKey =
    ACTION_OPTIONS.find((item) => item.value === action)?.labelKey ??
    `activitylog.actions.${action}`;
  const label =
    action === "upload" ? t("activitylog.actions.uploadShort") : t(labelKey);
  return (
    <span
      className={cn(
        "inline-flex items-center px-[7px] py-[2px] rounded-[20px] text-[10px] font-semibold uppercase tracking-wide",
        ACTION_STYLE[action] ??
          "bg-[color:var(--muted)] text-[color:var(--muted-fg)]",
      )}
    >
      {label === labelKey ? action : label}
    </span>
  );
}

// ── Date/time helpers ─────────────────────────────────────────────────────────

function fmtTs(ts: string): { date: string; time: string } {
  const d = new Date(ts);
  if (isNaN(d.getTime())) return { date: "—", time: "" };
  const date = d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const time = d.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  return { date, time };
}

// ── Main component ────────────────────────────────────────────────────────────

export function ActivityLog() {
  const t = useT();
  const [items, setItems] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // User name map: userId → displayName
  const [usersMap, setUsersMap] = useState<Record<string, string>>({});

  // Search
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const searchTimer = useRef<ReturnType<typeof setTimeout>>();

  // Filters
  const [actionFilter, setActionFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Load users map once
  useEffect(() => {
    getUsersMapApi().then(setUsersMap);
  }, []);

  useEffect(() => {
    loadData(page, pageSize, search, actionFilter, dateFrom, dateTo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, search, actionFilter, dateFrom, dateTo]);

  async function loadData(
    pg: number,
    ps: number,
    q: string,
    action: string,
    from: string,
    to: string,
  ) {
    setLoading(true);
    setFetchError(null);
    try {
      const params: ActivityLogParams = {
        page: pg,
        pageSize: ps,
        sort: ["-timestamp"],
        search: q || undefined,
        action: action || undefined,
        date_from: from || undefined,
        date_to: to || undefined,
      };
      const result = await getActivityLogsApi(params);
      setItems(result.items);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch {
      setFetchError(t("activitylog.fetchError"));
    } finally {
      setLoading(false);
    }
  }

  function handleSearchInput(value: string) {
    setSearchInput(value);
    clearTimeout(searchTimer.current);
    if (value === "") {
      setSearch("");
      setPage(1);
    } else {
      searchTimer.current = setTimeout(() => {
        setSearch(value);
        setPage(1);
      }, 400);
    }
  }

  function handleFilterChange(setter: (v: string) => void, value: string) {
    setter(value);
    setPage(1);
  }

  function handlePageSize(size: number) {
    setPageSize(size);
    setPage(1);
  }

  function handleRefresh() {
    loadData(page, pageSize, search, actionFilter, dateFrom, dateTo);
  }

  function resolveUser(log: ActivityLog): string {
    // user may now be an object {first_name, last_name, email}
    if (log.user && typeof log.user === "object") {
      const u = log.user;
      const name = [u.first_name, u.last_name].filter(Boolean).join(" ").trim();
      return name || u.email || t("activitylog.systemUser");
    }
    if (log.user_name) return log.user_name;
    if (log.user_email) return log.user_email;
    if (log.user && usersMap[log.user]) return usersMap[log.user];
    if (log.user) return isUuid(log.user) ? shortId(log.user) : log.user;
    return t("activitylog.systemUser");
  }

  const hasFilters = !!(search || actionFilter || dateFrom || dateTo);
  const actionOptions = ACTION_OPTIONS.map((item) => ({
    value: item.value,
    label: t(item.labelKey),
  }));
  const columns: DataTableColumn<ActivityLog>[] = [
    {
      key: "timestamp",
      header: t("activitylog.headers.time"),
      cell: (log) => {
        const { date, time } = fmtTs(log.timestamp);
        return (
          <>
            <div className="text-xs font-medium text-foreground">{date}</div>
            <div className="text-[10px] text-[color:var(--muted-fg)] font-mono">
              {time}
            </div>
          </>
        );
      },
      headerClassName: "w-[140px]",
      skeletonClassName: "w-20",
    },
    {
      key: "user",
      header: t("activitylog.headers.user"),
      cell: (log) => {
        const displayUser = resolveUser(log);
        return (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 min-w-[24px] rounded-full bg-[color:var(--primary)]/15 flex items-center justify-center text-[color:var(--primary)] text-[9px] font-bold shrink-0">
              {(displayUser[0] ?? "?").toUpperCase()}
            </div>
            <span
              className="text-xs text-foreground truncate max-w-[140px]"
              title={displayUser}
            >
              {displayUser}
            </span>
          </div>
        );
      },
      skeletonClassName: "w-28",
    },
    {
      key: "action",
      header: t("activitylog.headers.action"),
      cell: (log) => <ActionBadge action={log.action} />,
      headerClassName: "w-[110px]",
      skeletonClassName: "w-16 rounded-full",
    },
    {
      key: "collection",
      header: t("activitylog.headers.collection"),
      cell: (log) =>
        log.collection ? (
          <span className="text-xs font-mono text-[color:var(--muted-fg)] bg-[color:var(--faint)]/50 px-1.5 py-0.5 rounded">
            {log.collection}
          </span>
        ) : (
          <span className="text-xs text-[color:var(--faint)]">—</span>
        ),
      skeletonClassName: "w-24",
    },
    {
      key: "ip",
      header: t("activitylog.headers.ip"),
      cell: (log) => (
        <span className="text-xs font-mono text-[color:var(--muted-fg)]">
          {log.ip ?? "—"}
        </span>
      ),
      headerClassName: "w-[120px]",
      skeletonClassName: "w-20",
    },
  ];

  return (
    <div>
      <PageHeader
        title={t("activitylog.title")}
        desc={t("activitylog.desc")}
        icon={<Activity className="h-4 w-4" />}
        actions={
          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-[6px] px-3 py-[7px] rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] text-xs text-[color:var(--muted-fg)] hover:text-foreground hover:bg-surface-hover transition-colors disabled:opacity-50"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            {t("activitylog.refresh")}
          </button>
        }
      />

      {/* ── Stats strip ── */}
      {!loading && !fetchError && (
        <div className="mb-3 text-xs text-[color:var(--muted-fg)]">
          {total > 0 ? (
            <>
              {t("activitylog.showing")}{" "}
              <span className="font-medium text-foreground">
                {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)}
              </span>{" "}
              {t("activitylog.in")}{" "}
              <span className="font-medium text-foreground">
                {total.toLocaleString("vi-VN")}
              </span>{" "}
              {t("activitylog.records")}
            </>
          ) : (
            t("activitylog.noRecords")
          )}
        </div>
      )}

      <DataTable
        items={items}
        columns={columns}
        getRowKey={(log) => String(log.id)}
        loading={loading}
        error={fetchError}
        emptyLabel={t("activitylog.empty")}
        minWidth={620}
        loadingRows={8}
        filters={
          <>
            <SearchInput
              placeholder={t("activitylog.searchPlaceholder")}
              value={searchInput}
              onChange={handleSearchInput}
              className="max-w-[260px]"
            />
            <Combobox
              options={actionOptions}
              value={actionFilter}
              onChange={(v) => handleFilterChange(setActionFilter, v)}
              placeholder={t("activitylog.actionPlaceholder")}
              className="max-w-[180px]"
            />
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-[color:var(--muted-fg)] shrink-0">
                {t("activitylog.from")}
              </span>
              <DatePicker
                value={dateFrom}
                onChange={(v) => handleFilterChange(setDateFrom, v)}
                placeholder={t("activitylog.fromPlaceholder")}
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-[color:var(--muted-fg)] shrink-0">
                {t("activitylog.to")}
              </span>
              <DatePicker
                value={dateTo}
                onChange={(v) => handleFilterChange(setDateTo, v)}
                placeholder={t("activitylog.toPlaceholder")}
              />
            </div>
            {hasFilters && (
              <button
                type="button"
                className="text-xs text-[color:var(--muted-fg)] hover:text-foreground underline underline-offset-2"
                onClick={() => {
                  setSearchInput("");
                  setSearch("");
                  setActionFilter("");
                  setDateFrom("");
                  setDateTo("");
                  setPage(1);
                }}
              >
                {t("activitylog.clearFilters")}
              </button>
            )}
          </>
        }
        page={page}
        pageSize={pageSize}
        total={total}
        totalPages={totalPages}
        onPage={setPage}
        onPageSize={handlePageSize}
      />
    </div>
  );
}

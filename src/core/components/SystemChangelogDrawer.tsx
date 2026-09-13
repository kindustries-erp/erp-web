import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import {
  Sparkles,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
  Search,
  GitCommit,
  Server,
  Radio,
  Loader2,
} from "lucide-react";
import { useT } from "@/core/i18n";
import { useAppStore } from "@/core/config/appStore";
import { useEnvStore } from "@/core/store/useEnvStore";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { getBuildVersionLabel } from "@/shared/utils";
import { useChangelogInfinite } from "@/core/hooks/useChangelogInfinite";
import {
  CHANGELOG_RELEASES,
  ChangelogItem,
  ChangelogRelease,
} from "@/core/config/changelogData";

export interface SystemChangelogDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function SystemChangelogDrawer({
  open,
  onClose,
}: SystemChangelogDrawerProps) {
  const t = useT();
  const { locale } = useAppStore();
  const { env, isProduction } = useEnvStore();
  const [isReloading, setIsReloading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Server-side search & infinite scroll query
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useChangelogInfinite({
      search: debouncedSearch,
      limit: 6,
      enabled: open,
    });

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const buildVersionLabel = getBuildVersionLabel();

  const handleForceReload = async () => {
    setIsReloading(true);
    try {
      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          await reg.unregister();
        }
      }
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      if (typeof window !== "undefined" && window.sessionStorage) {
        window.sessionStorage.clear();
      }
    } catch (err) {
      console.warn("Error cleaning caches:", err);
    } finally {
      window.location.reload();
    }
  };

  const renderItemTypeLabel = (type: ChangelogItem["type"]) => {
    switch (type) {
      case "feature":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
            <Sparkles className="w-3 h-3" />
            {t("changelog.feature") || "Tính năng mới"}
          </span>
        );
      case "enhancement":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
            <Zap className="w-3 h-3" />
            {t("changelog.enhancement") || "Cải tiến"}
          </span>
        );
      case "fix":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-3 h-3" />
            {t("changelog.fixSecurity") || "Sửa lỗi & Bảo mật"}
          </span>
        );
    }
  };

  const getReleaseIcon = (idx: number, isLatest?: boolean) => {
    if (isLatest) return <Sparkles className="w-3.5 h-3.5" />;
    if (idx === 1) return <Layers className="w-3.5 h-3.5" />;
    if (idx === 2) return <Zap className="w-3.5 h-3.5" />;
    return <CheckCircle2 className="w-3.5 h-3.5" />;
  };

  // Fallback releases if offline or prior to API response
  const fallbackReleases = useMemo(() => {
    if (!debouncedSearch) return CHANGELOG_RELEASES;
    const q = debouncedSearch.toLowerCase();
    return CHANGELOG_RELEASES.filter(
      (r) =>
        r.version.toLowerCase().includes(q) ||
        r.tag?.toLowerCase().includes(q) ||
        r.titleVi.toLowerCase().includes(q) ||
        r.titleEn.toLowerCase().includes(q),
    );
  }, [debouncedSearch]);

  const displayedReleases: ChangelogRelease[] = useMemo(() => {
    if (data?.pages && data.pages.length > 0) {
      const flattened = data.pages.flatMap((page) => page.items);
      if (flattened.length > 0) return flattened as ChangelogRelease[];
    }
    return fallbackReleases;
  }, [data, fallbackReleases]);

  // Handle threshold infinite scroll via IntersectionObserver
  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleLoadMore();
        }
      },
      {
        rootMargin: "160px",
        threshold: 0.1,
      },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [handleLoadMore]);

  const drawerContent = (
    <div>
      {/* ── Section: Release Timeline with Search & Continuous Spine ───────── */}
      <DrawerSection
        title={t("changelog.releaseTimeline")}
        collapsible
        defaultCollapsed={false}
        fitViewportHeight={true}
      >
        {/* Search Input for server-side lookup */}
        <div className="relative mb-3 shrink-0">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={
              t("changelog.searchPlaceholder") ||
              "Tìm kiếm tính năng, phiên bản..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 text-xs h-8 bg-surface/70 border-border/70 focus-visible:ring-1"
          />
        </div>

        {isLoading && displayedReleases.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 text-xs text-muted-foreground py-8">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span>
              {t("changelog.checkingUpdate") || "Đang tải dữ liệu..."}
            </span>
          </div>
        ) : displayedReleases.length === 0 ? (
          <div className="text-center py-8 text-xs text-muted-foreground flex items-center justify-center">
            {t("changelog.noReleasesFound") ||
              "Không tìm thấy phiên bản phù hợp."}
          </div>
        ) : (
          <div ref={scrollContainerRef} className="relative py-2">
            {/* Continuous vertical divider spine - 100% mathematically centered through w-7 (28px) node */}
            <div className="absolute left-[14px] -translate-x-1/2 top-4 bottom-4 w-[2px] bg-slate-300 dark:bg-slate-700 rounded-full" />

            <div className="space-y-6">
              {displayedReleases.map((release, idx) => {
                const isVi = locale === "vi";
                const releaseTitle = isVi ? release.titleVi : release.titleEn;
                const isLatest = Boolean(release.isLatest);

                return (
                  <div
                    key={release.version}
                    className="relative flex items-start group"
                  >
                    {/* 1. Circular Node (w-7 = 28px -> Center is 14px) */}
                    <div className="relative z-10 flex-shrink-0">
                      {isLatest ? (
                        <div className="w-7 h-7 rounded-full bg-slate-900 text-white dark:bg-primary dark:text-primary-foreground flex items-center justify-center shadow-xs ring-4 ring-slate-100 dark:ring-slate-800 transition-transform group-hover:scale-105">
                          {getReleaseIcon(idx, true)}
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-surface border-2 border-slate-400 dark:border-slate-600 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-transform group-hover:scale-105">
                          {getReleaseIcon(idx, false)}
                        </div>
                      )}
                    </div>

                    {/* 2. Dotted horizontal connector */}
                    <div className="w-4 h-0 border-t-2 border-dotted border-slate-300 dark:border-slate-700 self-start mt-3.5 flex-shrink-0" />

                    {/* 3. Event Content (Borderless, clean typography) */}
                    <div className="flex-1 min-w-0 pl-1.5 pt-0.5 space-y-1.5">
                      {/* Header line: Version + Tag + Latest Badge + Date (aligned right) */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2 min-w-0 flex-wrap">
                          <span className="text-xs font-bold font-mono tracking-tight text-foreground">
                            {release.version}
                          </span>
                          {release.tag && (
                            <>
                              <span className="text-[11px] text-muted-foreground/60">
                                •
                              </span>
                              <span className="text-xs text-muted-foreground font-medium">
                                {release.tag}
                              </span>
                            </>
                          )}
                          {isLatest && (
                            <Badge
                              variant="default"
                              className="text-[9px] px-1.5 py-0 h-4"
                            >
                              {t("changelog.badgeLatest")}
                            </Badge>
                          )}
                        </div>

                        {/* Right-aligned Date */}
                        <div className="text-[11px] text-muted-foreground font-mono flex items-center gap-1 shrink-0">
                          <Calendar className="w-3 h-3 opacity-60" />
                          <span>{release.date}</span>
                        </div>
                      </div>

                      {/* Headline Title */}
                      <p className="text-xs font-semibold text-foreground/90 leading-snug">
                        {releaseTitle}
                      </p>

                      {/* Item list */}
                      <ul className="mt-2 space-y-1.5 pl-0.5">
                        {release.items.map((item, iIdx) => (
                          <li
                            key={iIdx}
                            className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-1.5 shrink-0" />
                            <div className="flex-1">
                              <span className="mr-1.5">
                                {renderItemTypeLabel(item.type)}
                              </span>
                              <span className="text-foreground/80">
                                {isVi ? item.textVi : item.textEn}
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Threshold Sentinel Element (Triggers infinite load as user scrolls near bottom) */}
            {hasNextPage && (
              <div
                ref={sentinelRef}
                className="py-4 flex items-center justify-center text-[11px] text-muted-foreground/60"
              >
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary/50 animate-ping mr-1.5" />
                {t("changelog.loadingMore") || "Đang tải thêm..."}
              </div>
            )}
          </div>
        )}
      </DrawerSection>
    </div>
  );

  return (
    <StandardFormDrawer
      open={open}
      mode="view"
      onClose={onClose}
      icon={
        <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4" />
        </div>
      }
      title={t("changelog.title")}
      subtitle={
        <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground mt-0.5">
          <span className="inline-flex items-center gap-1 font-mono font-medium text-foreground/90">
            <GitCommit className="w-3 h-3 text-muted-foreground" />
            {buildVersionLabel}
          </span>
          <span className="text-muted-foreground/40">•</span>
          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            <Radio className="w-2.5 h-2.5 text-emerald-500 animate-pulse" />
            {t("changelog.serviceWorkerActive")}
          </span>
        </div>
      }
      titleExtra={
        <div className="flex items-center gap-1.5">
          <Badge
            variant="default"
            className="text-[10px] px-2 py-0.5 font-semibold"
          >
            v2026.08
          </Badge>
          <Badge
            variant={isProduction ? "default" : "outline"}
            className="text-[9px] px-1.5 py-0 h-4 uppercase tracking-wider font-semibold flex items-center gap-1"
          >
            <Server className="w-2.5 h-2.5" />
            {env || "production"}
          </Badge>
        </div>
      }
      layout="1-column"
      size="md"
      actions={[
        {
          label: isReloading
            ? t("changelog.checkingUpdate") || "Đang kiểm tra..."
            : t("changelog.forceReload") || "Xóa Cache & Tải lại sạch",
          onClick: handleForceReload,
          variant: "secondary" as const,
          disabled: isReloading,
        },
      ]}
      leftPanel={drawerContent}
    />
  );
}

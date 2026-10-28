import * as React from "react";
import { LayoutGrid, Check, RotateCcw, AlertCircle } from "lucide-react";
import { cn } from "@/v2/shared/utils/cn";
import {
  V2Header,
  V2BottomNav,
  V2Modal,
  V2Button,
  V2Text,
  V2LanguageSwitcher,
  V2Icon,
  Palette,
  Globe,
  Sun,
  Moon,
  Sparkles,
  Sliders,
  type V2SidebarNavItem,
} from "@/v2/shared/components";
import { useV2PermissionChecker } from "@/v2/shared/hooks/useV2HasPermission";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { useV2ToastStore } from "@/v2/shared/stores/useV2ToastStore";
import {
  useV2MobileNavStore,
  MAX_PINNED_MOBILE_NAV,
} from "@/v2/shared/stores/useV2MobileNavStore";
import { filterV2NavSections, getV2NavigationSections } from "./v2Navigation";
import { V2AppLayoutProps } from "./V2AppLayout.type";

export const V2AppLayoutMobile: React.FC<V2AppLayoutProps> = ({
  children,
  activeNavId = "dashboard",
  breadcrumbs,
  userName,
  userRole,
  tenantName,
  branchName,
  logoUrl,
  sections,
  navItems,
  onNavigate,
  onBranchClick,
  onClickLogo,
  contentClassName,
  userMenuNode,
  notificationNode,
  currentTheme,
  onThemeChange,
}) => {
  const { t, locale } = useV2Translation();
  const can = useV2PermissionChecker();
  const [catalogOpen, setCatalogOpen] = React.useState(false);
  const [isCustomizing, setIsCustomizing] = React.useState(false);
  const [limitWarning, setLimitWarning] = React.useState<string | null>(null);

  const { pinnedIds, setPinnedIds, resetToDefault } = useV2MobileNavStore();

  const effectiveSections = React.useMemo(() => {
    if (sections && sections.length > 0) {
      return sections;
    }
    return filterV2NavSections(getV2NavigationSections(t), can);
  }, [sections, t, locale, can]);

  // Toàn bộ các module/mục con có thể truy cập
  const allAvailableItems = React.useMemo(() => {
    const list: V2SidebarNavItem[] = [];
    effectiveSections.forEach((sec) => {
      sec.items.forEach((item) => {
        if (!list.some((existing) => existing.id === item.id)) {
          list.push(item);
        }
      });
    });
    return list;
  }, [effectiveSections]);

  // Bộ 5 mục mặc định thông minh
  const default5Items = React.useMemo(() => {
    const primaryItems = effectiveSections
      .map((sec) => sec.items[0])
      .filter(Boolean);
    const combined: V2SidebarNavItem[] = [];
    for (const item of [...primaryItems, ...allAvailableItems]) {
      if (!combined.some((ex) => ex.id === item.id)) {
        combined.push(item);
      }
      if (combined.length >= MAX_PINNED_MOBILE_NAV) break;
    }
    return combined;
  }, [effectiveSections, allAvailableItems]);

  // Danh sách IDs đang được chọn thực tế (nếu store rỗng thì lấy từ default5Items)
  const currentSelectedIds = React.useMemo(() => {
    if (pinnedIds && pinnedIds.length > 0) {
      return pinnedIds;
    }
    return default5Items.map((it) => it.id);
  }, [pinnedIds, default5Items]);

  // 5 Quick action items thực tế hiển thị
  const quick5Items = React.useMemo(() => {
    return currentSelectedIds
      .map((id) => allAvailableItems.find((it) => it.id === id))
      .filter(Boolean) as V2SidebarNavItem[];
  }, [currentSelectedIds, allAvailableItems]);

  // Thanh điều hướng cố định 6 items: 5 quick actions + 1 Tất cả
  const effectiveNavItems = React.useMemo(() => {
    if (navItems) return navItems;

    const allMenuItem: V2SidebarNavItem = {
      id: "catalog",
      label: t("v2.nav.items.allModules", "Tất cả"),
      icon: LayoutGrid,
      href: "#catalog",
    };

    return [...quick5Items, allMenuItem];
  }, [navItems, quick5Items, t]);

  const handleMobileNavigate = (item: (typeof effectiveNavItems)[number]) => {
    if (item.id === "catalog") {
      setCatalogOpen(true);
      return;
    }
    onNavigate?.(item);
  };

  // Xử lý bật/tắt chọn mục trong chế độ Tùy chỉnh: Chặn khi đủ 5 mục và phát thông báo
  const handleToggleItem = (itemId: string) => {
    if (currentSelectedIds.includes(itemId)) {
      // Bỏ chọn mục đã có
      const nextIds = currentSelectedIds.filter((id) => id !== itemId);
      setPinnedIds(nextIds);
      setLimitWarning(null);
    } else {
      // Cố gắng chọn mục mới khi đã đủ 5 mục -> CHẶN & THÔNG BÁO
      if (currentSelectedIds.length >= MAX_PINNED_MOBILE_NAV) {
        const warningMsg = t(
          "v2.nav.maxShortcutsDesc",
          "Đã chọn đủ 5/5 mục lối tắt. Vui lòng bỏ chọn bớt một mục trước khi chọn mục mới.",
        );
        setLimitWarning(warningMsg);
        useV2ToastStore.getState().showToast({
          title: t("v2.nav.maxShortcutsTitle", "Đã đạt giới hạn lối tắt"),
          description: warningMsg,
          variant: "destructive",
        });
        return;
      }

      // Chưa đủ 5 mục -> Cho phép thêm
      const nextIds = [...currentSelectedIds, itemId];
      setPinnedIds(nextIds);
      setLimitWarning(null);
    }
  };

  const bottomActiveId = React.useMemo(() => {
    if (effectiveNavItems.some((item) => item.id === activeNavId)) {
      return activeNavId;
    }
    const parentSection = effectiveSections.find((sec) =>
      sec.items.some((item) => item.id === activeNavId),
    );
    if (parentSection) {
      const matched = effectiveNavItems.find(
        (item) =>
          parentSection.items.some((secItem) => secItem.id === item.id) ||
          item.label === parentSection.label,
      );
      if (matched) return matched.id;
    }
    return "catalog";
  }, [effectiveNavItems, activeNavId, effectiveSections]);

  const fallbackBreadcrumbs = React.useMemo(
    () => [{ label: t("v2.nav.items.dashboard", "Tổng quan") }],
    [t, locale],
  );

  const effectiveUserName =
    userName ?? t("v2.sidebar.userFallback", "Quản trị viên");

  return (
    <div
      data-testid="v2-app-layout-mobile"
      className="flex min-h-screen w-full flex-col bg-background text-foreground"
    >
      <V2Header
        breadcrumbs={breadcrumbs ?? fallbackBreadcrumbs}
        userName={effectiveUserName}
        userRole={userRole}
        tenantName={tenantName}
        branchName={branchName}
        logoUrl={logoUrl}
        onBranchClick={onBranchClick ?? onClickLogo}
        userMenuNode={userMenuNode}
        notificationNode={notificationNode}
      />
      <main
        tabIndex={-1}
        className={cn(
          "flex-1 overflow-y-auto px-2 py-2.5 pb-20 focus:outline-none sm:px-4 sm:py-4",
          contentClassName,
        )}
      >
        {children}
      </main>
      <V2BottomNav
        items={effectiveNavItems}
        activeId={bottomActiveId}
        onNavigate={handleMobileNavigate}
      />
      <V2Modal
        open={catalogOpen}
        onOpenChange={(open) => {
          setCatalogOpen(open);
          if (!open) {
            setIsCustomizing(false);
            setLimitWarning(null);
          }
        }}
        title={t("v2.nav.items.catalogTitle", "Danh mục phân hệ")}
        size="full"
      >
        <div className="space-y-4 pb-6">
          {/* Quick theme & language settings */}
          <div
            data-testid="mobile-appearance-settings"
            className="p-3 rounded-xl bg-card border border-border space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <V2Icon icon={Palette} size={14} className="text-primary" />
                <V2Text variant="caption" weight="semibold">
                  {t("nav.bottom.themeStyle", "Giao diện")}
                </V2Text>
              </div>
              <div className="flex items-center gap-1">
                <V2Button
                  size="xs"
                  variant={
                    currentTheme === "classic-light" ? "secondary" : "ghost"
                  }
                  className={cn(
                    "h-7 px-2 text-xs border",
                    currentTheme === "classic-light"
                      ? "border-primary bg-primary/10 text-primary font-medium"
                      : "border-border text-muted-fg",
                  )}
                  leftIcon={
                    <V2Icon icon={Sun} size={14} className="text-amber-500" />
                  }
                  onClick={() => onThemeChange?.("classic-light")}
                  title={t("nav.bottom.themeClassicLight", "Giao diện sáng")}
                >
                  <V2Text variant="caption">
                    {t("v2.theme.light", "Sáng")}
                  </V2Text>
                </V2Button>

                <V2Button
                  size="xs"
                  variant={
                    currentTheme === "classic-dark" ? "secondary" : "ghost"
                  }
                  className={cn(
                    "h-7 px-2 text-xs border",
                    currentTheme === "classic-dark"
                      ? "border-primary bg-primary/10 text-primary font-medium"
                      : "border-border text-muted-fg",
                  )}
                  leftIcon={
                    <V2Icon icon={Moon} size={14} className="text-blue-400" />
                  }
                  onClick={() => onThemeChange?.("classic-dark")}
                  title={t("nav.bottom.themeClassicDark", "Giao diện tối")}
                >
                  <V2Text variant="caption">{t("v2.theme.dark", "Tối")}</V2Text>
                </V2Button>

                <V2Button
                  size="xs"
                  variant={currentTheme === "midnight" ? "secondary" : "ghost"}
                  className={cn(
                    "h-7 px-2 text-xs border",
                    currentTheme === "midnight"
                      ? "border-primary bg-primary/10 text-primary font-medium"
                      : "border-border text-muted-fg",
                  )}
                  leftIcon={
                    <V2Icon
                      icon={Sparkles}
                      size={14}
                      className="text-indigo-400"
                    />
                  }
                  onClick={() => onThemeChange?.("midnight")}
                  title={t("nav.bottom.themeMidnight", "Midnight")}
                >
                  <V2Text variant="caption">Midnight</V2Text>
                </V2Button>
              </div>
            </div>

            <div className="border-t border-border/50 pt-2.5 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <V2Icon icon={Globe} size={14} className="text-primary" />
                <V2Text variant="caption" weight="semibold">
                  {t("nav.bottom.languageLabel", "Ngôn ngữ")}
                </V2Text>
              </div>
              <V2LanguageSwitcher size="default" />
            </div>
          </div>

          {/* Quick actions customization header */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-card border border-border">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <V2Icon icon={Sliders} size={14} className="text-primary" />
                <V2Text variant="caption" weight="semibold">
                  {t("v2.nav.customize", "Tùy chỉnh lối tắt")}{" "}
                  <V2Text
                    asChild
                    variant="caption"
                    color="muted"
                    weight="normal"
                  >
                    <span>
                      ({currentSelectedIds.length}/{MAX_PINNED_MOBILE_NAV})
                    </span>
                  </V2Text>
                </V2Text>
              </div>
              <V2Text
                variant="caption"
                color="muted"
                className="text-[11px] mt-0.5"
              >
                {isCustomizing
                  ? "Chọn tối đa 5 mục thao tác nhanh ngoài Bottom Nav"
                  : `Đang ghim ${currentSelectedIds.length} mục lối tắt ở Bottom Nav`}
              </V2Text>
            </div>
            <div className="flex items-center gap-1.5">
              {isCustomizing ? (
                <>
                  <V2Button
                    size="sm"
                    variant="ghost"
                    className="h-8 px-2 text-xs text-muted-fg"
                    onClick={() => {
                      resetToDefault();
                      setLimitWarning(null);
                    }}
                    title="Khôi phục mặc định"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </V2Button>
                  <V2Button
                    size="sm"
                    variant="default"
                    className="h-8 px-3 text-xs gap-1"
                    onClick={() => {
                      setIsCustomizing(false);
                      setLimitWarning(null);
                    }}
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>{t("v2.common.done", "Xong")}</span>
                  </V2Button>
                </>
              ) : (
                <V2Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs gap-1"
                  onClick={() => {
                    if (pinnedIds.length === 0) {
                      setPinnedIds(default5Items.map((it) => it.id));
                    }
                    setIsCustomizing(true);
                  }}
                >
                  <Sliders className="h-3.5 w-3.5" />
                  <span>Sửa</span>
                </V2Button>
              )}
            </div>
          </div>

          {/* Warning banner khi người dùng cố chọn vượt quá 5 mục */}
          {limitWarning && (
            <div
              data-testid="limit-warning-banner"
              className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs font-medium flex items-center gap-2 animate-in fade-in"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{limitWarning}</span>
            </div>
          )}

          {effectiveSections.map((section) => (
            <section key={section.id} className="space-y-2.5">
              <V2Text
                variant="section-title"
                color="muted"
                className="text-xs font-semibold tracking-wider uppercase"
              >
                {section.label}
              </V2Text>
              <div className="grid grid-cols-2 gap-2">
                {section.items.map((item) => {
                  const isSelected = currentSelectedIds.includes(item.id);
                  return (
                    <V2Button
                      key={item.id}
                      variant={
                        isCustomizing
                          ? isSelected
                            ? "secondary"
                            : "outline"
                          : activeNavId === item.id
                            ? "secondary"
                            : "outline"
                      }
                      className={cn(
                        "h-auto justify-between gap-2 py-2.5 px-3 text-left transition-all",
                        isCustomizing &&
                          isSelected &&
                          "border-primary bg-primary/10 text-primary font-medium",
                        !isCustomizing &&
                          activeNavId === item.id &&
                          "border-primary/50 text-primary font-medium",
                      )}
                      onClick={() => {
                        if (isCustomizing) {
                          handleToggleItem(item.id);
                        } else {
                          setCatalogOpen(false);
                          onNavigate?.(item);
                        }
                      }}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <item.icon className="h-4 w-4 shrink-0 text-muted-fg" />
                        <span className="truncate text-xs">{item.label}</span>
                      </div>
                      {isCustomizing && isSelected && (
                        <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                      )}
                    </V2Button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </V2Modal>
    </div>
  );
};

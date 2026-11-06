import * as React from "react";
import { ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/v2/shared/utils/cn";
import { V2Text } from "@/v2/shared/components/atoms";
import { Badge } from "@/v2/shared/ui";
import { V2UserBadge } from "@/v2/shared/components/molecules/v2-user-badge";
import { V2LanguageSwitcher } from "@/v2/shared/components/molecules/v2-language-switcher";
import { V2ImpersonationBanner } from "@/v2/shared/components/molecules/v2-impersonation-banner";
import { V2HeaderProps } from "./V2Header.type";

export const V2Header: React.FC<V2HeaderProps> = ({
  title,
  breadcrumbs = [],
  userName = "Admin",
  userRole,
  tenantName,
  branchName,
  logoUrl,
  onBranchClick,
  showLanguageSwitcher = false,
  userMenuNode,
  notificationNode,
  className,
  ...props
}) => {
  const resolvedUserMenuNode =
    typeof userMenuNode === "function"
      ? userMenuNode({ collapsed: false })
      : userMenuNode;

  return (
    <header
      data-testid="v2-header"
      className={cn(
        "flex h-14 w-full shrink-0 items-center justify-between border-b border-border bg-card/60 px-3 sm:px-4 backdrop-blur-md select-none gap-2",
        className,
      )}
      {...props}
    >
      {/* ── Left on mobile (order-1): Avatar only. On desktop (order-3): Right ── */}
      <div className="order-1 sm:order-3 flex items-center shrink-0">
        {resolvedUserMenuNode ? (
          resolvedUserMenuNode
        ) : (
          <V2UserBadge
            name={userName}
            role={userRole}
            tenantName={tenantName || branchName}
            avatarUrl={logoUrl}
            onClick={onBranchClick}
            className={cn(
              "shrink-0 min-w-0 max-w-full",
              onBranchClick && "cursor-pointer active:scale-95 transition-all",
            )}
          />
        )}
      </div>

      {/* ── Breadcrumbs or Title: Hidden on mobile, order-1 on desktop (left) ── */}
      <div className="hidden sm:flex sm:order-1 items-center gap-2 min-w-0 flex-1 overflow-hidden">
        {breadcrumbs.length > 0 ? (
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-xs min-w-0 overflow-hidden"
          >
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={crumb.label}>
                {idx > 0 && (
                  <ChevronRight size={14} className="text-muted-fg shrink-0" />
                )}
                {crumb.href ? (
                  <V2Text
                    asChild
                    variant="body-sm"
                    className="text-muted-fg hover:text-foreground truncate transition-colors"
                  >
                    <a href={crumb.href}>{crumb.label}</a>
                  </V2Text>
                ) : (
                  <V2Text
                    variant="body-sm"
                    weight="semibold"
                    className="text-foreground truncate"
                  >
                    {crumb.label}
                  </V2Text>
                )}
              </React.Fragment>
            ))}
          </nav>
        ) : title ? (
          <V2Text
            as="h1"
            variant="h4"
            className="tracking-tight text-foreground truncate"
          >
            {title}
          </V2Text>
        ) : (
          <Badge
            variant="outline"
            className="gap-1 text-[11px] font-medium text-primary shrink-0"
          >
            <Sparkles size={12} />
            <V2Text
              as="span"
              variant="caption"
              className="text-inherit font-inherit"
            >
              ERP V2 Beta
            </V2Text>
          </Badge>
        )}
      </div>

      {/* ── Right Actions: Notification bell, Impersonation banner, Language Switcher (order-2) ── */}
      <div className="order-2 sm:order-2 flex items-center gap-1.5 shrink-0 justify-end">
        <V2ImpersonationBanner compact />
        {notificationNode}
        {showLanguageSwitcher && (
          <div className="hidden sm:block">
            <V2LanguageSwitcher />
          </div>
        )}
      </div>
    </header>
  );
};

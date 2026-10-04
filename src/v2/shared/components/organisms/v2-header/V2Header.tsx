import * as React from "react";
import { ArrowLeft, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/v2/shared/utils/cn";
import { Button } from "@/v2/shared/ui/button";
import { Badge } from "@/v2/shared/ui/badge";
import { V2UserBadge } from "@/v2/shared/components/molecules/v2-user-badge";
import { V2HeaderProps } from "./V2Header.type";

export const V2Header: React.FC<V2HeaderProps> = ({
  title,
  breadcrumbs = [],
  userName = "Admin",
  userRole,
  tenantName,
  onReturnToV1,
  className,
}) => {
  const handleReturnV1 = () => {
    if (onReturnToV1) {
      onReturnToV1();
    } else if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  };

  return (
    <header
      data-testid="v2-header"
      className={cn(
        "flex h-14 w-full shrink-0 items-center justify-between border-b border-border bg-card/60 px-4 backdrop-blur-md select-none",
        className,
      )}
    >
      {/* Left: Breadcrumbs or Title */}
      <div className="flex items-center gap-2 overflow-hidden">
        {breadcrumbs.length > 0 ? (
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-xs"
          >
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={crumb.label}>
                {idx > 0 && (
                  <ChevronRight
                    size={14}
                    className="text-muted-foreground shrink-0"
                  />
                )}
                {crumb.href ? (
                  <a
                    href={crumb.href}
                    className="text-muted-foreground hover:text-foreground truncate transition-colors"
                  >
                    {crumb.label}
                  </a>
                ) : (
                  <span className="font-semibold text-foreground truncate">
                    {crumb.label}
                  </span>
                )}
              </React.Fragment>
            ))}
          </nav>
        ) : title ? (
          <h1 className="text-sm font-semibold tracking-tight text-foreground truncate">
            {title}
          </h1>
        ) : (
          <Badge
            variant="outline"
            className="gap-1 text-[11px] font-medium text-primary"
          >
            <Sparkles size={12} />
            <span>ERP V2 Beta</span>
          </Badge>
        )}
      </div>

      {/* Right Actions: Return to V1 button & User info */}
      <div className="flex items-center gap-2.5">
        <Button
          variant="outline"
          size="sm"
          onClick={handleReturnV1}
          className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          title="Quay lại giao diện ERP V1"
        >
          <ArrowLeft size={14} />
          <span className="hidden sm:inline">Quay lại ERP V1</span>
        </Button>

        <div className="h-4 w-px bg-border hidden sm:block" />

        <V2UserBadge name={userName} role={userRole} tenantName={tenantName} />
      </div>
    </header>
  );
};

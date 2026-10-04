import * as React from "react";
import { cn } from "@/v2/shared/utils/cn";
import { V2Text } from "@/v2/shared/components/atoms";
import { Badge } from "@/v2/shared/ui";
import { V2UserBadgeProps } from "./V2UserBadge.type";

function getInitials(name: string): string {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const V2UserBadge: React.FC<V2UserBadgeProps> = ({
  name,
  role,
  tenantName,
  avatarUrl,
  isCompact = false,
  className,
  onClick,
  ...props
}) => {
  const initials = getInitials(name);

  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      title={isCompact ? `${name}${role ? ` (${role})` : ""}` : undefined}
      className={cn(
        "flex items-center gap-2.5 rounded-lg select-none",
        onClick && "cursor-pointer hover:bg-accent/50 p-1.5 transition-colors",
        className,
      )}
      {...props}
    >
      <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary font-semibold text-xs border border-border/50">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={name}
            className="h-full w-full object-cover"
          />
        ) : (
          <V2Text
            as="span"
            variant="caption"
            weight="semibold"
            className="text-primary"
          >
            {initials}
          </V2Text>
        )}
      </div>

      {!isCompact && (
        <div className="flex flex-col min-w-0 leading-none">
          <div className="flex items-center gap-1.5">
            <V2Text variant="body-sm" weight="semibold" truncate>
              {name}
            </V2Text>
            {role && (
              <Badge
                variant="outline"
                className="h-4 px-1 text-[9px] font-normal text-muted-fg"
              >
                {role}
              </Badge>
            )}
          </div>
          {tenantName && (
            <V2Text variant="caption" truncate className="mt-0.5 text-muted-fg">
              {tenantName}
            </V2Text>
          )}
        </div>
      )}
    </div>
  );
};

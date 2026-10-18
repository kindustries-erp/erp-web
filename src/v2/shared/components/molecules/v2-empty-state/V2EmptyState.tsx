import * as React from "react";
import { Inbox } from "lucide-react";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { cn } from "@/v2/shared/utils/cn";
import type { V2EmptyStateProps } from "./V2EmptyState.type";

export const V2EmptyState: React.FC<V2EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
}) => {
  const { t } = useV2Translation();
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 px-4 py-10 text-center",
        className,
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
        {icon ?? <Inbox aria-hidden className="h-5 w-5" />}
      </div>
      <V2Text as="p" variant="body-sm" weight="bold">
        {title ?? t("v2.form.emptyTitle", "Chưa có dữ liệu")}
      </V2Text>
      {description && (
        <V2Text as="p" variant="body-sm" color="muted" className="max-w-sm">
          {description}
        </V2Text>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
};
V2EmptyState.displayName = "V2EmptyState";

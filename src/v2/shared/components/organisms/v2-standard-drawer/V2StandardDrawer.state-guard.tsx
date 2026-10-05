import React from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";

interface DrawerStateGuardProps {
  loading?: boolean;
  error?: string | null;
  children: React.ReactNode;
}

export const DrawerStateGuard: React.FC<DrawerStateGuardProps> = ({
  loading,
  error,
  children,
}) => {
  const { t } = useV2Translation();

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-16 gap-3">
        <Loader2 className="w-7 h-7 text-primary animate-spin" />
        <V2Text variant="body-sm" className="text-muted-foreground">
          {t("v2.common.loading", "Đang tải dữ liệu...")}
        </V2Text>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive flex items-center gap-2.5">
        <AlertCircle className="w-5 h-5 shrink-0" />
        <V2Text variant="body-sm" className="text-destructive font-medium">
          {error}
        </V2Text>
      </div>
    );
  }

  return <>{children}</>;
};

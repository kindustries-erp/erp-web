import React from "react";
import { V2Spinner } from "@/v2/shared/components/atoms/v2-spinner";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
import { V2AlertBanner } from "@/v2/shared/components/molecules/v2-alert-banner";
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
        <V2Spinner
          size="md"
          aria-label={t("v2.common.loading", "Đang tải dữ liệu...")}
        />
        <V2Text variant="body-sm" className="text-muted-fg">
          {t("v2.common.loading", "Đang tải dữ liệu...")}
        </V2Text>
      </div>
    );
  }

  if (error) {
    return <V2AlertBanner>{error}</V2AlertBanner>;
  }

  return <>{children}</>;
};

import * as React from "react";
import { KeyRound, V2Button } from "@/v2/shared/components/atoms";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";

export interface InvoiceSyncCredentialRowProps {
  noCredential: boolean;
  canEditInvoice: boolean;
  onOpenLogin: () => void;
}

/**
 * Trạng thái tài khoản Cổng Thuế. Chưa cấu hình thì hiện cảnh báo kèm nút đăng nhập
 * (đồng bộ bị chặn); đã cấu hình thì chỉ hiện nút đổi tài khoản.
 */
export const InvoiceSyncCredentialRow: React.FC<
  InvoiceSyncCredentialRowProps
> = ({ noCredential, canEditInvoice, onOpenLogin }) => {
  const { t } = useV2Translation();

  if (noCredential) {
    return (
      <div
        role="alert"
        className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
      >
        <span>
          {t(
            "v2.financeInvoiceSync.credential.notConfigured",
            "Chưa cấu hình tài khoản Cổng thuế",
          )}
        </span>
        {canEditInvoice && (
          <V2Button
            variant="outline"
            size="sm"
            onClick={onOpenLogin}
            leftIcon={<KeyRound className="h-4 w-4" />}
          >
            {t("v2.financeInvoiceSync.credential.login", "Đăng nhập Cổng Thuế")}
          </V2Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
      <span>
        {t(
          "v2.financeInvoiceSync.credential.configured",
          "Đã cấu hình tài khoản Cổng thuế",
        )}
      </span>
      {canEditInvoice && (
        <V2Button variant="ghost" size="sm" onClick={onOpenLogin}>
          {t("v2.financeInvoiceSync.credential.changeAccount", "Đổi tài khoản")}
        </V2Button>
      )}
    </div>
  );
};

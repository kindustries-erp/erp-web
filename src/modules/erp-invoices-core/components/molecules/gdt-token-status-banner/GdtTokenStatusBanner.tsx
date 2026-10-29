import { AlertCircle, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

export interface GdtTokenStatusBannerProps {
  hasToken: boolean;
}

/** Trạng thái token Cổng Thuế hiện tại (có/chưa có) kèm tên miền cổng */
export function GdtTokenStatusBanner({ hasToken }: GdtTokenStatusBannerProps) {
  const { t } = useTranslation("erpInvoices");

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-surface-hover/50 text-xs">
      <div className="flex items-center gap-2">
        {hasToken ? (
          <>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-emerald-700 font-medium">
              {t("gdtTokenConnected", "Đã có Token kết nối Cổng Thuế")}
            </span>
          </>
        ) : (
          <>
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span className="text-amber-700 font-medium">
              {t("gdtTokenMissing", "Chưa có Token đăng nhập Cổng Thuế")}
            </span>
          </>
        )}
      </div>
      <div className="text-muted-foreground text-[11px]">
        hoadondientu.gdt.gov.vn
      </div>
    </div>
  );
}

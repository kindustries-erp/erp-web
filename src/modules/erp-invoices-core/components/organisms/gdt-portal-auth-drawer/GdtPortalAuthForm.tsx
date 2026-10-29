import React from "react";
import { RefreshCw, LogIn, Building } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/components/ui/Button";
import { GdtTokenStatusBanner } from "@/modules/erp-invoices-core/components/molecules/gdt-token-status-banner";
import { GdtCaptchaField } from "@/modules/erp-invoices-core/components/molecules/gdt-captcha-field";
import { GdtPasswordField } from "@/modules/erp-invoices-core/components/molecules/gdt-password-field";
import { useGdtPortalAuthForm } from "./GdtPortalAuthForm.hook";
import type { GdtPortalAuthFormProps } from "./GdtPortalAuthDrawer.type";
export type { GdtPortalAuthFormProps };

/** Form đăng nhập Cổng Thuế: tài khoản, mật khẩu, captcha; logic nằm trong hook */
export const GdtPortalAuthForm: React.FC<GdtPortalAuthFormProps> = ({
  onSuccess,
  onCancel,
  showCancelButton = false,
}) => {
  const { t } = useTranslation("erpInvoices");
  const form = useGdtPortalAuthForm({ onSuccess });
  const busy = form.isLoggingIn || form.configLoading;

  return (
    <div className="flex flex-col space-y-4">
      <GdtTokenStatusBanner hasToken={form.hasToken} />

      <form
        onSubmit={form.submit}
        className="space-y-4 rounded-xl border border-border bg-surface p-4 card-shadow"
      >
        <div className="text-sm font-semibold text-foreground flex items-center gap-2 border-b border-border pb-2">
          <LogIn className="w-4 h-4 text-primary" />
          <span>{t("gdtLoginTitle", "Đăng nhập Cổng Hóa đơn điện tử")}</span>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-muted-foreground" />
            {t("gdtUsernameLabel", "Mã số thuế / Tài khoản (*)")}
          </label>
          <input
            type="text"
            className="w-full h-9 rounded-md border border-border bg-surface px-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            placeholder={t(
              "gdtUsernamePlaceholder",
              "Ví dụ: 0318334886 hoặc 0318334886-003",
            )}
            value={form.username}
            onChange={(e) => form.setUsername(e.target.value)}
            disabled={busy}
            required
          />
        </div>

        <GdtPasswordField
          value={form.password}
          onChange={form.setPassword}
          showPassword={form.showPassword}
          onToggleShow={form.toggleShowPassword}
          hasSavedPassword={form.hasSavedPassword}
          disabled={busy}
        />

        <GdtCaptchaField
          img={form.captchaImg}
          isLoading={form.captchaLoading}
          value={form.captchaValue}
          onValueChange={form.setCaptchaValue}
          onReload={form.refreshCaptcha}
          disabled={form.captchaLoading || form.isLoggingIn}
        />

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border mt-4">
          {showCancelButton && onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={form.isLoggingIn}
            >
              {t("gdtCancel", "Hủy")}
            </Button>
          )}
          <Button
            type="submit"
            disabled={busy || form.captchaLoading}
            className="gap-2 min-w-[140px]"
          >
            {form.isLoggingIn ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{t("gdtLoggingIn", "Đang đăng nhập...")}</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>{t("gdtLoginSave", "Đăng nhập & Lưu")}</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

import { RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/components/ui/Button";

export interface GdtCaptchaFieldProps {
  img: string | null;
  isLoading: boolean;
  value: string;
  onValueChange: (value: string) => void;
  onReload: () => void;
  disabled: boolean;
}

/** Ảnh captcha, nút đổi mã và ô nhập mã. Chữ được viết hoa khi nhập. */
export function GdtCaptchaField({
  img,
  isLoading,
  value,
  onValueChange,
  onReload,
  disabled,
}: GdtCaptchaFieldProps) {
  const { t } = useTranslation("erpInvoices");

  return (
    <div className="space-y-1.5 pt-1">
      <label className="text-xs font-medium text-foreground">
        {t("gdtCaptchaLabel", "Mã kiểm tra (Captcha) (*)")}
      </label>
      <div className="flex items-center gap-3">
        <div className="relative h-10 w-36 rounded-md border border-border bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center overflow-hidden shrink-0 select-none">
          {isLoading ? (
            <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />
          ) : img ? (
            <img
              src={img}
              alt="Captcha"
              className="h-full w-full object-contain"
            />
          ) : (
            <span className="text-xs text-muted-foreground">
              {t("gdtCaptchaEmpty", "Trống")}
            </span>
          )}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onReload}
          disabled={disabled}
          className="h-10 px-2.5 gap-1 shrink-0 text-xs"
          title={t("gdtCaptchaReloadTitle", "Tải lại mã khác")}
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`}
          />
          <span className="hidden sm:inline">
            {t("gdtCaptchaChangeCode", "Đổi mã")}
          </span>
        </Button>

        <input
          type="text"
          className="flex-1 h-10 rounded-md border border-border bg-surface px-3 text-sm font-mono uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary/30 transition-all font-semibold"
          placeholder={t("gdtCaptchaPlaceholder", "Nhập mã...")}
          maxLength={10}
          value={value}
          onChange={(e) => onValueChange(e.target.value.toUpperCase())}
          disabled={disabled}
          required
        />
      </div>
    </div>
  );
}

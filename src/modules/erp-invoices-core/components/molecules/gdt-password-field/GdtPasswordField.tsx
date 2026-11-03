import { CheckCircle2, Eye, EyeOff, KeyRound } from "lucide-react";
import { useTranslation } from "react-i18next";

export interface GdtPasswordFieldProps {
  value: string;
  onChange: (value: string) => void;
  showPassword: boolean;
  onToggleShow: () => void;
  hasSavedPassword: boolean;
  disabled: boolean;
}

/** Ô mật khẩu Cổng Thuế có nút hiện/ẩn và nhãn "Đã lưu mật khẩu" */
export function GdtPasswordField({
  value,
  onChange,
  showPassword,
  onToggleShow,
  hasSavedPassword,
  disabled,
}: GdtPasswordFieldProps) {
  const { t } = useTranslation("erpInvoices");

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
          <KeyRound className="w-3.5 h-3.5 text-muted-foreground" />
          {t("gdtPasswordLabel", "Mật khẩu (*)")}
        </label>
        {hasSavedPassword && (
          <span className="text-[11px] text-emerald-600 font-normal flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            {t("gdtPasswordSaved", "Đã lưu mật khẩu")}
          </span>
        )}
      </div>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          className="w-full h-9 rounded-md border border-border bg-surface px-3 pr-10 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          placeholder={t(
            "gdtPasswordPlaceholder",
            "Nhập mật khẩu Cổng thuế...",
          )}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          required
        />
        <button
          type="button"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
          onClick={onToggleShow}
          tabIndex={-1}
        >
          {showPassword ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}

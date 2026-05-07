import { useState } from "react";
import { useAppStore } from "@/core/config/appStore";
import { useAuthStore } from "@/modules/auth/domain/authStore";
import { useT } from "@/core/i18n";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function Login() {
  const { isDark, toggleTheme, locale, toggleLocale } = useAppStore();
  const { loginAction, loading } = useAuthStore();
  const t = useT();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});

  function validate() {
    const errs: typeof errors = {};
    if (!email.trim()) errs.email = t("login.errorEmailRequired");
    else if (!EMAIL_RE.test(email.trim()))
      errs.email = t("login.errorEmailFormat");
    if (!password) errs.password = t("login.errorPasswordRequired");
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    try {
      await loginAction(email.trim(), password);
    } catch {
      setErrors({ general: t("login.errorInvalid") });
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background px-4">
      {/* Theme + lang toggles top-right */}
      <div className="fixed top-4 right-4 flex items-center gap-1">
        {/* Language toggle */}
        <button
          onClick={toggleLocale}
          title={
            locale === "vi" ? "Switch to English" : "Chuyển sang Tiếng Việt"
          }
          className="h-8 px-2 border border-border rounded-lg flex items-center justify-center cursor-pointer flex-shrink-0 bg-surface hover:bg-surface-hover gap-1"
        >
          <svg
            className="w-[14px] h-[14px] text-[color:var(--muted-fg)] flex-shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          <span className="text-[11px] font-semibold text-[color:var(--muted-fg)]">
            {locale === "vi" ? "VI" : "EN"}
          </span>
        </button>
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={isDark ? "Chế độ tối" : "Chế độ sáng"}
          className="w-8 h-8 border border-border rounded-lg flex items-center justify-center cursor-pointer flex-shrink-0 bg-surface hover:bg-surface-hover"
        >
          {isDark ? (
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-[color:var(--muted-fg)]"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          ) : (
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-[color:var(--muted-fg)]"
            >
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          )}
        </button>
      </div>

      <div className="w-full max-w-[400px] bg-surface border border-border rounded-2xl shadow-lg px-8 py-10">
        {/* Logo + title */}
        <div className="flex flex-col items-center mb-8 gap-3">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 fill-primary-fg" viewBox="0 0 24 24">
              <path d="M3 3h8v8H3zm10 0h8v8h-8zM3 13h8v8H3zm10 0h8v8h-8z" />
            </svg>
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-foreground">
              {t("login.title")}
            </h1>
            <p className="text-sm text-[color:var(--muted-fg)] mt-1">
              {t("login.subtitle")}
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-4"
        >
          {/* General error */}
          {errors.general && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-lg px-4 py-3">
              {errors.general}
            </div>
          )}

          {/* Email */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-foreground">
              {t("login.email")}
            </label>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((v) => ({
                  ...v,
                  email: undefined,
                  general: undefined,
                }));
              }}
              placeholder={t("login.emailPlaceholder")}
              className={`form-input ${errors.email ? "border-red-400 dark:border-red-600 focus:ring-red-400" : ""}`}
            />
            {errors.email && (
              <span className="text-xs text-red-500">{errors.email}</span>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-foreground">
              {t("login.password")}
            </label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors((v) => ({
                    ...v,
                    password: undefined,
                    general: undefined,
                  }));
                }}
                placeholder={t("login.passwordPlaceholder")}
                className={`form-input pr-10 w-full ${errors.password ? "border-red-400 dark:border-red-600 focus:ring-red-400" : ""}`}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--muted-fg)] hover:text-foreground"
              >
                {showPass ? (
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <span className="text-xs text-red-500">{errors.password}</span>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full bg-primary text-primary-fg font-semibold text-sm py-[10px] rounded-lg hover:opacity-90 active:opacity-80 transition-opacity disabled:opacity-60"
          >
            {loading ? t("login.loading") : t("login.submit")}
          </button>
        </form>
      </div>
    </div>
  );
}

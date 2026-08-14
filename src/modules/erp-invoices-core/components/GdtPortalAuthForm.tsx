import React, { useState, useEffect, useCallback } from "react";
import {
  KeyRound,
  RefreshCw,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  LogIn,
  Save,
  ShieldCheck,
  Building,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "@/shared/components/ui/Button";
import { erpInvoicesCoreApi } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import { solveGdtSvgCaptcha } from "@/modules/erp-invoices-core/utils/gdtCaptchaSolver";

export interface GdtPortalAuthFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  showCancelButton?: boolean;
}

export const GdtPortalAuthForm: React.FC<GdtPortalAuthFormProps> = ({
  onSuccess,
  onCancel,
  showCancelButton = false,
}) => {
  // Credentials
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Captcha
  const [captchaImg, setCaptchaImg] = useState<string | null>(null);
  const [captchaKey, setCaptchaKey] = useState<string>("");
  const [captchaValue, setCaptchaValue] = useState("");
  const [isLoadingCaptcha, setIsLoadingCaptcha] = useState(false);

  // Auth State
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [currentToken, setCurrentToken] = useState("");
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);

  // Advanced Manual Mode
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [manualToken, setManualToken] = useState("");
  const [manualCookies, setManualCookies] = useState("");
  const [showManualToken, setShowManualToken] = useState(false);
  const [isSavingManual, setIsSavingManual] = useState(false);

  // Fetch Captcha
  const fetchCaptcha = useCallback(async () => {
    setIsLoadingCaptcha(true);
    setCaptchaValue("");
    try {
      const res = await erpInvoicesCoreApi.getPortalCaptcha();
      if (res?.key) {
        setCaptchaKey(res.key);
        const rawContent = res.content || "";
        let formattedImg = rawContent;
        if (rawContent.startsWith("<svg") || rawContent.includes("<svg")) {
          formattedImg = `data:image/svg+xml;utf8,${encodeURIComponent(rawContent)}`;
        } else if (!rawContent.startsWith("data:")) {
          formattedImg = `data:image/png;base64,${rawContent}`;
        }
        setCaptchaImg(formattedImg);

        // Auto-solve and auto-populate captcha text
        let autoText = res.text;
        if (!autoText && rawContent) {
          autoText = solveGdtSvgCaptcha(rawContent);
        }
        if (autoText) {
          setCaptchaValue(autoText);
        }
      }
    } catch {
      toast.error("Không thể tải mã Captcha từ Cổng thuế");
    } finally {
      setIsLoadingCaptcha(false);
    }
  }, []);

  // Load existing config
  const loadConfig = useCallback(async () => {
    setIsLoadingConfig(true);
    try {
      const config = await erpInvoicesCoreApi.getPortalConfig();
      if (config) {
        if (config.username) setUsername(config.username);
        if (config.password) setPassword(config.password);
        if (config.token) {
          setCurrentToken(config.token);
          setManualToken(config.token);
        }
        if (config.cookies) {
          setManualCookies(config.cookies);
        }
      }
    } catch {
      toast.error("Không thể tải thông tin cấu hình");
    } finally {
      setIsLoadingConfig(false);
    }
  }, []);

  useEffect(() => {
    loadConfig();
    fetchCaptcha();
  }, [loadConfig, fetchCaptcha]);

  // Handle Login
  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!username.trim()) {
      toast.error("Vui lòng nhập Mã số thuế / Tên đăng nhập");
      return;
    }
    if (!password) {
      toast.error("Vui lòng nhập mật khẩu Cổng thuế");
      return;
    }
    if (!captchaValue.trim()) {
      toast.error("Vui lòng nhập mã Captcha");
      return;
    }
    if (!captchaKey) {
      toast.error("Chưa có mã Captcha hợp lệ, vui lòng tải lại");
      fetchCaptcha();
      return;
    }

    setIsLoggingIn(true);
    try {
      const res = await erpInvoicesCoreApi.loginPortal({
        username: username.trim(),
        password,
        cvalue: captchaValue.trim().toUpperCase(),
        ckey: captchaKey,
      });

      if (res.success) {
        toast.success(res.message || "Đăng nhập Cổng Thuế thành công!");
        if (res.token) {
          setCurrentToken(res.token);
          setManualToken(res.token);
        }
        onSuccess?.();
      }
    } catch (err: any) {
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Đăng nhập thất bại. Vui lòng kiểm tra lại mật khẩu hoặc mã Captcha.";
      toast.error(errMsg);
      // Auto refresh captcha on failure
      fetchCaptcha();
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Manual Save
  const handleSaveManual = async () => {
    if (!manualToken.trim()) {
      toast.error("Vui lòng nhập Bearer Token");
      return;
    }

    setIsSavingManual(true);
    try {
      await erpInvoicesCoreApi.savePortalConfig(
        manualToken.trim(),
        manualCookies.trim() || undefined,
        username.trim() || undefined,
        password || undefined,
      );
      setCurrentToken(manualToken.trim());
      toast.success("Lưu cấu hình thủ công thành công!");
      onSuccess?.();
    } catch {
      toast.error("Lưu cấu hình thất bại");
    } finally {
      setIsSavingManual(false);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Status banner */}
      <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-surface-hover/50 text-xs">
        <div className="flex items-center gap-2">
          {currentToken ? (
            <>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="text-emerald-700 font-medium">
                Đã có Token kết nối Cổng Thuế
              </span>
            </>
          ) : (
            <>
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span className="text-amber-700 font-medium">
                Chưa có Token đăng nhập Cổng Thuế
              </span>
            </>
          )}
        </div>
        <div className="text-muted-foreground text-[11px]">
          hoadondientu.gdt.gov.vn
        </div>
      </div>

      {/* Main Login Form */}
      <form
        onSubmit={handleLogin}
        className="space-y-4 rounded-xl border border-border bg-surface p-4 card-shadow"
      >
        <div className="text-sm font-semibold text-foreground flex items-center gap-2 border-b border-border pb-2">
          <LogIn className="w-4 h-4 text-primary" />
          <span>Đăng nhập Cổng Hóa đơn điện tử</span>
        </div>

        {/* Username */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-muted-foreground" />
            Mã số thuế / Tài khoản (*)
          </label>
          <input
            type="text"
            className="w-full h-9 rounded-md border border-border bg-surface px-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            placeholder="Ví dụ: 0318334886 hoặc 0318334886-003"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoadingConfig || isLoggingIn}
            required
          />
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-muted-foreground" />
            Mật khẩu (*)
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full h-9 rounded-md border border-border bg-surface px-3 pr-10 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              placeholder="Nhập mật khẩu Cổng thuế..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoadingConfig || isLoggingIn}
              required
            />
            <button
              type="button"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setShowPassword(!showPassword)}
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

        {/* Captcha Block */}
        <div className="space-y-1.5 pt-1">
          <label className="text-xs font-medium text-foreground">
            Mã kiểm tra (Captcha) (*)
          </label>
          <div className="flex items-center gap-3">
            {/* Captcha Image Container */}
            <div className="relative h-10 w-36 rounded-md border border-border bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center overflow-hidden shrink-0 select-none">
              {isLoadingCaptcha ? (
                <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />
              ) : captchaImg ? (
                <img
                  src={captchaImg}
                  alt="Captcha"
                  className="h-full w-full object-contain"
                />
              ) : (
                <span className="text-xs text-muted-foreground">Trống</span>
              )}
            </div>

            {/* Reload Captcha Button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={fetchCaptcha}
              disabled={isLoadingCaptcha || isLoggingIn}
              className="h-10 px-2.5 gap-1 shrink-0 text-xs"
              title="Tải lại mã khác"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isLoadingCaptcha ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">Đổi mã</span>
            </Button>

            {/* Captcha Input */}
            <input
              type="text"
              className="flex-1 h-10 rounded-md border border-border bg-surface px-3 text-sm font-mono uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary/30 transition-all font-semibold"
              placeholder="Nhập mã..."
              maxLength={10}
              value={captchaValue}
              onChange={(e) => setCaptchaValue(e.target.value.toUpperCase())}
              disabled={isLoadingCaptcha || isLoggingIn}
              required
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border mt-4">
          {showCancelButton && onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoggingIn}
            >
              Hủy
            </Button>
          )}
          <Button
            type="submit"
            disabled={isLoggingIn || isLoadingCaptcha || isLoadingConfig}
            className="gap-2 min-w-[140px]"
          >
            {isLoggingIn ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Đang đăng nhập...</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Đăng nhập & Lưu</span>
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Advanced Collapsible Manual Token Input */}
      <div className="rounded-xl border border-border bg-surface p-3 card-shadow">
        <button
          type="button"
          className="w-full flex items-center justify-between text-xs font-medium text-muted-foreground hover:text-foreground transition-colors py-1"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <span className="flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5" />
            Cấu hình nâng cao (Dán Token & Cookies thủ công)
          </span>
          {showAdvanced ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {showAdvanced && (
          <div className="space-y-4 pt-3 border-t border-border mt-2">
            <p className="text-xs text-muted-foreground">
              Dành cho quản trị viên muốn dán trực tiếp Bearer token và WAF
              Cookies (TS011...) từ trình duyệt.
            </p>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Bearer Token
              </label>
              <div className="relative">
                {showManualToken ? (
                  <textarea
                    className="w-full h-24 rounded-md border border-border bg-surface px-3 py-2 text-xs font-mono outline-none focus:ring-2 focus:ring-primary/30 resize-none pr-10"
                    placeholder="eyJhbGciOiJ..."
                    value={manualToken}
                    onChange={(e) => setManualToken(e.target.value)}
                  />
                ) : (
                  <input
                    type="password"
                    className="w-full rounded-md border border-border bg-surface px-3 py-2 text-xs font-mono outline-none focus:ring-2 focus:ring-primary/30 pr-10"
                    placeholder="eyJhbGciOiJ..."
                    value={manualToken}
                    onChange={(e) => setManualToken(e.target.value)}
                  />
                )}
                <button
                  type="button"
                  className="absolute right-2 top-2 p-1 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowManualToken(!showManualToken)}
                >
                  {showManualToken ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {manualToken && (
                <p className="text-xs text-emerald-600 flex items-center gap-1 mt-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Token ({manualToken.length} ký tự)
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                WAF Cookies (Tùy chọn)
              </label>
              <textarea
                className="w-full h-16 rounded-md border border-border bg-surface px-3 py-2 text-xs font-mono outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                placeholder="TS0114b13e=..."
                value={manualCookies}
                onChange={(e) => setManualCookies(e.target.value)}
              />
              {manualCookies && (
                <p className="text-xs text-emerald-600 flex items-center gap-1 mt-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Cookies ({manualCookies.length} ký tự)
                </p>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSaveManual}
                disabled={isSavingManual}
                className="gap-1.5 text-xs"
              >
                <Save className="w-3.5 h-3.5" />
                {isSavingManual ? "Đang lưu..." : "Lưu Token thủ công"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

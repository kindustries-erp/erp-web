import { useCallback, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { erpInvoicesCoreApi } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import {
  portalConfigKey,
  usePortalConfigQuery,
} from "@/modules/erp-invoices-core/hooks/usePortalConfigQuery";
import { buildCaptchaView, type CaptchaView } from "./GdtPortalAuthForm.helper";

const captchaQueryKey = ["erp-invoices", "portal-captcha"] as const;

interface UseGdtPortalAuthFormParams {
  onSuccess?: () => void;
}

/**
 * Trạng thái form đăng nhập Cổng Thuế. Cấu hình và captcha là server state (query),
 * đăng nhập là mutation; phần nhập liệu giữ bằng state cục bộ.
 */
export function useGdtPortalAuthForm({
  onSuccess,
}: UseGdtPortalAuthFormParams) {
  const { t } = useTranslation("erpInvoices");
  const queryClient = useQueryClient();
  const configQuery = usePortalConfigQuery();
  const captchaQuery = useQuery<CaptchaView | null>({
    queryKey: captchaQueryKey,
    queryFn: async () =>
      buildCaptchaView(await erpInvoicesCoreApi.getPortalCaptcha()),
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: false,
  });

  // Giá trị người dùng sửa; khi chưa sửa thì hiển thị giá trị từ cấu hình / captcha
  const [usernameDraft, setUsernameDraft] = useState<string | null>(null);
  const [captchaDraft, setCaptchaDraft] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const config = configQuery.data;
  const captchaView = captchaQuery.data ?? null;
  const username = usernameDraft ?? config?.username ?? "";
  const captchaValue = captchaDraft ?? captchaView?.autoText ?? "";

  const refreshCaptcha = useCallback(async () => {
    setCaptchaDraft(null);
    try {
      await captchaQuery.refetch({ throwOnError: true });
    } catch {
      toast.error(
        t("gdtCaptchaLoadFailed", "Không thể tải mã Captcha từ Cổng thuế"),
      );
    }
  }, [captchaQuery, t]);

  const loginMutation = useMutation({
    mutationFn: (payload: {
      username: string;
      password: string;
      cvalue: string;
      ckey: string;
    }) => erpInvoicesCoreApi.loginPortal(payload),
    onSuccess: (res) => {
      if (!res.success) return;
      toast.success(
        res.message || t("gdtLoginSuccess", "Đăng nhập Cổng Thuế thành công!"),
      );
      void queryClient.invalidateQueries({ queryKey: portalConfigKey });
      onSuccess?.();
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          t(
            "gdtLoginFailed",
            "Đăng nhập thất bại. Vui lòng kiểm tra lại mật khẩu hoặc mã Captcha.",
          ),
      );
      void refreshCaptcha();
    },
  });

  const submit = useCallback(
    (e?: FormEvent) => {
      e?.preventDefault();
      if (!username.trim()) {
        toast.error(
          t("gdtUsernameRequired", "Vui lòng nhập Mã số thuế / Tên đăng nhập"),
        );
        return;
      }
      if (!password) {
        toast.error(
          t("gdtPasswordRequired", "Vui lòng nhập mật khẩu Cổng thuế"),
        );
        return;
      }
      if (!captchaValue.trim()) {
        toast.error(t("gdtCaptchaRequired", "Vui lòng nhập mã Captcha"));
        return;
      }
      if (!captchaView) {
        toast.error(
          t("gdtCaptchaMissing", "Chưa có mã Captcha hợp lệ, vui lòng tải lại"),
        );
        void refreshCaptcha();
        return;
      }
      loginMutation.mutate({
        username: username.trim(),
        password,
        cvalue: captchaValue.trim().toUpperCase(),
        ckey: captchaView.key,
      });
    },
    [
      username,
      password,
      captchaValue,
      captchaView,
      loginMutation,
      refreshCaptcha,
      t,
    ],
  );

  return {
    username,
    setUsername: setUsernameDraft,
    password,
    setPassword,
    showPassword,
    toggleShowPassword: () => setShowPassword((v) => !v),
    captchaValue,
    setCaptchaValue: setCaptchaDraft,
    captchaImg: captchaView?.img ?? null,
    captchaLoading: captchaQuery.isFetching,
    refreshCaptcha,
    hasSavedPassword: config?.hasPassword ?? false,
    hasToken: config?.hasToken ?? false,
    configLoading: configQuery.isLoading,
    isLoggingIn: loginMutation.isPending,
    submit,
  };
}

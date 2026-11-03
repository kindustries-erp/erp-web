import { useState, useCallback } from "react";
import { useAuthStore } from "@/modules/auth/domain/authStore";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { EMAIL_VALIDATION_REGEX } from "../auth.constants";
import type { LoginFormErrors } from "../auth.types";

const DEV_ADMIN_PASSWORD = import.meta.env.DEV
  ? (import.meta.env.VITE_DEV_ADMIN_PASSWORD as string | undefined)
  : undefined;

export function useV2LoginForm() {
  const { loginAction, loading } = useAuthStore();
  const { t } = useV2Translation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<LoginFormErrors>({});

  const validate = useCallback((): LoginFormErrors => {
    const errs: LoginFormErrors = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      errs.email = t("v2.auth.errorEmailRequired");
    } else if (!EMAIL_VALIDATION_REGEX.test(trimmedEmail)) {
      errs.email = t("v2.auth.errorEmailFormat");
    }

    if (!password) {
      errs.password = t("v2.auth.errorPasswordRequired");
    }

    return errs;
  }, [email, password, t]);

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      const validationErrors = validate();

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return false;
      }

      setErrors({});
      try {
        await loginAction(email.trim(), password);
        return true;
      } catch {
        setErrors({ general: t("v2.auth.errorInvalid") });
        return false;
      }
    },
    [validate, email, password, loginAction, t],
  );

  const handleDevQuickFill = useCallback(() => {
    setEmail("admin@liouni.com");
    if (DEV_ADMIN_PASSWORD) {
      setPassword(DEV_ADMIN_PASSWORD);
    }
    setErrors({});
  }, []);

  const toggleShowPassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  return {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    toggleShowPassword,
    errors,
    setErrors,
    loading,
    handleSubmit,
    handleDevQuickFill,
    hasDevPassword: Boolean(DEV_ADMIN_PASSWORD),
  };
}

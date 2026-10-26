import * as React from "react";
import { AlertCircle } from "lucide-react";
import { V2AuthBrandBadge } from "../../atoms/v2-auth-brand-badge/V2AuthBrandBadge";
import { V2AuthInputFields } from "../../molecules/v2-auth-input-fields/V2AuthInputFields";
import { V2DevQuickFill } from "../../molecules/v2-dev-quick-fill/V2DevQuickFill";
import { V2Button, V2Text } from "@/v2/shared/components";
import { useV2LoginForm } from "../../../domain/hooks/useV2LoginForm";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { cn } from "@/v2/shared/utils/cn";

export interface V2LoginCardProps {
  className?: string;
  onSuccess?: () => void;
}

export const V2LoginCard: React.FC<V2LoginCardProps> = ({
  className = "",
  onSuccess,
}) => {
  const { t } = useV2Translation();
  const {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    toggleShowPassword,
    errors,
    loading,
    handleSubmit,
    handleDevQuickFill,
  } = useV2LoginForm();

  const onSubmit = async (e: React.FormEvent) => {
    const ok = await handleSubmit(e);
    if (ok && onSuccess) onSuccess();
  };

  return (
    <div
      data-testid="v2-login-card"
      className={cn(
        "w-full max-w-[420px] rounded-2xl bg-surface p-8",
        "shadow-lg dark:shadow-[0_10px_35px_-5px_rgba(0,0,0,0.5)]",
        "transition-shadow",
        className,
      )}
    >
      {/* Brand header */}
      <div className="mb-6 flex flex-col items-center text-center">
        <V2AuthBrandBadge size="md" className="mb-3.5" />
        <V2Text as="h1" variant="h3" weight="bold" className="text-foreground">
          {t("v2.auth.title")}
        </V2Text>
        <V2Text variant="body-sm" color="muted" className="mt-1">
          {t("v2.auth.subtitle")}
        </V2Text>
      </div>

      {/* General error alert */}
      {errors.general && (
        <div
          role="alert"
          className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs font-medium text-destructive"
        >
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{errors.general}</span>
        </div>
      )}

      {/* Login form */}
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <V2AuthInputFields
          email={email}
          onEmailChange={setEmail}
          password={password}
          onPasswordChange={setPassword}
          showPassword={showPassword}
          onToggleShowPassword={toggleShowPassword}
          errors={errors}
          disabled={loading}
        />

        <V2Button
          type="submit"
          variant="default"
          fullWidth
          isLoading={loading}
          loadingText={t("v2.auth.submitting")}
          className="h-10 text-sm font-semibold"
        >
          {t("v2.auth.submitButton")}
        </V2Button>

        <V2DevQuickFill onQuickFill={handleDevQuickFill} disabled={loading} />
      </form>
    </div>
  );
};

V2LoginCard.displayName = "V2LoginCard";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/v2/shared/ui/input/input";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type { LoginFormErrors } from "../../../domain/auth.types";

export interface V2AuthInputFieldsProps {
  email: string;
  onEmailChange: (val: string) => void;
  password: string;
  onPasswordChange: (val: string) => void;
  showPassword: boolean;
  onToggleShowPassword: () => void;
  errors: LoginFormErrors;
  disabled?: boolean;
}

export const V2AuthInputFields: React.FC<V2AuthInputFieldsProps> = ({
  email,
  onEmailChange,
  password,
  onPasswordChange,
  showPassword,
  onToggleShowPassword,
  errors,
  disabled = false,
}) => {
  const { t } = useV2Translation();

  return (
    <div className="space-y-4">
      {/* Email field */}
      <div className="space-y-1.5">
        <label
          htmlFor="v2-auth-email"
          className="block text-xs font-medium text-foreground"
        >
          {t("v2.auth.emailLabel")}
        </label>
        <Input
          id="v2-auth-email"
          type="email"
          autoComplete="email"
          disabled={disabled}
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder={t("v2.auth.emailPlaceholder")}
          className={
            errors.email
              ? "border-destructive focus-visible:ring-destructive"
              : ""
          }
        />
        {errors.email && (
          <p className="text-xs font-medium text-destructive">{errors.email}</p>
        )}
      </div>

      {/* Password field */}
      <div className="space-y-1.5">
        <label
          htmlFor="v2-auth-password"
          className="block text-xs font-medium text-foreground"
        >
          {t("v2.auth.passwordLabel")}
        </label>
        <div className="relative">
          <Input
            id="v2-auth-password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            disabled={disabled}
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            placeholder={t("v2.auth.passwordPlaceholder")}
            className={`pr-10 ${errors.password ? "border-destructive focus-visible:ring-destructive" : ""}`}
          />
          <button
            type="button"
            onClick={onToggleShowPassword}
            disabled={disabled}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-0 top-0 flex h-10 w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs font-medium text-destructive">
            {errors.password}
          </p>
        )}
      </div>
    </div>
  );
};

V2AuthInputFields.displayName = "V2AuthInputFields";

import { useState } from "react";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import {
  DrawerSection,
  DrawerField,
  inputCls,
} from "@/shared/components/DrawerModal";
import { Button } from "@/shared/components/ui/Button";
import { Settings, Eye, EyeOff, Check, AlertCircle } from "lucide-react";
import { useT } from "@/core/i18n";
import { useAuthStore } from "@/modules/auth/domain/authStore";
import { cn } from "@/shared/utils";

// ── Strength Bar ─────────────────────────────────────────────────────────────

function getStrength(password: string): number {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score; // 0..4
}

function StrengthBar({ password }: { password: string }) {
  const t = useT();
  if (!password) return null;
  const score = getStrength(password);
  const levels = [
    { label: t("passwordModal.strengthWeak"), color: "bg-red-400" },
    { label: t("passwordModal.strengthMedium"), color: "bg-amber-400" },
    { label: t("passwordModal.strengthStrong"), color: "bg-emerald-400" },
  ];
  const idx = score <= 1 ? 0 : score <= 2 ? 1 : 2;
  const { label, color } = levels[idx];

  return (
    <div className="mt-1.5 flex items-center gap-2">
      <div className="flex gap-1 flex-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-all duration-300",
              i <= idx ? color : "bg-muted",
            )}
          />
        ))}
      </div>
      <span className="text-[10px] text-[color:var(--muted-fg)] font-medium">
        {label}
      </span>
    </div>
  );
}

// ── Password Input with Toggle Visibility ───────────────────────────────────

function PasswordInput({
  value,
  onChange,
  placeholder,
  autoComplete,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        className={cn(inputCls, "pr-9")}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShow((s) => !s)}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[color:var(--muted-fg)] hover:text-foreground border-none bg-transparent cursor-pointer p-0.5 flex items-center"
      >
        {show ? (
          <EyeOff className="w-3.5 h-3.5" />
        ) : (
          <Eye className="w-3.5 h-3.5" />
        )}
      </button>
    </div>
  );
}

// ── GlobalSettingsDrawer ───────────────────────────────────────────────────

export function GlobalSettingsDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const t = useT();
  const { loading, error, changePasswordAction, logoutAction } = useAuthStore();

  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function reset() {
    setOldPwd("");
    setNewPwd("");
    setConfirmPwd("");
    setFormError(null);
    setSuccess(false);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleSubmit() {
    setFormError(null);

    if (!oldPwd.trim()) {
      setFormError(t("passwordModal.oldPasswordRequired"));
      return;
    }
    if (newPwd.length < 8) {
      setFormError(t("passwordModal.tooShort"));
      return;
    }
    if (newPwd !== confirmPwd) {
      setFormError(t("passwordModal.mismatch"));
      return;
    }

    try {
      await changePasswordAction(oldPwd, newPwd);
      setSuccess(true);
      setOldPwd("");
      setNewPwd("");
      setConfirmPwd("");
    } catch {
      setFormError(error ?? t("passwordModal.fail"));
    }
  }

  async function handleLogoutNow() {
    await logoutAction();
    handleClose();
  }

  const actions = success
    ? []
    : [
        {
          label: t("common.cancel"),
          onClick: handleClose,
          disabled: loading,
        },
        {
          label: loading ? "..." : t("passwordModal.submit"),
          primary: true,
          disabled: loading || !oldPwd || !newPwd || !confirmPwd,
          onClick: handleSubmit,
        },
      ];

  return (
    <StandardFormDrawer
      open={open}
      mode="edit"
      onClose={handleClose}
      icon={<Settings className="w-5 h-5" />}
      title={t("globalSettings.title")}
      subtitle={t("passwordModal.subtitle")}
      layout="1-column"
      size="sm"
      zIndex={410}
      actions={actions}
      leftPanel={
        <div className="flex flex-col gap-4">
          {success ? (
            /* ── Success state ── */
            <div className="flex flex-col items-center justify-center py-10 gap-4 text-center border border-border rounded-xl bg-surface/50 p-6 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-approve-bg flex items-center justify-center text-approve-fg shadow-sm">
                <Check className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {t("passwordModal.successTitle")}
                </p>
                <p className="text-xs text-[color:var(--muted-fg)] mt-1">
                  {t("passwordModal.successDesc")}
                </p>
                <p className="text-xs text-[color:var(--muted-fg)] mt-2">
                  {t("passwordModal.successChoice")}
                </p>
              </div>
              <div className="flex items-center gap-3 mt-4 w-full max-w-[300px]">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={handleClose}
                >
                  {t("passwordModal.continueSession")}
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={handleLogoutNow}
                >
                  {t("passwordModal.logoutNow")}
                </Button>
              </div>
            </div>
          ) : (
            /* ── Form Section ── */
            <DrawerSection title={t("passwordModal.section")}>
              <DrawerField label={t("passwordModal.oldPassword")} required>
                <PasswordInput
                  value={oldPwd}
                  onChange={setOldPwd}
                  placeholder={t("passwordModal.oldPlaceholder")}
                  autoComplete="current-password"
                />
              </DrawerField>

              <DrawerField label={t("passwordModal.newPassword")} required>
                <PasswordInput
                  value={newPwd}
                  onChange={setNewPwd}
                  placeholder={t("passwordModal.newPlaceholder")}
                />
                <StrengthBar password={newPwd} />
              </DrawerField>

              <DrawerField label={t("passwordModal.confirmPassword")} required>
                <PasswordInput
                  value={confirmPwd}
                  onChange={setConfirmPwd}
                  placeholder={t("passwordModal.confirmPlaceholder")}
                />
                {confirmPwd && newPwd !== confirmPwd && (
                  <p className="text-[10px] text-red-500 mt-1">
                    {t("passwordModal.mismatchInline")}
                  </p>
                )}
                {confirmPwd && newPwd === confirmPwd && newPwd.length >= 8 && (
                  <p className="text-[10px] text-approve-fg mt-1">
                    {t("passwordModal.matchInline")}
                  </p>
                )}
              </DrawerField>

              {formError && (
                <div className="flex items-center gap-2 text-xs text-[color:var(--warn-fg)] bg-[color:var(--warn-bg)] border border-[color:var(--warn-fg)]/30 rounded-lg px-3 py-2 mt-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}
            </DrawerSection>
          )}
        </div>
      }
    />
  );
}

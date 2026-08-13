import { useState } from "react";
import { useAuthStore } from "@/modules/auth/domain/authStore";
import { useT } from "@/core/i18n";
import {
  DrawerSection,
  DrawerField,
  inputCls,
} from "@/shared/components/DrawerModal";
import { Button } from "@/shared/components/ui/Button";
import { cn } from "@/shared/utils";

// ── Eye icons ──────────────────────────────────────────────────────────────

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

// ── PasswordInput ──────────────────────────────────────────────────────────

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
        autoComplete={autoComplete ?? "new-password"}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShow((s) => !s)}
        className="absolute right-[10px] top-1/2 -translate-y-1/2 text-[color:var(--faint)] hover:text-[color:var(--muted-fg)]"
      >
        <EyeIcon open={show} />
      </button>
    </div>
  );
}

// ── Strength meter ─────────────────────────────────────────────────────────

function strengthLevel(pwd: string): 0 | 1 | 2 | 3 {
  if (pwd.length < 6) return 0;
  let score = 1;
  if (pwd.length >= 10) score++;
  if (/[A-Z]/.test(pwd) && /[0-9!@#$%^&*]/.test(pwd)) score++;
  return score as 0 | 1 | 2 | 3;
}

const STRENGTH_COLOR = ["", "bg-red-400", "bg-warn-fg", "bg-approve-fg"];
const STRENGTH_TEXT = [
  "",
  "text-red-400",
  "text-[color:var(--warn-fg)]",
  "text-approve-fg",
];

function StrengthBar({ password }: { password: string }) {
  const t = useT();
  if (!password) return null;
  const level = strengthLevel(password);
  const labels = [
    "",
    t("passwordModal.strengthWeak"),
    t("passwordModal.strengthMedium"),
    t("passwordModal.strengthStrong"),
  ];
  return (
    <div className="mt-[6px]">
      <div className="flex gap-[3px] mb-1">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "h-[3px] flex-1 rounded-full transition-colors",
              i <= level ? STRENGTH_COLOR[level] : "bg-[color:var(--border)]",
            )}
          />
        ))}
      </div>
      <span className={cn("text-[10px] font-medium", STRENGTH_TEXT[level])}>
        {labels[level]}
      </span>
    </div>
  );
}

// ── Main modal ─────────────────────────────────────────────────────────────

interface ChangePasswordFormProps {
  onClose: () => void;
}

export function ChangePasswordForm({ onClose }: ChangePasswordFormProps) {
  const { loading, error, changePasswordAction, logoutAction } = useAuthStore();
  const t = useT();

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

  return (
    <div className="flex flex-col gap-4">
      <div className="text-sm text-[color:var(--muted-fg)] mb-2">
        {t("passwordModal.subtitle")}
      </div>
      {success ? (
        /* ── Success state ── */
        <div className="flex flex-col items-center justify-center py-10 gap-4 text-center border border-border rounded-lg bg-surface mt-2">
          <div className="w-12 h-12 rounded-full bg-approve-bg flex items-center justify-center">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="text-approve-fg"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
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
        /* ── Form ── */
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
              <p className="text-[10px] text-red-400 mt-[5px]">
                {t("passwordModal.mismatchInline")}
              </p>
            )}
            {confirmPwd && newPwd === confirmPwd && newPwd.length >= 8 && (
              <p className="text-[10px] text-approve-fg mt-[5px]">
                {t("passwordModal.matchInline")}
              </p>
            )}
          </DrawerField>

          {formError && (
            <div className="text-xs text-[color:var(--warn-fg)] bg-[color:var(--warn-bg)] border border-[color:var(--warn-fg)]/30 rounded-lg px-3 py-2 mt-1">
              {formError}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-border">
            <Button variant="secondary" onClick={handleClose}>
              {t("common.cancel")}
            </Button>
            <Button
              variant="primary"
              disabled={loading || !oldPwd || !newPwd || !confirmPwd}
              onClick={handleSubmit}
            >
              {loading ? "..." : t("passwordModal.submit")}
            </Button>
          </div>
        </DrawerSection>
      )}
    </div>
  );
}

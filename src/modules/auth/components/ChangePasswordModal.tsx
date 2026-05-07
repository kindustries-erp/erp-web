import { useState } from "react";
import { useAuthStore } from "@/modules/auth/domain/authStore";
import { useT } from "@/core/i18n";
import {
  DrawerModal,
  DrawerSection,
  DrawerField,
  inputCls,
} from "@/shared/components/DrawerModal";
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
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
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
        autoComplete="new-password"
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

// ── Lock icon ──────────────────────────────────────────────────────────────

const IconLock = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

// ── Main modal ─────────────────────────────────────────────────────────────

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({
  open,
  onClose,
}: ChangePasswordModalProps) {
  const { loading, error, changePasswordAction } = useAuthStore();
  const t = useT();

  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function reset() {
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

    if (newPwd.length < 6) {
      setFormError(t("passwordModal.tooShort"));
      return;
    }
    if (newPwd !== confirmPwd) {
      setFormError(t("passwordModal.mismatch"));
      return;
    }

    try {
      await changePasswordAction(newPwd);
      setSuccess(true);
      setNewPwd("");
      setConfirmPwd("");
    } catch {
      setFormError(error ?? t("passwordModal.fail"));
    }
  }

  return (
    <DrawerModal
      open={open}
      onClose={handleClose}
      icon={<IconLock />}
      title={t("passwordModal.title")}
      subtitle={t("passwordModal.subtitle")}
      confirmOnClose={!!newPwd && !success}
      zIndex={410}
      actions={
        success
          ? [{ label: t("common.close"), primary: true, onClick: handleClose }]
          : [
              { label: t("common.cancel"), onClick: handleClose },
              {
                label: t("passwordModal.submit"),
                primary: true,
                disabled: loading || !newPwd || !confirmPwd,
                loading,
                onClick: handleSubmit,
              },
            ]
      }
    >
      {success ? (
        /* ── Success state ── */
        <div className="flex flex-col items-center justify-center py-10 gap-4 text-center">
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
          </div>
        </div>
      ) : (
        /* ── Form ── */
        <DrawerSection title={t("passwordModal.section")}>
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
            {confirmPwd && newPwd === confirmPwd && newPwd.length >= 6 && (
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
        </DrawerSection>
      )}
    </DrawerModal>
  );
}

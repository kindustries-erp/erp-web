import { useState, useEffect } from "react";
import { useAuthStore } from "@/modules/auth/domain/authStore";
import { useT } from "@/core/i18n";
import type { SelfUpdateProfileRequest } from "@/modules/auth/api/auth";
import {
  DrawerModal,
  DrawerSection,
  DrawerRow,
  DrawerField,
  inputCls,
} from "@/shared/components/DrawerModal";
import { cn } from "@/shared/utils";

// ── Helpers ────────────────────────────────────────────────────────────────

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

// ── Form state ─────────────────────────────────────────────────────────────

interface EditForm {
  full_name: string;
  phone: string;
  notes: string;
}

function buildForm(
  emp: NonNullable<ReturnType<typeof useAuthStore.getState>["employee"]>,
): EditForm {
  return {
    full_name: emp.full_name ?? "",
    phone: emp.phone ?? "",
    notes: emp.notes ?? "",
  };
}

// ── Main modal ─────────────────────────────────────────────────────────────

interface UserProfileModalProps {
  open: boolean;
  onClose: () => void;
}

export function UserProfileModal({ open, onClose }: UserProfileModalProps) {
  const {
    employee,
    profile,
    loading,
    error,
    updateProfileAction,
    impersonation,
    stopImpersonationAction,
  } = useAuthStore();
  const t = useT();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<EditForm>(() =>
    employee ? buildForm(employee) : { full_name: "", phone: "", notes: "" },
  );
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (employee) setForm(buildForm(employee));
  }, [employee, editing]);

  const setField = <K extends keyof EditForm>(key: K, value: EditForm[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  async function handleSave() {
    setSaveError(null);
    const payload: SelfUpdateProfileRequest = {
      full_name: form.full_name.trim() || undefined,
      phone: form.phone.trim() || null,
      notes: form.notes.trim() || null,
    };
    try {
      await updateProfileAction(payload);
      setEditing(false);
    } catch {
      setSaveError(error ?? t("profile.updateFail"));
    }
  }

  if (!employee) return null;

  const dept = employee.department_id;
  const pos = employee.position_id;
  const av = initials(employee.full_name);
  const statusLabel: Record<string, string> = {
    active: t("profile.statusActive"),
    inactive: t("profile.statusInactive"),
    resigned: t("profile.statusResigned"),
  };

  const avatarIcon = (
    <div className="w-[30px] h-[30px] bg-primary rounded-full flex items-center justify-center text-primary-fg text-[10px] font-bold select-none">
      {av}
    </div>
  );

  const editToggle = (
    <button
      onClick={() => {
        setEditing((e) => !e);
        setSaveError(null);
      }}
      className={cn(
        "px-3 py-[5px] rounded-lg text-xs font-medium border transition-colors",
        editing
          ? "border-[color:var(--border)] text-[color:var(--muted-fg)] bg-[color:var(--muted)] hover:bg-surface-hover"
          : "border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-fg",
      )}
    >
      {editing ? t("common.cancel") : t("profile.edit")}
    </button>
  );

  return (
    <DrawerModal
      open={open}
      onClose={() => {
        setEditing(false);
        setSaveError(null);
        onClose();
      }}
      confirmOnClose={editing}
      icon={avatarIcon}
      title={employee.full_name}
      subtitle={`${employee.employee_code} · ${dept.department_name} · ${pos.position_name}`}
      headerExtra={editToggle}
      actions={
        editing
          ? [
              {
                label: t("common.cancel"),
                onClick: () => {
                  setEditing(false);
                  setSaveError(null);
                },
              },
              {
                label: t("common.saveChanges"),
                primary: true,
                disabled: loading,
                loading,
                onClick: handleSave,
              },
            ]
          : [{ label: t("common.close"), onClick: onClose }]
      }
    >
      {editing ? (
        /* ── Edit mode — only whitelisted fields ── */
        <>
          <DrawerSection title={t("profile.personalInfo")}>
            <DrawerField label={t("profile.fullName")} required>
              <input
                type="text"
                className={inputCls}
                value={form.full_name}
                onChange={(e) => setField("full_name", e.target.value)}
                placeholder={t("profile.fullNamePlaceholder")}
              />
            </DrawerField>
            <DrawerField label={t("profile.phone")}>
              <input
                type="tel"
                className={inputCls}
                value={form.phone}
                onChange={(e) => setField("phone", e.target.value)}
                placeholder="0912 345 678"
              />
            </DrawerField>
          </DrawerSection>

          <DrawerSection title={t("profile.notes")}>
            <DrawerField label={t("profile.internalNotes")}>
              <textarea
                className={cn(inputCls, "min-h-[80px] resize-none")}
                value={form.notes}
                onChange={(e) => setField("notes", e.target.value)}
                placeholder={t("profile.notesPlaceholder")}
                rows={3}
              />
            </DrawerField>
          </DrawerSection>

          {saveError && (
            <div className="text-xs text-[color:var(--warn-fg)] bg-[color:var(--warn-bg)] border border-[color:var(--warn-fg)]/30 rounded-lg px-3 py-2 mb-3">
              {saveError}
            </div>
          )}
        </>
      ) : (
        /* ── View mode ── */
        <>
          <DrawerSection title={t("profile.personalInfo")}>
            <DrawerRow
              label={t("profile.employeeCode")}
              value={
                <code className="font-mono">{employee.employee_code}</code>
              }
            />
            <DrawerRow
              label={t("profile.fullName")}
              value={employee.full_name}
            />
            <DrawerRow label={t("profile.email")} value={employee.email} />
            <DrawerRow label={t("profile.phone")} value={employee.phone} />
            <DrawerRow
              label={t("profile.status")}
              value={
                <span
                  className={cn(
                    "inline-flex items-center px-[10px] py-[3px] rounded-[20px] text-[11px] font-medium border",
                    employee.employment_status === "active"
                      ? "bg-approve-bg text-approve-fg border-[#a8dbb8]"
                      : "bg-warn-bg text-warn-fg border-[#f5d580]",
                  )}
                >
                  {statusLabel[employee.employment_status] ??
                    employee.employment_status}
                </span>
              }
            />
          </DrawerSection>

          <DrawerSection title={t("profile.workInfo")}>
            <DrawerRow
              label={t("profile.department")}
              value={dept.department_name}
            />
            <DrawerRow
              label={t("profile.position")}
              value={pos.position_name}
            />
            <DrawerRow
              label={t("profile.systemRole")}
              value={profile?.role?.name ?? "—"}
            />
          </DrawerSection>

          {employee.notes && (
            <DrawerSection title={t("profile.notes")}>
              <DrawerRow
                label={t("profile.notes")}
                value={employee.notes}
                cls="max-w-[220px]"
              />
            </DrawerSection>
          )}

          {impersonation?.active && (
            <DrawerSection title={t("profile.impersonation.sectionTitle")}>
              <div className="flex flex-col gap-3">
                <div className="rounded-lg bg-[color:var(--warn-bg)] border border-[color:var(--warn-fg)]/30 px-3 py-2 text-xs text-[color:var(--warn-fg)]">
                  <div className="font-medium mb-1">
                    {t("profile.impersonation.activeNotice")}
                  </div>
                  <div className="text-[color:var(--warn-fg)]/80">
                    {t("profile.impersonation.actorLabel")}:{" "}
                    {[
                      impersonation.actor?.first_name,
                      impersonation.actor?.last_name,
                    ]
                      .filter(Boolean)
                      .join(" ") ||
                      impersonation.actor?.email ||
                      "—"}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    stopImpersonationAction("manual");
                    onClose();
                  }}
                  className="w-full py-[7px] px-3 rounded-lg border border-[color:var(--warn-fg)]/50 text-xs font-medium text-[color:var(--warn-fg)] bg-[color:var(--warn-bg)] hover:bg-[color:var(--warn-fg)]/10 transition-colors"
                >
                  {t("profile.impersonation.stopButton")}
                </button>
              </div>
            </DrawerSection>
          )}
        </>
      )}
    </DrawerModal>
  );
}

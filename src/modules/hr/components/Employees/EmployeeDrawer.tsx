import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import {
  DrawerModal,
  DrawerSection,
  DrawerField,
  inputCls,
} from "@/shared/components/DrawerModal";
import { Combobox } from "@/shared/components/Combobox";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { cn } from "@/shared/utils";
import type { Department, Position } from "@/modules/hr/api/hrApi";
import type { Employee } from "@/modules/auth/api/auth";
import type { Role } from "@/modules/system/types/rbac";
import type { useT } from "@/core/i18n";
import { IconUser, type EmpForm } from "./shared";
import { getBranchOptionsApi } from "@/modules/branches/api/branchApi";

type T = ReturnType<typeof useT>;

interface EmployeeDrawerProps {
  open: boolean;
  editing: Employee | null;
  form: EmpForm;
  setForm: Dispatch<SetStateAction<EmpForm>>;
  depts: Department[];
  positions: Position[];
  allRoles: Role[];
  statusOptions: { value: string; label: string }[];
  saving: boolean;
  saveError: string | null;
  isDirty: boolean;
  policyDrawerOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  onOpenPolicyMatrix: (emp: Employee) => void;
  t: T;
}

export function EmployeeDrawer(props: EmployeeDrawerProps) {
  const {
    open,
    editing,
    form,
    setForm,
    depts,
    positions,
    allRoles,
    statusOptions,
    saving,
    saveError,
    isDirty,
    onClose,
    onSave,
    onOpenPolicyMatrix,
    t,
  } = props;
  const setField = <K extends keyof EmpForm>(k: K, v: EmpForm[K]) =>
    setForm((f) => ({ ...f, [k]: v }));
  const [branchOptions, setBranchOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);
  useEffect(() => {
    getBranchOptionsApi()
      .then(setBranchOptions)
      .catch(() => {});
  }, []);
  return (
    <DrawerModal
      open={open}
      onClose={onClose}
      confirmOnClose={isDirty && !editing}
      icon={<IconUser />}
      title={
        editing ? t("nhansu.drawer.editTitle") : t("nhansu.drawer.createTitle")
      }
      subtitle={editing ? editing.full_name : t("nhansu.drawer.subtitle")}
      zIndex={400}
      actions={[
        { label: t("common.cancel"), onClick: onClose },
        {
          label: editing ? t("nhansu.actions.saveChanges") : t("common.addNew"),
          primary: true,
          loading: saving,
          disabled: saving,
          onClick: onSave,
        },
      ]}
    >
      <DrawerSection title={t("nhansu.drawer.personalInfo")}>
        <TextField
          label={t("nhansu.fields.employeeCode")}
          value={form.employee_code}
          onChange={(v) => setField("employee_code", v)}
          placeholder="VD: NV001"
        />
        <TextField
          label={t("nhansu.fields.fullName")}
          value={form.full_name}
          onChange={(v) => setField("full_name", v)}
          placeholder={t("nhansu.placeholders.fullName")}
          required
        />
        <TextField
          label={t("nhansu.fields.email")}
          type="email"
          value={form.email}
          onChange={(v) => setField("email", v)}
          placeholder="example@company.com"
          required
        />
        <TextField
          label={t("nhansu.fields.phone")}
          type="tel"
          value={form.phone}
          onChange={(v) => setField("phone", v)}
          placeholder="0912 345 678"
        />
      </DrawerSection>

      <DrawerSection title={t("nhansu.drawer.departmentPosition")}>
        <DrawerField label="Chi nhánh">
          <Combobox
            options={branchOptions}
            value={form.branch_id}
            onChange={(v) => setField("branch_id", v)}
            placeholder="Tất cả chi nhánh"
            allowClear={true}
          />
        </DrawerField>
        <DrawerField label={t("nhansu.fields.department")}>
          <Combobox
            options={depts.map((d) => ({
              value: d.id,
              label: d.department_name,
            }))}
            value={form.department_id}
            onChange={(v) => setField("department_id", v)}
            placeholder={t("nhansu.placeholders.none")}
          />
        </DrawerField>
        <DrawerField label={t("nhansu.fields.position")}>
          <Combobox
            options={positions.map((p) => ({
              value: p.id,
              label: p.position_name,
            }))}
            value={form.position_id}
            onChange={(v) => setField("position_id", v)}
            placeholder={t("nhansu.placeholders.none")}
          />
        </DrawerField>
      </DrawerSection>

      <DrawerSection title={t("nhansu.drawer.employment")}>
        <DrawerField label={t("nhansu.fields.status")}>
          <Combobox
            options={statusOptions}
            value={form.employment_status}
            onChange={(v) => setField("employment_status", v || "active")}
            allowClear={false}
          />
        </DrawerField>
        <TextField
          label={t("nhansu.fields.hireDate")}
          type="date"
          value={form.hire_date}
          onChange={(v) => setField("hire_date", v)}
        />
        <DrawerField label={t("nhansu.fields.accountActive")}>
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={form.is_active}
              onCheckedChange={(v) => setField("is_active", v === true)}
            />
            <span className="text-xs text-foreground">
              {t("nhansu.fields.activeAccount")}
            </span>
          </label>
        </DrawerField>
      </DrawerSection>

      <DrawerSection title={t("nhansu.drawer.notes")}>
        <DrawerField label={t("nhansu.fields.internalNotes")}>
          <textarea
            className={cn(inputCls, "min-h-[70px] resize-none")}
            value={form.notes}
            onChange={(e) => setField("notes", e.target.value)}
            placeholder={t("nhansu.placeholders.notes")}
            rows={3}
          />
        </DrawerField>
      </DrawerSection>

      {editing && (
        <PermissionsSection
          editing={editing}
          allRoles={allRoles}
          roleId={form.role_id}
          setRoleId={(v) => setField("role_id", v)}
          onOpenPolicyMatrix={onOpenPolicyMatrix}
          t={t}
        />
      )}
      {saveError && (
        <div className="text-xs text-[color:var(--warn-fg)] bg-[color:var(--warn-bg)] border border-[color:var(--warn-fg)]/30 rounded-lg px-3 py-2">
          {saveError}
        </div>
      )}
    </DrawerModal>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <DrawerField label={label} required={required}>
      <input
        type={type}
        className={inputCls}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </DrawerField>
  );
}

function PermissionsSection({
  editing,
  allRoles,
  roleId,
  setRoleId,
  onOpenPolicyMatrix,
  t,
}: {
  editing: Employee;
  allRoles: Role[];
  roleId: string;
  setRoleId: (value: string) => void;
  onOpenPolicyMatrix: (emp: Employee) => void;
  t: T;
}) {
  return (
    <DrawerSection title={t("nhansu.drawer.permissions")}>
      <DrawerField label={t("nhansu.fields.baseRole")}>
        <Combobox
          options={allRoles.map((r) => ({ value: r.id, label: r.name }))}
          value={roleId}
          onChange={setRoleId}
          placeholder={t("nhansu.placeholders.noRole")}
        />
      </DrawerField>
      <DrawerField label={t("nhansu.fields.customPolicy")}>
        <button
          type="button"
          onClick={() => onOpenPolicyMatrix(editing)}
          className="w-full flex items-center justify-between px-3 py-[7px] text-xs rounded-lg border border-[color:var(--border)] bg-[color:var(--muted)] text-[color:var(--muted-fg)] hover:bg-surface-hover hover:text-foreground transition-colors"
        >
          <span>{t("nhansu.actions.editCustomPermissions")}</span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </DrawerField>
    </DrawerSection>
  );
}

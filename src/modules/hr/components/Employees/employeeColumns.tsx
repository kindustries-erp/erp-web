import type { DataTableColumn } from "@/shared/components/DataTable";
import { cn } from "@/shared/utils";
import type { Employee } from "@/modules/auth/api/auth";
import type { useT } from "@/core/i18n";
import {
  deptLabel,
  IconEdit,
  IconLoginAs,
  IconTrash,
  initials,
  posLabel,
  StatusPill,
} from "./shared";

type T = ReturnType<typeof useT>;

interface EmployeeColumnsArgs {
  t: T;
  canImpersonate: boolean;
  statusLabel: Record<string, string>;
  onImpersonate: (emp: Employee) => void;
  onEdit: (emp: Employee) => void;
  onDelete: (emp: Employee) => void;
}

export function buildEmployeeColumns(
  args: EmployeeColumnsArgs,
): DataTableColumn<Employee>[] {
  const { t, canImpersonate, statusLabel, onImpersonate, onEdit, onDelete } =
    args;
  return [
    {
      key: "employee",
      header: t("nhansu.headers.employee"),
      cell: (emp) => <EmployeeIdentity emp={emp} />,
      skeletonClassName: "w-28",
    },
    {
      key: "contact",
      header: t("nhansu.headers.contact"),
      cell: (emp) => <EmployeeContact emp={emp} />,
      skeletonClassName: "w-36",
    },
    {
      key: "department",
      header: t("nhansu.headers.department"),
      cell: deptLabel,
      className: "text-[color:var(--muted-fg)]",
      skeletonClassName: "w-24",
    },
    {
      key: "position",
      header: t("nhansu.headers.position"),
      cell: posLabel,
      className: "text-[color:var(--muted-fg)]",
      skeletonClassName: "w-24",
    },
    {
      key: "status",
      header: t("nhansu.headers.status"),
      cell: (emp) => (
        <StatusPill
          status={emp.employment_status}
          label={statusLabel[emp.employment_status] ?? emp.employment_status}
        />
      ),
      skeletonClassName: "w-20 rounded-full",
    },
    {
      key: "actions",
      header: "",
      cell: (emp) => (
        <EmployeeActions
          emp={emp}
          canImpersonate={canImpersonate}
          onImpersonate={onImpersonate}
          onEdit={onEdit}
          onDelete={onDelete}
          t={t}
        />
      ),
      headerClassName: "w-[100px]",
      skeletonClassName: "",
    },
  ];
}

function EmployeeIdentity({ emp }: { emp: Employee }) {
  return (
    <div className="flex items-center gap-[10px]">
      <div className="w-8 h-8 min-w-[32px] bg-primary rounded-full flex items-center justify-center text-primary-fg text-[10px] font-bold flex-shrink-0">
        {initials(emp.full_name ?? "?")}
      </div>
      <div>
        <div className="text-xs font-medium text-foreground leading-tight">
          {emp.full_name}
        </div>
        <div className="text-[10px] text-[color:var(--faint)] font-mono">
          {emp.employee_code ?? "—"}
        </div>
      </div>
    </div>
  );
}

function EmployeeContact({ emp }: { emp: Employee }) {
  return (
    <div>
      <div className="text-xs text-foreground">{emp.email}</div>
      {emp.phone && (
        <div className="text-[10px] text-[color:var(--muted-fg)]">
          {emp.phone}
        </div>
      )}
    </div>
  );
}

function EmployeeActions({
  emp,
  canImpersonate,
  onImpersonate,
  onEdit,
  onDelete,
  t,
}: {
  emp: Employee;
  canImpersonate: boolean;
  onImpersonate: (emp: Employee) => void;
  onEdit: (emp: Employee) => void;
  onDelete: (emp: Employee) => void;
  t: T;
}) {
  const cls =
    "p-[5px] rounded text-[color:var(--muted-fg)] hover:bg-surface-hover cursor-pointer";
  return (
    <div className="flex gap-[5px] justify-end">
      {canImpersonate && (
        <IconButton
          title={t("nhansu.actions.loginAsUser")}
          onClick={() => onImpersonate(emp)}
          className={cn(cls, "hover:text-primary")}
        >
          <IconLoginAs />
        </IconButton>
      )}
      <IconButton
        title={t("nhansu.actions.edit")}
        onClick={() => onEdit(emp)}
        className={cn(cls, "hover:text-foreground")}
      >
        <IconEdit />
      </IconButton>
      <IconButton
        title={t("nhansu.actions.delete")}
        onClick={() => onDelete(emp)}
        className={cn(cls, "hover:text-red-500")}
      >
        <IconTrash />
      </IconButton>
    </div>
  );
}

function IconButton({
  title,
  onClick,
  className,
  children,
}: {
  title: string;
  onClick: () => void;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <button title={title} onClick={onClick} className={className}>
      {children}
    </button>
  );
}

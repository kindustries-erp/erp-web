import type { DataTableColumn } from "@/shared/components/DataTable";
import type { Employee } from "@/modules/auth/api/auth";
import type { useT } from "@/core/i18n";
import { deptLabel, initials, posLabel, StatusPill } from "./shared";

type T = ReturnType<typeof useT>;

interface EmployeeColumnsArgs {
  t: T;
  statusLabel: Record<string, string>;
}

export function buildEmployeeColumns(
  args: EmployeeColumnsArgs,
): DataTableColumn<Employee>[] {
  const { t, statusLabel } = args;
  return [
    {
      key: "employee",
      header: t("nhansu.headers.employee"),
      className: "text-left",
      headerClassName: "text-center",
      cell: (emp) => <EmployeeIdentity emp={emp} />,
      skeletonClassName: "w-28",
    },
    {
      key: "contact",
      header: t("nhansu.headers.contact"),
      className: "text-left",
      headerClassName: "text-center",
      cell: (emp) => <EmployeeContact emp={emp} />,
      skeletonClassName: "w-36",
    },
    {
      key: "department",
      header: t("nhansu.headers.department"),
      cell: deptLabel,
      className: "text-[color:var(--muted-fg)] text-left",
      headerClassName: "text-center",
      skeletonClassName: "w-24",
    },
    {
      key: "position",
      header: t("nhansu.headers.position"),
      cell: posLabel,
      className: "text-[color:var(--muted-fg)] text-left",
      headerClassName: "text-center",
      skeletonClassName: "w-24",
    },
    {
      key: "status",
      header: t("nhansu.headers.status"),
      className: "text-center",
      headerClassName: "text-center",
      cell: (emp) => (
        <div className="flex justify-center w-full">
          <StatusPill
            status={emp.employment_status}
            label={statusLabel[emp.employment_status] ?? emp.employment_status}
          />
        </div>
      ),
      skeletonClassName: "w-20 rounded-full",
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

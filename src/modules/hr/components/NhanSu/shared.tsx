import { cn } from "@/shared/utils";
import type { Employee } from "@/modules/auth/api/auth";

export const STATUS_STYLE: Record<string, string> = {
  active: "bg-approve-bg text-approve-fg",
  resigned: "bg-[color:var(--warn-bg)] text-[color:var(--warn-fg)]",
  inactive: "bg-[color:var(--muted)] text-[color:var(--muted-fg)]",
};
export const STATUS_FILTER_FETCH_LIMIT = 1000;

export interface EmpForm {
  employee_code: string;
  full_name: string;
  email: string;
  phone: string;
  department_id: string;
  position_id: string;
  employment_status: string;
  hire_date: string;
  is_active: boolean;
  notes: string;
  role_id: string;
}

export const emptyForm: EmpForm = {
  employee_code: "",
  full_name: "",
  email: "",
  phone: "",
  department_id: "",
  position_id: "",
  employment_status: "active",
  hire_date: "",
  is_active: true,
  notes: "",
  role_id: "",
};

export function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(-2).map((w) => w[0].toUpperCase()).join("");
}
export function deptLabel(emp: Employee) {
  if (!emp.department_id) return "—";
  if (typeof emp.department_id === "object") return emp.department_id.department_name;
  return String(emp.department_id);
}
export function posLabel(emp: Employee) {
  if (!emp.position_id) return "—";
  if (typeof emp.position_id === "object") return emp.position_id.position_name;
  return String(emp.position_id);
}
export function deptId(emp: Employee): string {
  if (!emp.department_id) return "";
  if (typeof emp.department_id === "object") return emp.department_id.id ?? "";
  return String(emp.department_id);
}
export function posId(emp: Employee): string {
  if (!emp.position_id) return "";
  if (typeof emp.position_id === "object") return (emp.position_id as unknown as { id: string }).id ?? "";
  return String(emp.position_id);
}
export function getDirectusId(emp: Employee): string {
  const val = emp.directus_user_id as unknown;
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object" && val !== null && "id" in val) return (val as { id?: string }).id ?? "";
  return "";
}
export function getEmployeeRoleId(emp: Employee): string {
  const du = emp.directus_user_id as unknown;
  if (!du || typeof du !== "object") return "";
  const role = (du as Record<string, unknown>).role;
  if (!role) return "";
  if (typeof role === "string") return role;
  if (typeof role === "object") return (role as { id?: string }).id ?? "";
  return "";
}
export function buildForm(e: Employee): EmpForm {
  return {
    employee_code: e.employee_code ?? "",
    full_name: e.full_name ?? "",
    email: e.email ?? "",
    phone: e.phone ?? "",
    department_id: deptId(e),
    position_id: posId(e),
    employment_status: e.employment_status ?? "active",
    hire_date: e.hire_date ? e.hire_date.slice(0, 10) : "",
    is_active: e.is_active,
    notes: e.notes ?? "",
    role_id: getEmployeeRoleId(e),
  };
}
export const IconPlus = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
export const IconEdit = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>;
export const IconTrash = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>;
export const IconUser = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
export const IconRefresh = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>;
export const IconLoginAs = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" /></svg>;
export function StatusPill({ status, label }: { status: string; label: string }) {
  return <span className={cn("inline-flex items-center px-[8px] py-[3px] rounded-[20px] text-[10px] font-medium", STATUS_STYLE[status] ?? "bg-[color:var(--muted)] text-[color:var(--muted-fg)]")}>{label}</span>;
}

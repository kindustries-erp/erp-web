import type { EmployeeModuleConfig } from "../employees.config.type";

export interface EmployeeDrawerProps {
  open: boolean;
  mode: "view" | "edit";
  recordId?: string | null;
  canUpdate: boolean;
  onClose: () => void;
  config: EmployeeModuleConfig;
}

import type { UserModuleConfig } from "../users.config.type";

export interface UserDrawerProps {
  open: boolean;
  mode: "view" | "edit";
  recordId?: string | null;
  canUpdate: boolean;
  onClose: () => void;
  config: UserModuleConfig;
}

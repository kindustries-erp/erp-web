import { V2WorkspaceMode } from "@/v2/shared/types";

export interface V2WorkspaceModeToggleProps {
  className?: string;
  onModeChange?: (mode: V2WorkspaceMode) => void;
}

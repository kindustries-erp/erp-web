import type { LucideIcon } from "lucide-react";
import type { V2BaseProps } from "@/v2/shared/types";

export interface V2TabItemProps extends V2BaseProps {
  id: string;
  label: string;
  icon?: LucideIcon;
  isActive?: boolean;
  isClosable?: boolean;
  onClose?: () => void;
}

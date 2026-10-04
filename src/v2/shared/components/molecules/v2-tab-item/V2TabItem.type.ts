import type { LucideIcon } from "lucide-react";

export interface V2TabItemProps {
  id: string;
  label: string;
  icon?: LucideIcon;
  isActive?: boolean;
  isClosable?: boolean;
  onClick?: () => void;
  onClose?: () => void;
  className?: string;
}

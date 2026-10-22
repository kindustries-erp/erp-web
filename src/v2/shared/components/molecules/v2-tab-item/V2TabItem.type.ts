import type * as React from "react";
import type { V2BaseProps } from "@/v2/shared/types";
import type { V2IconType } from "@/v2/shared/components/atoms";

export interface V2TabItemProps extends V2BaseProps {
  id: string;
  label: string;
  icon?: V2IconType | React.ComponentType<any> | React.ReactNode;
  isActive?: boolean;
  isClosable?: boolean;
  onClose?: () => void;
}

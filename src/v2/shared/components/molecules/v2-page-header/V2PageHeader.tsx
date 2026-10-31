import * as React from "react";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
import { V2PageIcon } from "@/v2/shared/components/atoms/v2-page-icon";
import { V2PageToolbarSlot } from "@/v2/shared/components/molecules/v2-page-toolbar-slot";
import type { V2PageHeaderProps } from "./V2PageHeader.type";

const noopRegister = () => {};

export const V2PageHeader: React.FC<V2PageHeaderProps> = ({
  title,
  description,
  icon,
  actions,
  tabKeys = [],
  activeKey,
  register = noopRegister,
}) => (
  <header className="flex shrink-0 items-center justify-between gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
    <div className="flex min-w-0 items-center gap-2 sm:gap-3">
      {icon && <V2PageIcon>{icon}</V2PageIcon>}
      <div className="min-w-0">
        <V2Text
          as="h1"
          variant="h3"
          truncate
          className="text-sm sm:text-base font-semibold"
        >
          {title}
        </V2Text>
        {description && (
          <V2Text
            as="p"
            variant="body-sm"
            color="muted"
            truncate
            className="hidden sm:block"
          >
            {description}
          </V2Text>
        )}
      </div>
    </div>
    <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
      {tabKeys.map((key) => (
        <V2PageToolbarSlot
          key={key}
          tabKey={key}
          active={key === activeKey}
          register={register}
        />
      ))}
      {actions}
    </div>
  </header>
);

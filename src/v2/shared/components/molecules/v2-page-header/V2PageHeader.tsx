import * as React from "react";
import { cn } from "@/v2/shared/utils/cn";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
import { V2PageIcon } from "@/v2/shared/components/atoms/v2-page-icon";
import { V2PageToolbarSlot } from "@/v2/shared/components/molecules/v2-page-toolbar-slot";
import { V2TabCombobox } from "@/v2/shared/components/molecules/v2-tab-combobox";
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
  pageTabs,
  activePageTab,
  onPageTabSelect,
}) => (
  <header
    className={cn(
      "flex shrink-0 items-center justify-between gap-2 sm:gap-3 flex-wrap sm:flex-nowrap",
      !actions && tabKeys.length === 0 && !pageTabs && "hidden sm:flex",
    )}
  >
    <div
      className={cn(
        "min-w-0 items-center gap-2 sm:gap-3 order-1",
        pageTabs && pageTabs.length > 1 ? "hidden sm:flex" : "flex",
      )}
    >
      {icon && (
        <V2PageIcon className="hidden sm:inline-flex">{icon}</V2PageIcon>
      )}
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

    {pageTabs && pageTabs.length > 1 && (
      <div className="flex sm:hidden order-1 min-w-0 max-w-[220px]">
        <V2TabCombobox
          items={pageTabs}
          activeKey={activePageTab}
          onSelect={onPageTabSelect}
        />
      </div>
    )}

    {actions && (
      <div className="order-2 sm:order-3 shrink-0 ml-auto sm:ml-0">
        {actions}
      </div>
    )}

    {tabKeys.length > 0 && (
      <div className="order-3 sm:order-2 flex w-full sm:w-auto shrink-0 items-center justify-between sm:justify-end gap-1.5 sm:gap-2 sm:ml-auto">
        {tabKeys.map((key) => (
          <V2PageToolbarSlot
            key={key}
            tabKey={key}
            active={key === activeKey}
            register={register}
          />
        ))}
      </div>
    )}
  </header>
);

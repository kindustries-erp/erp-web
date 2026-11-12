import * as React from "react";
import { cn } from "@/v2/shared/utils/cn";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
import { V2PageIcon } from "@/v2/shared/components/atoms/v2-page-icon";
import { V2PageToolbarSlot } from "@/v2/shared/components/molecules/v2-page-toolbar-slot";
import { V2TabCombobox } from "@/v2/shared/components/molecules/v2-tab-combobox";
import { V2_PAGE_HEADER_STYLES } from "./V2PageHeader.helper";
import {
  V2PageHeaderVariant,
  type V2PageHeaderProps,
} from "./V2PageHeader.type";

const noopRegister = () => {};

/** Tiêu đề trang chuẩn V2 hỗ trợ bố cục phẳng (FLAT) và dạng thẻ bo góc (CARD). */
export const V2PageHeader: React.FC<V2PageHeaderProps> = ({
  title,
  description,
  icon,
  variant = V2PageHeaderVariant.FLAT,
  actions,
  tabKeys = [],
  activeKey,
  register = noopRegister,
  pageTabs,
  activePageTab,
  onPageTabSelect,
}) => {
  const styles = V2_PAGE_HEADER_STYLES[variant];
  const isFlat = variant === V2PageHeaderVariant.FLAT;

  return (
    <header
      className={cn(
        styles.container,
        isFlat &&
          !actions &&
          tabKeys.length === 0 &&
          !pageTabs &&
          "hidden sm:flex",
      )}
    >
      <div
        className={cn(
          "min-w-0 items-center gap-2.5 sm:gap-3 order-1",
          pageTabs && pageTabs.length > 1 ? "hidden sm:flex" : "flex",
        )}
      >
        {icon && <V2PageIcon className={styles.icon}>{icon}</V2PageIcon>}
        <div className="min-w-0">
          <V2Text
            as="h1"
            variant={isFlat ? "h3" : "h2"}
            truncate={isFlat}
            className={styles.title}
          >
            {title}
          </V2Text>
          {description && (
            <V2Text
              as="p"
              variant="body-sm"
              color="muted"
              truncate={isFlat}
              className={styles.description}
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

      {actions && <div className={styles.actions}>{actions}</div>}

      {tabKeys.length > 0 && (
        <div className={styles.toolbar}>
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
};
V2PageHeader.displayName = "V2PageHeader";

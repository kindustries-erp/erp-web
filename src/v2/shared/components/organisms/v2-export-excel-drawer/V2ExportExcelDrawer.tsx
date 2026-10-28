import * as React from "react";
import { V2StandardDrawer } from "@/v2/shared/components/organisms/v2-standard-drawer";
import { DrawerSection } from "@/v2/shared/components/molecules/v2-drawer-section";
import { V2ColumnSelector } from "@/v2/shared/components/molecules/v2-column-selector";
import type { V2ExportExcelDrawerProps } from "./V2ExportExcelDrawer.type";

/**
 * Vỏ drawer xuất Excel dùng chung: cột trái là chọn cột + lịch sử file,
 * cột phải là điều kiện xuất. Platform split (desktop/mobile) do V2StandardDrawer đảm nhiệm.
 */
export const V2ExportExcelDrawer: React.FC<V2ExportExcelDrawerProps> = ({
  open,
  onClose,
  title,
  subtitle,
  icon,
  columnGroups,
  selectedColumns,
  defaultColumns,
  onColumnsChange,
  columnsTitle,
  historyTitle,
  historyExtra,
  history,
  conditions,
}) => (
  <V2StandardDrawer
    open={open}
    mode="view"
    onClose={onClose}
    title={title}
    subtitle={subtitle}
    icon={icon}
    layout="2-columns"
    size="lg"
    leftPanel={
      <div className="space-y-4">
        <DrawerSection title={columnsTitle} collapsible defaultCollapsed>
          <V2ColumnSelector
            groups={columnGroups}
            selectedKeys={selectedColumns}
            defaultKeys={defaultColumns}
            onChange={onColumnsChange}
          />
        </DrawerSection>
        <DrawerSection
          title={historyTitle}
          titleExtra={historyExtra}
          collapsible
          defaultCollapsed={false}
        >
          {history}
        </DrawerSection>
      </div>
    }
    rightPanel={<div className="space-y-4">{conditions}</div>}
  />
);

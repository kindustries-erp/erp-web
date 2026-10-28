import React from "react";
import { V2StandardDrawer } from "./V2StandardDrawer";
import { DrawerSection } from "@/v2/shared/components/molecules/v2-drawer-section";
import type { Meta } from "@storybook/react";

const meta: Meta<typeof V2StandardDrawer> = {
  title: "Components/Organisms/Drawer/V2StandardDrawer",
  component: V2StandardDrawer,
};

export default meta;

export const TabSpecificRightPanels = () => (
  <V2StandardDrawer
    open
    onClose={() => undefined}
    title="Drawer với panel phải theo tab"
    layout="2-columns"
    tabs={[
      {
        key: "details",
        label: "Chi tiết",
        content: (
          <DrawerSection title="Chi tiết">Nội dung chi tiết</DrawerSection>
        ),
        rightPanel: (
          <DrawerSection title="Thông tin hóa đơn">
            Panel chi tiết
          </DrawerSection>
        ),
      },
      {
        key: "history",
        label: "Lịch sử",
        content: (
          <DrawerSection title="Lịch sử">Nội dung lịch sử</DrawerSection>
        ),
        rightPanel: (
          <DrawerSection title="Kiểm duyệt">Panel lịch sử</DrawerSection>
        ),
      },
    ]}
  />
);

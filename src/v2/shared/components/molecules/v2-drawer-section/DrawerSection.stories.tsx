import type { Meta } from "@storybook/react";
import React from "react";
import { DrawerSection } from "./DrawerSection";

const meta: Meta<typeof DrawerSection> = {
  title: "Components/Molecules/Overlay & Menu/V2DrawerSection",
  component: DrawerSection,
  tags: ["autodocs"],
};
export default meta;

const Rows = () => (
  <div className="flex flex-col gap-2 text-xs">
    <div>Dòng 1</div>
    <div>Dòng 2</div>
    <div>Dòng 3</div>
  </div>
);

export const Default = () => (
  <DrawerSection title="Thông tin chung">
    <Rows />
  </DrawerSection>
);

export const WithCountAndExtra = () => (
  <DrawerSection
    title="Danh sách chi tiết"
    count={3}
    titleExtra={<span className="text-xs text-muted-fg">Xuất Excel</span>}
  >
    <Rows />
  </DrawerSection>
);

export const DefaultCollapsed = () => (
  <DrawerSection title="Ghi chú & Điều khoản" defaultCollapsed>
    <Rows />
  </DrawerSection>
);

export const HiddenHeader = () => (
  <DrawerSection hideHeader>
    <Rows />
  </DrawerSection>
);

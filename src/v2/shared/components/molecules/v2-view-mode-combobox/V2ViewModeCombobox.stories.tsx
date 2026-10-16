import type { Meta } from "@storybook/react";
import React, { useState } from "react";
import { V2ViewModeCombobox } from "./V2ViewModeCombobox";

const meta: Meta<typeof V2ViewModeCombobox> = {
  title: "Components/Molecules/Filter & Search/V2ViewModeCombobox",
  component: V2ViewModeCombobox,
  tags: ["autodocs"],
};
export default meta;

export const Default = () => {
  const [active, setActive] = useState("overview");
  return (
    <V2ViewModeCombobox
      items={[
        { key: "overview", label: "Tổng quan", isSystem: true },
        { key: "tax", label: "Thuế", isSystem: true },
        { key: "mine", label: "Của tôi" },
      ]}
      activeKey={active}
      onSelect={setActive}
      onCreate={() => {}}
      onEdit={() => {}}
      onDelete={() => {}}
    />
  );
};

/** Nhóm lọc nằm trong popover, trigger hiện "view • filter" khi đang lọc */
export const WithFilterGroup = () => {
  const [active, setActive] = useState("overview");
  const [filter, setFilter] = useState("all");
  return (
    <V2ViewModeCombobox
      items={[
        { key: "overview", label: "Tổng quan", isSystem: true },
        { key: "mine", label: "Của tôi" },
      ]}
      activeKey={active}
      onSelect={setActive}
      filterGroup={{
        items: [
          { key: "all", label: "Tất cả" },
          { key: "new", label: "Mới", badgeCount: 4 },
          { key: "replace", label: "Thay thế" },
        ],
        activeKey: filter,
        onChange: setFilter,
      }}
    />
  );
};

/** Chỉ có nhóm lọc (ví dụ mobile): không có mục chế độ xem */
export const FilterGroupOnly = () => {
  const [filter, setFilter] = useState("all");
  return (
    <V2ViewModeCombobox
      filterGroup={{
        items: [
          { key: "all", label: "Tất cả" },
          { key: "new", label: "Mới", badgeCount: 4 },
        ],
        activeKey: filter,
        onChange: setFilter,
      }}
    />
  );
};

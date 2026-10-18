import type { Meta } from "@storybook/react";
import React from "react";
import { ClipboardList, Plus, RefreshCw } from "lucide-react";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { V2PageHeader } from "./V2PageHeader";

const meta: Meta<typeof V2PageHeader> = {
  title: "Components/Molecules/Header & Account/V2PageHeader",
  component: V2PageHeader,
  tags: ["autodocs"],
};
export default meta;

const icon = <ClipboardList className="h-5 w-5" />;

export const TitleOnly = () => <V2PageHeader title="Đơn bán hàng" />;

export const WithDescriptionAndIcon = () => (
  <V2PageHeader
    title="Đơn bán hàng"
    description="Danh sách đơn bán hàng và trạng thái xử lý"
    icon={icon}
  />
);

export const WithActions = () => (
  <V2PageHeader
    title="Đơn bán hàng"
    icon={icon}
    actions={
      <>
        <V2Button
          variant="outline"
          size="sm"
          leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
        >
          Làm mới
        </V2Button>
        <V2Button size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />}>
          Tạo đơn
        </V2Button>
      </>
    }
  />
);

export const WithTabToolbars = () => (
  <V2PageHeader
    title="Hóa đơn"
    icon={icon}
    tabKeys={["overview", "in", "out"]}
    activeKey="in"
    register={() => {}}
  />
);

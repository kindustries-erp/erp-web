import type { Meta } from "@storybook/react";
import React from "react";
import { Filter, Maximize2, RefreshCw, Settings2 } from "lucide-react";
import { V2ToolbarIconButton } from "./V2ToolbarIconButton";

const meta: Meta<typeof V2ToolbarIconButton> = {
  title: "V2/Atoms/V2ToolbarIconButton",
  component: V2ToolbarIconButton,
  tags: ["autodocs"],
};
export default meta;

const icon = <Settings2 className="h-4 w-4" />;

export const Default = () => (
  <V2ToolbarIconButton label="Cấu hình cột" icon={icon} />
);
export const Active = () => (
  <V2ToolbarIconButton
    label="Bộ lọc"
    icon={<Filter className="h-4 w-4" />}
    active
  />
);
export const WithBadge = () => (
  <V2ToolbarIconButton
    label="Bộ lọc"
    icon={<Filter className="h-4 w-4" />}
    badge={3}
  />
);
export const Disabled = () => (
  <V2ToolbarIconButton
    label="Làm mới"
    icon={<RefreshCw className="h-4 w-4" />}
    disabled
  />
);
export const Group = () => (
  <div className="flex items-center gap-2">
    <V2ToolbarIconButton
      label="Bộ lọc"
      icon={<Filter className="h-4 w-4" />}
      badge={2}
    />
    <V2ToolbarIconButton label="Cấu hình cột" icon={icon} />
    <V2ToolbarIconButton
      label="Toàn màn hình"
      icon={<Maximize2 className="h-4 w-4" />}
    />
    <V2ToolbarIconButton
      label="Làm mới"
      icon={<RefreshCw className="h-4 w-4" />}
    />
  </div>
);

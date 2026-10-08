import type { Meta } from "@storybook/react";
import React, { useState } from "react";
import { FileText, Link2, Wallet } from "lucide-react";
import { V2TabBar } from "./V2TabBar";
import type { V2TabBarVariant, V2TabItemData } from "./V2TabBar.type";

const meta: Meta<typeof V2TabBar> = {
  title: "V2/Molecules/V2TabBar",
  component: V2TabBar,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};
export default meta;

const TABS: V2TabItemData[] = [
  { key: "detail", label: "Chi tiết", icon: FileText },
  { key: "finance", label: "Tài chính", icon: Wallet, badgeCount: 5 },
  {
    key: "links",
    label: "Chứng từ liên kết",
    icon: Link2,
    dot: true,
    dotColor: "emerald",
  },
  { key: "locked", label: "Đã khóa", disabled: true },
];

const Demo = ({ variant }: { variant: V2TabBarVariant }) => {
  const [active, setActive] = useState("detail");
  return (
    <V2TabBar
      variant={variant}
      tabs={TABS}
      activeTabKey={active}
      onTabChange={setActive}
      extra={<span className="text-xs text-muted-fg">extra</span>}
    />
  );
};

export const App = () => <Demo variant="app" />;
export const Header = () => <Demo variant="header" />;
export const Sub = () => <Demo variant="sub" />;
export const ButtonGroup = () => <Demo variant="button-group" />;
export const Page = () => <Demo variant="page" />;
export const PageManyTabs = () => {
  const [active, setActive] = useState("t0");
  const tabs = Array.from({ length: 14 }, (_, i) => ({
    key: `t${i}`,
    label: `Tab số ${i + 1}`,
  }));
  return (
    <div className="w-[480px]">
      <V2TabBar
        variant="page"
        tabs={tabs}
        activeTabKey={active}
        onTabChange={setActive}
      />
    </div>
  );
};

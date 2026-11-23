import type { Meta } from "@storybook/react";
import React, { useState } from "react";
import { FileText, Link2, Wallet } from "lucide-react";
import { V2TabBar } from "./V2TabBar";
import { V2TabBarVariant, type V2TabItemData } from "./V2TabBar.type";

const meta: Meta<typeof V2TabBar> = {
  title: "Components/Molecules/V2TabBar",
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

export const App = () => <Demo variant={V2TabBarVariant.APP} />;
export const Header = () => <Demo variant={V2TabBarVariant.HEADER} />;
export const Sub = () => <Demo variant={V2TabBarVariant.SUB} />;
export const SubStretch = () => {
  const [active, setActive] = useState("detail");
  return (
    <div className="w-[420px]">
      <V2TabBar
        variant={V2TabBarVariant.SUB}
        stretch
        tabs={TABS.filter((tab) => !tab.disabled)}
        activeTabKey={active}
        onTabChange={setActive}
      />
    </div>
  );
};
export const ButtonGroup = () => (
  <Demo variant={V2TabBarVariant.BUTTON_GROUP} />
);
export const Page = () => <Demo variant={V2TabBarVariant.PAGE} />;
export const Pill = () => <Demo variant={V2TabBarVariant.PILL} />;
export const StatusChip = () => <Demo variant={V2TabBarVariant.STATUS_CHIP} />;
export const PageManyTabs = () => {
  const [active, setActive] = useState("t0");
  const tabs = Array.from({ length: 14 }, (_, i) => ({
    key: `t${i}`,
    label: `Tab số ${i + 1}`,
  }));
  return (
    <div className="w-[480px]">
      <V2TabBar
        variant={V2TabBarVariant.PAGE}
        tabs={tabs}
        activeTabKey={active}
        onTabChange={setActive}
      />
    </div>
  );
};

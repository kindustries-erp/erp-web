import type { Meta } from "@storybook/react";
import React, { useState } from "react";
import { V2PageTabsContext } from "./V2PageTabs.context";
import { V2TabPanel } from "./V2TabPanel";

const meta: Meta<typeof V2TabPanel> = {
  title: "Components/Molecules/Navigation & Sidebar/V2TabPanel",
  component: V2TabPanel,
  tags: ["autodocs"],
};
export default meta;

const KEYS = ["overview", "in", "out"];

export const KeepAliveLazy = () => {
  const [active, setActive] = useState("overview");
  return (
    <V2PageTabsContext.Provider value={{ activeTab: active, slots: {} }}>
      <div className="flex gap-2 pb-3">
        {KEYS.map((k) => (
          <button key={k} type="button" onClick={() => setActive(k)}>
            {k}
          </button>
        ))}
      </div>
      {KEYS.map((k) => (
        <V2TabPanel key={k} tabKey={k}>
          <input defaultValue={`state của tab ${k} được giữ khi đổi tab`} />
        </V2TabPanel>
      ))}
    </V2PageTabsContext.Provider>
  );
};

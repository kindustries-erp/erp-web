import * as React from "react";

export interface V2PageTabsContextValue {
  activeTab: string;
  slots: Record<string, HTMLElement | null>;
}

export const V2PageTabsContext =
  React.createContext<V2PageTabsContextValue | null>(null);

export const V2TabPanelContext = React.createContext<{ tabKey: string } | null>(
  null,
);

export const useV2PageTabs = () => React.useContext(V2PageTabsContext);
export const useV2TabPanelKey = () =>
  React.useContext(V2TabPanelContext)?.tabKey ?? null;

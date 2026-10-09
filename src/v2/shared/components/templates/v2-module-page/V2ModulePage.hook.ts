import * as React from "react";
import type { V2PageTabsContextValue } from "@/v2/shared/components/molecules/v2-tab-panel";
import { useV2ModuleTabState } from "@/v2/shared/hooks/useV2ModuleTabState";
import type { V2ModulePageProps } from "./V2ModulePage.type";

type UseV2ModulePageParams<T> = Pick<
  V2ModulePageProps<T>,
  "tabs" | "activeTab" | "defaultTab" | "onTabChange" | "syncUrl"
>;

export function useV2ModulePage<T>({
  tabs,
  activeTab,
  defaultTab,
  onTabChange,
  syncUrl = true,
}: UseV2ModulePageParams<T>) {
  const tabKeys = React.useMemo(() => tabs.map((tab) => tab.key), [tabs]);

  const urlState = useV2ModuleTabState({ tabKeys, defaultTab });
  const [localTab, setLocalTab] = React.useState(
    defaultTab ?? tabKeys[0] ?? "",
  );
  const useUrl = syncUrl && activeTab === undefined;

  const uncontrolled = useUrl
    ? urlState.activeTab
    : tabKeys.includes(localTab)
      ? localTab
      : (tabKeys[0] ?? "");
  const activeKey = activeTab ?? uncontrolled;

  const [slots, setSlots] = React.useState<Record<string, HTMLElement | null>>(
    {},
  );
  const register = React.useCallback(
    (key: string, el: HTMLElement | null) =>
      setSlots((prev) => (prev[key] === el ? prev : { ...prev, [key]: el })),
    [],
  );

  const { setActiveTab } = urlState;
  const handleTabChange = React.useCallback(
    (key: string) => {
      if (useUrl) setActiveTab(key);
      else setLocalTab(key);
      onTabChange?.(key);
    },
    [useUrl, setActiveTab, onTabChange],
  );

  const context = React.useMemo<V2PageTabsContextValue>(
    () => ({ activeTab: activeKey, slots }),
    [activeKey, slots],
  );

  return { activeKey, tabKeys, register, handleTabChange, context };
}

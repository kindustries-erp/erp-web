import { useV2PageTabs, useV2TabPanelKey } from "./V2PageTabs.context";

/**
 * Slot header của tab chứa component này; ngoài panel thì dùng tab đang active
 * của trang. null thì render toolbar inline.
 */
export function useV2ToolbarPortal(): HTMLElement | null {
  const page = useV2PageTabs();
  const tabKey = useV2TabPanelKey() ?? page?.activeTab ?? null;
  if (!page || !tabKey) return null;
  return page.slots[tabKey] ?? null;
}

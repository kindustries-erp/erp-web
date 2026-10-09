import { renderHook } from "@testing-library/react";
import * as React from "react";
import { describe, expect, it } from "vitest";
import { V2PageTabsContext, V2TabPanelContext } from "./V2PageTabs.context";
import { useV2ToolbarPortal } from "./useV2ToolbarPortal";

const slot = document.createElement("div");

const wrap =
  (
    page: boolean,
    tabKey: string | null,
  ): React.FC<{ children: React.ReactNode }> =>
  ({ children }) => {
    const inner = tabKey ? (
      <V2TabPanelContext.Provider value={{ tabKey }}>
        {children}
      </V2TabPanelContext.Provider>
    ) : (
      children
    );
    return page ? (
      <V2PageTabsContext.Provider
        value={{ activeTab: "a", slots: { a: slot } }}
      >
        {inner}
      </V2PageTabsContext.Provider>
    ) : (
      <>{inner}</>
    );
  };

describe("useV2ToolbarPortal", () => {
  it("trả null ngoài template", () => {
    const { result } = renderHook(() => useV2ToolbarPortal(), {
      wrapper: wrap(false, "a"),
    });
    expect(result.current).toBeNull();
  });

  it("ngoài panel thì dùng slot của tab active", () => {
    const { result } = renderHook(() => useV2ToolbarPortal(), {
      wrapper: wrap(true, null),
    });
    expect(result.current).toBe(slot);
  });

  it("trả slot của đúng panel, null nếu panel chưa có slot", () => {
    const ok = renderHook(() => useV2ToolbarPortal(), {
      wrapper: wrap(true, "a"),
    });
    expect(ok.result.current).toBe(slot);
    const miss = renderHook(() => useV2ToolbarPortal(), {
      wrapper: wrap(true, "b"),
    });
    expect(miss.result.current).toBeNull();
  });
});

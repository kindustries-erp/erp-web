import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import React from "react";
import { V2TabBar } from "./V2TabBar";
import type { V2TabItemData } from "./V2TabBar.type";

vi.mock("@/v2/shared/hooks/useV2Translation", () => ({
  useV2Translation: () => ({
    t: (_key: string, fallback?: unknown) =>
      typeof fallback === "string" ? fallback : _key,
  }),
}));

const tabs: V2TabItemData[] = [
  { key: "week", id: "week", label: "Tuần" },
  { key: "month", id: "month", label: "Tháng" },
];

describe("V2TabBar variant=sub stretch", () => {
  it("không truyền stretch thì tab giữ kích thước theo nội dung", () => {
    render(
      <V2TabBar
        variant="sub"
        tabs={tabs}
        activeTabKey="month"
        onTabChange={vi.fn()}
      />,
    );

    const tab = screen.getByRole("tab", { name: "Tuần" });
    expect(tab.className).toContain("shrink-0");
    expect(tab.className).not.toContain("flex-1");
  });

  it("stretch chia đều các tab trên toàn chiều ngang", () => {
    render(
      <V2TabBar
        variant="sub"
        stretch
        tabs={tabs}
        activeTabKey="month"
        onTabChange={vi.fn()}
      />,
    );

    const tab = screen.getByRole("tab", { name: "Tuần" });
    expect(tab.className).toContain("flex-1");
    expect(tab.className).toContain("justify-center");
    expect(tab.className).not.toContain("shrink-0");
  });

  it("stretch không ảnh hưởng variant button-group", () => {
    render(
      <V2TabBar
        variant="button-group"
        stretch
        tabs={tabs}
        activeTabKey="month"
        onTabChange={vi.fn()}
      />,
    );

    const tab = screen.getByRole("tab", { name: "Tuần" });
    expect(tab.className).toContain("shrink-0");
    expect(tab.className).not.toContain("flex-1");
  });
});

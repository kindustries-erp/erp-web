import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DashboardTemplate } from "../DashboardTemplate";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: unknown) =>
      typeof fallback === "string" ? fallback : key,
  }),
}));

describe("DashboardTemplate - nút chính", () => {
  it("có onCreate + createActions: nút chính gọi onCreate, dropdown gọi action", async () => {
    const user = userEvent.setup();
    const onCreate = vi.fn();
    const onExport = vi.fn();

    render(
      <DashboardTemplate
        title="Tổng quan"
        onCreate={onCreate}
        createLabel="Đồng bộ"
        createActions={[
          {
            groupLabel: "Báo cáo & Xuất file",
            items: [{ label: "Xuất Excel", onClick: onExport }],
          },
        ]}
      >
        <div />
      </DashboardTemplate>,
    );

    await user.click(screen.getByRole("button", { name: /Đồng bộ/ }));
    expect(onCreate).toHaveBeenCalledTimes(1);

    // Nút mũi tên (không có tên) mở dropdown
    const buttons = screen.getAllByRole("button");
    const chevron = buttons.find(
      (b) => b.getAttribute("aria-haspopup") === "menu",
    );
    expect(chevron).toBeDefined();
    await user.click(chevron!);
    await user.click(screen.getByText("Xuất Excel"));
    expect(onExport).toHaveBeenCalledTimes(1);
    expect(onCreate).toHaveBeenCalledTimes(1);
  });

  it("không truyền onCreate/createActions thì không render nút chính", () => {
    render(
      <DashboardTemplate title="Tổng quan">
        <div />
      </DashboardTemplate>,
    );
    expect(screen.queryByRole("button", { name: /Đồng bộ/ })).toBeNull();
  });
});

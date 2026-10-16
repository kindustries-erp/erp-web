import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { GarageOpexDrawer } from "./GarageOpexDrawer";
import { CATEGORY_PRESETS } from "./garage-opex-drawer.constants";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, defaultVal: string) => defaultVal,
  }),
}));

vi.mock("@/shared/components/StandardFormDrawer", () => ({
  StandardFormDrawer: ({ open, title, leftPanel }: any) =>
    open ? (
      <div data-testid="standard-form-drawer">
        <h1>{title}</h1>
        <div>{leftPanel}</div>
      </div>
    ) : null,
}));

describe("GarageOpexDrawer Component", () => {
  it("renders when open is true", () => {
    render(
      <GarageOpexDrawer
        open={true}
        onClose={vi.fn()}
        mode="view"
        setMode={vi.fn()}
        isCreate={false}
      />,
    );

    expect(screen.getByTestId("standard-form-drawer")).toBeInTheDocument();
  });

  it("shows read-only notice for an opex row recorded from a cashflow voucher", () => {
    render(
      <GarageOpexDrawer
        open={true}
        onClose={vi.fn()}
        mode="view"
        setMode={vi.fn()}
        isCreate={false}
        id="opex-1"
        initialData={
          {
            id: "opex-1",
            periodYear: 2026,
            periodMonth: 10,
            period: "10/2026",
            categoryKey: "CHI_PHI_TRUC_TIEP_KHAC",
            categoryName: "Chi phí trực tiếp khác (Tính vào Giá vốn)",
            amount: 1200000,
            sourceCashflowVoucherId: "voucher-1",
            createdAt: "",
            updatedAt: "",
          } as any
        }
      />,
    );

    expect(
      screen.getByText(
        "Khoản chi này được ghi nhận từ phiếu chi garage (Chỉ đọc). Vui lòng chỉnh sửa tại Thu chi garage.",
      ),
    ).toBeInTheDocument();
  });

  it("VAT_TU_TIEU_HAO (Vật tư tiêu hao) thuộc nhóm COGS (Giá vốn)", () => {
    const preset = CATEGORY_PRESETS.find((p) => p.key === "VAT_TU_TIEU_HAO");
    expect(preset?.group).toBe("COGS");
  });

  it("HHBH thuộc nhóm COMMISSION (Hoa hồng)", () => {
    const preset = CATEGORY_PRESETS.find((p) => p.key === "HHBH");
    expect(preset?.group).toBe("COMMISSION");
  });
});

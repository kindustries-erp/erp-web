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

  it("does NOT contain VAT_TU_TIEU_HAO (Vật tư tiêu hao) in CATEGORY_PRESETS", () => {
    const vatTuTieuHao = CATEGORY_PRESETS.find(
      (preset) => preset.key === "VAT_TU_TIEU_HAO",
    );
    expect(vatTuTieuHao).toBeUndefined();
  });
});

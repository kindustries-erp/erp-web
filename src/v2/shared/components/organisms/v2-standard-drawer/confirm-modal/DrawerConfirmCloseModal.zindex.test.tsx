import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DrawerConfirmCloseModal } from "./DrawerConfirmCloseModal";

vi.mock("@/v2/shared/hooks/useV2Translation", () => ({
  useV2Translation: () => ({
    t: (_key: string, fallback?: unknown) =>
      typeof fallback === "string" ? fallback : _key,
  }),
}));

describe("DrawerConfirmCloseModal z-index", () => {
  it("hộp xác nhận và lớp phủ nằm trên các drawer xếp chồng (z 699/700)", () => {
    render(
      <DrawerConfirmCloseModal open onConfirm={vi.fn()} onCancel={vi.fn()} />,
    );

    expect(document.querySelector(".z-\\[699\\]")).not.toBeNull();
    const dialog = screen.getByRole("dialog");
    expect(dialog.className).toContain("z-[700]");
    expect(dialog.className).not.toMatch(/\bz-50\b/);
  });
});

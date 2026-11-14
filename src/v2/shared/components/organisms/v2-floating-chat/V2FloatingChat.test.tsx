import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { V2FloatingChat } from "./V2FloatingChat";

const viewport = { isMobile: false };
vi.mock("@/v2/shared/hooks/useViewport", () => ({
  useViewport: () => viewport,
}));
vi.mock("@/v2/shared/hooks/useV2Translation", () => ({
  useV2Translation: () => ({
    t: (_k: string, fallback: string) => fallback,
    locale: "vi",
  }),
}));

const setup = (open: boolean, onOpenChange = vi.fn()) => {
  render(
    <V2FloatingChat
      open={open}
      onOpenChange={onOpenChange}
      title="Trợ lý hóa đơn"
      launcherLabel="Mở trợ lý"
      footer={<button>Chọn file</button>}
    >
      <p>Tin nhắn</p>
    </V2FloatingChat>,
  );
  return onOpenChange;
};

describe("V2FloatingChat", () => {
  beforeEach(() => {
    viewport.isMobile = false;
  });

  it("desktop đóng: chỉ có nút nổi, bấm thì mở", () => {
    const onOpenChange = setup(false);
    expect(screen.queryByTestId("v2-floating-chat-panel")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Mở trợ lý" }));
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it("desktop mở: panel có tiêu đề, nội dung, footer; đóng bằng nút và Escape", () => {
    const onOpenChange = setup(true);
    const panel = screen.getByRole("dialog", { name: "Trợ lý hóa đơn" });
    expect(panel.textContent).toContain("Tin nhắn");
    expect(screen.getByText("Chọn file")).toBeDefined();
    expect(screen.queryByRole("button", { name: "Mở trợ lý" })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Đóng" }));
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onOpenChange.mock.calls).toEqual([[false], [false]]);
  });

  it("mobile: nút nổi nằm trên vùng an toàn, mở ra bottom sheet", () => {
    viewport.isMobile = true;
    setup(false);
    const launcher = screen.getByRole("button", { name: "Mở trợ lý" });
    expect(launcher.className).toContain("safe-area-inset-bottom");
  });

  it("mobile mở: nội dung nằm trong bottom sheet", () => {
    viewport.isMobile = true;
    setup(true);
    expect(screen.getByTestId("v2-bottom-sheet-content")).toBeDefined();
    expect(
      screen.getByTestId("v2-floating-chat-sheet-body").textContent,
    ).toContain("Tin nhắn");
    expect(screen.queryByTestId("v2-floating-chat-panel")).toBeNull();
  });
});

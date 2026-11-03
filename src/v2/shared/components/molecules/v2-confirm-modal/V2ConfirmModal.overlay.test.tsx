import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { V2ConfirmModal } from "./V2ConfirmModal";

vi.mock("@/v2/shared/hooks/useV2Translation", () => ({
  useV2Translation: () => ({
    t: (_key: string, fallback?: unknown) =>
      typeof fallback === "string" ? fallback : _key,
  }),
}));

const baseProps = {
  open: true,
  message: "Bạn có chắc không?",
  onConfirm: vi.fn(),
  onCancel: vi.fn(),
};

describe("V2ConfirmModal overlayClassName", () => {
  it("gắn overlayClassName vào lớp phủ nền", () => {
    render(<V2ConfirmModal {...baseProps} overlayClassName="z-[699]" />);

    const overlay = document.querySelector('[data-state="open"].z-\\[699\\]');
    expect(overlay).not.toBeNull();
  });

  it("không thêm class khi không truyền overlayClassName", () => {
    render(<V2ConfirmModal {...baseProps} />);

    expect(document.querySelector(".z-\\[699\\]")).toBeNull();
  });
});

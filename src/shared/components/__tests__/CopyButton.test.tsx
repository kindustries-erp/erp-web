import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { CopyButton, CopyIconBtn, copyToClipboard } from "../CopyButton";

describe("CopyButton Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it("renders with default copy icon", () => {
    render(<CopyButton value="TEST_TEXT" title="Sao chép" />);
    const btn = screen.getByRole("button", { name: "Sao chép" });
    expect(btn).toBeDefined();
  });

  it("copies text and switches to check icon on click", async () => {
    vi.useFakeTimers();
    render(<CopyButton value="HELLO_WORLD" title="Sao chép" timeout={1000} />);
    const btn = screen.getByRole("button", { name: "Sao chép" });

    await act(async () => {
      fireEvent.click(btn);
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("HELLO_WORLD");
    expect(btn.getAttribute("aria-label")).toBe("Đã sao chép");

    // Fast-forward timeout
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(btn.getAttribute("aria-label")).toBe("Sao chép");
    vi.useRealTimers();
  });

  it("calls onCopy callback when copied", async () => {
    const onCopyMock = vi.fn();
    render(
      <CopyButton value="CALLBACK_TEST" title="Sao chép" onCopy={onCopyMock} />,
    );
    const btn = screen.getByRole("button", { name: "Sao chép" });

    await act(async () => {
      fireEvent.click(btn);
    });

    expect(onCopyMock).toHaveBeenCalledWith("CALLBACK_TEST");
  });

  it("CopyIconBtn alias works properly", async () => {
    render(<CopyIconBtn text="ALIAS_TEST" title="Sao chép" />);
    const btn = screen.getByRole("button", { name: "Sao chép" });
    expect(btn.className).toContain("ml-2");

    await act(async () => {
      fireEvent.click(btn);
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("ALIAS_TEST");
  });

  it("copyToClipboard function returns true on success", async () => {
    const res = await copyToClipboard("TEST_STR");
    expect(res).toBe(true);
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { V2CopyButton } from "./V2CopyButton";
import { copyTextToClipboard } from "./V2CopyButton.helper";

const writeText = vi.fn().mockResolvedValue(undefined);

describe("V2CopyButton", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    writeText.mockClear();
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });
  });
  afterEach(() => vi.useRealTimers());

  it("copies the value and shows a confirmation, then resets", async () => {
    const onCopy = vi.fn();
    render(
      <V2CopyButton value="C26TGA-1474" onCopy={onCopy} timeoutMs={1000} />,
    );
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Sao chép" }));
    });
    expect(writeText).toHaveBeenCalledWith("C26TGA-1474");
    expect(onCopy).toHaveBeenCalledWith("C26TGA-1474");
    expect(
      screen.getByRole("button", { name: "Đã sao chép" }),
    ).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(
      screen.getByRole("button", { name: "Sao chép" }),
    ).toBeInTheDocument();
  });

  it("does not bubble the click to a clickable row", async () => {
    const onRowClick = vi.fn();
    render(
      <div onClick={onRowClick}>
        <V2CopyButton value="x" />
      </div>,
    );
    await act(async () => {
      fireEvent.click(screen.getByRole("button"));
    });
    expect(onRowClick).not.toHaveBeenCalled();
  });
});

describe("copyTextToClipboard", () => {
  it("returns false for an empty string", async () => {
    expect(await copyTextToClipboard("")).toBe(false);
  });

  it("falls back to execCommand when the clipboard API is missing", async () => {
    Object.defineProperty(navigator, "clipboard", {
      value: undefined,
      configurable: true,
    });
    document.execCommand = vi.fn().mockReturnValue(true);
    expect(await copyTextToClipboard("abc")).toBe(true);
    expect(document.execCommand).toHaveBeenCalledWith("copy");
  });
});

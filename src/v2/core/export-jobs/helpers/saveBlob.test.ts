import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { saveBlob } from "./saveBlob";

describe("saveBlob", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    window.URL.createObjectURL = vi.fn(() => "blob:test");
    window.URL.revokeObjectURL = vi.fn();
  });
  afterEach(() => vi.useRealTimers());

  it("clicks a hidden anchor with the file name then cleans up after 2s", () => {
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});

    saveBlob(new Blob(["x"]), "file.xlsx");

    const anchor = document.querySelector("a[download]") as HTMLAnchorElement;
    expect(anchor.download).toBe("file.xlsx");
    expect(anchor.style.display).toBe("none");
    expect(click).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(2000);
    expect(document.querySelector("a[download]")).toBeNull();
    expect(window.URL.revokeObjectURL).toHaveBeenCalledWith("blob:test");
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import * as viewportHook from "@/v2/shared/hooks/useViewport";
import { Sheet, SheetContent, SheetTitle } from "@/v2/shared/ui/sheet";
import { V2MultiCombobox } from "./V2MultiCombobox";

const options = [
  { value: "b1", label: "ĐT — Đào Trì" },
  { value: "b2", label: "PQ — Phú Quang" },
];

const mockViewport = () =>
  vi.spyOn(viewportHook, "useViewport").mockReturnValue({
    width: 1280,
    height: 800,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  });

describe("V2MultiCombobox inside modal Sheet", () => {
  beforeEach(() => mockViewport());
  afterEach(() => vi.restoreAllMocks());

  it("lets the user pick an option from the popover opened inside a Sheet", () => {
    const onValueChange = vi.fn();
    render(
      <Sheet open onOpenChange={() => {}}>
        <SheetContent side="right" hideCloseButton>
          <SheetTitle className="sr-only">Chi tiết</SheetTitle>
          <V2MultiCombobox
            options={options}
            value={[]}
            onValueChange={onValueChange}
          />
        </SheetContent>
      </Sheet>,
    );

    fireEvent.click(screen.getByRole("combobox"));
    const listbox = screen.getByRole("listbox");
    fireEvent.click(within(listbox).getByText("ĐT — Đào Trì"));

    expect(onValueChange).toHaveBeenCalledWith(["b1"]);
  });
});

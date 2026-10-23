import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

const renderInsideSheet = (onValueChange: (value: string[]) => void) =>
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

describe("V2MultiCombobox inside modal Sheet", () => {
  beforeEach(() => mockViewport());
  afterEach(() => vi.restoreAllMocks());

  it("opens the popover inside a Sheet", () => {
    renderInsideSheet(() => {});
    fireEvent.click(screen.getByRole("combobox"));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("lets the user pick an option from the popover (pointer click)", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderInsideSheet(onValueChange);

    await user.click(screen.getByRole("combobox"));
    const listbox = screen.getByRole("listbox");
    await user.click(within(listbox).getByText("ĐT — Đào Trì"));

    expect(onValueChange).toHaveBeenCalledWith(["b1"]);
  });

  // jsdom does not inherit pointer-events from <body>, so user-event cannot see the
  // real browser hit-test problem. Guard the class that re-enables clicks on the content.
  it("keeps the popover content clickable while a Sheet sets body pointer-events:none", () => {
    renderInsideSheet(() => {});
    fireEvent.click(screen.getByRole("combobox"));
    const content = screen
      .getByRole("listbox")
      .closest("[data-radix-popper-content-wrapper]")?.firstElementChild;
    expect(content).toHaveClass("pointer-events-auto");
  });
});

import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Popover } from "@/core/components/ui/Popover";

describe("Popover (reusable)", () => {
  it("renders trigger but not content initially", () => {
    render(
      <Popover content={<span>Popover content</span>}>
        <button>Open</button>
      </Popover>,
    );

    expect(screen.getByRole("button", { name: "Open" })).toBeInTheDocument();
    expect(screen.queryByText("Popover content")).not.toBeInTheDocument();
  });

  it("shows content when trigger is clicked", () => {
    render(
      <Popover content={<span>Popover content</span>}>
        <button>Open</button>
      </Popover>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByText("Popover content")).toBeInTheDocument();
  });

  it("supports controlled open state", () => {
    render(
      <Popover open={true} content={<span>Always visible</span>}>
        <button>Trigger</button>
      </Popover>,
    );

    expect(screen.getByText("Always visible")).toBeInTheDocument();
  });

  it("calls onOpenChange when toggled", () => {
    let opened = false;
    render(
      <Popover
        content={<span>Content</span>}
        onOpenChange={(v) => {
          opened = v;
        }}
      >
        <button>Toggle</button>
      </Popover>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Toggle" }));
    expect(opened).toBe(true);
  });
});

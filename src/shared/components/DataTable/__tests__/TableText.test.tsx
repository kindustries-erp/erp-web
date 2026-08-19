import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TooltipProvider } from "@/core/components/ui/Tooltip";
import { TableText } from "../TableText";

// Mock matchMedia for Radix UI
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
  },
});

const renderWithProviders = (ui: React.ReactElement) => {
  return render(<TooltipProvider>{ui}</TooltipProvider>);
};

describe("TableText", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders text correctly", () => {
    renderWithProviders(<TableText text="Hello World" />);
    expect(screen.getByText("Hello World")).toBeInTheDocument();
  });

  it("calls onDrawerClick when drawer icon is clicked", () => {
    const handleDrawerClick = vi.fn();
    const { container } = renderWithProviders(
      <TableText text="Drawer" onDrawerClick={handleDrawerClick} />,
    );
    // Find the button wrapping the drawer icon (first button if no copy)
    const button = container.querySelector("button");
    if (button) fireEvent.click(button);
    expect(handleDrawerClick).toHaveBeenCalledTimes(1);
  });

  it("copies text to clipboard when copy icon is clicked", () => {
    const { container } = renderWithProviders(
      <TableText text="CopyMe" enableCopy />,
    );
    // The copy button is the only button in this render
    const button = container.querySelector("button");
    if (button) fireEvent.click(button);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("CopyMe");
  });

  it("calls onDetailClick when detail (eye) icon is clicked", () => {
    const handleDetailClick = vi.fn();
    const { container } = renderWithProviders(
      <TableText text="Invoice #001" onDetailClick={handleDetailClick} />,
    );
    const button = container.querySelector("button");
    if (button) fireEvent.click(button);
    expect(handleDetailClick).toHaveBeenCalledTimes(1);
  });

  it("renders both onDetailClick and onDrawerClick simultaneously", () => {
    const handleDetailClick = vi.fn();
    const handleDrawerClick = vi.fn();
    const { container } = renderWithProviders(
      <TableText
        text="Invoice with both"
        onDetailClick={handleDetailClick}
        onDrawerClick={handleDrawerClick}
      />,
    );
    const buttons = container.querySelectorAll("button");
    expect(buttons.length).toBe(2);
    fireEvent.click(buttons[0]);
    expect(handleDetailClick).toHaveBeenCalledTimes(1);
    fireEvent.click(buttons[1]);
    expect(handleDrawerClick).toHaveBeenCalledTimes(1);
  });

  it("renders popover trigger when popoverContent is provided", () => {
    const { container } = renderWithProviders(
      <TableText
        text="PopoverText"
        popoverContent={<div>Popover Content</div>}
      />,
    );
    // The popover trigger button
    const button = container.querySelector("button");
    expect(button).toBeInTheDocument();

    // Test if Radix popover opens (might require async or specific radix handling)
    if (button) fireEvent.click(button);
    // Popover content is rendered in a portal, so we check document body
    expect(document.body.textContent).toContain("Popover Content");
  });
});

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { AppTabs } from "../AppTabs";

describe("AppTabs", () => {
  const mockTabs = [
    { key: "tab1", label: "Tab 1", content: <div>Tab 1 Content</div> },
    { key: "tab2", label: "Tab 2", content: <div>Tab 2 Content</div> },
    { key: "tab3", label: "Tab 3", content: <div>Tab 3 Content</div> },
  ];

  it("renders tabs and default active content", () => {
    render(<AppTabs tabs={mockTabs} defaultValue="tab1" />);

    expect(screen.getByText("Tab 1")).toBeInTheDocument();
    expect(screen.getByText("Tab 2")).toBeInTheDocument();
    expect(screen.getByText("Tab 1 Content")).toBeInTheDocument();
  });

  it("switches content with animation when clicked", async () => {
    const onValueChange = vi.fn();
    render(
      <AppTabs
        tabs={mockTabs}
        defaultValue="tab1"
        onValueChange={onValueChange}
      />,
    );

    fireEvent.click(screen.getByText("Tab 2"));
    expect(onValueChange).toHaveBeenCalledWith("tab2");

    await waitFor(() => {
      expect(screen.getByText("Tab 2 Content")).toBeInTheDocument();
    });
  });
});

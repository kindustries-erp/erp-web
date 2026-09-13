import React, { useState } from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { TabSlideTransition } from "../TabSlideTransition";

describe("TabSlideTransition", () => {
  it("renders active children content correctly", () => {
    render(
      <TabSlideTransition activeKey="tab1" tabKeys={["tab1", "tab2"]}>
        <div>Content of Tab 1</div>
      </TabSlideTransition>,
    );

    expect(screen.getByText("Content of Tab 1")).toBeInTheDocument();
  });

  it("switches content when activeKey changes", async () => {
    function TestTabs() {
      const [activeTab, setActiveTab] = useState("tab1");
      return (
        <div>
          <button onClick={() => setActiveTab("tab1")}>Tab 1</button>
          <button onClick={() => setActiveTab("tab2")}>Tab 2</button>
          <TabSlideTransition activeKey={activeTab} tabKeys={["tab1", "tab2"]}>
            {activeTab === "tab1" ? <div>Content 1</div> : <div>Content 2</div>}
          </TabSlideTransition>
        </div>
      );
    }

    render(<TestTabs />);
    expect(screen.getByText("Content 1")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Tab 2"));

    await waitFor(() => {
      expect(screen.getByText("Content 2")).toBeInTheDocument();
    });
  });

  it("handles backward navigation with correct tabKeys", async () => {
    function TestNav() {
      const [activeTab, setActiveTab] = useState("tab3");
      return (
        <div>
          <button onClick={() => setActiveTab("tab1")}>Go to Tab 1</button>
          <TabSlideTransition
            activeKey={activeTab}
            tabKeys={["tab1", "tab2", "tab3"]}
          >
            <div>{activeTab === "tab1" ? "tab1 Content" : "tab3 Content"}</div>
          </TabSlideTransition>
        </div>
      );
    }

    render(<TestNav />);
    expect(screen.getByText("tab3 Content")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Go to Tab 1"));

    await waitFor(() => {
      expect(screen.getByText("tab1 Content")).toBeInTheDocument();
    });
  });

  it("supports fadeOnly mode and custom classNames", () => {
    const { container } = render(
      <TabSlideTransition
        activeKey="tabA"
        fadeOnly={true}
        className="custom-transition-class"
        contentClassName="custom-content-class"
      >
        <div>Fade Only Content</div>
      </TabSlideTransition>,
    );

    expect(screen.getByText("Fade Only Content")).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("custom-transition-class");
  });
});

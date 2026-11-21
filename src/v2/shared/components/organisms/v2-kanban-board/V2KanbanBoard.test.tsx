import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { V2KanbanBoard } from "./V2KanbanBoard";
import { findItemAndLane, moveItemBetweenLanes } from "./V2KanbanBoard.helper";
import type { V2KanbanLaneData } from "./V2KanbanBoard.type";

interface MockCardItem {
  id: string;
  title: string;
  category: string;
}

const mockLanes: V2KanbanLaneData<MockCardItem>[] = [
  {
    id: "TODO",
    title: "Cần làm",
    badgeCount: 2,
    subtotalLabel: "2 việc",
    accentColor: "#3b82f6",
    items: [
      { id: "task-1", title: "Việc 1", category: "A" },
      { id: "task-2", title: "Việc 2", category: "B" },
    ],
  },
  {
    id: "IN_PROGRESS",
    title: "Đang làm",
    badgeCount: 1,
    subtotalLabel: "1 việc",
    accentColor: "#f59e0b",
    items: [{ id: "task-3", title: "Việc 3", category: "C" }],
  },
  {
    id: "DONE",
    title: "Hoàn thành",
    badgeCount: 0,
    subtotalLabel: "0 việc",
    accentColor: "#10b981",
    items: [],
  },
];

describe("V2KanbanBoard Component", () => {
  it("renders all lanes and cards correctly", () => {
    render(
      <V2KanbanBoard<MockCardItem>
        lanes={mockLanes}
        getItemId={(item) => item.id}
        renderCard={(item) => (
          <div data-testid={`card-${item.id}`}>{item.title}</div>
        )}
      />,
    );

    expect(screen.getByText("Cần làm")).toBeInTheDocument();
    expect(screen.getByText("Đang làm")).toBeInTheDocument();
    expect(screen.getByText("Hoàn thành")).toBeInTheDocument();

    expect(screen.getByTestId("card-task-1")).toHaveTextContent("Việc 1");
    expect(screen.getByTestId("card-task-2")).toHaveTextContent("Việc 2");
    expect(screen.getByTestId("card-task-3")).toHaveTextContent("Việc 3");
  });

  it("displays empty lane message when lane has no items", () => {
    render(
      <V2KanbanBoard<MockCardItem>
        lanes={mockLanes}
        getItemId={(item) => item.id}
        renderCard={(item) => <div>{item.title}</div>}
        emptyLaneMessage="Không có việc nào"
      />,
    );

    expect(screen.getByText("Không có việc nào")).toBeInTheDocument();
  });

  it("helper findItemAndLane finds items correctly", () => {
    const found = findItemAndLane(mockLanes, "task-3", (i) => i.id);
    expect(found).not.toBeNull();
    expect(found?.lane.id).toBe("IN_PROGRESS");
    expect(found?.item.title).toBe("Việc 3");
    expect(found?.index).toBe(0);

    const notFound = findItemAndLane(mockLanes, "non-existent", (i) => i.id);
    expect(notFound).toBeNull();
  });

  it("helper moveItemBetweenLanes moves items between lanes", () => {
    const updatedLanes = moveItemBetweenLanes(
      JSON.parse(JSON.stringify(mockLanes)),
      "TODO",
      "DONE",
      "task-1",
      0,
      (i: MockCardItem) => i.id,
    );

    const todoLane = updatedLanes.find((l) => l.id === "TODO");
    const doneLane = updatedLanes.find((l) => l.id === "DONE");

    expect(todoLane?.items.map((i) => i.id)).toEqual(["task-2"]);
    expect(doneLane?.items.map((i) => i.id)).toEqual(["task-1"]);
  });
});

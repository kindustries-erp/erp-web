import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { V2KanbanBoardProps } from "@/v2/shared/components/organisms/v2-kanban-board";
import {
  WORKSHOP_FIXTURE_NOW,
  workshopCaseFixture,
} from "../../workshop/garageWorkshop.fixtures";
import type { WorkshopCaseView } from "../../workshop";
import { GarageWorkshopBoard } from "./GarageWorkshopBoard";
import { GarageWorkshopMobileList } from "./GarageWorkshopMobileList";

let boardProps: V2KanbanBoardProps<WorkshopCaseView> | null = null;
vi.mock("@/v2/shared/components/organisms/v2-kanban-board", () => ({
  V2KanbanBoard: (p: V2KanbanBoardProps<WorkshopCaseView>) => {
    boardProps = p;
    return (
      <div>
        {p.lanes.map((l) => (
          <section key={l.id} data-testid={`lane-${l.id}`}>
            {l.title} ({l.badgeCount})
            {l.items.map((it) => (
              <div key={it.id}>{p.renderCard(it, l.id)}</div>
            ))}
          </section>
        ))}
      </div>
    );
  },
}));

const items = [
  workshopCaseFixture({ id: "a", licensePlate: "30A-1", progressStage: "QC" }),
  workshopCaseFixture({
    id: "b",
    licensePlate: "30A-2",
    progressStage: "WAITING_PARTS",
  }),
  workshopCaseFixture({
    id: "c",
    licensePlate: "30A-3",
    status: "INTAKE",
    progressStage: null,
  }),
];
const NOW = WORKSHOP_FIXTURE_NOW;

describe("GarageWorkshopBoard", () => {
  it("5 cột status v2 có số xe; trong cột xếp theo thứ tự status nhỏ", () => {
    render(
      <GarageWorkshopBoard
        items={items}
        now={NOW}
        canMoveStatus
        onOpen={vi.fn()}
      />,
    );
    expect(boardProps?.lanes.map((l) => l.id)).toEqual([
      "INTAKE",
      "QUOTED",
      "IN_PROGRESS",
      "COMPLETED",
      "CANCELLED",
    ]);
    expect(screen.getByTestId("lane-IN_PROGRESS")).toHaveTextContent(
      "Đang làm (2)",
    );
    expect(boardProps?.lanes[2].items.map((i) => i.id)).toEqual(["b", "a"]);
    expect(boardProps?.isDragDisabled).toBe(false);
  });

  it("thả sang cột khác gọi onMoveStatus; cùng cột thì bỏ qua; không quyền thì khóa kéo", () => {
    const onMove = vi.fn();
    const onInvalid = vi.fn();
    const { rerender } = render(
      <GarageWorkshopBoard
        items={items}
        now={NOW}
        canMoveStatus
        onMoveStatus={onMove}
        onInvalidMove={onInvalid}
        onOpen={vi.fn()}
      />,
    );
    const drop = (target: string) =>
      boardProps?.onCardDrop?.({
        itemId: "a",
        item: items[0],
        sourceLaneId: "IN_PROGRESS",
        targetLaneId: target,
        targetIndex: 0,
      });
    drop("IN_PROGRESS");
    expect(onMove).not.toHaveBeenCalled();
    drop("COMPLETED");
    expect(onMove).toHaveBeenCalledWith(items[0], "COMPLETED");
    // Xe ERP Đang làm không về Tiếp nhận: chặn ở client, báo trang.
    drop("INTAKE");
    expect(onMove).toHaveBeenCalledTimes(1);
    expect(onInvalid).toHaveBeenCalledWith(items[0], "INTAKE");
    rerender(
      <GarageWorkshopBoard
        items={items}
        now={NOW}
        canMoveStatus={false}
        onOpen={vi.fn()}
      />,
    );
    expect(boardProps?.isDragDisabled).toBe(true);
  });

  it("chạm thẻ mở xe", () => {
    const onOpen = vi.fn();
    render(
      <GarageWorkshopBoard
        items={items}
        now={NOW}
        canMoveStatus
        onOpen={onOpen}
      />,
    );
    fireEvent.click(screen.getByTestId("workshop-card-c"));
    expect(onOpen).toHaveBeenCalledWith(items[2]);
  });
});

describe("GarageWorkshopMobileList", () => {
  it("mặc định mở tab Đang làm, đổi tab thì đổi danh sách, tab rỗng hiện thông báo", () => {
    const onOpen = vi.fn();
    render(
      <GarageWorkshopMobileList items={items} now={NOW} onOpen={onOpen} />,
    );
    const list = screen.getByTestId("workshop-mobile-list");
    expect(within(list).getByTestId("workshop-card-a")).toBeInTheDocument();
    expect(within(list).queryByTestId("workshop-card-c")).toBeNull();
    fireEvent.click(within(list).getByRole("tab", { name: /Tiếp nhận/ }));
    expect(within(list).getByTestId("workshop-card-c")).toBeInTheDocument();
    fireEvent.click(within(list).getByTestId("workshop-card-c"));
    expect(onOpen).toHaveBeenCalledWith(items[2]);
    fireEvent.click(within(list).getByRole("tab", { name: /Hủy/ }));
    expect(within(list).getByText("Không có xe")).toBeInTheDocument();
  });
});

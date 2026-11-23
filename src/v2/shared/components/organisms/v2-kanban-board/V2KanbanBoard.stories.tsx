import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { V2KanbanBoard } from "./V2KanbanBoard";
import { moveItemBetweenLanes } from "./V2KanbanBoard.helper";
import type { V2KanbanLaneData, V2KanbanDropEvent } from "./V2KanbanBoard.type";
import { V2Badge } from "@/v2/shared/components/atoms/v2-badge";

interface DemoCard {
  id: string;
  title: string;
  assignee: string;
}

const initialLanes: V2KanbanLaneData<DemoCard>[] = [
  {
    id: "TODO",
    title: "Tiếp nhận",
    badgeCount: 2,
    accentColor: "#64748b",
    accentClassName: "bg-muted-fg",
    items: [
      { id: "c-1", title: "Thay nhớt & lọc dầu", assignee: "KTV Nam" },
      { id: "c-2", title: "Kiểm tra hệ thống phanh", assignee: "KTV Hưng" },
    ],
  },
  {
    id: "IN_PROGRESS",
    title: "Đang sửa",
    badgeCount: 1,
    accentColor: "#f59e0b",
    accentClassName: "bg-warning",
    items: [{ id: "c-3", title: "Sơn dặm cản trước", assignee: "KTV Tuấn" }],
  },
  {
    id: "DONE",
    title: "Hoàn tất",
    badgeCount: 1,
    accentColor: "#10b981",
    accentClassName: "bg-success",
    items: [{ id: "c-4", title: "Rửa khoang máy", assignee: "KTV Long" }],
  },
];

const meta: Meta<typeof V2KanbanBoard> = {
  title: "Components/Organisms/V2KanbanBoard",
  component: V2KanbanBoard,
};

export default meta;

const KanbanBoardDemo: React.FC = () => {
  const [lanes, setLanes] = useState(initialLanes);

  const handleDrop = (e: V2KanbanDropEvent<DemoCard>) => {
    setLanes((prev) =>
      moveItemBetweenLanes(
        prev,
        e.sourceLaneId,
        e.targetLaneId,
        e.itemId,
        e.targetIndex,
        (i) => i.id,
      ),
    );
  };

  return (
    <div className="p-4 bg-background min-h-[500px]">
      <V2KanbanBoard<DemoCard>
        lanes={lanes}
        getItemId={(i) => i.id}
        onCardDrop={handleDrop}
        renderCard={(item) => (
          <div className="p-3 bg-surface border border-border/80 rounded-xl shadow-xs space-y-1.5">
            <div className="text-xs font-semibold text-foreground">
              {item.title}
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-fg">
              <span>{item.assignee}</span>
              <V2Badge variant="outline" className="text-[10px]">
                Xe
              </V2Badge>
            </div>
          </div>
        )}
      />
    </div>
  );
};

export const Default: StoryObj = {
  render: () => <KanbanBoardDemo />,
};

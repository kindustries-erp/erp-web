import {
  type WorkflowCanvasDefinition,
  type WorkflowCanvasEdge,
  type WorkflowCanvasIconName,
  type WorkflowCanvasLane,
  type WorkflowCanvasNode,
  type WorkflowCanvasTone,
} from "@/v2/core/workflow";

import { txt } from "./procurementWorkflow.text";

const ROW_TOP = 64;
const ROW_GAP = 48;
const ROW_HEIGHT = 170;
const ROW_COUNT = 5;
const COL_LEFT = 200;
const COL_WIDTH = 340;
const COL_COUNT = 6;
/** Thẻ rộng 220 đặt giữa cột rộng 340: (340 - 220) / 2 = 60. */
const CELL_PAD_X = 60;
const CELL_PAD_Y = 36;
const CANVAS_HEIGHT = ROW_TOP + (ROW_HEIGHT + ROW_GAP) * ROW_COUNT - ROW_GAP;
const LANE_WIDTH = COL_LEFT + COL_WIDTH * COL_COUNT;

const colX = (index: number) => COL_LEFT + COL_WIDTH * index;
const rowY = (index: number) => ROW_TOP + (ROW_HEIGHT + ROW_GAP) * index;

const column = (id: string, index: number) => ({
  id,
  title: txt(`endUser.columns.${id}`),
  x: colX(index),
  y: 0,
  width: COL_WIDTH,
  height: CANVAS_HEIGHT,
});

const lane = (
  id: string,
  index: number,
  tone: WorkflowCanvasTone,
  icon: WorkflowCanvasIconName,
): WorkflowCanvasLane => ({
  id,
  title: txt(`endUser.lanes.${id}`),
  tone,
  icon,
  x: 0,
  y: rowY(index),
  width: LANE_WIDTH,
  height: ROW_HEIGHT,
});

/** Thẻ đặt vào ô giao giữa cột `col` và hàng `row` (đếm từ 0). */
const card = (
  id: string,
  kind: WorkflowCanvasNode["kind"],
  col: number,
  row: number,
  badges: number,
  step?: number,
): WorkflowCanvasNode => ({
  id,
  kind,
  x: colX(col) + CELL_PAD_X,
  y: rowY(row) + CELL_PAD_Y,
  title: txt(`endUser.nodes.${id}.title`),
  badges: Array.from({ length: badges }, (_, i) =>
    txt(`endUser.nodes.${id}.badge${i + 1}`),
  ),
  ...(step ? { step } : {}),
});

const edge = (
  id: string,
  source: string,
  target: string,
  dashed = false,
): WorkflowCanvasEdge => ({
  id,
  source,
  target,
  label: txt(`endUser.edges.${id}`),
  ...(dashed ? { dashed: true } : {}),
});

/** Sơ đồ người dùng cuối: hàng = vai trò, cột = giai đoạn. Khóa: `v2.procurementWorkflow.endUser.*` */
export const PROCUREMENT_END_USER_CANVAS: WorkflowCanvasDefinition = {
  id: "end-user",
  title: txt("endUser.title"),
  description: txt("endUser.description"),
  corner: {
    x: 0,
    y: 0,
    width: COL_LEFT,
    height: ROW_TOP,
    title: txt("endUser.corner"),
  },
  columns: [
    column("c1", 0),
    column("c2", 1),
    column("c3", 2),
    column("c4", 3),
    column("c5", 4),
    column("c6", 5),
  ],
  lanes: [
    lane("r1", 0, "slate", "receipt"),
    lane("r2", 1, "violet", "scale"),
    lane("r3", 2, "orange", "wallet"),
    lane("r4", 3, "green", "car"),
    lane("r5", 4, "teal", "cpu"),
  ],
  nodes: [
    card("n1", "module", 0, 0, 1, 1),
    card("n2", "state", 1, 0, 1),
    card("n3", "state", 1, 1, 1, 2),
    card("n4", "module", 2, 2, 2, 3),
    card("n5", "state", 3, 1, 1, 4),
    card("n6", "module", 3, 2, 1, 5),
    card("n7", "voucher", 4, 3, 2, 6),
    card("n8", "hub-action", 4, 4, 2, 7),
    card("n9", "state", 5, 3, 1, 8),
    card("n10", "hub-action", 5, 4, 1, 9),
  ],
  edges: [
    edge("ee1", "n1", "n3"),
    edge("ee2", "n1", "n2", true),
    edge("ee3", "n3", "n4"),
    edge("ee4", "n4", "n5"),
    edge("ee5", "n5", "n6"),
    edge("ee6", "n6", "n7"),
    edge("ee7", "n7", "n8"),
    edge("ee8", "n9", "n10"),
  ],
};

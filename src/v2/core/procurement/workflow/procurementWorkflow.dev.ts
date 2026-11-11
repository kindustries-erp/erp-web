import {
  WORKFLOW_BUSINESS_COLORS,
  WORKFLOW_CARD_MIN_HEIGHT,
  type WorkflowCanvasDefinition,
  type WorkflowCanvasEdge,
  type WorkflowCanvasFlow,
  type WorkflowCanvasIconName,
  type WorkflowCanvasLane,
  type WorkflowCanvasNode,
  type WorkflowCanvasTone,
} from "@/v2/core/workflow";

import { FLOW, txt } from "./procurementWorkflow.text";

const BOX_PAD_X = 30;
const BOX_GAP = 100;
const LANE_WIDTH = BOX_PAD_X * 2 + 220;
const ROW_TOP = 64;
const ROW_PITCH = 160;
const ROW_COUNT = 6;
const LANE_HEIGHT =
  ROW_TOP + (ROW_COUNT - 1) * ROW_PITCH + WORKFLOW_CARD_MIN_HEIGHT + 24;

const laneX = (index: number) => index * (LANE_WIDTH + BOX_GAP);

type LaneId = "gr" | "flow" | "po" | "stock" | "notify";
const LANE_ORDER: LaneId[] = ["gr", "flow", "po", "stock", "notify"];
const LANE_TONE: Record<LaneId, WorkflowCanvasTone> = {
  gr: "green",
  flow: "teal",
  po: "orange",
  stock: "slate",
  notify: "violet",
};
const LANE_ICON: Record<LaneId, WorkflowCanvasIconName> = {
  gr: "receipt",
  flow: "cpu",
  po: "wallet",
  stock: "car",
  notify: "refresh",
};

const lane = (id: LaneId): WorkflowCanvasLane => ({
  id,
  title: txt(`dev.lanes.${id}`),
  tone: LANE_TONE[id],
  icon: LANE_ICON[id],
  headerSide: "top",
  x: laneX(LANE_ORDER.indexOf(id)),
  y: 0,
  width: LANE_WIDTH,
  height: LANE_HEIGHT,
});

const card = (
  id: string,
  kind: WorkflowCanvasNode["kind"],
  laneId: LaneId,
  row: number,
  badges: number,
): WorkflowCanvasNode => ({
  id,
  kind,
  x: laneX(LANE_ORDER.indexOf(laneId)) + BOX_PAD_X,
  y: ROW_TOP + row * ROW_PITCH,
  tone: LANE_TONE[laneId],
  title: txt(`dev.nodes.${id}.title`),
  badges: Array.from({ length: badges }, (_, i) =>
    txt(`dev.nodes.${id}.badge${i + 1}`),
  ),
});

const edge = (
  id: string,
  source: string,
  target: string,
  mechanism: string,
  flow: string,
  step: number,
): WorkflowCanvasEdge => ({
  id,
  source,
  target,
  label: txt(`dev.edges.${id}`),
  mechanism,
  kind: "main",
  flows: [flow],
  steps: { [flow]: step },
});

export const PROCUREMENT_FLOWS: WorkflowCanvasFlow[] = [
  {
    id: FLOW.post,
    letter: "A",
    color: WORKFLOW_BUSINESS_COLORS.income,
    title: txt("flows.post"),
    description: txt("flowDescriptions.post"),
  },
  {
    id: FLOW.cancel,
    letter: "B",
    color: WORKFLOW_BUSINESS_COLORS.expense,
    title: txt("flows.cancel"),
    description: txt("flowDescriptions.cancel"),
  },
];

/** Sơ đồ kỹ thuật: cột = module, luồng A (post) ở nửa trên, luồng B (hủy) ở nửa dưới. Khóa: `v2.procurementWorkflow.dev.*` */
export const PROCUREMENT_DEV_CANVAS: WorkflowCanvasDefinition = {
  id: "dev",
  audience: "dev",
  title: txt("dev.title"),
  description: txt("dev.description"),
  flows: PROCUREMENT_FLOWS,
  columns: [],
  lanes: LANE_ORDER.map(lane),
  nodes: [
    card("g1", "module", "gr", 0, 1),
    card("f1", "hub-action", "flow", 0, 2),
    card("p1", "module", "po", 0, 1),
    card("s1", "module", "stock", 1, 2),
    card("n1", "report", "notify", 2, 1),
    card("g2", "module", "gr", 3, 1),
    card("f2", "hub-action", "flow", 3, 2),
    card("p2", "module", "po", 3, 1),
    card("s2", "module", "stock", 4, 1),
    card("n2", "report", "notify", 5, 1),
  ],
  edges: [
    edge("d1", "g1", "f1", "DI", FLOW.post, 1),
    edge("d2", "f1", "p1", "transaction", FLOW.post, 2),
    edge("d3", "f1", "s1", "transaction", FLOW.post, 3),
    edge("d4", "f1", "n1", "sau commit", FLOW.post, 4),
    edge("d5", "g2", "f2", "DI", FLOW.cancel, 1),
    edge("d6", "f2", "p2", "transaction", FLOW.cancel, 2),
    edge("d7", "f2", "s2", "transaction", FLOW.cancel, 3),
    edge("d8", "f2", "n2", "sau commit", FLOW.cancel, 4),
  ],
};

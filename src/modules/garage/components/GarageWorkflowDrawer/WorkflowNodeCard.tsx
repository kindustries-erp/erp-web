import React from "react";
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";

import { WORKFLOW_ICONS } from "./workflowIcons";
import {
  WORKFLOW_CARD_MIN_HEIGHT,
  WORKFLOW_NODE_WIDTH,
  type GarageWorkflowIconName,
  type GarageWorkflowNodeKind,
  type GarageWorkflowTone,
} from "./garageWorkflowTypes";

import { tonePalette, TONE_BASE, type TonePalette } from "./workflowPalette";

/** Bảng màu nhạt của từng lane, lấy từ bảng màu chart dashboard. */
export const TONE_HEX = Object.fromEntries(
  Object.entries(TONE_BASE).map(([name, hex]) => [name, tonePalette(hex)]),
) as Record<GarageWorkflowTone, TonePalette>;

/** Vạch màu bên trái thẻ, theo loại thẻ. */
const KIND_ACCENT: Record<GarageWorkflowNodeKind, string> = {
  state: "#64748b",
  module: "#1e3a5f",
  "hub-action": "#4c3f7a",
  voucher: "#115e59",
  report: "#7c5a14",
};

const STATUS_BORDER: Record<number, string> = {
  3: "#15803d",
  9: "#b91c1c",
};

export const HANDLE_SIDES = ["top", "right", "bottom", "left"] as const;
export type HandleSide = (typeof HANDLE_SIDES)[number];

const SIDE_POSITION: Record<HandleSide, Position> = {
  top: Position.Top,
  right: Position.Right,
  bottom: Position.Bottom,
  left: Position.Left,
};

export interface WorkflowCardData extends Record<string, unknown> {
  title: string;
  badges: string[];
  kind: GarageWorkflowNodeKind;
  statusCode?: number;
  step?: number;
  /** Màu nhóm module: thay vạch trái theo loại thẻ. */
  tone?: GarageWorkflowTone;
  /** Chữ nhóm nhỏ phía trên tên thẻ (đã dịch). */
  group?: string;
}

export interface WorkflowLaneData extends Record<string, unknown> {
  title: string;
  tone: GarageWorkflowTone;
  headerSide: "top" | "left";
  icon?: GarageWorkflowIconName;
}

export interface WorkflowColumnData extends Record<string, unknown> {
  title: string;
}

export interface WorkflowHeadingData extends Record<string, unknown> {
  title: string;
  description: string;
}

export interface WorkflowCornerData extends Record<string, unknown> {
  title: string;
}

export type WorkflowCardNode = Node<WorkflowCardData, "workflow-card">;
export type WorkflowLaneNode = Node<WorkflowLaneData, "workflow-lane">;
export type WorkflowColumnNode = Node<WorkflowColumnData, "workflow-column">;
export type WorkflowHeadingNode = Node<WorkflowHeadingData, "workflow-heading">;
export type WorkflowCornerNode = Node<WorkflowCornerData, "workflow-corner">;

const HIDDEN_HANDLE = {
  opacity: 0,
  width: 6,
  height: 6,
  minWidth: 0,
  minHeight: 0,
} as const;

export function WorkflowCardNode({ data }: NodeProps<WorkflowCardNode>) {
  const statusBorder =
    data.statusCode !== undefined ? STATUS_BORDER[data.statusCode] : undefined;
  const accent = data.tone ? TONE_BASE[data.tone] : KIND_ACCENT[data.kind];

  return (
    <div
      style={{
        position: "relative",
        width: WORKFLOW_NODE_WIDTH,
        minHeight: WORKFLOW_CARD_MIN_HEIGHT,
        boxSizing: "border-box",
        padding: "8px 10px 8px 12px",
        borderRadius: 6,
        border: statusBorder
          ? `2px solid ${statusBorder}`
          : "1px solid #cbd5e1",
        borderLeft: `4px solid ${accent}`,
        backgroundColor: "#ffffff",
        color: "#0f172a",
        boxShadow: "0 1px 2px rgba(15,23,42,0.08)",
      }}
    >
      {HANDLE_SIDES.map((side) => (
        <React.Fragment key={side}>
          <Handle
            id={`t-${side}`}
            type="target"
            position={SIDE_POSITION[side]}
            style={HIDDEN_HANDLE}
          />
          <Handle
            id={`s-${side}`}
            type="source"
            position={SIDE_POSITION[side]}
            style={HIDDEN_HANDLE}
          />
        </React.Fragment>
      ))}
      {data.step !== undefined && (
        <div
          style={{
            position: "absolute",
            top: -12,
            left: -12,
            width: 24,
            height: 24,
            borderRadius: "50%",
            backgroundColor: "#0f172a",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 700,
            border: "2px solid #ffffff",
          }}
        >
          {data.step}
        </div>
      )}
      {data.group && (
        <div
          style={{
            marginBottom: 2,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 0.4,
            color: accent,
            textTransform: "uppercase",
          }}
        >
          {data.group}
        </div>
      )}
      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          lineHeight: 1.3,
          overflowWrap: "anywhere",
        }}
      >
        {data.title}
      </div>
      {data.badges.length > 0 && (
        <ul
          style={{
            margin: "5px 0 0",
            padding: 0,
            listStyle: "none",
            fontSize: 11,
            lineHeight: 1.35,
            color: "#475569",
          }}
        >
          {data.badges.map((badge) => (
            <li key={badge}>• {badge}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

const LANE_HEADER_TOP = 40;
const LANE_HEADER_LEFT = 200;

export function WorkflowLaneNode({
  data,
  width,
  height,
}: NodeProps<WorkflowLaneNode>) {
  const tone = TONE_HEX[data.tone];
  const isLeft = data.headerSide === "left";
  const Icon = data.icon ? WORKFLOW_ICONS[data.icon] : undefined;

  return (
    <div
      style={{
        width,
        height,
        boxSizing: "border-box",
        border: `1px solid ${tone.border}`,
        borderRadius: 8,
        backgroundColor: tone.body,
        display: "flex",
        flexDirection: isLeft ? "row" : "column",
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          flex: isLeft
            ? `0 0 ${LANE_HEADER_LEFT}px`
            : `0 0 ${LANE_HEADER_TOP}px`,
          backgroundColor: tone.header,
          color: tone.text,
          borderLeft: `4px solid ${tone.accent}`,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 10px",
          fontSize: 13,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: 0.3,
          lineHeight: 1.25,
        }}
      >
        {Icon && (
          <Icon size={16} strokeWidth={2.25} style={{ flexShrink: 0 }} />
        )}
        <span>{data.title}</span>
      </div>
    </div>
  );
}

export function WorkflowColumnNode({
  data,
  width,
  height,
}: NodeProps<WorkflowColumnNode>) {
  return (
    <div
      style={{
        width,
        height,
        boxSizing: "border-box",
        borderLeft: "1px dashed #94a3b8",
        borderRight: "1px dashed #94a3b8",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          textAlign: "center",
          fontSize: 12,
          fontWeight: 700,
          color: "#334155",
          padding: "12px 6px",
          border: "1px solid #cbd5e1",
          borderBottom: "2px solid #475569",
          backgroundColor: "#f1f5f9",
          textTransform: "uppercase",
          letterSpacing: 0.3,
        }}
      >
        {data.title}
      </div>
    </div>
  );
}

/** Ô góc trên bên trái của lưới end-user: "Bộ phận \ Giai đoạn". */
export function WorkflowCornerNode({
  data,
  width,
  height,
}: NodeProps<WorkflowCornerNode>) {
  return (
    <div
      style={{
        width,
        height,
        boxSizing: "border-box",
        border: "1px solid #cbd5e1",
        backgroundColor: "#f1f5f9",
        color: "#334155",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 6,
        fontSize: 12,
        fontWeight: 700,
        textAlign: "center",
        pointerEvents: "none",
      }}
    >
      {data.title}
    </div>
  );
}

/** Khối tiêu đề + mô tả, chỉ hiện trong lúc xuất PNG/PDF. */
export function WorkflowHeadingNode({
  data,
  width,
}: NodeProps<WorkflowHeadingNode>) {
  return (
    <div
      style={{
        width,
        boxSizing: "border-box",
        padding: "0 0 12px",
        pointerEvents: "none",
        color: "#0f172a",
      }}
    >
      <div style={{ fontSize: 26, fontWeight: 800, lineHeight: 1.2 }}>
        {data.title}
      </div>
      <div
        style={{
          marginTop: 6,
          fontSize: 15,
          color: "#475569",
          lineHeight: 1.4,
        }}
      >
        {data.description}
      </div>
    </div>
  );
}

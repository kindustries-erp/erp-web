import React from "react";
import { type NodeProps } from "@xyflow/react";

import { LANE_HEADER_LEFT, LANE_HEADER_TOP } from "./canvasHeaderRects";
import { WORKFLOW_ICONS } from "./workflowIcons";
import {
  TONE_HEX,
  type WorkflowColumnNode as ColumnNodeType,
  type WorkflowCornerNode as CornerNodeType,
  type WorkflowHeadingNode as HeadingNodeType,
  type WorkflowLaneNode as LaneNodeType,
} from "./WorkflowNodeCard";

export function WorkflowLaneNode({
  data,
  width,
  height,
}: NodeProps<LaneNodeType>) {
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
}: NodeProps<ColumnNodeType>) {
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
}: NodeProps<CornerNodeType>) {
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
}: NodeProps<HeadingNodeType>) {
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

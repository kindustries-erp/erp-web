import React from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  type Edge,
  type EdgeProps,
} from "@xyflow/react";

import type { RoutePoint } from "./edgeRouter";

/** Màu cố định (hex) để PNG/PDF giống màn hình, không phụ thuộc theme. */
export const EDGE_COLORS = {
  stroke: "#334155",
  labelBg: "#ffffff",
  labelBorder: "#94a3b8",
  labelText: "#0f172a",
  mechanism: "#64748b",
  read: "#94a3b8",
} as const;

export interface WorkflowEdgeData extends Record<string, unknown> {
  /** Các điểm của đường đi đã tránh thẻ (tính sẵn ở canvas). */
  points: RoutePoint[];
  labelPoint: RoutePoint;
  label?: string;
  mechanism?: string;
  dashed?: boolean;
  step?: number;
  /** Luồng chỉ đọc dữ liệu: nét chấm nhạt, ẩn mặc định. */
  read?: boolean;
  /** Màu của luồng tự động mà mũi tên thuộc về (ghi đè màu mặc định). */
  color?: string;
  /** Nhãn số thứ tự theo luồng, ví dụ "A1" (thay cho `step`). */
  stepLabel?: string;
  /** Mờ đi khi đang làm nổi một luồng khác. */
  dimmed?: boolean;
}

export type WorkflowEdgeType = Edge<WorkflowEdgeData, "workflow-edge">;

/** Đường gấp khúc từ các điểm, bo góc nhẹ ở mỗi chỗ rẽ. */
export function polylinePath(points: RoutePoint[], radius = 6): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let k = 1; k < points.length - 1; k += 1) {
    const prev = points[k - 1];
    const cur = points[k];
    const next = points[k + 1];
    const inLen = Math.hypot(cur.x - prev.x, cur.y - prev.y);
    const outLen = Math.hypot(next.x - cur.x, next.y - cur.y);
    const r = Math.min(radius, inLen / 2, outLen / 2);
    if (r <= 0) {
      d += ` L ${cur.x} ${cur.y}`;
      continue;
    }
    const beforeX = cur.x + ((prev.x - cur.x) / inLen) * r;
    const beforeY = cur.y + ((prev.y - cur.y) / inLen) * r;
    const afterX = cur.x + ((next.x - cur.x) / outLen) * r;
    const afterY = cur.y + ((next.y - cur.y) / outLen) * r;
    d += ` L ${beforeX} ${beforeY} Q ${cur.x} ${cur.y} ${afterX} ${afterY}`;
  }
  const last = points[points.length - 1];
  d += ` L ${last.x} ${last.y}`;
  return d;
}

const CIRCLED_DIGITS = [
  "①",
  "②",
  "③",
  "④",
  "⑤",
  "⑥",
  "⑦",
  "⑧",
  "⑨",
  "⑩",
  "⑪",
  "⑫",
  "⑬",
  "⑭",
  "⑮",
  "⑯",
  "⑰",
  "⑱",
  "⑲",
  "⑳",
];

/** Ký hiệu số khoanh tròn (①..⑳), số lớn hơn thì dùng dạng (n). */
export function formatStep(step: number): string {
  return CIRCLED_DIGITS[step - 1] ?? `(${step})`;
}

/** Nhãn mũi tên dạng văn bản (dùng cho kiểm thử): "② Gọi · DI". */
export function buildEdgeLabel(
  step?: number,
  label?: string,
  mechanism?: string,
): string {
  const head = [step !== undefined ? formatStep(step) : "", label ?? ""]
    .filter(Boolean)
    .join(" ");
  return [head, mechanism ?? ""].filter(Boolean).join(" · ");
}

export function WorkflowEdge({
  id,
  data,
  markerEnd,
}: EdgeProps<WorkflowEdgeType>) {
  const points = data?.points ?? [];
  const labelPoint = data?.labelPoint;
  const hasLabel = Boolean(
    data?.label ||
    data?.mechanism ||
    data?.step !== undefined ||
    data?.stepLabel !== undefined,
  );

  return (
    <>
      <BaseEdge
        id={id}
        path={polylinePath(points)}
        markerEnd={markerEnd}
        style={{
          stroke: data?.read
            ? EDGE_COLORS.read
            : (data?.color ?? EDGE_COLORS.stroke),
          strokeWidth: data?.read ? 1.25 : 2.25,
          opacity: data?.dimmed ? 0.12 : 1,
          strokeLinejoin: "round",
          strokeDasharray: data?.read
            ? "2 4"
            : data?.dashed
              ? "6 4"
              : undefined,
        }}
      />
      {hasLabel && labelPoint && (
        <EdgeLabelRenderer>
          <div
            className="nodrag nopan"
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelPoint.x}px, ${labelPoint.y}px)`,
              pointerEvents: "none",
              opacity: data?.dimmed ? 0.15 : 1,
              /* Nhãn phải nằm trên mọi mũi tên (edge zIndex 30) và che đoạn đường bên dưới. */
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              gap: 5,
              backgroundColor: EDGE_COLORS.labelBg,
              color: EDGE_COLORS.labelText,
              border: `1px solid ${EDGE_COLORS.labelBorder}`,
              borderRadius: 4,
              padding: "2px 6px 2px 3px",
              fontSize: 11,
              fontWeight: 600,
              whiteSpace: "nowrap",
              lineHeight: 1.3,
              boxShadow: "0 1px 2px rgba(15,23,42,0.1)",
            }}
          >
            {(data?.step !== undefined || data?.stepLabel !== undefined) && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: 20,
                  height: 18,
                  padding: "0 4px",
                  borderRadius: 9,
                  backgroundColor: data?.color ?? "#0f172a",
                  color: "#ffffff",
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {data.stepLabel ?? data.step}
              </span>
            )}
            <div style={{ display: "flex", flexDirection: "column" }}>
              {data?.label && <span>{data.label}</span>}
              {data?.mechanism && (
                <span
                  style={{
                    color: EDGE_COLORS.mechanism,
                    fontWeight: 500,
                    fontSize: 10,
                  }}
                >
                  {data.mechanism}
                </span>
              )}
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

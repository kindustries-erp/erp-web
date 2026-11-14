import React from "react";

import type { GuideUnit } from "./guideTypes";

export const FONT_FAMILY =
  'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

export const COLORS = {
  text: "#1f2937",
  muted: "#64748b",
  accent: "#334155",
  line: "#cbd5e1",
  badge: "#0f172a",
} as const;

export const BADGE_STYLE = {
  flexShrink: 0,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: 26,
  height: 20,
  padding: "0 6px",
  borderRadius: 10,
  backgroundColor: COLORS.badge,
  color: "#ffffff",
  fontSize: 11,
  fontWeight: 700,
  boxSizing: "border-box",
} as const;

/** Một đơn vị nội dung. Khoảng cách dưới là padding để chiều cao đo được đã gồm khoảng cách. */
export function GuideUnitView({
  unit,
  pageOf,
}: {
  unit: GuideUnit;
  /** Số trang (trong tài liệu hướng dẫn) của đơn vị mà mục lục trỏ tới. */
  pageOf: (unitId: string) => string;
}) {
  const { content } = unit;

  switch (content.kind) {
    case "docTitle":
      return (
        <div
          style={{
            paddingBottom: 16,
            borderBottom: `2px solid ${COLORS.accent}`,
            marginBottom: 6,
          }}
        >
          <div
            style={{
              fontSize: 24,
              fontWeight: 800,
              lineHeight: 1.25,
              color: COLORS.text,
            }}
          >
            {content.title}
          </div>
          <div
            style={{
              marginTop: 6,
              fontSize: 14,
              color: COLORS.muted,
              lineHeight: 1.4,
            }}
          >
            {content.subtitle}
          </div>
        </div>
      );
    case "tocTitle":
      return (
        <div
          style={{
            paddingTop: 10,
            paddingBottom: 8,
            fontSize: 17,
            fontWeight: 700,
            color: COLORS.accent,
          }}
        >
          {content.text}
        </div>
      );
    case "tocEntry":
      return (
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 8,
            paddingBottom: content.level === 1 ? 4 : 3,
            paddingTop: content.level === 1 ? 4 : 0,
            paddingLeft: content.level === 1 ? 0 : 22,
            fontSize: content.level === 1 ? 13 : 12,
            fontWeight: content.level === 1 ? 700 : 400,
            lineHeight: 1.4,
            color: COLORS.text,
          }}
        >
          <span style={{ flexShrink: 0, minWidth: 30 }}>{content.number}</span>
          <span style={{ flex: 1, minWidth: 0 }}>{content.text}</span>
          <span
            style={{
              flexShrink: 0,
              color: COLORS.muted,
              fontWeight: 400,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {pageOf(content.targetId)}
          </span>
        </div>
      );
    case "sectionTitle":
      return (
        <div
          style={{
            paddingTop: 16,
            paddingBottom: 8,
            fontSize: 17,
            fontWeight: 700,
            color: COLORS.accent,
            lineHeight: 1.3,
            borderBottom: `1px solid ${COLORS.line}`,
            marginBottom: 8,
          }}
        >
          {`${content.number}. ${content.text}`}
        </div>
      );
    case "paragraph":
      return (
        <div
          style={{
            paddingBottom: 9,
            fontSize: 13,
            lineHeight: 1.6,
            color: COLORS.text,
          }}
        >
          {content.text}
        </div>
      );
    case "example":
      return (
        <div style={{ paddingBottom: 9, paddingLeft: 42 }}>
          <div
            style={{
              padding: "6px 10px",
              borderLeft: `3px solid ${COLORS.accent}`,
              backgroundColor: "#f1f5f9",
              borderRadius: 4,
              fontSize: 12,
              lineHeight: 1.5,
              color: COLORS.text,
            }}
          >
            <span style={{ fontWeight: 700, color: COLORS.accent }}>
              {content.label}:{" "}
            </span>
            {content.text}
          </div>
        </div>
      );
    case "numbered": {
      const level3 = content.level === 3;
      return (
        <div
          style={{
            display: "flex",
            gap: 8,
            paddingBottom: level3 ? 5 : 8,
            paddingLeft: level3 ? 34 : 0,
            fontSize: level3 ? 12.5 : 13,
            lineHeight: 1.5,
            color: COLORS.text,
          }}
        >
          <span
            style={{
              flexShrink: 0,
              minWidth: level3 ? 40 : 34,
              fontWeight: 700,
              color: COLORS.accent,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {content.number}
          </span>
          {content.badge && <span style={BADGE_STYLE}>{content.badge}</span>}
          <div style={{ minWidth: 0, flex: 1 }}>
            {content.title && (
              <div style={{ fontWeight: 700, lineHeight: 1.4 }}>
                {content.title}
              </div>
            )}
            {content.text && (
              <div
                style={{
                  marginTop: content.title ? 2 : 0,
                  color: content.title ? COLORS.muted : COLORS.text,
                }}
              >
                {content.text}
              </div>
            )}
          </div>
        </div>
      );
    }
  }
}

import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  GUIDE_CONTENT_HEIGHT,
  GUIDE_CONTENT_WIDTH,
  GUIDE_FOOTER_HEIGHT,
  GUIDE_HEADER_HEIGHT,
  GUIDE_MARGIN_BOTTOM,
  GUIDE_MARGIN_TOP,
  GUIDE_MARGIN_X,
  GUIDE_PAGE,
} from "./guideLayout";
import type { GuideUnit } from "./guideTypes";
import { packGuideUnits } from "./packGuideUnits";

const FONT_FAMILY =
  'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

const COLORS = {
  text: "#1f2937",
  muted: "#64748b",
  accent: "#334155",
  line: "#cbd5e1",
  badge: "#0f172a",
} as const;

const BADGE_STYLE = {
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
function GuideUnitView({
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

interface WorkflowGuideDocumentProps {
  units: GuideUnit[];
  /** Tên tài liệu hiển thị ở đầu mỗi trang. */
  headerTitle: string;
  /** Nhãn "Trang" ở chân trang. */
  pageLabel: string;
  /** Gọi một lần khi các trang A4 đã dựng xong, theo thứ tự trang. */
  onPagesReady: (pages: HTMLElement[]) => void;
}

/**
 * Dựng tài liệu hướng dẫn thành các trang A4 dọc, nằm ngoài màn hình để chụp ảnh đưa vào PDF.
 * Pha 1: đo chiều cao từng đơn vị trong một cột có đúng bề rộng vùng nội dung.
 * Pha 2: xếp đơn vị vào trang (`packGuideUnits`) rồi dựng từng trang, đầu trang và chân trang.
 */
export function WorkflowGuideDocument({
  units,
  headerTitle,
  pageLabel,
  onPagesReady,
}: WorkflowGuideDocumentProps) {
  const measureRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [heights, setHeights] = useState<number[] | null>(null);

  useLayoutEffect(() => {
    if (heights) return;
    setHeights(
      units.map((_, index) => measureRefs.current[index]?.offsetHeight ?? 0),
    );
  }, [heights, units]);

  const pages = useMemo(
    () =>
      heights
        ? packGuideUnits(
            heights,
            units.map((unit) => unit.keepWithNext),
            GUIDE_CONTENT_HEIGHT,
          )
        : null,
    [heights, units],
  );

  const pageByUnitId = useMemo(() => {
    const map = new Map<string, number>();
    pages?.forEach((unitIndexes, pageIndex) =>
      unitIndexes.forEach((unitIndex) =>
        map.set(units[unitIndex].id, pageIndex + 1),
      ),
    );
    return map;
  }, [pages, units]);

  // Pha đo chưa biết số trang: dùng chuỗi cùng độ rộng, chiều cao dòng không đổi.
  const pageOf = (unitId: string) =>
    pageByUnitId.has(unitId) ? String(pageByUnitId.get(unitId)) : "00";

  useEffect(() => {
    if (!pages) return;
    // Chờ 2 frame để trình duyệt vẽ xong các trang trước khi báo sẵn sàng.
    const frame = requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        const elements = pageRefs.current
          .slice(0, pages.length)
          .filter((element): element is HTMLDivElement => element !== null);
        onPagesReady(elements);
      }),
    );
    return () => cancelAnimationFrame(frame);
  }, [pages, onPagesReady]);

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        left: -100000,
        top: 0,
        pointerEvents: "none",
        fontFamily: FONT_FAMILY,
      }}
    >
      {!pages && (
        <div style={{ width: GUIDE_CONTENT_WIDTH }}>
          {units.map((unit, index) => (
            <div
              key={unit.id}
              ref={(element) => {
                measureRefs.current[index] = element;
              }}
            >
              <GuideUnitView unit={unit} pageOf={pageOf} />
            </div>
          ))}
        </div>
      )}

      {pages?.map((unitIndexes, pageIndex) => (
        <div
          key={`page-${pageIndex}`}
          ref={(element) => {
            pageRefs.current[pageIndex] = element;
          }}
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            width: GUIDE_PAGE.width,
            height: GUIDE_PAGE.height,
            boxSizing: "border-box",
            padding: `${GUIDE_MARGIN_TOP}px ${GUIDE_MARGIN_X}px ${GUIDE_MARGIN_BOTTOM}px`,
            backgroundColor: "#ffffff",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: GUIDE_HEADER_HEIGHT,
              flexShrink: 0,
              borderBottom: `1px solid ${COLORS.line}`,
              fontSize: 11,
              color: COLORS.muted,
              display: "flex",
              alignItems: "flex-start",
            }}
          >
            {headerTitle}
          </div>
          <div style={{ flex: 1, paddingTop: 12, minHeight: 0 }}>
            {unitIndexes.map((unitIndex) => (
              <GuideUnitView
                key={units[unitIndex].id}
                unit={units[unitIndex]}
                pageOf={pageOf}
              />
            ))}
          </div>
          <div
            style={{
              height: GUIDE_FOOTER_HEIGHT,
              flexShrink: 0,
              borderTop: `1px solid ${COLORS.line}`,
              paddingTop: 6,
              fontSize: 11,
              color: COLORS.muted,
              textAlign: "right",
            }}
          >
            {`${pageLabel} ${pageIndex + 1}/${pages.length}`}
          </div>
        </div>
      ))}
    </div>
  );
}

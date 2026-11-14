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

import { COLORS, FONT_FAMILY, GuideUnitView } from "./GuideUnitView";

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

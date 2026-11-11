import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

import { GUIDE_CONTENT_HEIGHT } from "./guideLayout";
import type { GuideUnit } from "./guideTypes";
import { WorkflowGuideDocument } from "./WorkflowGuideDocument";

const UNIT_HEIGHT = Math.floor(GUIDE_CONTENT_HEIGHT / 3) + 10;

const units: GuideUnit[] = [
  {
    id: "u0",
    keepWithNext: false,
    content: { kind: "docTitle", title: "Tài liệu thử", subtitle: "Phụ đề" },
  },
  {
    id: "u1",
    keepWithNext: true,
    content: { kind: "sectionTitle", number: "1", text: "Mục một" },
  },
  {
    id: "u2",
    keepWithNext: false,
    content: { kind: "paragraph", text: "Đoạn văn một" },
  },
  {
    id: "u3",
    keepWithNext: false,
    content: {
      kind: "numbered",
      level: 2,
      number: "1.1",
      text: "Gạch đầu dòng",
    },
  },
  {
    id: "u4",
    keepWithNext: false,
    content: {
      kind: "numbered",
      level: 2,
      number: "1.2",
      badge: "1",
      title: "Bước một",
      text: "Mô tả",
    },
  },
];

const originalOffsetHeight = Object.getOwnPropertyDescriptor(
  HTMLElement.prototype,
  "offsetHeight",
);

describe("WorkflowGuideDocument", () => {
  beforeEach(() => {
    // jsdom không có layout: giả lập mỗi đơn vị cao hơn 1/3 vùng nội dung nên mỗi trang chứa tối đa 2 đơn vị.
    Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
      configurable: true,
      get: () => UNIT_HEIGHT,
    });
  });

  afterEach(() => {
    if (originalOffsetHeight) {
      Object.defineProperty(
        HTMLElement.prototype,
        "offsetHeight",
        originalOffsetHeight,
      );
    }
  });

  it("đo rồi xếp thành nhiều trang A4 và báo các trang qua onPagesReady", async () => {
    const onPagesReady = vi.fn();

    render(
      <WorkflowGuideDocument
        units={units}
        headerTitle="Hướng dẫn nội bộ"
        pageLabel="Trang"
        onPagesReady={onPagesReady}
      />,
    );

    await waitFor(() => expect(onPagesReady).toHaveBeenCalled());
    const pages = onPagesReady.mock.calls[0][0] as HTMLElement[];

    expect(pages.length).toBeGreaterThan(1);
    expect(pages[0].style.width).toBe("794px");
    expect(pages[0].style.height).toBe("1123px");
  });

  it("mỗi trang có đầu trang và chân trang Trang n/N", async () => {
    const onPagesReady = vi.fn();

    render(
      <WorkflowGuideDocument
        units={units}
        headerTitle="Hướng dẫn nội bộ"
        pageLabel="Trang"
        onPagesReady={onPagesReady}
      />,
    );

    await waitFor(() => expect(onPagesReady).toHaveBeenCalled());
    const total = (onPagesReady.mock.calls[0][0] as HTMLElement[]).length;

    expect(screen.getAllByText("Hướng dẫn nội bộ")).toHaveLength(total);
    expect(screen.getByText(`Trang 1/${total}`)).toBeInTheDocument();
    expect(screen.getByText(`Trang ${total}/${total}`)).toBeInTheDocument();
  });

  it("tiêu đề mục không đứng cuối trang: luôn cùng trang với đơn vị liền sau", async () => {
    const onPagesReady = vi.fn();

    render(
      <WorkflowGuideDocument
        units={units}
        headerTitle="Hướng dẫn nội bộ"
        pageLabel="Trang"
        onPagesReady={onPagesReady}
      />,
    );

    await waitFor(() => expect(onPagesReady).toHaveBeenCalled());
    const pages = onPagesReady.mock.calls[0][0] as HTMLElement[];
    const pageWithTitle = pages.find((page) =>
      page.textContent?.includes("Mục một"),
    );

    expect(pageWithTitle?.textContent).toContain("Đoạn văn một");
  });
});

import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ProcurementLinkedDocCell } from "./ProcurementLinkedDocCell";

const mockT = (_key: string, fallback: string) => fallback;

describe("ProcurementLinkedDocCell", () => {
  it("hiện '—' khi không có chứng từ liên kết", () => {
    render(<ProcurementLinkedDocCell docs={[]} t={mockT} />);

    expect(screen.getByText("—")).toBeTruthy();
  });

  it("hiện chứng từ đầu và mở drawer khi bấm chữ", () => {
    const onOpen = vi.fn();
    render(
      <ProcurementLinkedDocCell
        docs={[{ id: "o1", label: "PO-0001" }]}
        t={mockT}
        onOpen={onOpen}
      />,
    );

    fireEvent.click(screen.getByText("PO-0001"));

    expect(onOpen).toHaveBeenCalledWith("o1");
  });

  it("không có +N khi chỉ có một chứng từ", () => {
    render(
      <ProcurementLinkedDocCell
        docs={[{ id: "o1", label: "PO-0001" }]}
        t={mockT}
      />,
    );

    expect(screen.queryByText(/^\+\d+$/)).toBeNull();
  });

  it("gom các chứng từ còn lại vào chip +N", () => {
    render(
      <ProcurementLinkedDocCell
        docs={[
          { id: "o1", label: "PO-0001" },
          { id: "o2", label: "PO-0002" },
          { id: "o3", label: "PO-0003" },
        ]}
        t={mockT}
      />,
    );

    expect(screen.getByText("PO-0001")).toBeTruthy();
    expect(screen.getByText("+2")).toBeTruthy();
  });
});

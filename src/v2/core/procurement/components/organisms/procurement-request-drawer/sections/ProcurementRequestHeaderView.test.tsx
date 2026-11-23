import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProcurementRequestHeaderView } from "./ProcurementRequestHeaderView";
import type { ProcurementRequestFormValue } from "../../../../form/procurementRequest.form";

const form: ProcurementRequestFormValue = {
  branchId: "b-1",
  branchName: "Chi nhánh Quận 1",
  requestDate: "2026-11-05",
  neededDate: "2026-11-12",
  title: "Mua lốp xe",
  remarks: "Gấp trong tuần",
  lines: [],
};

describe("ProcurementRequestHeaderView", () => {
  it("hiển thị đủ giá trị đầu đề ở dạng đọc", () => {
    render(<ProcurementRequestHeaderView form={form} />);
    expect(screen.getByText("Chi nhánh Quận 1")).toBeInTheDocument();
    expect(screen.getByText("2026-11-05")).toBeInTheDocument();
    expect(screen.getByText("2026-11-12")).toBeInTheDocument();
    expect(screen.getByText("Mua lốp xe")).toBeInTheDocument();
    expect(screen.getByText("Gấp trong tuần")).toBeInTheDocument();
  });

  it("chi nhánh đứng trước nội dung, ngày đề nghị đứng trước ngày cần", () => {
    render(<ProcurementRequestHeaderView form={form} />);
    const after = (a: string, b: string) =>
      Boolean(
        screen.getByText(a).compareDocumentPosition(screen.getByText(b)) &
        Node.DOCUMENT_POSITION_FOLLOWING,
      );
    expect(after("Chi nhánh", "Ngày đề nghị")).toBe(true);
    expect(after("Ngày đề nghị", "Ngày cần hàng")).toBe(true);
    expect(after("Ngày cần hàng", "Nội dung")).toBe(true);
  });

  it("ô trống hiển thị dấu gạch", () => {
    render(
      <ProcurementRequestHeaderView
        form={{ ...form, neededDate: "", remarks: "" }}
      />,
    );
    expect(screen.getAllByText("—").length).toBeGreaterThanOrEqual(2);
  });
});

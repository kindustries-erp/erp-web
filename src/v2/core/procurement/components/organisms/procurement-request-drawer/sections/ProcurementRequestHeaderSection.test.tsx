import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ProcurementRequestHeaderSection } from "./ProcurementRequestHeaderSection";
import type { ProcurementRequestFormValue } from "../../../../form/procurementRequest.form";

vi.mock(
  "../../../molecules/procurement-pickers/ProcurementPickers",
  async () => {
    const React = await import("react");
    return {
      ProcurementBranchPicker: ({ label }: { label: string }) =>
        React.createElement("div", null, `branch:${label}`),
      ProcurementDateField: () =>
        React.createElement("div", null, "date-field"),
    };
  },
);

const baseForm: ProcurementRequestFormValue = {
  branchId: "b-1",
  branchName: "Chi nhánh Quận 1",
  requestDate: "2026-11-05",
  neededDate: "",
  title: "Mua lốp xe",
  remarks: "Gấp trong tuần",
  lines: [],
};

describe("ProcurementRequestHeaderSection", () => {
  it("chế độ xem hiển thị giá trị đọc (nội dung và ghi chú)", () => {
    render(
      <ProcurementRequestHeaderSection
        form={baseForm}
        errors={{}}
        headerViewing
        branchLocked
        setField={vi.fn()}
      />,
    );
    expect(screen.getByText("Mua lốp xe")).toBeDefined();
    expect(screen.getByText("Gấp trong tuần")).toBeDefined();
    expect(screen.queryByRole("textbox")).toBeNull();
  });

  it("hiển thị lỗi bắt buộc khi thiếu chi nhánh", () => {
    render(
      <ProcurementRequestHeaderSection
        form={{ ...baseForm, branchId: "" }}
        errors={{ branchId: true }}
        headerViewing={false}
        branchLocked={false}
        setField={vi.fn()}
      />,
    );
    expect(screen.getByText("Trường này bắt buộc")).toBeDefined();
  });

  it("nhập nội dung khi đang sửa gọi setField đúng khóa title", async () => {
    const setField = vi.fn();
    render(
      <ProcurementRequestHeaderSection
        form={{ ...baseForm, title: "" }}
        errors={{}}
        headerViewing={false}
        branchLocked={false}
        setField={setField}
      />,
    );
    const titleInput = screen.getAllByRole("textbox")[0];
    await userEvent.type(titleInput, "A");
    expect(setField).toHaveBeenCalledWith("title", "A");
  });
});

import { fireEvent, render, screen } from "@testing-library/react";
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
      ProcurementDateField: ({
        value,
        onChange,
      }: {
        value: string;
        onChange: (v: string) => void;
      }) =>
        React.createElement(
          "button",
          { type: "button", onClick: () => onChange("2026-11-08") },
          `date:${value}`,
        ),
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

  it("chế độ xem: chi nhánh đứng trước nội dung và ngày đề nghị trước ngày cần", () => {
    render(
      <ProcurementRequestHeaderSection
        form={baseForm}
        errors={{}}
        headerViewing
        branchLocked
        setField={vi.fn()}
      />,
    );
    const order = (a: string, b: string) =>
      screen.getByText(a).compareDocumentPosition(screen.getByText(b)) &
      Node.DOCUMENT_POSITION_FOLLOWING;
    expect(order("Chi nhánh", "Ngày đề nghị")).toBeTruthy();
    expect(order("Ngày đề nghị", "Ngày cần hàng")).toBeTruthy();
    expect(order("Ngày cần hàng", "Nội dung")).toBeTruthy();
  });

  it("chế độ sửa: chi nhánh đứng trước nội dung và hai ngày nằm cùng một lưới", () => {
    render(
      <ProcurementRequestHeaderSection
        form={baseForm}
        errors={{}}
        headerViewing={false}
        branchLocked={false}
        setField={vi.fn()}
      />,
    );
    const order = (a: string, b: string) =>
      screen.getByText(a).compareDocumentPosition(screen.getByText(b)) &
      Node.DOCUMENT_POSITION_FOLLOWING;
    expect(order("Chi nhánh", "Nội dung")).toBeTruthy();
    const requestGrid = screen.getByText("Ngày đề nghị").closest(".grid");
    const neededGrid = screen.getByText("Ngày cần hàng").closest(".grid");
    expect(requestGrid).not.toBeNull();
    expect(requestGrid).toBe(neededGrid);
  });

  it("Garage (chi nhánh tùy chọn): chi nhánh vẫn đứng trước nội dung ở chế độ sửa", () => {
    render(
      <ProcurementRequestHeaderSection
        form={baseForm}
        errors={{}}
        headerViewing={false}
        branchLocked={false}
        branchOptional
        setField={vi.fn()}
      />,
    );
    const branch = screen.getByText("Chi nhánh");
    const title = screen.getByText("Nội dung");
    expect(
      branch.compareDocumentPosition(title) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("đổi ngày đề nghị khi ngày cần đang đồng bộ thì ngày cần đổi theo", () => {
    const setField = vi.fn();
    render(
      <ProcurementRequestHeaderSection
        form={{ ...baseForm, neededDate: "2026-11-05" }}
        errors={{}}
        headerViewing={false}
        branchLocked={false}
        setField={setField}
      />,
    );
    fireEvent.click(screen.getAllByRole("button", { name: /^date:/ })[0]);
    expect(setField).toHaveBeenCalledWith("requestDate", "2026-11-08");
    expect(setField).toHaveBeenCalledWith("neededDate", "2026-11-08");
  });

  it("đổi ngày đề nghị khi ngày cần đã sửa lệch thì giữ ngày cần", () => {
    const setField = vi.fn();
    render(
      <ProcurementRequestHeaderSection
        form={{ ...baseForm, neededDate: "2026-11-20" }}
        errors={{}}
        headerViewing={false}
        branchLocked={false}
        setField={setField}
      />,
    );
    fireEvent.click(screen.getAllByRole("button", { name: /^date:/ })[0]);
    expect(setField).toHaveBeenCalledWith("requestDate", "2026-11-08");
    expect(setField).not.toHaveBeenCalledWith("neededDate", "2026-11-08");
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

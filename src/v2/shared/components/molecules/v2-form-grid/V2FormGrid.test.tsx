import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { V2FormGrid } from "./V2FormGrid";
import type { V2FormFieldConfig } from "./V2FormGrid.type";

describe("V2FormGrid Molecule", () => {
  interface TestForm {
    name: string;
    age: number;
    notes?: string;
  }

  const fields: V2FormFieldConfig<TestForm>[] = [
    {
      name: "name",
      label: "Họ và tên",
      type: "text",
      required: true,
    },
    {
      name: "age",
      label: "Tuổi",
      type: "number",
    },
    {
      name: "notes",
      label: "Ghi chú",
      type: "textarea",
      colSpan: 2,
    },
  ];

  it("renders all fields based on config array", () => {
    render(
      <V2FormGrid<TestForm>
        fields={fields}
        values={{ name: "Nguyễn Văn A", age: 30, notes: "Ghi chú test" }}
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByText("Họ và tên")).toBeInTheDocument();
    expect(screen.getByText("Tuổi")).toBeInTheDocument();
    expect(screen.getByText("Ghi chú")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Nguyễn Văn A")).toBeInTheDocument();
  });

  it("calls onChange with field name and new value", () => {
    const onChange = vi.fn();
    render(
      <V2FormGrid<TestForm>
        fields={fields}
        values={{ name: "", age: 0 }}
        onChange={onChange}
      />,
    );

    const nameInput = screen.getAllByRole("textbox")[0];
    fireEvent.change(nameInput, { target: { value: "Trần Thị B" } });

    expect(onChange).toHaveBeenCalledWith("name", "Trần Thị B");
  });

  it("renders in viewing mode without input controls", () => {
    render(
      <V2FormGrid<TestForm>
        fields={fields}
        values={{ name: "Lê Văn C", age: 25, notes: "Xem chi tiết" }}
        viewing={true}
      />,
    );

    expect(screen.getByText("Lê Văn C")).toBeInTheDocument();
    expect(screen.getByText("Xem chi tiết")).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });
});

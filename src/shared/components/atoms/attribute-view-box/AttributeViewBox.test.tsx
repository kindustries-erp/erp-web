import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { AttributeViewBox } from "./AttributeViewBox";

describe("AttributeViewBox", () => {
  it("renders formatted value", () => {
    const attr = {
      id: "1",
      code: "note",
      name: "Ghi chú",
      fieldType: "TEXT",
    } as any;
    render(
      <AttributeViewBox
        attr={attr}
        value="Hello world"
        locale="vi"
        t={(k, f) => f}
      />,
    );
    expect(screen.getByText("Hello world")).toBeInTheDocument();
  });
});

import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { V2Panel } from "./V2Panel";

describe("V2Panel", () => {
  it("renders title, badge, extra and children", () => {
    render(
      <V2Panel
        title="Xu hướng dòng tiền"
        badge={<span>12</span>}
        extra={<button type="button">Biểu đồ</button>}
      >
        <div>nội dung</div>
      </V2Panel>,
    );
    expect(
      screen.getByRole("heading", { name: "Xu hướng dòng tiền" }),
    ).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Biểu đồ" })).toBeInTheDocument();
    expect(screen.getByText("nội dung")).toBeInTheDocument();
  });

  it("omits the header when there is no title, badge or extra", () => {
    const { container } = render(<V2Panel>chỉ nội dung</V2Panel>);
    expect(container.querySelector("header")).toBeNull();
  });
});

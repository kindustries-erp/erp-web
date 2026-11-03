import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { V2AdminStatCard } from "./V2AdminStatCard";
import { DollarSign } from "lucide-react";

describe("V2AdminStatCard", () => {
  it("renders title and value properly", () => {
    render(
      <V2AdminStatCard
        title="Tổng doanh thu"
        value="1.500.000.000 ₫"
        subtitle="So với tháng trước"
        icon={DollarSign}
        growthRate={12.5}
      />,
    );

    expect(screen.getByText("Tổng doanh thu")).toBeDefined();
    expect(screen.getByText("1.500.000.000 ₫")).toBeDefined();
    expect(screen.getByText("12.5%")).toBeDefined();
    expect(screen.getByText("So với tháng trước")).toBeDefined();
  });

  it("renders negative growth rate with minus", () => {
    render(<V2AdminStatCard title="Đơn bán" value="120" growthRate={-5.2} />);

    expect(screen.getByText("Đơn bán")).toBeDefined();
    expect(screen.getByText("5.2%")).toBeDefined();
  });
});

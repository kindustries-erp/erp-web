import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  WORKSHOP_FIXTURE_NOW,
  workshopCaseFixture,
} from "../../workshop/garageWorkshop.fixtures";
import { GarageWorkshopCard } from "./GarageWorkshopCard";
import { GarageWorkshopClock } from "./GarageWorkshopClock";
import { GarageWorkshopStatusBadge } from "./GarageWorkshopStatusBadge";

const NOW = WORKSHOP_FIXTURE_NOW;
const workshopItem = workshopCaseFixture;

describe("GarageWorkshopStatusBadge", () => {
  it("hiện status v2 và status nhỏ; chưa có status nhỏ thì hiện nhãn trống khi được yêu cầu", () => {
    const { rerender } = render(
      <GarageWorkshopStatusBadge status="QUOTED" stage="AWAITING_APPROVAL" />,
    );
    expect(screen.getByTestId("workshop-status-badge")).toHaveTextContent(
      "Báo giá",
    );
    expect(screen.getByTestId("workshop-stage-badge")).toHaveTextContent(
      "Chờ khách duyệt",
    );
    rerender(<GarageWorkshopStatusBadge status="INTAKE" stage={null} />);
    expect(screen.queryByTestId("workshop-stage-badge")).toBeNull();
    rerender(
      <GarageWorkshopStatusBadge status="INTAKE" stage={null} showEmptyStage />,
    );
    expect(screen.getByTestId("workshop-stage-badge")).toHaveTextContent(
      "Chưa chọn công đoạn",
    );
  });
});

describe("GarageWorkshopClock", () => {
  it("đếm từ giờ bắt đầu, đổi tông khi quá 8 giờ, ẩn khi chưa có công đoạn", () => {
    const { rerender, container } = render(
      <GarageWorkshopClock startedAt="2026-11-24T08:30:00.000Z" now={NOW} />,
    );
    expect(screen.getByTestId("workshop-clock")).toHaveTextContent(
      "1 giờ 30 phút",
    );
    expect(screen.getByTestId("workshop-clock")).toHaveAttribute(
      "data-tone",
      "normal",
    );
    rerender(
      <GarageWorkshopClock startedAt="2026-11-24T01:00:00.000Z" now={NOW} />,
    );
    expect(screen.getByTestId("workshop-clock")).toHaveAttribute(
      "data-tone",
      "warn",
    );
    rerender(<GarageWorkshopClock startedAt={null} now={NOW} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("GarageWorkshopCard", () => {
  it("hiện biển số, xe, status v2 + công đoạn, đồng hồ, người làm, ghi chú; chạm hoặc Enter thì mở", () => {
    const onOpen = vi.fn();
    render(
      <GarageWorkshopCard item={workshopItem()} now={NOW} onOpen={onOpen} />,
    );
    const card = screen.getByTestId("workshop-card-c1");
    expect(card).toHaveTextContent("51A-12345");
    expect(card).toHaveTextContent("VinFast VF8");
    expect(card).toHaveTextContent("Đang làm");
    expect(card).toHaveTextContent("Sơn");
    expect(card).toHaveTextContent("Thợ sơn");
    expect(card).toHaveTextContent("Chờ sơn lót khô");
    expect(card).toHaveTextContent("4 giờ");
    fireEvent.click(card);
    fireEvent.keyDown(card, { key: "Enter" });
    expect(onOpen).toHaveBeenCalledTimes(2);
  });

  it("xe trễ hẹn có nhãn Trễ hẹn; không biển số thì dùng mã phiếu", () => {
    render(
      <GarageWorkshopCard
        item={workshopItem({ licensePlate: null, isOverdue: true })}
        now={NOW}
      />,
    );
    expect(screen.getByTestId("workshop-card-c1")).toHaveTextContent("VV-001");
    expect(screen.getByText("Trễ hẹn")).toBeInTheDocument();
  });
});

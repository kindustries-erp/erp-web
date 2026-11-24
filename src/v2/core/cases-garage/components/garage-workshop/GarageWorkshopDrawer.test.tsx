import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  WORKSHOP_FIXTURE_NOW,
  workshopCaseFixture,
  workshopLogFixture,
  workshopWorkersFixture,
} from "../../workshop/garageWorkshop.fixtures";
import {
  GarageWorkshopDrawer,
  type GarageWorkshopDrawerProps,
} from "./GarageWorkshopDrawer";
import { GarageWorkshopLogForm } from "./GarageWorkshopLogForm";
import { GarageWorkshopTimeline } from "./GarageWorkshopTimeline";

const NOW = WORKSHOP_FIXTURE_NOW;
/** Thẻ `V2ActivityCard` chứa dòng nhật ký (badge thời lượng nằm ở đầu thẻ). */
const card = (id: string) =>
  screen
    .getByTestId(`workshop-log-${id}`)
    .closest('[data-testid="v2-activity-card"]') as HTMLElement;
const closed = workshopLogFixture();
const open = workshopLogFixture({
  id: "l2",
  stage: "PAINTING",
  startedAt: "2026-11-24T08:30:00.000Z",
  endedAt: null,
  durationMinutes: 90,
});
const note = workshopLogFixture({
  id: "l3",
  kind: "NOTE",
  stage: null,
  note: "Đã gọi khách",
  endedAt: null,
});

describe("GarageWorkshopTimeline", () => {
  it("công đoạn đang chạy đếm tới hiện tại, công đoạn đã đóng hiện thời lượng, ghi chú hiện nội dung", () => {
    render(<GarageWorkshopTimeline logs={[open, closed, note]} now={NOW} />);
    expect(card("l2")).toHaveTextContent("Đang làm · 1 giờ 30 phút");
    expect(card("l1")).toHaveTextContent("Đang sửa");
    expect(card("l1")).toHaveTextContent("1 giờ 30 phút");
    expect(card("l3")).toHaveTextContent("Đã gọi khách");
    expect(screen.queryByText("Sửa")).toBeNull();
  });

  it("có quyền thì hiện Sửa/Xóa; danh sách rỗng hiện thông báo", () => {
    const onEdit = vi.fn();
    const onRemove = vi.fn();
    const { rerender } = render(
      <GarageWorkshopTimeline
        logs={[closed]}
        now={NOW}
        canEdit
        onEdit={onEdit}
        onRemove={onRemove}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Sửa/ }));
    fireEvent.click(screen.getByRole("button", { name: /Xóa/ }));
    expect(onEdit).toHaveBeenCalledWith(closed);
    expect(onRemove).toHaveBeenCalledWith(closed);
    rerender(<GarageWorkshopTimeline logs={[]} now={NOW} />);
    expect(
      screen.getByTestId("v2-activity-timeline-empty"),
    ).toBeInTheDocument();
  });
});

describe("GarageWorkshopLogForm", () => {
  const renderForm = (onSubmit = vi.fn().mockResolvedValue(undefined)) => {
    render(
      <GarageWorkshopLogForm
        status="IN_PROGRESS"
        editing={null}
        workers={workshopWorkersFixture}
        onSubmit={onSubmit}
      />,
    );
    return onSubmit;
  };

  it("chỉ hiện công đoạn của status hiện tại; chưa chọn công đoạn thì báo lỗi, không gửi", async () => {
    const onSubmit = renderForm();
    fireEvent.click(screen.getByRole("combobox", { name: "Công đoạn" }));
    expect(
      screen.getByRole("option", { name: /Chờ phụ tùng/ }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("option", { name: /Chờ khách duyệt/ }),
    ).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Lưu tiến độ" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Chọn công đoạn.",
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("chọn công đoạn, nhập mô tả và giờ bắt đầu sửa tay thì gửi payload chuẩn", async () => {
    // Chỉ giả lập Date (giữ timer thật cho waitFor): ô giờ ghép với ngày hôm nay.
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 10, 24, 10, 0));
    const onSubmit = renderForm();
    fireEvent.click(screen.getByRole("combobox", { name: "Công đoạn" }));
    fireEvent.click(screen.getByRole("option", { name: /^Sơn/ }));
    fireEvent.change(screen.getByPlaceholderText(/Ví dụ/), {
      target: { value: " Sơn lót " },
    });
    fireEvent.change(screen.getByLabelText("Bắt đầu lúc – Giờ"), {
      target: { value: "07:15" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Lưu tiến độ" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      kind: "STAGE",
      stage: "PAINTING",
      note: "Sơn lót",
      startedAt: new Date("2026-11-24T07:15").toISOString(),
      endedAt: undefined,
    });
    vi.useRealTimers();
  });
});

const baseProps = (
  over: Partial<GarageWorkshopDrawerProps> = {},
): GarageWorkshopDrawerProps => ({
  open: true,
  item: workshopCaseFixture(),
  logs: [open, closed],
  now: NOW,
  canEdit: true,
  workers: workshopWorkersFixture,
  onCreate: vi.fn().mockResolvedValue(undefined),
  onUpdate: vi.fn().mockResolvedValue(undefined),
  onRemove: vi.fn().mockResolvedValue(undefined),
  onClose: vi.fn(),
  ...over,
});

describe("GarageWorkshopDrawer", () => {
  it("không có quyền thì chỉ xem: không form, không nút sửa", () => {
    render(<GarageWorkshopDrawer {...baseProps({ canEdit: false })} />);
    expect(
      screen.getByText("Bạn chỉ có quyền xem tiến độ."),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("workshop-log-form")).toBeNull();
  });

  it("sửa một dòng: form nạp dữ liệu dòng đó và gửi onUpdate", async () => {
    const props = baseProps();
    render(<GarageWorkshopDrawer {...props} />);
    const row = screen.getByTestId("workshop-log-l1");
    fireEvent.click(within(row).getByRole("button", { name: /Sửa/ }));
    expect(screen.getByText("Đang sửa một dòng nhật ký")).toBeInTheDocument();
    // Giờ kết thúc theo múi giờ máy chạy test, chỉ kiểm có giá trị HH:mm.
    expect(
      (screen.getByLabelText("Kết thúc lúc – Giờ") as HTMLInputElement).value,
    ).toMatch(/^\d{2}:\d{2}$/);
    fireEvent.click(screen.getByRole("button", { name: "Lưu thay đổi" }));
    await waitFor(() =>
      expect(props.onUpdate).toHaveBeenCalledWith("l1", expect.any(Object)),
    );
  });

  it("xóa cần xác nhận trước khi gọi onRemove", async () => {
    const props = baseProps();
    render(<GarageWorkshopDrawer {...props} />);
    fireEvent.click(
      within(screen.getByTestId("workshop-log-l1")).getByRole("button", {
        name: /Xóa/,
      }),
    );
    expect(props.onRemove).not.toHaveBeenCalled();
    expect(await screen.findByText("Xóa dòng nhật ký?")).toBeInTheDocument();
    const buttons = screen.getAllByRole("button", { name: "Xóa" });
    fireEvent.click(buttons[buttons.length - 1]);
    await waitFor(() => expect(props.onRemove).toHaveBeenCalledWith("l1"));
  });
});

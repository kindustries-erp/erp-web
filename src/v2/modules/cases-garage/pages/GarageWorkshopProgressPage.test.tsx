import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useViewport } from "@/v2/shared/hooks/useViewport";
import { useGarageWorkshopProgress } from "../hooks/useGarageWorkshopProgress";
import { useGarageWorkshopTracking } from "../hooks/useGarageWorkshopTracking";
import { GarageWorkshopProgressPage } from "./GarageWorkshopProgressPage";

vi.mock("../hooks/useGarageWorkshopProgress", () => ({
  useGarageWorkshopProgress: vi.fn(),
}));
vi.mock("../hooks/useGarageWorkshopTracking", () => ({
  useGarageWorkshopTracking: vi.fn(),
}));
vi.mock("@/v2/shared/hooks/useViewport", () => ({ useViewport: vi.fn() }));

const tracking = (over: Record<string, unknown> = {}) => {
  const value = {
    canAdd: true,
    canCreate: true,
    canChangeStatus: true,
    addOpen: false,
    openAdd: vi.fn(),
    closeAdd: vi.fn(),
    search: "",
    setSearch: vi.fn(),
    candidates: [],
    candidatesLoading: false,
    submitting: false,
    submit: vi.fn(),
    untrackTarget: null,
    askUntrack: vi.fn(),
    cancelUntrack: vi.fn(),
    confirmUntrack: vi.fn(),
    ...over,
  };
  vi.mocked(useGarageWorkshopTracking).mockReturnValue(value as never);
  return value;
};

const card = {
  id: "c1",
  caseCode: "VV-1",
  licensePlate: "51A-12345",
  vehicleBrandName: null,
  vehicleModelName: null,
  customerName: "Khách A",
  workSummary: null,
  status: "IN_PROGRESS",
  progressStage: "PAINTING",
  assigneeName: null,
  expectedCompletionAt: null,
  isOverdue: false,
  stageStartedAt: null,
  totalElapsedMinutes: null,
  stageWorkerName: null,
  lastNote: null,
};

const vm = (over: Record<string, unknown> = {}) => ({
  hasBranch: true,
  isLoading: false,
  isError: false,
  refetch: vi.fn(),
  items: [card],
  search: "",
  setSearch: vi.fn(),
  now: new Date("2026-11-24T10:00:00Z"),
  canEdit: true,
  canMoveStatus: true,
  selected: null,
  open: vi.fn(),
  openById: vi.fn(),
  boardEmpty: false,
  defaultWorker: null,
  close: vi.fn(),
  logs: [],
  logsLoading: false,
  workers: [],
  workersLoading: false,
  setWorkerSearch: vi.fn(),
  saving: false,
  moveStatus: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
  ...over,
});

const mockVm = (over: Record<string, unknown> = {}) => {
  const value = vm(over);
  vi.mocked(useGarageWorkshopProgress).mockReturnValue(value as never);
  return value;
};

describe("GarageWorkshopProgressPage", () => {
  beforeEach(() => {
    vi.mocked(useViewport).mockReturnValue({ isMobile: false } as never);
    tracking();
  });

  it("desktop: tiêu đề, số xe, board có thẻ; chạm thẻ thì mở xe", () => {
    const v = mockVm();
    render(<GarageWorkshopProgressPage kgaraBranchId="KG1" />);
    expect(screen.getByTestId("garage-workshop-desktop")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Tiến độ xưởng" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("workshop-card-c1"));
    expect(v.open).toHaveBeenCalledWith(card);
  });

  it("mobile: danh sách theo tab status", () => {
    vi.mocked(useViewport).mockReturnValue({ isMobile: true } as never);
    mockVm();
    render(<GarageWorkshopProgressPage kgaraBranchId="KG1" />);
    expect(screen.getByTestId("garage-workshop-mobile")).toBeInTheDocument();
    expect(screen.getByTestId("workshop-mobile-list")).toBeInTheDocument();
    expect(screen.getByTestId("workshop-card-c1")).toBeInTheDocument();
  });

  it("chưa có chi nhánh KGara thì hướng dẫn chọn chi nhánh, không hiện board", () => {
    mockVm({ hasBranch: false, items: [] });
    render(<GarageWorkshopProgressPage />);
    expect(
      screen.getByText(/Chọn chi nhánh có liên kết KGara/),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("workshop-card-c1")).toBeNull();
  });

  it("lỗi tải thì báo lỗi", () => {
    mockVm({ isError: true });
    render(<GarageWorkshopProgressPage kgaraBranchId="KG1" />);
    expect(
      screen.getByText("Không tải được tiến độ xưởng."),
    ).toBeInTheDocument();
  });

  it("dùng V2PageLayout; nút Thêm xe vào bảng mở hộp thoại", () => {
    mockVm();
    const tr = tracking();
    render(<GarageWorkshopProgressPage kgaraBranchId="KG1" />);
    // V2PageLayout nhận `data-testid` của trang; header do PageHeader render.
    expect(screen.getByTestId("garage-workshop-desktop")).toHaveClass(
      "flex-col",
    );
    fireEvent.click(screen.getByRole("button", { name: /Thêm xe vào bảng/ }));
    expect(tr.openAdd).toHaveBeenCalled();
  });

  it("không có quyền thêm thì ẩn nút; bảng rỗng thì hướng dẫn thêm xe", () => {
    mockVm({ items: [], boardEmpty: true });
    tracking({ canAdd: false });
    render(<GarageWorkshopProgressPage kgaraBranchId="KG1" />);
    expect(
      screen.queryByRole("button", { name: /Thêm xe vào bảng/ }),
    ).toBeNull();
    expect(screen.getByText("Chưa có xe trên bảng")).toBeInTheDocument();
  });

  it("hộp xác nhận bỏ khỏi bảng: xác nhận thì đóng drawer và gọi bỏ", () => {
    const v = mockVm();
    const tr = tracking({ untrackTarget: card });
    render(<GarageWorkshopProgressPage kgaraBranchId="KG1" />);
    expect(screen.getByText("Bỏ xe 51A-12345 khỏi bảng?")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Bỏ khỏi bảng" }));
    expect(v.close).toHaveBeenCalled();
    expect(tr.confirmUntrack).toHaveBeenCalled();
  });
});

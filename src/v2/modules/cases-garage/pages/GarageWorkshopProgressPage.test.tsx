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
  isLoading: false,
  isError: false,
  refetch: vi.fn(),
  items: [card],
  search: "",
  setSearch: vi.fn(),
  classification: null,
  setClassification: vi.fn(),
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
    render(<GarageWorkshopProgressPage branchId="B1" />);
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
    render(<GarageWorkshopProgressPage branchId="B1" />);
    expect(screen.getByTestId("garage-workshop-mobile")).toBeInTheDocument();
    expect(screen.getByTestId("workshop-mobile-list")).toBeInTheDocument();
    expect(screen.getByTestId("workshop-card-c1")).toBeInTheDocument();
  });

  it("không chọn chi nhánh vẫn hiện board, không còn câu KGara", () => {
    render(<GarageWorkshopProgressPage />);
    expect(screen.getByTestId("workshop-card-c1")).toBeInTheDocument();
    expect(screen.queryByText(/KGara/)).toBeNull();
  });

  it("lỗi tải thì báo lỗi", () => {
    mockVm({ isError: true });
    render(<GarageWorkshopProgressPage branchId="B1" />);
    expect(
      screen.getByText("Không tải được tiến độ xưởng."),
    ).toBeInTheDocument();
  });

  it("dùng V2PageLayout; nút Thêm xe vào bảng mở hộp thoại", () => {
    mockVm();
    const tr = tracking();
    render(<GarageWorkshopProgressPage branchId="B1" />);
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
    render(<GarageWorkshopProgressPage branchId="B1" />);
    expect(
      screen.queryByRole("button", { name: /Thêm xe vào bảng/ }),
    ).toBeNull();
    expect(screen.getByText("Chưa có xe trên bảng")).toBeInTheDocument();
  });

  it("hộp xác nhận bỏ khỏi bảng: xác nhận thì đóng drawer và gọi bỏ", () => {
    const v = mockVm();
    const tr = tracking({ untrackTarget: card });
    render(<GarageWorkshopProgressPage branchId="B1" />);
    expect(screen.getByText("Bỏ xe 51A-12345 khỏi bảng?")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Bỏ khỏi bảng" }));
    expect(v.close).toHaveBeenCalled();
    expect(tr.confirmUntrack).toHaveBeenCalled();
  });

  it("có ô lọc Phân loại, mặc định Tất cả phân loại", () => {
    render(<GarageWorkshopProgressPage branchId="B1" />);
    expect(screen.getByLabelText("Phân loại")).toBeInTheDocument();
    expect(screen.getByText("Tất cả phân loại")).toBeInTheDocument();
  });

  it("ô phạm vi: mặc định chi nhánh đang chọn; chọn Tất cả chi nhánh thì hook nhận undefined", () => {
    mockVm();
    render(<GarageWorkshopProgressPage branchId="B1" />);
    expect(useGarageWorkshopProgress).toHaveBeenLastCalledWith("B1");
    expect(useGarageWorkshopTracking).toHaveBeenLastCalledWith(
      "B1",
      expect.anything(),
      "B1",
    );
    fireEvent.click(
      screen.getByRole("combobox", { name: "Phạm vi chi nhánh" }),
    );
    fireEvent.click(screen.getByRole("option", { name: "Tất cả chi nhánh" }));
    expect(useGarageWorkshopProgress).toHaveBeenLastCalledWith(undefined);
    // Xem mọi chi nhánh nhưng xe tạo mới vẫn gắn chi nhánh shell.
    expect(useGarageWorkshopTracking).toHaveBeenLastCalledWith(
      undefined,
      expect.anything(),
      "B1",
    );
  });

  it("không có chi nhánh ở shell thì không hiện ô phạm vi", () => {
    mockVm();
    render(<GarageWorkshopProgressPage />);
    expect(
      screen.queryByRole("combobox", { name: "Phạm vi chi nhánh" }),
    ).toBeNull();
  });
});

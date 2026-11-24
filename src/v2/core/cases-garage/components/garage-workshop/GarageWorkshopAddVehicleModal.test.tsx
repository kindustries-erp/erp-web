import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { workshopCandidatesFixture } from "../../workshop/garageWorkshop.fixtures";
import {
  GarageWorkshopAddVehicleModal,
  type GarageWorkshopAddVehicleModalProps,
} from "./GarageWorkshopAddVehicleModal";

const props = (
  over: Partial<GarageWorkshopAddVehicleModalProps> = {},
): GarageWorkshopAddVehicleModalProps => ({
  open: true,
  search: "51g 123",
  onSearchChange: vi.fn(),
  candidates: workshopCandidatesFixture,
  canCreate: true,
  canChangeStatus: true,
  onSubmit: vi.fn().mockResolvedValue({}),
  onClose: vi.fn(),
  ...over,
});

const submitBtn = () => screen.getByRole("button", { name: "Đưa vào bảng" });

describe("GarageWorkshopAddVehicleModal", () => {
  it("chưa chọn xe thì không gửi được", () => {
    render(<GarageWorkshopAddVehicleModal {...props()} />);
    expect(submitBtn()).toBeDisabled();
  });

  it("xe KGara giữ trạng thái: gửi không kèm status rồi đóng", async () => {
    const p = props();
    render(<GarageWorkshopAddVehicleModal {...p} />);
    fireEvent.click(screen.getByRole("radio", { name: /51G-123\.45/ }));
    expect(screen.getByRole("radio", { name: /^Báo giá/ })).toBeChecked();
    fireEvent.click(submitBtn());
    await waitFor(() =>
      expect(p.onSubmit).toHaveBeenCalledWith({
        mode: "existing",
        caseId: "k1",
        status: undefined,
      }),
    );
    await waitFor(() => expect(p.onClose).toHaveBeenCalled());
  });

  it("xe KGara đổi trạng thái: hiện gợi ý ghi đè và gửi status mới", async () => {
    const p = props();
    render(<GarageWorkshopAddVehicleModal {...p} />);
    fireEvent.click(screen.getByRole("radio", { name: /51G-123\.45/ }));
    fireEvent.click(screen.getByRole("radio", { name: /^Đang làm/ }));
    expect(screen.getByText(/KGara giữ nguyên/)).toBeInTheDocument();
    fireEvent.click(submitBtn());
    await waitFor(() =>
      expect(p.onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ status: "IN_PROGRESS" }),
      ),
    );
  });

  it("xe mới: nhập tên khách, gửi biển số viết hoa; lỗi thì giữ hộp thoại", async () => {
    const p = props({ onSubmit: vi.fn().mockRejectedValue(new Error("409")) });
    render(<GarageWorkshopAddVehicleModal {...p} />);
    fireEvent.click(screen.getByRole("radio", { name: /Tạo xe mới/ }));
    expect(screen.getByRole("radio", { name: /^Hoàn thành/ })).toBeDisabled();
    fireEvent.change(screen.getByLabelText("Tên khách (không bắt buộc)"), {
      target: { value: "Anh Ba" },
    });
    fireEvent.click(submitBtn());
    await waitFor(() =>
      expect(p.onSubmit).toHaveBeenCalledWith({
        mode: "new",
        licensePlate: "51G 123",
        customerName: "Anh Ba",
        status: "INTAKE",
      }),
    );
    expect(p.onClose).not.toHaveBeenCalled();
  });

  it("không có quyền đổi trạng thái: khóa trạng thái khác và báo lý do", () => {
    render(
      <GarageWorkshopAddVehicleModal {...props({ canChangeStatus: false })} />,
    );
    fireEvent.click(screen.getByRole("radio", { name: /51G-123\.45/ }));
    expect(screen.getByRole("radio", { name: /^Đang làm/ })).toBeDisabled();
    expect(
      screen.getByText(/Cần quyền sửa vụ việc garage/),
    ).toBeInTheDocument();
  });
});

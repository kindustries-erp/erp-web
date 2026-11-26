import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { workshopCandidatesFixture } from "../../workshop/garageWorkshop.fixtures";
import { WORKSHOP_NEW_CANDIDATE } from "../../workshop";
// Import qua barrel để nạp locale họ garage (nhãn có tham số `{{plate}}`).
import { GarageWorkshopCandidatePicker } from "../..";

const base = {
  candidates: workshopCandidatesFixture,
  canCreate: true,
  value: null,
};

describe("GarageWorkshopCandidatePicker", () => {
  it("chưa đủ 2 ký tự thì nhắc gõ thêm", () => {
    render(
      <GarageWorkshopCandidatePicker {...base} search="5" onChange={vi.fn()} />,
    );
    expect(screen.getByText(/ít nhất 2 ký tự/)).toBeInTheDocument();
  });

  it("liệt kê xe, khóa xe đã trên bảng, có lựa chọn tạo xe mới theo biển số", () => {
    const onChange = vi.fn();
    render(
      <GarageWorkshopCandidatePicker
        {...base}
        search="51g 123"
        onChange={onChange}
      />,
    );
    expect(screen.getByRole("radio", { name: /51G-123\.45/ })).toBeEnabled();
    expect(screen.getByRole("radio", { name: /51G-123\.99/ })).toBeDisabled();
    expect(screen.getByText(/Đã có trên bảng/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("radio", { name: /Tạo xe mới 51G 123/ }));
    expect(onChange).toHaveBeenCalledWith(WORKSHOP_NEW_CANDIDATE);
  });

  it("không có xe và không có quyền tạo thì báo cần quyền", () => {
    render(
      <GarageWorkshopCandidatePicker
        {...base}
        candidates={[]}
        canCreate={false}
        search="99Z"
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByTestId("workshop-add-none")).toHaveTextContent(
      "Cần quyền tạo vụ việc garage",
    );
  });
});

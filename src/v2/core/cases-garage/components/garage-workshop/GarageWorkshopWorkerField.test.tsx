import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { workshopWorkersFixture } from "../../workshop/garageWorkshop.fixtures";
// Nạp locale họ garage (nhãn có tham số `{{code}}`).
import "../..";
import {
  GarageWorkshopWorkerField,
  type WorkshopWorkerValue,
} from "./GarageWorkshopWorkerField";

function Harness({
  spy,
  init,
}: {
  spy: (v: WorkshopWorkerValue) => void;
  init?: WorkshopWorkerValue;
}) {
  const [v, setV] = React.useState<WorkshopWorkerValue>(
    init ?? { workerId: null, workerName: "" },
  );
  return (
    <GarageWorkshopWorkerField
      {...v}
      workers={workshopWorkersFixture}
      onChange={(next) => {
        spy(next);
        setV(next);
      }}
    />
  );
}
const box = () => screen.getByRole("combobox", { name: "Người làm" });

describe("GarageWorkshopWorkerField", () => {
  it("gõ tên hiện gợi ý; chọn thì gắn nhân viên và hiện mã", () => {
    const spy = vi.fn();
    render(<Harness spy={spy} />);
    fireEvent.change(box(), { target: { value: "thợ b" } });
    fireEvent.click(screen.getByRole("option", { name: /Thợ B/ }));
    expect(spy).toHaveBeenLastCalledWith({
      workerId: "e2",
      workerName: "Thợ B",
    });
    expect(box()).toHaveValue("Thợ B");
    expect(screen.getByText("Nhân viên NV02")).toBeInTheDocument();
  });

  it("gõ tên không có trong danh sách: giữ tên, không gắn nhân viên, không còn công tắc", () => {
    const spy = vi.fn();
    render(<Harness spy={spy} />);
    fireEvent.change(box(), { target: { value: "Thợ thuê ngoài" } });
    expect(spy).toHaveBeenLastCalledWith({
      workerId: null,
      workerName: "Thợ thuê ngoài",
    });
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(screen.getByText(/Tên nhập tay/)).toBeInTheDocument();
    expect(screen.queryByRole("switch")).toBeNull();
  });

  it("sửa tên sau khi đã chọn nhân viên thì bỏ gắn nhân viên", () => {
    const spy = vi.fn();
    render(
      <Harness spy={spy} init={{ workerId: "e1", workerName: "Thợ A" }} />,
    );
    fireEvent.change(box(), { target: { value: "Thợ A2" } });
    expect(spy).toHaveBeenLastCalledWith({
      workerId: null,
      workerName: "Thợ A2",
    });
  });
});

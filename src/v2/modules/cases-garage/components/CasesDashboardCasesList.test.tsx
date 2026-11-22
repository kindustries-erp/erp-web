import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CasesDashboardCasesList } from "./CasesDashboardCasesList";

const vehicle = (key: string, plate: string, codes: string[]) => ({
  vehicleKey: key,
  licensePlate: plate,
  customerName: "KH",
  caseCount: codes.length,
  caseCodes: codes,
  amount: 1000,
  latestAt: null,
  cases: [],
});

const props = {
  title: "Danh sách xe · Báo giá",
  loading: false,
  onPrevious: vi.fn(),
  onNext: vi.fn(),
  onClose: vi.fn(),
};

describe("CasesDashboardCasesList", () => {
  it("mỗi xe một dòng; xe nhiều lệnh hiện số lệnh và các số phiếu", () => {
    render(
      <CasesDashboardCasesList
        {...props}
        items={[
          vehicle("A", "51B-756.95", ["GN-1", "GN-2"]),
          vehicle("B", "30G-258.46", ["GN-3"]),
        ]}
      />,
    );

    expect(screen.getAllByRole("row")).toHaveLength(3); // tiêu đề + 2 xe
    expect(screen.getByText("51B-756.95")).toBeTruthy();
    expect(screen.getByText("GN-1, GN-2")).toBeTruthy();
    expect(screen.getByText("2")).toBeTruthy();
  });

  it("không có xe thì hiện thông báo trống và nút Đóng hoạt động", () => {
    render(<CasesDashboardCasesList {...props} items={[]} />);

    expect(screen.queryByRole("table")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /Đóng|Close/ }));
    expect(props.onClose).toHaveBeenCalled();
  });
});

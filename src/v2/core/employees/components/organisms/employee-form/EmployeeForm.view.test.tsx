import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { emptyEmployeeForm } from "../../../domain/employee";
import "../../../employees.locale";
import type { EmployeeFormProps } from "./EmployeeForm.type";
import { EmployeeAccountSection } from "./EmployeeAccountSection";
import { EmployeeProfileSection } from "./EmployeeProfileSection";
import { EmployeeProfileView } from "./EmployeeProfileView";
import { EmployeeWorkSection } from "./EmployeeWorkSection";
import { EmployeeWorkView } from "./EmployeeWorkView";

const t = (_key: string, fallback?: string) => fallback ?? _key;
const FORM_ROLES = ["textbox", "combobox", "spinbutton"] as const;
const expectNoInputs = () =>
  FORM_ROLES.forEach((role) =>
    expect(screen.queryAllByRole(role)).toHaveLength(0),
  );

const form = {
  ...emptyEmployeeForm(),
  employeeCode: "NV001",
  fullName: "Nguyễn Văn An",
  phone: "0901234567",
  email: "an@liouni.com",
  birthDate: "1990-05-20",
  address: "12 Lê Lợi, Quận 1",
  jobTitle: "Kế toán",
  department: "Tài chính",
  branchId: "b1",
  status: "ACTIVE" as const,
  startDate: "2024-01-02",
  notes: "Ghi chú thử",
};

const base: EmployeeFormProps = {
  form,
  viewing: true,
  creating: false,
  error: null,
  branchOptions: [{ value: "b1", label: "Chi nhánh 1" }],
  branchLoading: false,
  nationalIdMasked: "********1234",
  linkedUserEmail: "an@liouni.com",
  t,
  setField: vi.fn(),
};

describe("Employee form view mode render thông tin", () => {
  it("EmployeeProfileView hiển thị nhãn - giá trị, không có ô nhập", () => {
    render(
      <EmployeeProfileView form={form} nationalIdMasked="********1234" t={t} />,
    );
    expect(screen.getByText("Họ tên")).toBeTruthy();
    expect(screen.getByText("Nguyễn Văn An")).toBeTruthy();
    expect(screen.getByText("********1234")).toBeTruthy();
    expect(screen.getByText("12 Lê Lợi, Quận 1")).toBeTruthy();
    expectNoInputs();
  });

  it("EmployeeWorkView hiển thị chi nhánh, trạng thái, ngày; không có ô nhập", () => {
    render(
      <EmployeeWorkView form={form} branchOptions={base.branchOptions} t={t} />,
    );
    expect(screen.getByText("Chi nhánh 1")).toBeTruthy();
    expect(screen.getByText("Đang làm")).toBeTruthy();
    expect(screen.getByText("Kế toán")).toBeTruthy();
    expectNoInputs();
  });

  it("EmployeeWorkView dùng nhãn dự phòng khi chi nhánh chưa có trong danh sách", () => {
    render(
      <EmployeeWorkView
        form={form}
        branchOptions={[]}
        branchFallbackLabel="Chi nhánh cũ"
        t={t}
      />,
    );
    expect(screen.getByText("Chi nhánh cũ")).toBeTruthy();
  });

  it("các Section ở view mode không render control nhập", () => {
    render(
      <>
        <EmployeeProfileSection {...base} />
        <EmployeeWorkSection {...base} />
        <EmployeeAccountSection linkedUserEmail="an@liouni.com" t={t} />
      </>,
    );
    expectNoInputs();
  });

  it("EmployeeAccountSection hiển thị thông báo khi chưa liên kết", () => {
    render(<EmployeeAccountSection t={t} />);
    expect(screen.getByText("Chưa liên kết tài khoản")).toBeTruthy();
    expectNoInputs();
  });

  it("edit mode vẫn render ô nhập", () => {
    render(
      <>
        <EmployeeProfileSection {...base} viewing={false} />
        <EmployeeWorkSection {...base} viewing={false} />
      </>,
    );
    expect(screen.getAllByRole("textbox").length).toBeGreaterThan(0);
    expect(screen.getAllByRole("combobox").length).toBeGreaterThan(0);
  });
});

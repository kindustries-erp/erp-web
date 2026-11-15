import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { UserFormValue } from "../../../domain/user";
import "../../../users.locale";
import { UserFormSections } from "./UserFormSections";
import { UserFormView } from "./UserFormView";

const t = (_key: string, fallback?: string) => fallback ?? _key;

const form = {
  email: "an@liouni.com",
  password: "",
  status: "ACTIVE",
  employeeId: "e1",
} as UserFormValue;

const FORM_ROLES = ["textbox", "combobox", "spinbutton"] as const;

describe("UserFormView (view mode render thông tin)", () => {
  it("hiển thị nhãn - giá trị, không có ô nhập", () => {
    render(<UserFormView form={form} employeeLabel="Nguyễn An" t={t} />);

    expect(screen.getByText("Email")).toBeTruthy();
    expect(screen.getByText("an@liouni.com")).toBeTruthy();
    expect(screen.getByText("Nguyễn An")).toBeTruthy();
    expect(screen.getByText("Hoạt động")).toBeTruthy();
    FORM_ROLES.forEach((role) =>
      expect(screen.queryAllByRole(role)).toHaveLength(0),
    );
  });

  it("hiển thị — khi chưa liên kết nhân viên", () => {
    render(<UserFormView form={form} t={t} />);
    expect(screen.getAllByText("—").length).toBeGreaterThan(0);
  });
});

describe("UserFormSections", () => {
  const base = {
    form,
    emailEditable: false,
    creating: false,
    emailError: "",
    passwordError: "",
    employeeOptions: [{ value: "e1", label: "Nguyễn An" }],
    employeeLoading: false,
    t,
    setField: vi.fn(),
  };

  it("view mode không render control nhập", () => {
    render(<UserFormSections {...base} viewing />);
    FORM_ROLES.forEach((role) =>
      expect(screen.queryAllByRole(role)).toHaveLength(0),
    );
    expect(screen.getByText("Nguyễn An")).toBeTruthy();
  });

  it("edit mode vẫn render ô nhập và combobox", () => {
    render(<UserFormSections {...base} viewing={false} />);
    expect(screen.getAllByRole("textbox").length).toBeGreaterThan(0);
    expect(screen.getAllByRole("combobox").length).toBeGreaterThan(0);
  });
});

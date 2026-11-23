import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  emptyBusinessPartnerForm,
  type BusinessPartnerFormValue,
} from "../../../domain/entities/businessPartner";
import { BusinessPartnerFormSections } from "./BusinessPartnerFormSections";

const form: BusinessPartnerFormValue = {
  ...emptyBusinessPartnerForm(),
  code: "KH-001",
  name: "Khách hàng A",
  address: "Quận 1",
};

const renderSections = (
  overrides: Partial<Parameters<typeof BusinessPartnerFormSections>[0]> = {},
) =>
  render(
    <BusinessPartnerFormSections
      form={form}
      viewing={false}
      codeEditable
      nameError=""
      t={(_key, fallback) => fallback ?? ""}
      setField={vi.fn()}
      onRegenerateCode={vi.fn()}
      {...overrides}
    />,
  );

describe("BusinessPartnerFormSections", () => {
  it("locks the code and hides regenerate once the partner exists", () => {
    renderSections({ codeEditable: false });

    expect(screen.getByDisplayValue("KH-001")).toBeDisabled();
    expect(
      screen.queryByRole("button", { name: "Sinh mã mới" }),
    ).not.toBeInTheDocument();
  });

  it("offers regenerate only when creating", () => {
    const onRegenerateCode = vi.fn();
    renderSections({ onRegenerateCode });

    fireEvent.click(screen.getByRole("button", { name: "Sinh mã mới" }));
    expect(onRegenerateCode).toHaveBeenCalledTimes(1);
  });

  it("renders read-only values in view mode without form fields", () => {
    renderSections({ viewing: true });

    expect(screen.getByText("Quận 1")).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("uses the shared textarea for address and notes in edit mode", () => {
    renderSections();

    expect(screen.getAllByRole("textbox").length).toBeGreaterThan(0);
    expect(document.querySelectorAll("textarea")).toHaveLength(2);
  });
});

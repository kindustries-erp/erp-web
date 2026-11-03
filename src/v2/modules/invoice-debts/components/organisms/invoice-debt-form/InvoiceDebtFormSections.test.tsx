import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { emptyInvoiceDebtForm } from "../../../domain/entities/invoiceDebt";
import { InvoiceDebtFormSections } from "./InvoiceDebtFormSections";

const renderSections = (viewing: boolean) =>
  render(
    <InvoiceDebtFormSections
      form={{ ...emptyInvoiceDebtForm(), search: "Mẫu" }}
      viewing={viewing}
      errorField={null}
      errorMessage=""
      t={(_key, fallback) => fallback ?? ""}
      setField={vi.fn()}
    />,
  );

describe("InvoiceDebtFormSections", () => {
  it("renders read-only values in view mode without inputs", () => {
    renderSections(true);
    expect(screen.getAllByText("Mẫu").length).toBeGreaterThan(0);
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("renders editable fields in edit mode", () => {
    renderSections(false);
    expect(screen.getAllByRole("textbox").length).toBeGreaterThan(0);
  });
});

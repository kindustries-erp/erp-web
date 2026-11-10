import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { emptyRoleForm } from "../../../domain/entities/role";
import { RoleFormSections } from "./RoleFormSections";

const renderSections = (viewing: boolean) =>
  render(
    <RoleFormSections
      form={{ ...emptyRoleForm(), name: "Mẫu", description: "Mô tả mẫu" }}
      viewing={viewing}
      errorField={null}
      errorMessage=""
      t={(_key, fallback) => fallback ?? ""}
      setField={vi.fn()}
    />,
  );

describe("RoleFormSections", () => {
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

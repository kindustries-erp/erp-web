import { describe, expect, it } from "vitest";
import { canDeleteRole, isRoleFormDirty, validateRoleForm } from "./roleRules";

describe("roleRules", () => {
  it("validateRoleForm requires non-empty name", () => {
    expect(validateRoleForm({ name: "", description: "" })).toBe("name");
    expect(validateRoleForm({ name: "   ", description: "" })).toBe("name");
    expect(validateRoleForm({ name: "Admin", description: "" })).toBeNull();
  });

  it("isRoleFormDirty correctly identifies changes", () => {
    const initial = { name: "Admin", description: "Admin role" };
    expect(isRoleFormDirty(initial, initial)).toBe(false);
    expect(isRoleFormDirty({ ...initial, name: "Manager" }, initial)).toBe(
      true,
    );
    expect(
      isRoleFormDirty({ ...initial, description: "Updated" }, initial),
    ).toBe(true);
  });

  it("canDeleteRole prevents deleting system role", () => {
    expect(canDeleteRole(null)).toBe(false);
    expect(
      canDeleteRole({ id: "1", name: "System Admin", isSystem: true }),
    ).toBe(false);
    expect(
      canDeleteRole({ id: "2", name: "Custom Role", isSystem: false }),
    ).toBe(true);
  });
});

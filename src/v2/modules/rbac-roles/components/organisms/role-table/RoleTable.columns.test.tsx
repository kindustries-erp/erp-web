import { describe, expect, it } from "vitest";
import { buildRolesColumns } from "./RoleTable.columns";
import { rolesViewVisibility } from "./RoleTable.views";

const columns = buildRolesColumns(
  (_key, fallback) => fallback ?? "",
  () => undefined,
);

describe("buildRolesColumns", () => {
  it("leaves the row number to V2StandardTable", () => {
    expect(columns.map((column) => column.key)).not.toContain("index");
  });

  it("keeps every field as a column in the correct order", () => {
    expect(columns.map((column) => column.key)).toEqual([
      "name",
      "description",
      "users",
      "isSystem",
      "status",
      "createdAt",
    ]);
  });
});

describe("rolesViewVisibility", () => {
  it("shows all columns in the all view", () => {
    expect(Object.values(rolesViewVisibility.all).every(Boolean)).toBe(true);
  });
});

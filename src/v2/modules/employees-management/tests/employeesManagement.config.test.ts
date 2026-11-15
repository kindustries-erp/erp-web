import { describe, expect, it } from "vitest";
import { employeesManagementConfig } from "../employeesManagement.config";

describe("employeesManagementConfig", () => {
  it("ghép đủ API, khóa cache và quyền riêng của module", () => {
    expect(employeesManagementConfig.keys.all).toEqual([
      "v2-employees-management",
    ]);
    expect(employeesManagementConfig.permissionCollection).toBe("employees");
    expect(typeof employeesManagementConfig.api.list).toBe("function");
  });
});

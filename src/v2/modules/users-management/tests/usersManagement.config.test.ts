import { describe, expect, it } from "vitest";
import { usersManagementConfig } from "../usersManagement.config";

describe("usersManagementConfig", () => {
  it("ghép đủ API, khóa cache và quyền riêng của module", () => {
    expect(usersManagementConfig.keys.all).toEqual(["v2-users-management"]);
    expect(usersManagementConfig.permissionCollection).toBe("admin_users");
    expect(typeof usersManagementConfig.api.list).toBe("function");
  });
});

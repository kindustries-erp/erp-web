import { describe, expect, it } from "vitest";
import { businessPartnersCustomersConfig } from "../businessPartnersCustomers.config";

describe("businessPartnersCustomersConfig", () => {
  it("ghép đủ API, khóa cache và quyền riêng của module", () => {
    expect(businessPartnersCustomersConfig.keys.all).toEqual([
      "v2-business-partners-customers",
    ]);
    expect(businessPartnersCustomersConfig.permissionCollection).toBe(
      "business_partners",
    );
    expect(typeof businessPartnersCustomersConfig.api.list).toBe("function");
  });
});

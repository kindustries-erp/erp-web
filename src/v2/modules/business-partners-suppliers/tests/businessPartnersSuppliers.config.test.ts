import { describe, expect, it } from "vitest";
import { businessPartnersSuppliersConfig } from "../businessPartnersSuppliers.config";

describe("businessPartnersSuppliersConfig", () => {
  it("ghép đủ API, khóa cache và quyền riêng của module", () => {
    expect(businessPartnersSuppliersConfig.keys.all).toEqual([
      "v2-business-partners-suppliers",
    ]);
    expect(businessPartnersSuppliersConfig.permissionCollection).toBe(
      "business_partners",
    );
    expect(typeof businessPartnersSuppliersConfig.api.list).toBe("function");
  });
});

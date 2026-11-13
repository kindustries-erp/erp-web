import { describe, expect, it } from "vitest";
import {
  isV2TablePreferenceId,
  v2TablePreferenceListPath,
  v2TablePreferencePath,
} from "./v2TablePreferences.sync";

describe("v2TablePreferencePath", () => {
  it("routes procurement tables to the v2 endpoint", () => {
    expect(v2TablePreferencePath("procurement-requests-garage-table")).toBe(
      "/api/v2/table-preferences/procurement-requests-garage-table",
    );
  });

  it("routes inventory-movements tables to the v2 endpoint", () => {
    expect(
      v2TablePreferencePath("inventory-movements-vouchers-garage-table"),
    ).toBe(
      "/api/v2/table-preferences/inventory-movements-vouchers-garage-table",
    );
  });

  it("keeps other tables on the v1 endpoint", () => {
    expect(v2TablePreferencePath("erp-customers-table")).toBe(
      "/api/v1/app/table-preferences/erp-customers-table",
    );
    expect(v2TablePreferencePath("erp-garage-goods-receipts-table")).toBe(
      "/api/v1/app/table-preferences/erp-garage-goods-receipts-table",
    );
  });

  it("encodes the tableId segment", () => {
    expect(v2TablePreferencePath("procurement-a/b")).toBe(
      "/api/v2/table-preferences/procurement-a%2Fb",
    );
  });
});

describe("isV2TablePreferenceId", () => {
  it("matches only the configured prefix", () => {
    expect(isV2TablePreferenceId("procurement-orders-garage-table")).toBe(true);
    expect(isV2TablePreferenceId("erp-garage-procurement-orders-table")).toBe(
      false,
    );
  });
});

describe("v2TablePreferenceListPath", () => {
  it("builds the list url with an encoded prefix", () => {
    expect(v2TablePreferenceListPath("procurement-")).toBe(
      "/api/v2/table-preferences?tableIdPrefix=procurement-",
    );
  });
});

import { describe, expect, it } from "vitest";
import { buildV2CoreData } from "./v2CoreData.mjs";
import { v2CoreFileMap } from "./v2CoreFiles.mjs";
import { buildV2CoreManifest, v2CoreManifestJson } from "./v2CoreManifest.mjs";

const answers = {
  familyInput: "customer-claims",
  entityInput: "CustomerClaim",
};

describe("buildV2CoreData", () => {
  it("suy ra tên hợp đồng từ entity", () => {
    const data = buildV2CoreData(answers);
    expect(data.coreDir).toBe("src/v2/core/customer-claims");
    expect(data.recordType).toBe("CustomerClaimRecord");
    expect(data.formValueType).toBe("CustomerClaimFormValue");
    expect(data.apiType).toBe("CustomerClaimApi");
    expect(data.keysFactory).toBe("createCustomerClaimKeys");
    expect(data.configType).toBe("CustomerClaimModuleConfig");
    expect(data.localeNamespace).toBe("customerClaims");
    expect(data.configFileImport).toBe("./customer-claims.config.type");
    expect(data.apiTypeImport).toBe("./api/customerClaimApi.type");
    expect(data.keysImport).toBe("./api/customerClaimKeys");
    expect(data.domainFromApi).toBe("../domain/customerClaim");
  });

  it("từ chối họ hoặc entity sai định dạng", () => {
    expect(() =>
      buildV2CoreData({ ...answers, familyInput: "CustomerClaims" }),
    ).toThrow(/Tên họ/);
    expect(() =>
      buildV2CoreData({ ...answers, entityInput: "customer_claim" }),
    ).toThrow(/Tên entity/);
  });
});

describe("v2CoreFileMap", () => {
  it("sinh 6 file khung nằm trong src/v2/core/<họ>", () => {
    const files = v2CoreFileMap(buildV2CoreData(answers));
    expect(files).toHaveLength(6);
    for (const { path } of files)
      expect(path.startsWith("src/v2/core/customer-claims/")).toBe(true);
    expect(files.map((f) => f.path)).toContain(
      "src/v2/core/customer-claims/customer-claims.locale.ts",
    );
  });
});

describe("core.manifest.json (web)", () => {
  it("exports mặc định là null để chưa cho ghép module", () => {
    const manifest = buildV2CoreManifest(buildV2CoreData(answers));
    expect(manifest.layer).toBe("web");
    expect(manifest.exports).toBeNull();
  });

  it("v2CoreManifestJson là JSON hợp lệ", () => {
    const json = JSON.parse(v2CoreManifestJson(buildV2CoreData(answers)));
    expect(json.family).toBe("customer-claims");
    expect(json.barrel).toBe("src/v2/core/customer-claims/index.ts");
  });
});

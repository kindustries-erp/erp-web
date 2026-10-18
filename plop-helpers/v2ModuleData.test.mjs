import { describe, expect, it } from "vitest";
import { buildModuleData, camelCase, decorateFields, kebabCase, pascalCase } from "./v2ModuleData.mjs";

const base = {
  moduleName: "sample-items",
  entityName: "SampleItem",
  pluralName: "SampleItems",
  titleVi: "Mẫu",
  titleEn: "Sample",
  apiBase: "/api/v1/sample-items",
  permissionCollection: "sample_items",
  routeInput: "",
  navSection: "settings",
  tableInput: "",
  fieldSpec: "code:string:required,name:string:required,phone:string,address:text,status:status",
  hasNextCode: false,
};

describe("case helpers", () => {
  it("converts between naming styles", () => {
    expect(pascalCase("sample-items")).toBe("SampleItems");
    expect(camelCase("SampleItem")).toBe("sampleItem");
    expect(kebabCase("sampleItems")).toBe("sample-items");
    expect(kebabCase("business-partners")).toBe("business-partners");
  });
});

describe("buildModuleData", () => {
  it("derives names, route, table id and flags", () => {
    const data = buildModuleData(base);
    expect(data).toMatchObject({
      moduleKebab: "sample-items",
      namespace: "sampleItems",
      Entity: "SampleItem",
      entity: "sampleItem",
      EntityPlural: "SampleItems",
      entityPlural: "sampleItems",
      routePath: "sample-items",
      tableId: "erp-sample-items-table",
      hasStatus: true,
      viewConst: "sampleItemsViewVisibility",
    });
    expect(data.formFields.map((f) => f.name)).not.toContain("createdAt");
    expect(data.requiredFields.map((f) => f.name)).toEqual(["code", "name"]);
  });

  it("marks overview columns and skips createdAt there", () => {
    const data = buildModuleData(base);
    const overview = data.fields.filter((f) => f.inOverview).map((f) => f.name);
    expect(overview).toEqual(["code", "name", "phone", "address"]);
  });

  it("rejects invalid input before anything is generated", () => {
    expect(() => buildModuleData({ ...base, entityName: "1bad" })).toThrow(/entityName/);
    expect(() => buildModuleData({ ...base, apiBase: "v1/x" })).toThrow(/apiBase/);
    expect(() => buildModuleData({ ...base, navSection: "hr" })).toThrow(/navSection/);
    expect(() => buildModuleData({ ...base, fieldSpec: "name:string" })).toThrow(/required/);
    expect(() => buildModuleData({ ...base, fieldSpec: "name:text" })).toThrow(/required/);
  });

  it("requires the first field to be text when a next code is generated", () => {
    expect(() =>
      buildModuleData({ ...base, hasNextCode: true, fieldSpec: "status:status:required,name:string:required" }),
    ).toThrow(/hasNextCode/);
  });
});


describe("numeric summary flags", () => {
  it("marks decimal as amount summary and number as qty summary", () => {
    const [amount, qty] = decorateFields([
      { name: "amount", type: "decimal", required: false },
      { name: "qty", type: "number", required: false },
    ]);
    expect(amount.isNumber).toBe(true);
    expect(amount.summaryVariant).toBe("amount");
    expect(amount.tsType).toBe("number");
    expect(qty.summaryVariant).toBe("qty");
  });
});

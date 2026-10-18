import { mkdtempSync, readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import nodePlop from "node-plop";
import { describe, expect, it } from "vitest";

const ROOT = resolve(import.meta.dirname, "..");

const answers = {
  moduleName: "sample-items",
  entityName: "SampleItem",
  pluralName: "SampleItems",
  titleVi: "Mẫu",
  titleEn: "Sample",
  apiBase: "/api/v1/sample-items",
  permissionCollection: "sample_items",
  routeInput: "sample-items",
  navSection: "settings",
  tableInput: "erp-sample-items-table",
  fieldSpec: "code:string:required,name:string:required,phone:string,address:text,status:status",
  hasNextCode: false,
  wire: false,
};

const runGenerator = async (overrides = {}) => {
  const dest = mkdtempSync(join(tmpdir(), "v2-module-"));
  const plop = await nodePlop(join(ROOT, "plopfile.mjs"), { destBasePath: dest, force: false });
  const generator = plop.getGenerator("v2-module");
  const result = await generator.runActions({ ...answers, ...overrides });
  return { dest, result };
};

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });

describe("v2-module generator", () => {
  it("creates the module with its expected files and no failures", async () => {
    const { dest, result } = await runGenerator();
    expect(result.failures).toEqual([]);

    const base = join(dest, "src/v2/modules/sample-items");
    const expected = [
      "api/sampleItemsApi.ts",
      "api/queries/useSampleItemsQuery.ts",
      "api/mutations/useSampleItemMutations.ts",
      "domain/entities/sampleItem.ts",
      "domain/rules/sampleItemRules.ts",
      "components/molecules/sample-item-status-badge/SampleItemStatusBadge.tsx",
      "components/organisms/sample-item-table/SampleItemTable.columns.tsx",
      "components/organisms/sample-item-form/SampleItemFormSections.tsx",
      "drawers/SampleItemDrawer.tsx",
      "pages/SampleItemsPage.tsx",
      "tests/integration/SampleItemsPage.test.tsx",
      "sampleItems.locale.ts",
      "index.ts",
    ];
    for (const file of expected) expect(existsSync(join(base, file)), file).toBe(true);
  });

  it("leaves no template placeholders and no V1 imports", async () => {
    const { dest } = await runGenerator();
    const files = walk(join(dest, "src/v2/modules/sample-items"));
    for (const file of files) {
      const text = readFileSync(file, "utf8");
      expect(text, file).not.toMatch(/\{\{/);
      expect(text, file).not.toMatch(/from "@\/(core|shared|modules|pages|components)\//);
    }
  });

  it("keeps every generated file under the 180-line limit", async () => {
    const { dest } = await runGenerator();
    for (const file of walk(join(dest, "src/v2/modules/sample-items"))) {
      const lines = readFileSync(file, "utf8").split("\n").length;
      expect(lines, file).toBeLessThanOrEqual(180);
    }
  });

  it("skips the status molecule when there is no status field", async () => {
    const { dest } = await runGenerator({ fieldSpec: "code:string:required,name:string:required" });
    expect(
      existsSync(join(dest, "src/v2/modules/sample-items/components/molecules")),
    ).toBe(false);
  });

  it("throws on invalid input before any file is generated", async () => {
    const dest = mkdtempSync(join(tmpdir(), "v2-module-"));
    const plop = await nodePlop(join(ROOT, "plopfile.mjs"), { destBasePath: dest, force: false });
    const generator = plop.getGenerator("v2-module");
    await expect(generator.runActions({ ...answers, entityName: "1bad" })).rejects.toThrow(/entityName/);
    expect(existsSync(join(dest, "src/v2/modules/sample-items"))).toBe(false);
  });
});

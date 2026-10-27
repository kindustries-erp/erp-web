import { mkdirSync, mkdtempSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import nodePlop from "node-plop";
import { describe, expect, it } from "vitest";
import { addBarrelExport, buildComponentData } from "./v2ComponentFiles.mjs";

const ROOT = resolve(import.meta.dirname, "..");

const answers = {
  layer: "molecules",
  name: "V2TraceabilityCanvas",
  description: "Canvas sơ đồ chứng từ",
};

/** Tạo sẵn thư mục barrel như repo thật, rồi chạy generator trong thư mục tạm */
const runGenerator = async (overrides = {}) => {
  const dest = mkdtempSync(join(tmpdir(), "v2-component-"));
  const barrel = join(dest, "src/v2/shared/components/molecules");
  mkdirSync(barrel, { recursive: true });
  writeFileSync(join(barrel, "index.ts"), 'export * from "./v2-modal";\n');
  const plop = await nodePlop(join(ROOT, "plopfile.mjs"), { destBasePath: dest, force: false });
  const generator = plop.getGenerator("v2-component");
  const result = await generator.runActions({ ...answers, ...overrides });
  return { dest, result };
};

describe("buildComponentData", () => {
  it("derives kebab folder and layer title from the V2 name", () => {
    const data = buildComponentData(answers);
    expect(data.folder).toBe("v2-traceability-canvas");
    expect(data.layerTitle).toBe("Molecules");
  });

  it("rejects a name without the V2 prefix", () => {
    expect(() => buildComponentData({ ...answers, name: "TraceabilityCanvas" })).toThrow(/V2/);
  });

  it("rejects an unknown layer", () => {
    expect(() => buildComponentData({ ...answers, layer: "templates" })).toThrow(/Tầng/);
  });
});

describe("addBarrelExport", () => {
  it("appends the export once", () => {
    const once = addBarrelExport('export * from "./v2-modal";\n', "v2-popover");
    expect(once).toBe('export * from "./v2-modal";\nexport * from "./v2-popover";\n');
    expect(addBarrelExport(once, "v2-popover")).toBe(once);
  });
});

describe("v2-component generator", () => {
  it("creates the five component files and wires the molecules barrel", async () => {
    const { dest, result } = await runGenerator();
    expect(result.failures).toEqual([]);

    const base = join(dest, "src/v2/shared/components/molecules/v2-traceability-canvas");
    for (const file of [
      "V2TraceabilityCanvas.tsx",
      "V2TraceabilityCanvas.type.ts",
      "V2TraceabilityCanvas.test.tsx",
      "V2TraceabilityCanvas.stories.tsx",
      "index.ts",
    ]) {
      expect(existsSync(join(base, file)), file).toBe(true);
    }

    const barrel = readFileSync(join(dest, "src/v2/shared/components/molecules/index.ts"), "utf8");
    expect(barrel).toContain('export * from "./v2-traceability-canvas";');
  });

  it("leaves no placeholders and no V1 imports", async () => {
    const { dest } = await runGenerator();
    const base = join(dest, "src/v2/shared/components/molecules/v2-traceability-canvas");
    for (const file of ["V2TraceabilityCanvas.tsx", "V2TraceabilityCanvas.stories.tsx", "index.ts"]) {
      const text = readFileSync(join(base, file), "utf8");
      expect(text, file).not.toMatch(/\{\{/);
      expect(text, file).not.toMatch(/from "@\/(core|shared|modules|pages|components)\//);
      expect(text, file).not.toMatch(/blue-/);
    }
  });
});

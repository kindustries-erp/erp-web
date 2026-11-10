import { describe, expect, it } from "vitest";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  buildV2ThinData,
  listWebCoreFamilies,
  readWebCoreManifest,
} from "./v2ThinData.mjs";
import { v2ThinFileMap } from "./v2ThinFiles.mjs";

const repoRoot = process.cwd();

const exportsFixture = {
  configType: "GoodsReceiptModuleConfig",
  apiType: "GoodsReceiptApi",
  keysFactory: "createGoodsReceiptKeys",
  recordType: "GoodsReceiptRecord",
  formValueType: "GoodsReceiptFormValue",
  listController: "useGoodsReceiptListController",
  query: "useGoodsReceiptsQuery",
  drawer: "GoodsReceiptDrawer",
  viewVisibility: "goodsReceiptViewVisibility",
};

const manifestFixture = { layer: "web", family: "goods-receipts", exports: exportsFixture };

const thinAnswers = {
  moduleInput: "garage-goods-receipts",
  titleViInput: "Nhập kho Garage",
  titleEnInput: "Garage Goods Receipts",
  permissionInput: "garage_goods_receipts",
  routeInput: "",
  navSection: "inventory",
  wireInput: false,
};

/** Dựng thư mục gốc giả có src/v2/core/<họ>/core.manifest.json. */
function fakeRepo(families) {
  const root = mkdtempSync(join(tmpdir(), "v2thin-"));
  for (const [family, manifest] of Object.entries(families)) {
    mkdirSync(join(root, "src/v2/core", family), { recursive: true });
    writeFileSync(join(root, "src/v2/core", family, "core.manifest.json"), JSON.stringify(manifest));
  }
  return root;
}

describe("readWebCoreManifest", () => {
  it("đọc được manifest thật của goods-receipts (đã khai báo exports)", () => {
    const manifest = readWebCoreManifest(repoRoot, "goods-receipts");
    expect(manifest.exports.listController).toBe("useGoodsReceiptListController");
  });

  it("từ chối lõi chưa khai báo exports", () => {
    const root = fakeRepo({ "customer-claims": { ...manifestFixture, family: "customer-claims", exports: null } });
    expect(() => readWebCoreManifest(root, "customer-claims")).toThrow(/chưa khai báo exports/);
  });

  it("từ chối lõi thiếu một export bắt buộc", () => {
    const partial = { ...exportsFixture, drawer: undefined };
    const root = fakeRepo({ "goods-receipts": { ...manifestFixture, exports: partial } });
    expect(() => readWebCoreManifest(root, "goods-receipts")).toThrow(/exports\.drawer/);
  });

  it("từ chối manifest của layer api", () => {
    const root = fakeRepo({ "goods-receipts": { ...manifestFixture, layer: "api" } });
    expect(() => readWebCoreManifest(root, "goods-receipts")).toThrow(/layer web/);
  });
});

describe("listWebCoreFamilies", () => {
  it("chỉ liệt kê họ có exports đủ", () => {
    const root = fakeRepo({
      "goods-receipts": manifestFixture,
      "draft-family": { ...manifestFixture, family: "draft-family", exports: null },
    });
    expect(listWebCoreFamilies(root)).toEqual(["goods-receipts"]);
  });

  it("thư mục gốc không có src/v2/core trả về danh sách rỗng", () => {
    expect(listWebCoreFamilies(mkdtempSync(join(tmpdir(), "empty-")))).toEqual([]);
  });
});

describe("buildV2ThinData", () => {
  it("ghép tên và export của lõi vào module", () => {
    const data = buildV2ThinData(thinAnswers, manifestFixture);
    expect(data.modulePath).toBe("src/v2/modules/garage-goods-receipts");
    expect(data.moduleCamel).toBe("garageGoodsReceipts");
    expect(data.pageName).toBe("GarageGoodsReceiptsPage");
    expect(data.hookName).toBe("useGarageGoodsReceiptsPage");
    expect(data.coreBarrel).toBe("@/v2/core/goods-receipts");
    expect(data.viewVisibilityImport).toBe(", goodsReceiptViewVisibility");
    expect(data.tableId).toBe("erp-garage-goods-receipts-table");
  });

  it("không có viewVisibility thì dùng {} và không import thêm", () => {
    const manifest = { ...manifestFixture, exports: { ...exportsFixture, viewVisibility: undefined } };
    const data = buildV2ThinData(thinAnswers, manifest);
    expect(data.viewVisibilityImport).toBe("");
    expect(data.viewVisibilityExpr).toBe("{}");
  });

  it("sinh post/cancel/nextCode theo exports.lifecycle và nextCode", () => {
    const manifest = {
      ...manifestFixture,
      exports: { ...exportsFixture, lifecycle: ["post", "cancel"], nextCode: true },
    };
    const data = buildV2ThinData(thinAnswers, manifest);
    expect(data.apiExtraMembers).toContain("post: async (id: string)");
    expect(data.apiExtraMembers).toContain("cancel: async (id: string)");
    expect(data.apiExtraMembers).toContain("nextCode: async (date?: string)");
    expect(data.apiExtraMembers).toContain("${BASE}/${id}/post");
  });

  it("không khai báo lifecycle thì không sinh thành viên thừa", () => {
    expect(buildV2ThinData(thinAnswers, manifestFixture).apiExtraMembers).toBe("");
  });

  it("từ chối hành động vòng đời không hỗ trợ", () => {
    const manifest = { ...manifestFixture, exports: { ...exportsFixture, lifecycle: ["approve"] } };
    expect(() => buildV2ThinData(thinAnswers, manifest)).toThrow(/approve/);
  });

  it("từ chối tiêu đề chứa dấu nháy kép", () => {
    expect(() => buildV2ThinData({ ...thinAnswers, titleViInput: 'Kho "A"' }, manifestFixture)).toThrow(/dấu/);
  });

  it("từ chối tên module sai định dạng", () => {
    expect(() => buildV2ThinData({ ...thinAnswers, moduleInput: "GarageX" }, manifestFixture)).toThrow(/Tên module/);
  });
});

describe("buildV2ThinData (nối route/menu)", () => {
  it("suy ra route, nhóm menu và tên trang cho wiringPlan", () => {
    const data = buildV2ThinData(thinAnswers, manifestFixture);
    expect(data.routePath).toBe("garage-goods-receipts");
    expect(data.routeCamel).toBe("garageGoodsReceipts");
    expect(data.navSection).toBe("inventory");
    expect(data.EntityPlural).toBe("GarageGoodsReceipts");
    expect(data.wire).toBe(false);
  });

  it("từ chối nhóm menu không hợp lệ", () => {
    expect(() => buildV2ThinData({ ...thinAnswers, navSection: "khac" }, manifestFixture)).toThrow(/navSection/);
  });

  it("wireInput bật thì wire = true", () => {
    expect(buildV2ThinData({ ...thinAnswers, wireInput: true }, manifestFixture).wire).toBe(true);
  });
});

describe("v2ThinFileMap", () => {
  it("sinh 8 file trong src/v2/modules/<module>, có test tích hợp", () => {
    const files = v2ThinFileMap(buildV2ThinData(thinAnswers, manifestFixture));
    expect(files).toHaveLength(8);
    for (const { path } of files) expect(path.startsWith("src/v2/modules/garage-goods-receipts/")).toBe(true);
    expect(files.map((f) => f.path)).toContain(
      "src/v2/modules/garage-goods-receipts/pages/GarageGoodsReceiptsPage.hook.ts",
    );
    expect(files.map((f) => f.path)).toContain(
      "src/v2/modules/garage-goods-receipts/tests/integration/GarageGoodsReceiptsPage.test.tsx",
    );
  });
});

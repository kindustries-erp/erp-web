import { describe, expect, it, vi } from "vitest";
import { getQuickActions } from "@/v2/shared/components/molecules/v2-table-row-actions/V2TableRowActions.helper";
import type { ProcurementActionKey } from "../procurement.rules";
import type { ProcurementListConfig } from "./procurementListConfig.type";
import { buildProcurementRowActions } from "./procurementRowActions.builder";

type Row = { id: string; status: string };
const LABELS: Record<string, string> = {
  "v2.procurement.actions.submit": "Gửi duyệt",
  "v2.procurement.actions.recall": "Thu hồi",
  "v2.procurement.actions.approve": "Duyệt",
  "v2.procurement.actions.reject": "Từ chối",
};
const t = (key: string, fallback: string) => LABELS[key] ?? fallback;

const makeConfig = (
  actions: ProcurementActionKey[],
  editable: boolean,
): ProcurementListConfig<Row> =>
  ({
    api: { remove: vi.fn() },
    queryKey: "q",
    permissionCollection: "c",
    availableActions: () => actions,
    isEditable: () => editable,
    rowLabel: (r: Row) => r.id,
  }) as unknown as ProcurementListConfig<Row>;

const deps = () => ({
  openDrawer: vi.fn(),
  start: vi.fn(),
  openDelete: vi.fn(),
  orderFromRequest: vi.fn(),
  purgeActions: () => [],
});

const labelsOf = (
  groups: ReturnType<ReturnType<typeof buildProcurementRowActions<Row>>>,
) =>
  groups.map((g) => ({
    group: g.groupLabel,
    items: g.items.map((i) => i.label),
  }));

describe("buildProcurementRowActions", () => {
  it("DRAFT có quyền: Tra cứu + Thao tác với Chỉnh sửa đứng đầu, Xóa đứng cuối", () => {
    const d = deps();
    const build = buildProcurementRowActions<Row>({
      t,
      config: makeConfig(["submit"], true),
      canCreate: false,
      canUpdate: true,
      canDelete: true,
      ...d,
    });
    const groups = build({ id: "p1", status: "DRAFT" });
    expect(labelsOf(groups)).toEqual([
      { group: "Tra cứu", items: ["Xem chi tiết"] },
      { group: "Thao tác", items: ["Chỉnh sửa", "Gửi duyệt", "Xóa"] },
    ]);
    expect(getQuickActions(groups, 2).map((a) => a.label)).toEqual([
      "Xem chi tiết",
      "Chỉnh sửa",
    ]);
  });

  it("chờ duyệt: chuyển trạng thái thường trước, từ chối (danger) sau, không có Xóa", () => {
    const build = buildProcurementRowActions<Row>({
      t,
      config: makeConfig(["recall", "approve", "reject"], false),
      canCreate: false,
      canUpdate: true,
      canDelete: true,
      ...deps(),
    });
    const groups = build({ id: "p2", status: "PENDING_APPROVAL" });
    expect(labelsOf(groups)[1].items).toEqual([
      "Chỉnh sửa",
      "Thu hồi",
      "Duyệt",
      "Từ chối",
    ]);
    expect(groups[1].items[0].disabled).toBe(true);
    expect(groups[1].items[3].variant).toBe("danger");
  });

  it("không có quyền sửa: chỉ còn nhóm Tra cứu", () => {
    const build = buildProcurementRowActions<Row>({
      t,
      config: makeConfig(["submit"], true),
      canCreate: false,
      canUpdate: false,
      canDelete: false,
      ...deps(),
    });
    const groups = build({ id: "p3", status: "DRAFT" });
    expect(labelsOf(groups)).toEqual([
      { group: "Tra cứu", items: ["Xem chi tiết"] },
    ]);
  });

  it("gọi đúng callback: Chỉnh sửa mở drawer ở chế độ edit, Xem mở ở chế độ view", () => {
    const d = deps();
    const build = buildProcurementRowActions<Row>({
      t,
      config: makeConfig([], true),
      canCreate: false,
      canUpdate: true,
      canDelete: false,
      ...d,
    });
    const groups = build({ id: "p4", status: "DRAFT" });
    groups[0].items[0].onClick();
    groups[1].items[0].onClick();
    expect(d.openDrawer).toHaveBeenNthCalledWith(1, "p4", "view");
    expect(d.openDrawer).toHaveBeenNthCalledWith(2, "p4", "edit");
  });

  it("không phải nháp: Chỉnh sửa vẫn hiện, bị mờ kèm lý do, và vẫn là mục đầu THAO TÁC", () => {
    const build = buildProcurementRowActions<Row>({
      t,
      config: makeConfig(["recall"], false),
      canCreate: false,
      canUpdate: true,
      canDelete: true,
      ...deps(),
    });
    const groups = build({ id: "p5", status: "APPROVED" });
    const edit = groups[1].items[0];
    expect(edit.label).toBe("Chỉnh sửa");
    expect(edit.disabled).toBe(true);
    expect(edit.disabledReason).toBe("Chỉ sửa được khi còn nháp");
    expect(getQuickActions(groups, 2).map((a) => a.label)).toEqual([
      "Xem chi tiết",
      "Chỉnh sửa",
    ]);
  });
});

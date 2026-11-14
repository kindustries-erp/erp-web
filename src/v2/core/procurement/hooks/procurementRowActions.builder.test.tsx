import { describe, expect, it, vi } from "vitest";
import { getQuickActions } from "@/v2/shared/components/molecules/v2-table-row-actions/V2TableRowActions.helper";
import type { ProcurementActionKey } from "../procurement.rules";
import type { ProcurementListConfig } from "./procurementListConfig.type";
import { buildProcurementRowActions } from "./procurementRowActions.builder";

type Row = { id: string; status: string };
const LABELS: Record<string, string> = {
  "v2.procurement.actions.submit": "Gửi duyệt",
  "v2.procurement.actions.submitNotCreatorReason":
    "Chỉ người tạo mới được gửi duyệt",
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

  it("gửi duyệt: disable kèm lý do khi người dùng không phải người tạo", () => {
    const build = buildProcurementRowActions<any>({
      t,
      config: makeConfig(["submit"], true),
      canCreate: false,
      canUpdate: true,
      canDelete: false,
      currentUserId: "user-1",
      currentUserEmail: "user1@liouni.com",
      ...deps(),
    });
    const groups = build({
      id: "p6",
      status: "DRAFT",
      createdBy: "user-2",
      createdByEmail: "user2@liouni.com",
    });
    const submit = groups[1].items.find((i) => i.label === "Gửi duyệt")!;
    expect(submit.disabled).toBe(true);
    expect(submit.disabledReason).toBe("Chỉ người tạo mới được gửi duyệt");
  });

  it("gửi duyệt: sáng bình thường khi người dùng chính là người tạo", () => {
    const build = buildProcurementRowActions<any>({
      t,
      config: makeConfig(["submit"], true),
      canCreate: false,
      canUpdate: true,
      canDelete: false,
      currentUserId: "user-1",
      currentUserEmail: "user1@liouni.com",
      ...deps(),
    });
    const groups = build({
      id: "p7",
      status: "DRAFT",
      createdBy: "user-1",
      createdByEmail: "user1@liouni.com",
    });
    const submit = groups[1].items.find((i) => i.label === "Gửi duyệt")!;
    expect(submit.disabled).toBe(false);
    expect(submit.disabledReason).toBeUndefined();
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

  it("gửi duyệt: disable kèm lý do khi người dùng không phải người tạo", () => {
    const build = buildProcurementRowActions<any>({
      t,
      config: makeConfig(["submit"], true),
      canCreate: false,
      canUpdate: true,
      canDelete: false,
      currentUserId: "user-1",
      currentUserEmail: "user1@liouni.com",
      ...deps(),
    });
    const groups = build({
      id: "p6",
      status: "DRAFT",
      createdBy: "user-2",
      createdByEmail: "user2@liouni.com",
    });
    const submit = groups[1].items.find((i) => i.label === "Gửi duyệt")!;
    expect(submit.disabled).toBe(true);
    expect(submit.disabledReason).toBe("Chỉ người tạo mới được gửi duyệt");
  });

  it("gửi duyệt: sáng bình thường khi người dùng chính là người tạo", () => {
    const build = buildProcurementRowActions<any>({
      t,
      config: makeConfig(["submit"], true),
      canCreate: false,
      canUpdate: true,
      canDelete: false,
      currentUserId: "user-1",
      currentUserEmail: "user1@liouni.com",
      ...deps(),
    });
    const groups = build({
      id: "p7",
      status: "DRAFT",
      createdBy: "user-1",
      createdByEmail: "user1@liouni.com",
    });
    const submit = groups[1].items.find((i) => i.label === "Gửi duyệt")!;
    expect(submit.disabled).toBe(false);
    expect(submit.disabledReason).toBeUndefined();
  });
});

describe("buildProcurementRowActions — lập đơn mua từ PR", () => {
  type PrRow = { id: string; status: string };
  const prLabels: Record<string, string> = {
    "v2.procurement.actions.createOrder": "Lập đơn mua từ đề nghị này",
    "v2.procurement.actions.orderFullyOrderedReason":
      "Đề nghị đã được lập đủ đơn mua",
    "v2.procurement.actions.orderNotApprovedReason":
      "Chỉ lập đơn mua khi đề nghị đã duyệt",
  };
  const prT = (key: string, fallback: string) => prLabels[key] ?? fallback;
  const prConfig = (
    allowed: boolean,
    blockedKey: "notApproved" | "fullyOrdered" | null,
  ): ProcurementListConfig<PrRow> =>
    ({
      ...makeConfig([], true),
      poHref: "/garage-procurement?tab=orders",
      canOrderFromRequest: () => allowed,
      orderFromRequestBlockedKey: () => blockedKey,
    }) as unknown as ProcurementListConfig<PrRow>;
  const findOrder = (
    groups: ReturnType<ReturnType<typeof buildProcurementRowActions<PrRow>>>,
  ) =>
    groups
      .flatMap((g) => g.items)
      .find((i) => i.label === "Lập đơn mua từ đề nghị này");

  it("PR đã duyệt còn thiếu: mục bật, không có lý do", () => {
    const d = deps();
    const build = buildProcurementRowActions<PrRow>({
      t: prT,
      config: prConfig(true, null),
      canCreate: true,
      canUpdate: false,
      canDelete: false,
      ...d,
    });
    const item = findOrder(build({ id: "r1", status: "APPROVED" }))!;
    expect(item.disabled).toBe(false);
    expect(item.disabledReason).toBeUndefined();
    item.onClick?.();
    expect(d.orderFromRequest).toHaveBeenCalledTimes(1);
  });

  it("PR đã lập đủ PO: hiện nhưng mờ kèm lý do, không gọi callback", () => {
    const d = deps();
    const build = buildProcurementRowActions<PrRow>({
      t: prT,
      config: prConfig(false, "fullyOrdered"),
      canCreate: true,
      canUpdate: false,
      canDelete: false,
      ...d,
    });
    const item = findOrder(build({ id: "r2", status: "APPROVED" }))!;
    expect(item.disabled).toBe(true);
    expect(item.disabledReason).toBe("Đề nghị đã được lập đủ đơn mua");
  });

  it("PR chưa duyệt: hiện nhưng mờ kèm lý do chờ duyệt", () => {
    const build = buildProcurementRowActions<PrRow>({
      t: prT,
      config: prConfig(false, "notApproved"),
      canCreate: true,
      canUpdate: false,
      canDelete: false,
      ...deps(),
    });
    const item = findOrder(build({ id: "r3", status: "PENDING_APPROVAL" }))!;
    expect(item.disabled).toBe(true);
    expect(item.disabledReason).toBe("Chỉ lập đơn mua khi đề nghị đã duyệt");
  });

  it("không có quyền tạo: không hiện mục lập đơn mua", () => {
    const build = buildProcurementRowActions<PrRow>({
      t: prT,
      config: prConfig(true, null),
      canCreate: false,
      canUpdate: false,
      canDelete: false,
      ...deps(),
    });
    expect(findOrder(build({ id: "r4", status: "APPROVED" }))).toBeUndefined();
  });
});

describe("buildProcurementRowActions — nhân bản", () => {
  type CloneRow = { id: string; status: string };
  const cloneLabels: Record<string, string> = {
    "v2.procurement.actions.clone": "Nhân bản",
  };
  const cloneT = (key: string, fallback: string) =>
    cloneLabels[key] ?? fallback;
  const cloneConfig = (cloneable: boolean) =>
    ({
      ...makeConfig([], true),
      cloneable,
    }) as unknown as ProcurementListConfig<CloneRow>;
  const hasClone = (
    groups: ReturnType<ReturnType<typeof buildProcurementRowActions<CloneRow>>>,
  ) => groups.flatMap((g) => g.items).some((i) => i.label === "Nhân bản");

  it("phiếu đã từ chối hoặc đã hủy: hiện Nhân bản và gọi callback", () => {
    const cloneRow = vi.fn();
    const build = buildProcurementRowActions<CloneRow>({
      t: cloneT,
      config: cloneConfig(true),
      canCreate: true,
      canUpdate: false,
      canDelete: false,
      cloneRow,
      ...deps(),
    });
    const groups = build({ id: "c1", status: "REJECTED" });
    const item = groups[1].items.find((i) => i.label === "Nhân bản")!;
    item.onClick?.();
    expect(cloneRow).toHaveBeenCalledWith({ id: "c1", status: "REJECTED" });
    expect(hasClone(build({ id: "c2", status: "CANCELLED" }))).toBe(true);
  });

  it("phiếu nháp hoặc đang duyệt: không có Nhân bản", () => {
    const build = buildProcurementRowActions<CloneRow>({
      t: cloneT,
      config: cloneConfig(true),
      canCreate: true,
      canUpdate: false,
      canDelete: false,
      cloneRow: vi.fn(),
      ...deps(),
    });
    expect(hasClone(build({ id: "c3", status: "DRAFT" }))).toBe(false);
    expect(hasClone(build({ id: "c4", status: "PENDING_APPROVAL" }))).toBe(
      false,
    );
  });

  it("cấu hình không cho nhân bản hoặc thiếu quyền tạo: không hiện", () => {
    const off = buildProcurementRowActions<CloneRow>({
      t: cloneT,
      config: cloneConfig(false),
      canCreate: true,
      canUpdate: false,
      canDelete: false,
      cloneRow: vi.fn(),
      ...deps(),
    });
    expect(hasClone(off({ id: "c5", status: "REJECTED" }))).toBe(false);
    const noPerm = buildProcurementRowActions<CloneRow>({
      t: cloneT,
      config: cloneConfig(true),
      canCreate: false,
      canUpdate: false,
      canDelete: false,
      cloneRow: vi.fn(),
      ...deps(),
    });
    expect(hasClone(noPerm({ id: "c6", status: "REJECTED" }))).toBe(false);
  });
});

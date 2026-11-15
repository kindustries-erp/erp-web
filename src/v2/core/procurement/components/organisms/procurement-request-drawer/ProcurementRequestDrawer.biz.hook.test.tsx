import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useAuthStore } from "@/modules/auth/domain/authStore";
import type { ProcurementRequestDetail } from "../../../procurement.types";
import type { ProcurementActionKey } from "../../../procurement.rules";
import { useProcurementDrawerActions } from "./ProcurementRequestDrawer.biz.hook";

const approvedDetail = {
  id: "req-1",
  status: "APPROVED",
  createdBy: "creator-1",
  createdByEmail: null,
} as unknown as ProcurementRequestDetail;

const setCurrentUser = (id: string) =>
  useAuthStore.setState({ profile: { id, email: null } } as never);

const run = (actions: ProcurementActionKey[], onTransition = vi.fn()) =>
  renderHook(() =>
    useProcurementDrawerActions({
      viewing: true,
      canUpdate: true,
      availableActions: actions,
      detail: approvedDetail,
      saving: false,
      loading: false,
      onClose: vi.fn(),
      onCancelEdit: vi.fn(),
      onSubmit: vi.fn(),
      onTransition,
    }),
  ).result.current;

type DropdownItem = {
  id: string;
  disabled?: boolean;
  disabledReason?: string;
  onClick: () => void;
};

const itemOf = (
  items: ReturnType<typeof run>["actionDropdownItems"],
  id: string,
) => (items as unknown as DropdownItem[]).find((i) => i.id === id);

describe("useProcurementDrawerActions — Hủy theo ma trận quyền", () => {
  beforeEach(() => {
    useAuthStore.setState({ profile: null } as never);
  });

  it("người không phải người tạo: Hủy vẫn sáng (ma trận quyền quyết định)", () => {
    setCurrentUser("user-2");
    const onTransition = vi.fn();
    const { actionDropdownItems } = run(["cancel"], onTransition);
    const cancel = itemOf(actionDropdownItems, "cancel");
    expect(cancel?.disabled).toBe(false);
  });

  it("người tạo: Hủy sáng và gọi onTransition", () => {
    setCurrentUser("creator-1");
    const onTransition = vi.fn();
    const { actionDropdownItems } = run(["cancel"], onTransition);
    const cancel = itemOf(actionDropdownItems, "cancel");
    expect(cancel?.disabled).toBe(false);
    (cancel?.onClick as () => void)();
    expect(onTransition).toHaveBeenCalledWith("cancel", approvedDetail);
  });

  it("người duyệt không phải người tạo: Từ chối không bị luật chỉ-người-tạo chặn", () => {
    setCurrentUser("approver-1");
    const { actionDropdownItems } = run(["reject"]);
    expect(itemOf(actionDropdownItems, "reject")?.disabled).toBe(false);
  });
});

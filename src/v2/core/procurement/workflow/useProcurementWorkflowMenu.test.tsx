import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("./ProcurementWorkflowDrawer", () => ({
  ProcurementWorkflowDrawer: () => null,
}));

import { useProcurementWorkflowMenu } from "./useProcurementWorkflowMenu";

describe("useProcurementWorkflowMenu", () => {
  it("mục menu luôn bật, không bị khóa theo quyền", () => {
    const { result } = renderHook(() => useProcurementWorkflowMenu("dev"));
    expect(result.current.item.key).toBe("view-workflow");
    expect(result.current.item.label).toBe("Xem sơ đồ quy trình");
    expect(result.current.item.disabled).toBeFalsy();
    expect(result.current.item.hidden).toBeFalsy();
  });

  it("bấm mục thì mở drawer với sơ đồ mặc định theo trang", () => {
    const { result } = renderHook(() => useProcurementWorkflowMenu("dev"));
    expect(result.current.drawer.props.open).toBe(false);
    expect(result.current.drawer.props.initialCanvasId).toBe("dev");

    act(() => result.current.item.onClick?.());
    expect(result.current.drawer.props.open).toBe(true);

    act(() => result.current.drawer.props.onClose());
    expect(result.current.drawer.props.open).toBe(false);
  });
});

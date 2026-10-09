import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { useAppStore } from "@/core/config/appStore";
import * as viewportHook from "@/v2/shared/hooks/useViewport";
import { makeGroups } from "./V2TableRowActions.fixture";
import { V2TableRowHoverActions } from "./V2TableRowHoverActions";

describe("V2TableRowHoverActions", () => {
  beforeEach(() => {
    useAppStore.setState({ locale: "vi" });
    vi.spyOn(viewportHook, "useViewport").mockReturnValue({
      width: 1280,
      height: 800,
      isMobile: false,
      isTablet: false,
      isDesktop: true,
    });
  });
  afterEach(() => vi.restoreAllMocks());

  it("renders quick action buttons and runs them without bubbling to the row", () => {
    const { groups, handlers } = makeGroups();
    const onRowClick = vi.fn();
    render(
      <div onClick={onRowClick}>
        <V2TableRowHoverActions groups={groups} />
      </div>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Xem chi tiết" }));
    expect(handlers.view).toHaveBeenCalledTimes(1);
    expect(onRowClick).not.toHaveBeenCalled();
    expect(
      screen.getByRole("button", { name: "Chỉnh sửa" }),
    ).toBeInTheDocument();
  });

  it("opens the full grouped menu from the more button", () => {
    const { groups, handlers } = makeGroups();
    render(<V2TableRowHoverActions groups={groups} />);
    fireEvent.click(screen.getByRole("button", { name: "Thao tác khác" }));
    expect(screen.getByText("THAO TÁC")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Xóa"));
    expect(handlers.remove).toHaveBeenCalledTimes(1);
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { useAppStore } from "@/core/config/appStore";
import {
  V2_ALL_MATCHING_VALUE,
  V2_BLANK_VALUE,
} from "@/v2/shared/types/v2-table";
import { V2FilterOptionsList } from "./V2ColumnHeaderFilter.options";
import { V2_IDLE_OPTIONS_STATE } from "./V2ColumnHeaderFilter.type";
import type { V2FilterOptionsState } from "./V2ColumnHeaderFilter.type";

const READY: V2FilterOptionsState = {
  ...V2_IDLE_OPTIONS_STATE,
  status: "ready",
  options: [
    { value: "a", label: "Option A" },
    { value: "b", label: "Option B" },
  ],
};

const renderList = (
  overrides: Partial<React.ComponentProps<typeof V2FilterOptionsList>> = {},
) => {
  const props = {
    state: READY,
    selected: [] as string[],
    search: "",
    onChange: vi.fn(),
    ...overrides,
  };
  render(<V2FilterOptionsList {...props} />);
  return props;
};

describe("V2FilterOptionsList", () => {
  beforeEach(() => useAppStore.setState({ locale: "vi" }));

  it("renders options with a select-all-visible row first", () => {
    renderList();
    const boxes = screen.getAllByRole("checkbox");
    expect(boxes[0]).toHaveAccessibleName("(Chọn tất cả đang hiển thị)");
    expect(boxes).toHaveLength(3);
  });

  it("toggles one option or every visible option", () => {
    const props = renderList({ selected: ["a"] });
    fireEvent.click(screen.getByRole("checkbox", { name: "Option B" }));
    expect(props.onChange).toHaveBeenLastCalledWith(["a", "b"]);
    fireEvent.click(
      screen.getByRole("checkbox", { name: "(Chọn tất cả đang hiển thị)" }),
    );
    expect(props.onChange).toHaveBeenLastCalledWith(["a", "b"]);
  });

  it("switches to select-all-matching while a keyword is typed", () => {
    const props = renderList({ search: "opt" });
    fireEvent.click(
      screen.getByRole("checkbox", { name: "(Chọn tất cả kết quả tìm kiếm)" }),
    );
    expect(props.onChange).toHaveBeenLastCalledWith([
      V2_ALL_MATCHING_VALUE,
      "opt",
    ]);
  });

  it("shows the blank option label and formats values", () => {
    renderList({
      state: {
        ...READY,
        options: [
          { value: V2_BLANK_VALUE, label: V2_BLANK_VALUE },
          { value: "1066:::C25MDP", label: "1066:::C25MDP" },
        ],
      },
    });
    expect(
      screen.getByRole("checkbox", { name: "(Trống)" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", { name: "1066 (C25MDP)" }),
    ).toBeInTheDocument();
  });

  it("asks for the next page when scrolled near the bottom", () => {
    const onLoadMore = vi.fn();
    renderList({ state: { ...READY, hasNextPage: true, onLoadMore } });
    const scroller = screen.getByTestId("v2-options-scroll");
    Object.defineProperties(scroller, {
      scrollHeight: { value: 200, configurable: true },
      clientHeight: { value: 100, configurable: true },
      scrollTop: { value: 90, configurable: true },
    });
    fireEvent.scroll(scroller);
    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });

  it("does not request more while fetching or when there is no next page", () => {
    const onLoadMore = vi.fn();
    renderList({
      state: { ...READY, hasNextPage: false, onLoadMore },
    });
    const scroller = screen.getByTestId("v2-options-scroll");
    Object.defineProperties(scroller, {
      scrollHeight: { value: 200, configurable: true },
      clientHeight: { value: 100, configurable: true },
      scrollTop: { value: 100, configurable: true },
    });
    fireEvent.scroll(scroller);
    expect(onLoadMore).not.toHaveBeenCalled();
  });

  it("shows loading, empty and error states", () => {
    const { unmount } = render(
      <V2FilterOptionsList
        state={{ ...V2_IDLE_OPTIONS_STATE, status: "loading" }}
        selected={[]}
        search=""
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByText("Đang tải lựa chọn...")).toBeInTheDocument();
    unmount();
    const empty = render(
      <V2FilterOptionsList
        state={{ ...V2_IDLE_OPTIONS_STATE, status: "ready" }}
        selected={[]}
        search=""
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByText("Không có lựa chọn")).toBeInTheDocument();
    empty.unmount();
    render(
      <V2FilterOptionsList
        state={{ ...V2_IDLE_OPTIONS_STATE, status: "error" }}
        selected={[]}
        search=""
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByText("Đã xảy ra lỗi")).toBeInTheDocument();
  });
});

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { V2PostingLinesEditor } from "./V2PostingLinesEditor";
import { createPostingLine } from "./postingLines.helper";

const accounts = [{ value: "1111", label: "1111 - Quỹ tiền mặt" }];

describe("V2PostingLinesEditor", () => {
  it("hiện tổng Nợ/Có và báo chưa cân bằng khi lệch", () => {
    render(
      <V2PostingLinesEditor
        lines={[createPostingLine({ debit: 100 })]}
        accounts={accounts}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByText(/Chưa cân bằng/)).toBeTruthy();
  });

  it("bấm Thêm dòng gọi onChange với một dòng mới", () => {
    const onChange = vi.fn();
    const lines = [createPostingLine({ debit: 100 })];
    render(
      <V2PostingLinesEditor
        lines={lines}
        accounts={accounts}
        onChange={onChange}
        autoBalance
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Thêm dòng/ }));
    const [next] = onChange.mock.calls[0];
    expect(next).toHaveLength(2);
    expect(next[1]).toMatchObject({ debit: 0, credit: 100 });
  });

  it("bấm Xóa dòng bỏ đúng dòng", () => {
    const onChange = vi.fn();
    const a = createPostingLine({ debit: 1 });
    const b = createPostingLine({ credit: 1 });
    render(
      <V2PostingLinesEditor
        lines={[a, b]}
        accounts={accounts}
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getAllByRole("button", { name: "Xóa dòng" })[0]);
    expect(onChange).toHaveBeenCalledWith([b]);
  });

  it("khóa mọi thao tác khi disabled", () => {
    render(
      <V2PostingLinesEditor
        lines={[]}
        accounts={accounts}
        onChange={vi.fn()}
        disabled
      />,
    );
    expect(
      (screen.getByRole("button", { name: /Thêm dòng/ }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
  });
});

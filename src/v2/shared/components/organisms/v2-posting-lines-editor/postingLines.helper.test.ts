import { describe, expect, it } from "vitest";
import {
  addPostingLine,
  createPostingLine,
  removePostingLine,
  totalsOf,
  updatePostingLine,
} from "./postingLines.helper";

describe("totalsOf", () => {
  it("cộng Nợ và Có, báo cân bằng khi chênh dưới một xu", () => {
    const t = totalsOf([
      createPostingLine({ debit: 100 }),
      createPostingLine({ credit: 100.001 }),
    ]);
    expect(t.totalDebit).toBe(100);
    expect(t.balanced).toBe(true);
  });

  it("chênh lệch dương là Nợ thừa", () => {
    expect(totalsOf([createPostingLine({ debit: 50 })]).difference).toBe(50);
  });
});

describe("addPostingLine", () => {
  it("không tự cân khi autoBalance tắt", () => {
    const lines = addPostingLine([createPostingLine({ debit: 80 })]);
    expect(lines[1]).toMatchObject({ debit: 0, credit: 0 });
  });

  it("tự cân: Nợ thừa thì dòng mới ghi Có phần chênh", () => {
    const lines = addPostingLine([createPostingLine({ debit: 80 })], {
      autoBalance: true,
    });
    expect(lines[1]).toMatchObject({ debit: 0, credit: 80 });
  });

  it("tự cân: Có thừa thì dòng mới ghi Nợ phần chênh", () => {
    const lines = addPostingLine([createPostingLine({ credit: 30 })], {
      autoBalance: true,
    });
    expect(lines[1]).toMatchObject({ debit: 30, credit: 0 });
  });
});

describe("updatePostingLine", () => {
  it("nhập Nợ thì xóa Có của cùng dòng", () => {
    const line = createPostingLine({ credit: 40 });
    const [next] = updatePostingLine([line], line.id, { debit: 10 });
    expect(next).toMatchObject({ debit: 10, credit: 0 });
  });

  it("nhập Có thì xóa Nợ của cùng dòng", () => {
    const line = createPostingLine({ debit: 40 });
    const [next] = updatePostingLine([line], line.id, { credit: 5 });
    expect(next).toMatchObject({ debit: 0, credit: 5 });
  });

  it("không đụng dòng khác", () => {
    const a = createPostingLine({ debit: 1 });
    const b = createPostingLine({ debit: 2 });
    const [, second] = updatePostingLine([a, b], a.id, { accountId: "1111" });
    expect(second).toBe(b);
  });
});

describe("removePostingLine", () => {
  it("bỏ đúng dòng theo id", () => {
    const a = createPostingLine();
    const b = createPostingLine();
    expect(removePostingLine([a, b], a.id)).toEqual([b]);
  });
});

import { describe, expect, it } from "vitest";
import { summarizeJournalEntry } from "./summarizeJournalEntry";
import {
  clampNetOffAmount,
  defaultNetOffAmount,
  exceedsNetOffLimit,
} from "./netOffAllocation";
import { canShowPartnerTabs } from "./partnerTabVisibility";
import { resolveDetailTab } from "./resolveDetailTab";

describe("summarizeJournalEntry", () => {
  it("gộp dòng theo tài khoản và cân bằng khi Nợ = Có", () => {
    const s = summarizeJournalEntry([
      { accountId: "1111", debit: 100, credit: 0 },
      { accountId: "1111", debit: 50, credit: 0 },
      { accountId: "131", debit: 0, credit: 150 },
    ]);
    expect(s.accounts).toHaveLength(2);
    expect(s.accounts[0]).toEqual({ accountId: "1111", debit: 150, credit: 0 });
    expect(s.totalDebit).toBe(150);
    expect(s.totalCredit).toBe(150);
    expect(s.balanced).toBe(true);
  });

  it("báo lệch khi Nợ khác Có", () => {
    expect(
      summarizeJournalEntry([{ accountId: "a", debit: 10, credit: 0 }])
        .balanced,
    ).toBe(false);
  });
});

describe("netOffAllocation", () => {
  it("mặc định lấy số nhỏ hơn giữa còn lại và tối đa, không âm", () => {
    expect(defaultNetOffAmount(300, 200)).toBe(200);
    expect(defaultNetOffAmount(100, 500)).toBe(100);
    expect(defaultNetOffAmount(100, -5)).toBe(0);
  });

  it("kẹp số nhập tay vào [0, còn lại]", () => {
    expect(clampNetOffAmount(-1, 100)).toBe(0);
    expect(clampNetOffAmount(150, 100)).toBe(100);
    expect(clampNetOffAmount(NaN, 100)).toBe(0);
  });

  it("báo vượt khi tổng các khoản lớn hơn số còn cấn trừ", () => {
    expect(exceedsNetOffLimit([60, 50], 100)).toBe(true);
    expect(exceedsNetOffLimit([60, 40], 100)).toBe(false);
    expect(exceedsNetOffLimit([0.1, 0.2], 0.3)).toBe(false);
  });
});

describe("partnerTabVisibility", () => {
  it("hiện khi có tên hoặc tài khoản, ẩn khi cả hai rỗng hoặc chỉ có khoảng trắng", () => {
    expect(canShowPartnerTabs({ correspondentName: "Nguyễn A" })).toBe(true);
    expect(canShowPartnerTabs({ correspondentAccount: "0123" })).toBe(true);
    expect(canShowPartnerTabs({ correspondentName: "   " })).toBe(false);
    expect(canShowPartnerTabs({})).toBe(false);
  });
});

describe("resolveDetailTab", () => {
  it("đổi khóa V1 sang tab V2, kể cả khóa 'partner' cũ bị lệch", () => {
    expect(resolveDetailTab("txn_details")).toBe("details");
    expect(resolveDetailTab("txn_partner")).toBe("partner");
    expect(resolveDetailTab("partner")).toBe("partner");
    expect(resolveDetailTab("history")).toBe("history");
  });

  it("khóa lạ hoặc rỗng về tab Chi tiết", () => {
    expect(resolveDetailTab("xyz")).toBe("details");
    expect(resolveDetailTab(undefined)).toBe("details");
  });
});

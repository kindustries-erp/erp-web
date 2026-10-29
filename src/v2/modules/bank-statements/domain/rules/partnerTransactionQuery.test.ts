import { describe, expect, it } from "vitest";
import type { V2TableQuery } from "@/v2/shared/types/v2-table";
import {
  remainingOfTransaction,
  sourceLabelOfTransaction,
  toPartnerTransactionParams,
} from "./partnerTransactionQuery";
import type { CashTransactionDto } from "../../api/dtos/cashTransaction.dto";

const baseQuery: V2TableQuery = {
  page: 2,
  pageSize: 20,
  sorts: [],
  columnFilters: {},
  columnSearch: {},
  columnOperators: {},
  dateRanges: {},
};

describe("toPartnerTransactionParams", () => {
  it("mặc định sắp theo ngày giảm dần, kèm khóa đối tượng", () => {
    const params = toPartnerTransactionParams(baseQuery, {
      correspondentName: "ACME",
    });
    expect(params).toEqual({
      page: 2,
      pageSize: 20,
      sortBy: "transDate",
      sortOrder: "DESC",
      correspondentName: "ACME",
    });
  });

  it("đổi khoảng ngày và bộ lọc cột thành tham số server", () => {
    const params = toPartnerTransactionParams(
      {
        ...baseQuery,
        dateRanges: { transDate: { from: "2026-10-01", to: "2026-10-31" } },
        columnFilters: { branch: ["HN"], empty: [] },
        search: " abc ",
      },
      {},
    );
    expect(params.startDate).toBe("2026-10-01T00:00:00");
    expect(params.endDate).toBe("2026-10-31T23:59:59");
    expect(params.column_filters).toBe('{"branch":["HN"]}');
    expect(params.column_search).toBe("abc");
  });
});

describe("partner row helpers", () => {
  it("còn lại là số lớn hơn giữa Thu và Chi trừ đã cấn trừ, không âm", () => {
    expect(
      remainingOfTransaction({
        creditAmount: 500,
        debitAmount: 0,
        netOffAmount: 200,
      } as CashTransactionDto),
    ).toBe(300);
    expect(
      remainingOfTransaction({
        creditAmount: 0,
        debitAmount: 100,
        netOffAmount: 150,
      } as CashTransactionDto),
    ).toBe(0);
  });

  it("nguồn tiền: sổ quỹ hiện tên sổ, tài khoản ngân hàng hiện tên - số", () => {
    expect(
      sourceLabelOfTransaction({
        sourceType: "CASH",
        cashBook: { name: "Quỹ ĐT" },
      } as CashTransactionDto),
    ).toBe("Quỹ ĐT");
    expect(
      sourceLabelOfTransaction({
        sourceType: "BANK",
        bankAccount: { bankName: "TCB", accountNumber: "123" },
      } as CashTransactionDto),
    ).toBe("TCB - 123");
  });
});

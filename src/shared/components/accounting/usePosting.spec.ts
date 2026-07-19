import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeAll } from "vitest";
import { usePosting } from "./usePosting";

describe("usePosting", () => {
  beforeAll(() => {
    Object.defineProperty(globalThis, "crypto", {
      value: {
        randomUUID: () => Math.random().toString(36).substring(7),
      },
    });
  });

  it("should initialize with default values", () => {
    const { result } = renderHook(() => usePosting());

    expect(result.current.postingDate).toBe("");
    expect(result.current.description).toBe("");
    expect(result.current.lines).toEqual([]);
    expect(result.current.totalDebit).toBe(0);
    expect(result.current.totalCredit).toBe(0);
    expect(result.current.isBalanced).toBe(true);
    expect(result.current.isDirty).toBe(false);
  });

  it("should initialize with provided initialState", () => {
    const initialState = {
      postingDate: "2023-10-01",
      description: "Test description",
      lines: [
        {
          id: "1",
          accountId: "111",
          debit: 100,
          credit: 0,
          description: "Test",
        },
      ],
    };
    const { result } = renderHook(() => usePosting(initialState));

    expect(result.current.postingDate).toBe("2023-10-01");
    expect(result.current.description).toBe("Test description");
    expect(result.current.lines).toHaveLength(1);
    expect(result.current.totalDebit).toBe(100);
    expect(result.current.totalCredit).toBe(0);
    expect(result.current.isBalanced).toBe(false);
    expect(result.current.isDirty).toBe(false);
  });

  it("should add a new line correctly", () => {
    const { result } = renderHook(() => usePosting());

    act(() => {
      result.current.addLine();
    });

    expect(result.current.lines).toHaveLength(1);
    expect(result.current.lines[0].debit).toBe(0);
    expect(result.current.lines[0].credit).toBe(0);
    expect(result.current.isDirty).toBe(true);
  });

  it("should remove a line correctly", () => {
    const initialState = {
      lines: [
        {
          id: "line-1",
          accountId: "111",
          debit: 100,
          credit: 0,
          description: "",
        },
      ],
    };
    const { result } = renderHook(() => usePosting(initialState));

    act(() => {
      result.current.removeLine("line-1");
    });

    expect(result.current.lines).toHaveLength(0);
    expect(result.current.isDirty).toBe(true);
  });

  it("should update line debit and reset credit", () => {
    const initialState = {
      lines: [
        {
          id: "line-1",
          accountId: "111",
          debit: 0,
          credit: 50,
          description: "",
        },
      ],
    };
    const { result } = renderHook(() => usePosting(initialState));

    act(() => {
      result.current.updateLine("line-1", "debit", 100);
    });

    expect(result.current.lines[0].debit).toBe(100);
    expect(result.current.lines[0].credit).toBe(0); // Credit should be reset when debit is > 0
    expect(result.current.totalDebit).toBe(100);
    expect(result.current.totalCredit).toBe(0);
    expect(result.current.isBalanced).toBe(false);
  });

  it("should calculate isBalanced correctly", () => {
    const { result } = renderHook(() =>
      usePosting({
        lines: [
          {
            id: "1",
            accountId: "111",
            debit: 100.5,
            credit: 0,
            description: "",
          },
          {
            id: "2",
            accountId: "112",
            debit: 0,
            credit: 100.5,
            description: "",
          },
        ],
      }),
    );

    expect(result.current.totalDebit).toBe(100.5);
    expect(result.current.totalCredit).toBe(100.5);
    expect(result.current.isBalanced).toBe(true);
  });

  it("should setAllState correctly", () => {
    const { result } = renderHook(() => usePosting());

    act(() => {
      result.current.setAllState({
        postingDate: "2024-01-01",
        description: "New state",
        lines: [
          {
            id: "new-1",
            accountId: "331",
            debit: 0,
            credit: 200,
            description: "",
          },
        ],
      });
    });

    expect(result.current.postingDate).toBe("2024-01-01");
    expect(result.current.description).toBe("New state");
    expect(result.current.lines).toHaveLength(1);
    expect(result.current.totalCredit).toBe(200);
    expect(result.current.isDirty).toBe(true);
  });
});

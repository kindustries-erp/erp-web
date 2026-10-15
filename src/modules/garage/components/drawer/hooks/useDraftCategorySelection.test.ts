import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useDraftCategorySelection } from "./useDraftCategorySelection";

describe("useDraftCategorySelection", () => {
  it("xóa category (null) thì xóa luôn classification nháp", () => {
    const { result } = renderHook(() => useDraftCategorySelection());
    act(() => result.current.reset("cat-1", "KY_GUI_NOI_BO"));
    expect(result.current.draftClassification).toBe("KY_GUI_NOI_BO");

    act(() => result.current.setDraftCategoryId(null));
    expect(result.current.draftCategoryId).toBeNull();
    expect(result.current.draftClassification).toBe("");
  });

  it("chọn category khác giữ nguyên classification nháp (server tự suy ra)", () => {
    const { result } = renderHook(() => useDraftCategorySelection());
    act(() => result.current.reset("cat-1", "KHAC"));
    act(() => result.current.setDraftCategoryId("cat-2"));
    expect(result.current.draftCategoryId).toBe("cat-2");
    expect(result.current.draftClassification).toBe("KHAC");
  });
});

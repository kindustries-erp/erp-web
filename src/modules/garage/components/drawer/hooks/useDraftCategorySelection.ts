import { useCallback, useState } from "react";

/**
 * State nháp phân loại của phiếu (categoryId + classification).
 * `setDraftCategoryId(null)` xóa luôn classification nháp, nếu không server giữ classification cũ
 * và UI vẫn hiện phân loại sau khi lưu. `reset` dùng cho khởi tạo/Hủy (không có hiệu ứng phụ).
 */
export function useDraftCategorySelection() {
  const [draftCategoryId, setCategoryIdState] = useState<string | null>(null);
  const [draftClassification, setDraftClassification] = useState<string>("");

  const setDraftCategoryId = useCallback((categoryId: string | null) => {
    setCategoryIdState(categoryId);
    if (!categoryId) setDraftClassification("");
  }, []);

  const reset = useCallback(
    (categoryId: string | null, classification: string) => {
      setCategoryIdState(categoryId);
      setDraftClassification(classification);
    },
    [],
  );

  return {
    draftCategoryId,
    setDraftCategoryId,
    draftClassification,
    setDraftClassification,
    reset,
  };
}

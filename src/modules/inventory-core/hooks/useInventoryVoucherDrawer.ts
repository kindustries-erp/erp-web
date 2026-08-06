import { useState, useCallback, useEffect } from "react";
import { useGrDrawer } from "@/modules/goods-receipts-core/hooks/useGrDrawer";
import { useGiDrawer } from "@/modules/goods-issues-core/hooks/useGiDrawer";
import { useIaDrawer } from "@/modules/inventory-adjustments/hooks/useIaDrawer";

export function useInventoryVoucherDrawer(options?: {
  invalidateWarehouseQuery?: boolean;
}) {
  const [type, setType] = useState<"receipt" | "issue" | "adjustment">(
    "receipt",
  );
  const [unifiedOpen, setUnifiedOpen] = useState(false);

  const grDrawer = useGrDrawer(options);
  const giDrawer = useGiDrawer(options);
  const iaDrawer = useIaDrawer(options);

  /** Mở drawer hợp nhất với loại chứng từ ban đầu */
  const openUnifiedCreate = useCallback(
    (initialType: "receipt" | "issue" | "adjustment" = "receipt") => {
      setType(initialType);

      // Khởi tạo lại trạng thái của tất cả các form thành Tạo mới (clear data cũ nếu có)
      grDrawer.openCreate();
      giDrawer.openCreate();
      iaDrawer.openCreate();

      setUnifiedOpen(true);
    },
    [grDrawer.openCreate, giDrawer.openCreate, iaDrawer.openCreate],
  );

  /** Đóng drawer hợp nhất */
  const closeUnified = useCallback(() => {
    setUnifiedOpen(false);
    grDrawer.close();
    giDrawer.close();
    iaDrawer.close();
  }, [grDrawer.close, giDrawer.close, iaDrawer.close]);

  // Đồng bộ trạng thái lưu/đóng: nếu form hiện tại đang active mà tự chuyển open=false (do đã save thành công), thì đóng unified luôn.
  useEffect(() => {
    if (unifiedOpen) {
      if (type === "receipt" && !grDrawer.open) setUnifiedOpen(false);
      if (type === "issue" && !giDrawer.open) setUnifiedOpen(false);
      if (type === "adjustment" && !iaDrawer.open) setUnifiedOpen(false);
    }
  }, [unifiedOpen, type, grDrawer.open, giDrawer.open, iaDrawer.open]);

  /**
   * Đổi loại chứng từ — chỉ cập nhật state, KHÔNG đóng/mở lại drawer.
   * Drawer giữ nguyên trạng thái mở, chỉ re-render nội dung bên trong.
   */
  const handleSwitchType = useCallback(
    (newType: "receipt" | "issue" | "adjustment") => {
      if (newType === type) return;
      setType(newType);
    },
    [type],
  );

  return {
    type,
    unifiedOpen,
    handleSwitchType,
    openUnifiedCreate,
    closeUnified,
    grDrawer,
    giDrawer,
    iaDrawer,
  };
}

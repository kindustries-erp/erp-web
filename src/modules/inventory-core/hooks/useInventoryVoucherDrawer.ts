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

      // Khởi tạo lại trạng thái của form và chỉ open form hiện tại
      if (initialType === "receipt") grDrawer.openCreate();
      if (initialType === "issue") giDrawer.openCreate();
      if (initialType === "adjustment") iaDrawer.openCreate();

      setUnifiedOpen(true);
    },
    [grDrawer, giDrawer, iaDrawer],
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
   * Đổi loại chứng từ — cập nhật state và mở form tương ứng nếu unified đang mở.
   */
  const handleSwitchType = useCallback(
    (newType: "receipt" | "issue" | "adjustment") => {
      if (newType === type) return;
      setType(newType);

      if (unifiedOpen) {
        if (newType === "receipt") grDrawer.openCreate();
        if (newType === "issue") giDrawer.openCreate();
        if (newType === "adjustment") iaDrawer.openCreate();
      }
    },
    [type, unifiedOpen, grDrawer, giDrawer, iaDrawer],
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

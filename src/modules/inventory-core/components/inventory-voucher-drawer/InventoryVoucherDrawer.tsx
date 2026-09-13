import { GrFormDrawer } from "@/modules/goods-receipts-core/components/GrFormDrawer";
import { GiFormDrawer } from "@/modules/goods-issues-core/components/GiFormDrawer";
import { IaFormDrawer } from "@/modules/inventory-adjustments/components/IaFormDrawer";
import type { useInventoryVoucherDrawer } from "@/modules/inventory-core/hooks/useInventoryVoucherDrawer";

interface Props {
  unifiedDrawer: ReturnType<typeof useInventoryVoucherDrawer>;
}

export function InventoryVoucherDrawer({ unifiedDrawer }: Props) {
  const {
    type,
    unifiedOpen,
    handleSwitchType,
    closeUnified,
    grDrawer,
    giDrawer,
    iaDrawer,
  } = unifiedDrawer;

  /** Context được inject vào từng sub-drawer để hiển thị Combobox loại chứng từ */
  const unifiedContext = {
    type,
    setType: handleSwitchType,
    mode: "create" as const,
  };

  return (
    <>
      <GrFormDrawer
        drawer={{
          ...grDrawer,
          open: unifiedOpen ? type === "receipt" : grDrawer.open,
          close: unifiedOpen ? closeUnified : grDrawer.close,
          unifiedContext: unifiedOpen ? unifiedContext : undefined,
        }}
      />
      <GiFormDrawer
        drawer={{
          ...giDrawer,
          open: unifiedOpen ? type === "issue" : giDrawer.open,
          close: unifiedOpen ? closeUnified : giDrawer.close,
          unifiedContext: unifiedOpen ? unifiedContext : undefined,
        }}
      />
      <IaFormDrawer
        drawer={{
          ...iaDrawer,
          open: unifiedOpen ? type === "adjustment" : iaDrawer.open,
          close: unifiedOpen ? closeUnified : iaDrawer.close,
          unifiedContext: unifiedOpen ? unifiedContext : undefined,
        }}
      />
    </>
  );
}

import { TrackedGoodsDrawer } from "../../TrackedGoodsDrawer";
import { SoPreviewDrawer } from "@/modules/sales-orders-core/components/SoPreviewDrawer";
import { GiFormDrawer } from "@/modules/goods-issues-core/components/GiFormDrawer";
import type { useGiDrawer } from "@/modules/goods-issues-core/hooks/useGiDrawer";
import type { InventorySerialRow } from "@/modules/inventory-core/api/inventoryCoreApi";

export interface TrackedGoodsDrawersProps {
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  selectedItem: InventorySerialRow | null;
  drawerMode: "view" | "edit";
  previewSoNo: string | null;
  setPreviewSoNo: (soNo: string | null) => void;
  giDrawer: ReturnType<typeof useGiDrawer>;
  onRefetch: () => void;
}

export function TrackedGoodsDrawers({
  drawerOpen,
  setDrawerOpen,
  selectedItem,
  drawerMode,
  previewSoNo,
  setPreviewSoNo,
  giDrawer,
  onRefetch,
}: TrackedGoodsDrawersProps) {
  return (
    <>
      {drawerOpen && (
        <TrackedGoodsDrawer
          open={drawerOpen}
          item={selectedItem}
          initialMode={drawerMode}
          onClose={() => setDrawerOpen(false)}
          onSaved={() => {
            onRefetch();
            setDrawerOpen(false);
          }}
        />
      )}
      {!!previewSoNo && (
        <SoPreviewDrawer
          open={!!previewSoNo}
          soNo={previewSoNo}
          onClose={() => setPreviewSoNo(null)}
        />
      )}
      {giDrawer.open && <GiFormDrawer drawer={giDrawer} />}
    </>
  );
}

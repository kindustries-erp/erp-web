import React from "react";
import { DrawerModal } from "@/shared/components/DrawerModal";
import { StandardTable } from "@/shared/components/StandardTable";
import { ShoppingCart } from "lucide-react";
import type { ErpPurchaseOrder } from "@/modules/purchase-orders-core/api/purchaseOrdersCoreApi";
import type { PurchaseOrderSelectionModalProps } from "./PurchaseOrderSelectionModal.type";
import { usePurchaseOrderSelectionModal } from "./PurchaseOrderSelectionModal.hook";

export function PurchaseOrderSelectionModal({
  open,
  onClose,
  onSelect,
  existingPoIds = [],
}: PurchaseOrderSelectionModalProps) {
  const {
    t,
    page,
    setPage,
    pageSize,
    setPageSize,
    selectedPo,
    orders,
    data,
    isLoading,
    columns,
    handleSelect,
    handleConfirm,
  } = usePurchaseOrderSelectionModal({
    open,
    onClose,
    onSelect,
    existingPoIds,
  });

  return (
    <DrawerModal
      open={open}
      onClose={onClose}
      icon={<ShoppingCart className="w-5 h-5 text-primary" />}
      title={t(
        "Chọn đơn mua hàng (PO) để ghép nối",
        "Chọn đơn mua hàng (PO) để ghép nối",
      )}
      panelClassName="w-full md:w-[95vw] lg:w-[1100px] xl:w-[1100px]"
      actions={[
        {
          label: t("cancel", "Hủy"),
          variant: "outline",
          onClick: onClose,
        },
        {
          label: t("confirm", "Ghép nối"),
          primary: true,
          disabled: !selectedPo,
          onClick: handleConfirm,
        },
      ]}
    >
      <div className="flex flex-col h-full min-h-[480px]">
        <StandardTable<ErpPurchaseOrder>
          tableId="purchase-order-selection-table"
          items={orders}
          columns={columns}
          getRowKey={(row) => row.id}
          variant="spreadsheet"
          enableColumnResizing={true}
          loading={isLoading}
          page={page}
          pageSize={pageSize}
          total={data?.total || 0}
          totalPages={data?.totalPages || 0}
          onPage={setPage}
          onPageSize={setPageSize}
          minWidth={850}
          onRowClick={(row) => {
            if (!existingPoIds.includes(row.id)) {
              handleSelect(row);
            }
          }}
        />
      </div>
    </DrawerModal>
  );
}
export default PurchaseOrderSelectionModal;

import React from "react";
import { DrawerModal } from "@/shared/components/DrawerModal";
import { StandardTable } from "@/shared/components/StandardTable";
import { FileSpreadsheet } from "lucide-react";
import type { ErpSalesOrder } from "@/modules/sales-orders-core/api/salesOrdersCoreApi";
import type { SalesOrderSelectionModalProps } from "./SalesOrderSelectionModal.type";
import { useSalesOrderSelectionModal } from "./SalesOrderSelectionModal.hook";

export function SalesOrderSelectionModal({
  open,
  onClose,
  onSelect,
  existingSoIds = [],
}: SalesOrderSelectionModalProps) {
  const {
    t,
    page,
    setPage,
    pageSize,
    setPageSize,
    selectedSo,
    orders,
    data,
    isLoading,
    columns,
    handleSelect,
    handleConfirm,
  } = useSalesOrderSelectionModal({
    open,
    onClose,
    onSelect,
    existingSoIds,
  });

  return (
    <DrawerModal
      open={open}
      onClose={onClose}
      icon={<FileSpreadsheet className="w-5 h-5 text-primary" />}
      title={t(
        "Chọn đơn bán hàng (SO) để ghép nối",
        "Chọn đơn bán hàng (SO) để ghép nối",
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
          disabled: !selectedSo,
          onClick: handleConfirm,
        },
      ]}
    >
      <div className="flex flex-col h-full min-h-[480px]">
        <StandardTable<ErpSalesOrder>
          tableId="sales-order-selection-table"
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
            if (!existingSoIds.includes(row.id)) {
              handleSelect(row);
            }
          }}
        />
      </div>
    </DrawerModal>
  );
}
export default SalesOrderSelectionModal;

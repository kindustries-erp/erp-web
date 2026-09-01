import React, { useMemo, useState } from "react";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate";
import {
  useGarageReceivables,
  useSyncGarageReceivables,
} from "../hooks/useGarage";
import { useGarageStore } from "../store/garageStore";
import { GarageBranchSelector } from "../components/GarageBranchSelector";
import { DrawerModal } from "@/shared/components/DrawerModal";
import { RefreshCw, WalletCards } from "lucide-react";
import { useFilterPanel } from "@/shared/hooks/useFilterPanel";
import { Button } from "@/shared/components/ui/Button";

export function GarageReceivables() {
  const { selectedBranchId } = useGarageStore();

  const filterConfig = useMemo(() => {
    return {
      period: true,
      noDefaultPeriod: true,
      custom: [],
    };
  }, []);

  const filter = useFilterPanel(filterConfig, () => {});

  const {
    data: items,
    isLoading,
    refetch,
  } = useGarageReceivables(selectedBranchId);
  const { mutate: syncData, isPending: isSyncing } = useSyncGarageReceivables();

  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  const columns = [
    {
      key: "code",
      header: "Mã Phiếu Thu",
      sortable: true,
      cell: (item: any) => (
        <span className="font-medium text-blue-600">{item.code}</span>
      ),
    },
    {
      key: "name",
      header: "Tên Khách Hàng",
      sortable: true,
      cell: (item: any) => item.name,
    },
    {
      key: "totalAmount",
      header: "Tổng Tiền",
      sortable: true,
      cell: (item: any) =>
        new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(Number(item.totalAmount) || 0),
    },
    {
      key: "paidAmount",
      header: "Đã Thanh Toán",
      sortable: true,
      cell: (item: any) =>
        new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(Number(item.paidAmount) || 0),
    },
  ];

  const handleSync = () => {
    if (!selectedBranchId) return;
    syncData({
      branchId: selectedBranchId,
      from: filter.state.dateFrom || undefined,
      to: filter.state.dateTo || undefined,
    });
  };

  return (
    <>
      <SpreadsheetPageTemplate
        title="Garage Receivables"
        desc="Manage synced receivables from Greenway"
        icon={<WalletCards className="w-5 h-5 text-blue-600" />}
        tableId="garage-receivables-table"
        items={items || []}
        columns={columns}
        getRowKey={(item: any) => item.id}
        loading={isLoading}
        onRefresh={() => refetch()}
        customActionsNode={<GarageBranchSelector />}
        extraActions={
          <Button
            onClick={handleSync}
            disabled={!selectedBranchId || isSyncing}
            variant="primary"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isSyncing ? "animate-spin" : ""}`}
            />
            Sync Receivables
          </Button>
        }
        onRowClick={(item) => setSelectedItem(item)}
        page={1}
        pageSize={items?.length || 10}
        total={items?.length || 0}
        totalPages={1}
        onPage={() => {}}
        onPageSize={() => {}}
      />

      <DrawerModal
        open={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title={`Receivable Details: ${selectedItem?.code || ""}`}
      >
        {selectedItem && (
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-500">Customer Name</span>
                <p className="font-medium">{selectedItem.name}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Total Amount</span>
                <p className="font-medium text-blue-600">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(Number(selectedItem.totalAmount) || 0)}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Paid Amount</span>
                <p className="font-medium text-green-600">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(Number(selectedItem.paidAmount) || 0)}
                </p>
              </div>
            </div>
            {selectedItem.rawData && (
              <div className="mt-6">
                <h4 className="text-sm font-semibold mb-2">Raw JSON Data</h4>
                <pre className="bg-gray-50 p-4 rounded-md text-xs overflow-auto max-h-96">
                  {JSON.stringify(selectedItem.rawData, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </DrawerModal>
    </>
  );
}

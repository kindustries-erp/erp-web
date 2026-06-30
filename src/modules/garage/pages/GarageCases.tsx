import React, { useState, useMemo } from "react";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate";
import {
  useGarageCases,
  useSyncGarageCases,
  useGarageCaseServices,
  useGarageCasePayments,
  useSyncGarageCaseDetail,
} from "../hooks/useGarage";
import { useGarageStore } from "../store/garageStore";
import { GarageBranchSelector } from "../components/GarageBranchSelector";
import { DrawerModal } from "@/shared/components/DrawerModal";
import { RefreshCw, Car } from "lucide-react";
import { useFilterPanel } from "@/shared/hooks/useFilterPanel";

export function GarageCases() {
  const { selectedBranchId } = useGarageStore();

  const filterConfig = useMemo(() => {
    return {
      period: true,
      noDefaultPeriod: true,
      search: true,
      custom: [],
    };
  }, []);

  const filter = useFilterPanel(filterConfig, () => {});

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const {
    data: casesData,
    isLoading,
    refetch,
  } = useGarageCases(
    selectedBranchId,
    page,
    pageSize,
    filter.state.search || "",
  );
  const cases = casesData?.data || [];
  const totalCases = casesData?.pagination?.total || 0;

  const { mutate: syncCases, isPending: isSyncing } = useSyncGarageCases();
  const { mutate: syncCaseDetail, isPending: isSyncingDetail } =
    useSyncGarageCaseDetail();

  const [selectedCase, setSelectedCase] = useState<any | null>(null);

  const { data: services } = useGarageCaseServices(selectedCase?.externalId);
  const { data: payments } = useGarageCasePayments(selectedCase?.externalId);

  const columns = [
    {
      key: "caseDate",
      header: "Case Date",
      sortable: true,
      cell: (item: any) => {
        if (!item.rawData?.caseDate) return "-";
        // format ISO date string to DD/MM/YYYY HH:mm without changing timezone
        const d = new Date(item.rawData.caseDate);
        const pad = (n: number) => n.toString().padStart(2, "0");
        return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
      },
    },
    {
      key: "caseCode",
      header: "Case Code",
      sortable: true,
      cell: (item: any) => (
        <span className="font-medium text-blue-600">{item.caseCode}</span>
      ),
    },
    {
      key: "licensePlate",
      header: "License Plate",
      sortable: true,
      cell: (item: any) => item.rawData?.licensePlate || "-",
    },
    {
      key: "customerCode",
      header: "Customer Code",
      sortable: true,
      cell: (item: any) => item.rawData?.customerCode || "-",
    },
    {
      key: "customerName",
      header: "Customer Name",
      sortable: true,
      cell: (item: any) => item.rawData?.customerName || "-",
    },
    {
      key: "isInsuranceClaim",
      header: "Insurance",
      sortable: true,
      cell: (item: any) => (item.rawData?.isInsuranceClaim ? "Yes" : "No"),
    },
    {
      key: "totalAmount",
      header: "Total Amount",
      sortable: true,
      cell: (item: any) =>
        new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(Number(item.totalAmount) || 0),
    },
    {
      key: "paidAmount",
      header: "Paid Amount",
      sortable: true,
      cell: (item: any) =>
        new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(Number(item.paidAmount) || 0),
    },
    {
      key: "statusName",
      header: "Status",
      sortable: true,
      cell: (item: any) => (
        <span className="px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-700">
          {item.statusName || "Unknown"}
        </span>
      ),
    },
  ];

  const handleSync = () => {
    if (!selectedBranchId) return;
    syncCases({
      branchId: selectedBranchId,
      from: filter.state.dateFrom || undefined,
      to: filter.state.dateTo || undefined,
    });
  };

  return (
    <>
      <SpreadsheetPageTemplate
        title="Garage Cases"
        desc="Manage synced cases from Greenway"
        icon={<Car className="w-5 h-5 text-blue-600" />}
        tableId="garage-cases-table"
        items={cases}
        columns={columns}
        getRowKey={(item: any) => item.id}
        loading={isLoading}
        onRefresh={() => refetch()}
        filterConfig={filterConfig}
        filter={filter}
        customActionsNode={<GarageBranchSelector />}
        extraActions={
          <button
            onClick={handleSync}
            disabled={!selectedBranchId || isSyncing}
            className="flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isSyncing ? "animate-spin" : ""}`}
            />
            Sync Cases
          </button>
        }
        onRowClick={(item) => setSelectedCase(item)}
        page={page}
        pageSize={pageSize}
        total={totalCases}
        totalPages={Math.ceil(totalCases / pageSize) || 1}
        onPage={(p) => setPage(p)}
        onPageSize={(s) => {
          setPageSize(s);
          setPage(1);
        }}
      />

      <DrawerModal
        open={!!selectedCase}
        onClose={() => setSelectedCase(null)}
        title={`Case Details: ${selectedCase?.caseCode || ""}`}
      >
        {selectedCase && (
          <div className="p-4 space-y-4">
            <div className="flex justify-end border-b pb-4">
              <button
                onClick={() =>
                  syncCaseDetail({
                    branchId: selectedBranchId!,
                    caseId: selectedCase.externalId,
                  })
                }
                disabled={isSyncingDetail}
                className="flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded"
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${isSyncingDetail ? "animate-spin" : ""}`}
                />
                Sync Details
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-500">Case Name</span>
                <p className="font-medium">{selectedCase.caseName}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Status</span>
                <p className="font-medium">{selectedCase.statusName}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Total Amount</span>
                <p className="font-medium text-blue-600">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(Number(selectedCase.totalAmount) || 0)}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Paid Amount</span>
                <p className="font-medium text-green-600">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(Number(selectedCase.paidAmount) || 0)}
                </p>
              </div>
            </div>

            {/* Services Table */}
            <div className="mt-6 border-t pt-4">
              <h4 className="text-sm font-semibold mb-2">Services</h4>
              {services?.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2">Service Name</th>
                        <th className="px-3 py-2 text-right">Qty</th>
                        <th className="px-3 py-2 text-right">Price</th>
                        <th className="px-3 py-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {services.map((s: any) => (
                        <tr key={s.id} className="border-b">
                          <td className="px-3 py-2">{s.serviceName}</td>
                          <td className="px-3 py-2 text-right">{s.quantity}</td>
                          <td className="px-3 py-2 text-right">
                            {new Intl.NumberFormat("vi-VN").format(
                              s.price || 0,
                            )}
                          </td>
                          <td className="px-3 py-2 text-right font-medium">
                            {new Intl.NumberFormat("vi-VN").format(
                              s.totalAmount || 0,
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No services found.</p>
              )}
            </div>

            {/* Payments Table */}
            <div className="mt-6 border-t pt-4">
              <h4 className="text-sm font-semibold mb-2">Payments</h4>
              {payments?.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2">Method</th>
                        <th className="px-3 py-2 text-right">Amount</th>
                        <th className="px-3 py-2">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((p: any) => (
                        <tr key={p.id} className="border-b">
                          <td className="px-3 py-2">{p.paymentMethod}</td>
                          <td className="px-3 py-2 text-right font-medium">
                            {new Intl.NumberFormat("vi-VN").format(
                              p.amount || 0,
                            )}
                          </td>
                          <td className="px-3 py-2">
                            {p.paymentDate
                              ? new Date(p.paymentDate).toLocaleDateString()
                              : ""}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No payments found.</p>
              )}
            </div>

            {selectedCase.rawData && (
              <div className="mt-6">
                <h4 className="text-sm font-semibold mb-2">Raw JSON Data</h4>
                <pre className="bg-gray-50 p-4 rounded-md text-xs overflow-auto max-h-96">
                  {JSON.stringify(selectedCase.rawData, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </DrawerModal>
    </>
  );
}

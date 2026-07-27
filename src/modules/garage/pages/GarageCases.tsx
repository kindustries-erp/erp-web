import React, { useState, useMemo, useEffect } from "react";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate";
import {
  useGarageCases,
  useGarageBranches,
  useSyncGarageCases,
  useSyncGarageCaseDetail,
  useGarageDashboard,
} from "../hooks/useGarage";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { DrawerSection, DrawerRow } from "@/shared/components/DrawerModal";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { RefreshCw, Car, DownloadCloud, Download, MoreHorizontal } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { useFilterPanel } from "@/shared/hooks/useFilterPanel";
import { useGarageStore } from "../store/garageStore";
import { GarageBranchSelector } from "../components/GarageBranchSelector";
import { GarageCaseSyncDrawer } from "../components/GarageCaseSyncDrawer";
import { useTranslation } from "react-i18next";

export function GarageCases() {
  const { t } = useTranslation("garage");
  const { selectedBranchId, setSelectedBranchId } = useGarageStore();
  const { data: branches } = useGarageBranches();

  useEffect(() => {
    if (branches && branches.length > 0 && !selectedBranchId) {
      setSelectedBranchId(branches[0].externalId);
    }
  }, [branches, selectedBranchId, setSelectedBranchId]);

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

  const [syncDrawerOpen, setSyncDrawerOpen] = useState(false);


  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const selectedCase = useMemo(
    () => cases?.find((c: any) => c.id === selectedCaseId),
    [cases, selectedCaseId],
  );

  const createActions = useMemo(
    () => [
      {
        groupLabel: "Thao tác",
        items: [
          {
            label: "Đồng bộ Cases",
            icon: <DownloadCloud className="w-4 h-4 text-indigo-600" />,
            onClick: () => setSyncDrawerOpen(true),
          },
        ],
      },
    ],
    [],
  );

  const columns = [
    {
      key: "caseDate",
      header: t("cases.columns.caseDate"),
      sortable: true,
      cell: (item: any) => {
        if (!item.ngayPhatSinh) return "-";
        // format ISO date string to DD/MM/YYYY HH:mm without changing timezone
        const d = new Date(item.ngayPhatSinh);
        const pad = (n: number) => n.toString().padStart(2, "0");
        return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
      },
    },
    {
      key: "caseCode",
      header: t("cases.columns.caseCode"),
      sortable: true,
      cell: (item: any) => (
        <span className="font-medium text-blue-600">{item.soChungTu}</span>
      ),
    },
    {
      key: "licensePlate",
      header: t("cases.columns.licensePlate"),
      sortable: true,
      cell: (item: any) => item.bienSoXe || "-",
    },
    {
      key: "customerCode",
      header: t("cases.columns.customerCode"),
      sortable: true,
      cell: (item: any) => item.khachHangCode || "-",
    },
    {
      key: "customerName",
      header: t("cases.columns.customerName"),
      sortable: true,
      cell: (item: any) => item.khachHangName || "-",
    },
    {
      key: "isInsuranceClaim",
      header: t("cases.columns.insurance"),
      sortable: true,
      cell: (item: any) =>
        item.rawData?.XeLamBaoHiem
          ? t("cases.common.yes")
          : t("cases.common.no"),
    },
    {
      key: "totalAmount",
      header: t("cases.columns.totalAmount"),
      sortable: true,
      cell: (item: any) =>
        new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(Number(item.tienCoThue) || 0),
    },
    {
      key: "balanceAmount",
      header: t("cases.columns.balanceAmount"),
      sortable: true,
      cell: (item: any) =>
        new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(Number(item.tienConPhaiThanhToan) || 0),
    },
    {
      key: "dataAsOf",
      header: t("cases.columns.dataAsOf"),
      sortable: true,
      cell: (item: any) => {
        if (!item.dataAsOf) return "-";
        return new Date(item.dataAsOf).toLocaleString();
      },
    },
    {
      key: "createdAt",
      header: t("cases.columns.createdAt"),
      sortable: true,
      cell: (item: any) => {
        if (!item.createdAt) return "-";
        return new Date(item.createdAt).toLocaleString();
      },
    },
    {
      key: "updatedAt",
      header: t("cases.columns.updatedAt"),
      sortable: true,
      cell: (item: any) => {
        if (!item.updatedAt) return "-";
        return new Date(item.updatedAt).toLocaleString();
      },
    },
    {
      key: "statusName",
      header: t("cases.columns.status"),
      sortable: true,
      cell: (item: any) => (
        <span className="px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-700">
          {item.tenTinhTrangDichVu || t("cases.common.unknown")}
        </span>
      ),
    },
  ];

  return (
    <>
      <SpreadsheetPageTemplate
        title={t("cases.title")}
        desc={t("cases.desc")}
        icon={<Car className="w-5 h-5 text-blue-600" />}
        tableId="garage-cases-table"
        items={cases}
        columns={columns}
        getRowKey={(item: any) => item.id}
        loading={isLoading}
        onRefresh={() => refetch()}
        filterConfig={filterConfig}
        filter={filter}
        createLabel="Tạo phiếu dịch vụ"
        createActions={createActions}
        rowActions={(item: any) => [
          {
            label: "Xem chi tiết",
            icon: <MoreHorizontal className="w-4 h-4" />,
            onClick: () => {
              setSelectedCaseId(item.id);
            },
          },
          {
            label: t("cases.actions.syncDetails"),
            icon: <RefreshCw className="w-4 h-4" />,
            onClick: () => {
              syncCaseDetail({
                branchId: selectedBranchId!,
                caseId: item.hdPhieuDichVuId,
              });
            },
          }
        ]}
        onRowClick={(item) => {
          setSelectedCaseId(item.id);
        }}
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

      <StandardFormDrawer
        open={!!selectedCase}
        mode="view"
        onClose={() => setSelectedCaseId(null)}
        title={`${t("cases.drawer.caseDetails")} ${selectedCase?.soChungTu || ""}`}
        rightPanelTitle={t("cases.drawer.overview")}
        actions={[
          {
            label: t("cases.actions.syncDetails"),
            onClick: () =>
              syncCaseDetail({
                branchId: selectedBranchId!,
                caseId: selectedCase?.hdPhieuDichVuId,
              }),
            variant: "outline",
            loading: isSyncingDetail,
            disabled: isSyncingDetail,
          },
        ]}
        leftPanel={
          selectedCase &&
          isSyncingDetail ? (
            <div className="space-y-4 animate-pulse pt-2">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          ) : selectedCase ? (
            <div className="space-y-4 pt-2">
              <DrawerSection title={t("cases.drawer.conditionAndNotes")}>
                <DrawerRow
                  label={t("cases.drawer.customerRequest")}
                  value={selectedCase.rawData?.YeuCauDichVu}
                />
                <DrawerRow
                  label={t("cases.drawer.diagnosis")}
                  value={selectedCase.rawData?.ChanDoan}
                />
                <DrawerRow
                  label={t("cases.drawer.receptionCondition")}
                  value={selectedCase.rawData?.TinhTrangTiepNhan}
                />
                <DrawerRow
                  label={t("cases.drawer.vehicleIssues")}
                  value={selectedCase.rawData?.ThongTinBenhXe}
                />
                <DrawerRow
                  label={t("cases.drawer.consultation")}
                  value={selectedCase.rawData?.ThongTinTuVan}
                />
                <DrawerRow
                  label={t("cases.drawer.conditionBefore")}
                  value={selectedCase.rawData?.TinhTrangTruoc}
                />
                <DrawerRow
                  label={t("cases.drawer.conditionAfter")}
                  value={selectedCase.rawData?.TinhTrangSau}
                />
                <DrawerRow
                  label={t("cases.drawer.notes")}
                  value={selectedCase.rawData?.GhiChu}
                />
                <DrawerRow
                  label={t("cases.drawer.deliveryNotes")}
                  value={selectedCase.rawData?.GhiChuGiaoXe}
                />
              </DrawerSection>

              <DrawerSection title={t("cases.drawer.servicesAndParts")}>
                {selectedCase.rawData?.ListPhieuDichVuChiTiet?.length ? (
                  <div className="overflow-x-auto mt-2">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead className="bg-gray-50 border-y border-gray-200 text-gray-500 uppercase">
                        <tr>
                          <th className="px-2 py-2 font-semibold">
                            {t("cases.drawer.description")}
                          </th>
                          <th className="px-2 py-2 text-right font-semibold">
                            {t("cases.drawer.qty")}
                          </th>
                          <th className="px-2 py-2 text-right font-semibold">
                            {t("cases.drawer.price")}
                          </th>
                          <th className="px-2 py-2 text-right font-semibold">
                            {t("cases.drawer.total")}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedCase.rawData.ListPhieuDichVuChiTiet.map(
                          (s: any) => (
                            <tr
                              key={s.HdPhieuDichVuChiTietID}
                              className="border-b border-gray-100 last:border-b-0"
                            >
                              <td className="px-2 py-2">
                                <div className="font-medium text-gray-900 line-clamp-2">
                                  {s.NoiDungChiTiet}
                                </div>
                                <div className="text-[10px] text-gray-500">
                                  {s.NhomInName}
                                </div>
                              </td>
                              <td className="px-2 py-2 text-right">
                                {s.SoLuongHoaDon}
                              </td>
                              <td className="px-2 py-2 text-right text-gray-600">
                                {new Intl.NumberFormat("vi-VN").format(
                                  s.DonGia || 0,
                                )}
                              </td>
                              <td className="px-2 py-2 text-right font-semibold">
                                {new Intl.NumberFormat("vi-VN").format(
                                  s.TienCoThue || 0,
                                )}
                              </td>
                            </tr>
                          ),
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 py-2">
                    {t("cases.drawer.noServicesFound")}
                  </p>
                )}
              </DrawerSection>

              <DrawerSection title={t("cases.drawer.payments")}>
                <p className="text-sm text-gray-500 py-2">
                  {t("cases.drawer.noPaymentsFound", "Chưa có dữ liệu thanh toán")}
                </p>
              </DrawerSection>
            </div>
          ) : null
        }
        rightPanel={
          selectedCase &&
          !isSyncingDetail ? (
            <div className="space-y-4">
              <DrawerSection
                title={t("cases.drawer.customerAndVehicle")}
                collapsible
              >
                <DrawerRow
                  label={t("cases.drawer.customerName")}
                  value={
                    selectedCase.rawData?.KhachHangName ||
                    selectedCase.khachHangName
                  }
                />
                <DrawerRow
                  label={t("cases.drawer.customerCode")}
                  value={
                    selectedCase.rawData?.KhachHangCode ||
                    selectedCase.khachHangCode
                  }
                />
                <DrawerRow
                  label={t("cases.drawer.phone")}
                  value={selectedCase.rawData?.DienThoaiKhachHang}
                />
                <DrawerRow
                  label={t("cases.drawer.email")}
                  value={selectedCase.rawData?.EmailKhachHang}
                />
                <DrawerRow
                  label={t("cases.drawer.address")}
                  value={selectedCase.rawData?.DiaChiKhachHang}
                />
                <DrawerRow
                  label={t("cases.drawer.licensePlate")}
                  value={selectedCase.bienSoXe}
                />
                <DrawerRow
                  label={t("cases.drawer.mileage")}
                  value={
                    selectedCase.rawData?.SoKMTruoc ||
                    selectedCase.rawData?.SoKM
                  }
                />
                <DrawerRow
                  label={t("cases.drawer.isOwner")}
                  value={
                    selectedCase.rawData?.LaChuXe
                      ? t("cases.common.yes")
                      : t("cases.common.no")
                  }
                />
                <DrawerRow
                  label={t("cases.drawer.customerSource")}
                  value={selectedCase.rawData?.NguonGocKhachHangName}
                />
                <DrawerRow
                  label={t("cases.drawer.insuranceClaim")}
                  value={
                    selectedCase.rawData?.XeLamBaoHiem
                      ? t("cases.common.yes")
                      : t("cases.common.no")
                  }
                />
                <DrawerRow
                  label={t("cases.drawer.insuranceApproved")}
                  value={
                    selectedCase.rawData?.DaDuyetBaoHiem
                      ? t("cases.common.yes")
                      : t("cases.common.no")
                  }
                />
              </DrawerSection>

              <DrawerSection
                title={t("cases.drawer.generalAndAdvisor")}
                collapsible
              >
                <DrawerRow
                  label={t("cases.drawer.serviceAdvisor")}
                  value={selectedCase.rawData?.NhanVienCoVanDichVuName}
                />
                <DrawerRow
                  label={t("cases.drawer.surveyor")}
                  value={selectedCase.rawData?.GiamDinhVienName}
                />
                <DrawerRow
                  label={t("cases.drawer.broker")}
                  value={selectedCase.rawData?.NguoiMoiGioiName}
                />
                <DrawerRow
                  label={t("cases.drawer.warehouse")}
                  value={selectedCase.rawData?.KhoXuatName}
                />
                <DrawerRow
                  label={t("cases.columns.status")}
                  value={selectedCase.tenTinhTrangDichVu}
                />
                <DrawerRow
                  label={t("cases.drawer.docType")}
                  value={selectedCase.rawData?.LoaiChungTuName}
                />
                <DrawerRow
                  label={t("cases.drawer.startDate")}
                  value={
                    selectedCase.rawData?.NgayBatDauSuaChua
                      ? new Date(
                          selectedCase.rawData.NgayBatDauSuaChua,
                        ).toLocaleString()
                      : null
                  }
                />
                <DrawerRow
                  label={t("cases.drawer.completionDate")}
                  value={
                    selectedCase.rawData?.NgayHoanThanhCongViec
                      ? new Date(
                          selectedCase.rawData.NgayHoanThanhCongViec,
                        ).toLocaleString()
                      : null
                  }
                />
                <DrawerRow
                  label={t("cases.drawer.payer")}
                  value={selectedCase.rawData?.DoiTuongThanhToanName}
                />
              </DrawerSection>

              <DrawerSection
                title={t("cases.drawer.financialSummary")}
                collapsible
              >
                <DrawerRow
                  label={t("cases.drawer.totalGoods")}
                  value={new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(Number(selectedCase.rawData?.TongTienHang || 0))}
                />
                <DrawerRow
                  label={t("cases.drawer.amountBeforeTax")}
                  value={new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(Number(selectedCase.rawData?.TienChuaThue || 0))}
                />
                <DrawerRow
                  label={t("cases.drawer.tax")}
                  value={new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(Number(selectedCase.rawData?.TienThue || 0))}
                />
                <DrawerRow
                  label={t("cases.drawer.discount")}
                  value={new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(Number(selectedCase.rawData?.TienChietKhau || 0))}
                />
                <DrawerRow
                  label={t("cases.drawer.insuranceDeductible")}
                  value={new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(
                    Number(selectedCase.rawData?.TienKhauTruBaoHiem || 0),
                  )}
                />
                <DrawerRow
                  label={t("cases.drawer.sanctionCost")}
                  value={new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(
                    Number(selectedCase.rawData?.TienChiPhiCheTai || 0),
                  )}
                />
                <div className="my-2 border-t border-gray-100"></div>
                <DrawerRow
                  label={t("cases.columns.totalAmount")}
                  cls="text-blue-600 font-bold"
                  value={new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(
                    Number(
                      selectedCase.rawData?.TongTienThanhToan ||
                        selectedCase.tienCoThue,
                    ) || 0,
                  )}
                />
                <DrawerRow
                  label={t("cases.drawer.paidAmount")}
                  cls="text-green-600 font-bold"
                  value={new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(
                    Number(selectedCase.rawData?.TienThanhToanKH || 0) +
                      Number(selectedCase.rawData?.TienThanhToanBH || 0),
                  )}
                />
                <DrawerRow
                  label={t("cases.drawer.paidAmountKH")}
                  cls="text-gray-600 text-xs italic"
                  value={new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(Number(selectedCase.rawData?.TienThanhToanKH || 0))}
                />
                <DrawerRow
                  label={t("cases.drawer.paidAmountBH")}
                  cls="text-gray-600 text-xs italic"
                  value={new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(Number(selectedCase.rawData?.TienThanhToanBH || 0))}
                />
                <DrawerRow
                  label={t("cases.drawer.balance")}
                  cls="text-red-600 font-bold"
                  value={new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(Number(selectedCase.tienConPhaiThanhToan) || 0)}
                />
              </DrawerSection>
            </div>
          ) : null
        }
      />

      <GarageCaseSyncDrawer
        open={syncDrawerOpen}
        onClose={() => setSyncDrawerOpen(false)}
        onSuccess={() => refetch()}
      />
    </>
  );
}

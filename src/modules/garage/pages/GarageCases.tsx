import React, { useState, useMemo, useEffect } from "react";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate";
import {
  useGarageCases,
  useGarageBranches,
  useSyncGarageCaseDetail,
  useGarageGrossProfit,
} from "../hooks/useGarage";
import {
  RefreshCw,
  DownloadCloud,
  MoreHorizontal,
  FileText,
} from "lucide-react";
import { useFilterPanel } from "@/shared/hooks/useFilterPanel";
import { TableText } from "@/shared/components/DataTable/TableText";
import { useGarageStore } from "../store/garageStore";
import { GarageCaseSyncDrawer } from "../components/GarageCaseSyncDrawer";
import { GarageCaseStandaloneDrawer } from "../components/GarageCaseStandaloneDrawer";
import { KgaraCaseStatusBadge } from "../components/KgaraCaseStatusBadge";
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

  const { data: profitData } = useGarageGrossProfit(
    selectedBranchId,
    filter.state.dateFrom || undefined,
    filter.state.dateTo || undefined,
  );

  const profitCases = useMemo(() => {
    const groups = profitData?.results?.Groups || profitData?.Groups || [];
    return groups.flatMap((g: any) => g.Items || []);
  }, [profitData]);

  const {
    data: casesData,
    isLoading,
    refetch,
  } = useGarageCases(
    selectedBranchId,
    page,
    pageSize,
    filter.state.search || "",
    filter.state.dateFrom || undefined,
    filter.state.dateTo || undefined,
  );
  const cases = casesData?.data || [];
  const totalCases = casesData?.pagination?.total || 0;

  const { mutate: syncCaseDetail } = useSyncGarageCaseDetail();

  const [syncDrawerOpen, setSyncDrawerOpen] = useState(false);

  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  const createActions = useMemo(
    () => [
      {
        groupLabel: "Thao tác",
        items: [
          {
            label: t("cases.actions.syncCases", "Đồng bộ Sổ báo giá"),
            icon: <DownloadCloud className="w-4 h-4 text-indigo-600" />,
            onClick: () => setSyncDrawerOpen(true),
          },
        ],
      },
    ],
    [t],
  );

  const columns = [
    {
      key: "branchName",
      header: "Chi nhánh Kgara",
      sortable: false,
      cell: (item: any) => {
        const b = branches?.find(
          (b: any) => b.externalId === item.branchExternalId,
        );
        return b?.name || "-";
      },
    },
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
        <KgaraCaseStatusBadge
          status={item.tenTinhTrangDichVu || t("cases.common.unknown")}
        />
      ),
    },
    {
      key: "caseCode",
      header: t("cases.columns.caseCode"),
      sortable: true,
      size: 200,
      cell: (item: any) => (
        <TableText
          text={item.soChungTu}
          textClassName="font-medium text-primary text-left"
          enableCopy={true}
          onDrawerClick={() => setSelectedCaseId(item.soChungTu)}
        />
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
      key: "doanhThu",
      header: "Doanh thu",
      sortable: true,
      cell: (item: any) => {
        const pItem = profitCases.find(
          (p: any) => p.VuViecCode === item.soChungTu,
        );
        const val = pItem?.DoanhThu ?? item.doanhThu ?? item.rawData?.DoanhThu;
        if (item.tenTinhTrangDichVu === "Kết thúc" && val == null) {
          return (
            <span className="text-red-500 text-xs italic">Chưa đồng bộ</span>
          );
        }
        return new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(Number(val) || 0);
      },
    },
    {
      key: "chiPhi",
      header: "Chi phí",
      sortable: true,
      cell: (item: any) => {
        const pItem = profitCases.find(
          (p: any) => p.VuViecCode === item.soChungTu,
        );
        const val = pItem?.ChiPhi ?? item.chiPhi ?? item.rawData?.ChiPhi;
        if (item.tenTinhTrangDichVu === "Kết thúc" && val == null) {
          return (
            <span className="text-red-500 text-xs italic">Chưa đồng bộ</span>
          );
        }
        return new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(Number(val) || 0);
      },
    },
    {
      key: "loiNhuan",
      header: "Lợi nhuận",
      sortable: true,
      cell: (item: any) => {
        const pItem = profitCases.find(
          (p: any) => p.VuViecCode === item.soChungTu,
        );
        const val = pItem?.LoiNhuan ?? item.loiNhuan ?? item.rawData?.LoiNhuan;
        if (item.tenTinhTrangDichVu === "Kết thúc" && val == null) {
          return (
            <span className="text-red-500 text-xs italic">Chưa đồng bộ</span>
          );
        }
        return new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(Number(val) || 0);
      },
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
  ];

  return (
    <>
      <SpreadsheetPageTemplate
        title={t("cases.title")}
        desc={t("cases.desc")}
        icon={<FileText className="w-5 h-5 text-slate-700" />}
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
          },
        ]}
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

      <GarageCaseStandaloneDrawer
        isOpen={!!selectedCaseId}
        caseCode={selectedCaseId}
        onClose={() => setSelectedCaseId(null)}
        onSuccess={() => refetch()}
      />

      <GarageCaseSyncDrawer
        open={syncDrawerOpen}
        onClose={() => setSyncDrawerOpen(false)}
        onSuccess={() => refetch()}
      />
    </>
  );
}

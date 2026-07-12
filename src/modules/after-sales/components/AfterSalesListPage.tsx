import React, { useState, useEffect, useMemo } from "react";
import { useT } from "@/core/i18n";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate";
import {
  useFilterPanel,
  type FilterPanelConfig,
} from "@/shared/hooks/useFilterPanel";
import { useDrawerStore } from "@/shared/stores/useDrawerStore";
import { AfterSalesDrawer } from "./AfterSalesDrawer";
import { format } from "date-fns";
import { Shield, Eye, Copy, Check } from "lucide-react";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { useAfterSalesQuery } from "../hooks/useAfterSalesQuery";
import { SoPreviewDrawer } from "@/modules/sales-orders-core/components/SoPreviewDrawer";
import { Button } from "@/shared/components/ui/Button";
import { useBasicMasterInfinite } from "@/modules/basic-masters/hooks/useBasicMasterInfinite";

export function AfterSalesListPage() {
  const t = useT();

  const CopyIconBtn = ({ text }: { text: string }) => {
    const [copied, setCopied] = useState(false);
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
        className="opacity-0 group-hover:opacity-100 hover:text-gray-900 transition-opacity p-1"
        title={copied ? t("Đã copy") : t("Copy")}
      >
        {copied ? (
          <Check className="w-3.5 h-3.5 text-green-600" />
        ) : (
          <Copy className="w-3.5 h-3.5" />
        )}
      </button>
    );
  };

  const { openDrawer, closeDrawer, isOpen, type, mode, entityData } =
    useDrawerStore();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [previewSoNo, setPreviewSoNo] = useState<string | null>(null);

  const [sortField, setSortField] = useState<string | undefined>();
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>();
  const [dealerSearch, setDealerSearch] = useState("");

  const {
    data: dealersData,
    fetchNextPage: fetchNextDealers,
    isFetchingNextPage: loadingDealers,
  } = useBasicMasterInfinite({
    search: dealerSearch,
    limit: 50,
    entities: "customers",
  });

  const dealerOptions = useMemo(() => {
    return (
      dealersData?.pages.flatMap((p) =>
        (p.items.customers || []).map((c) => ({
          value: c.id,
          label: `${c.code} — ${c.displayName || c.name}`,
        })),
      ) || []
    );
  }, [dealersData]);

  const filterConfig: FilterPanelConfig = useMemo(
    () => ({
      search: { placeholder: t("Tìm theo serial, khách hàng...") },
      period: true,
      noDefaultPeriod: true,
      custom: [
        {
          key: "dealerId",
          label: t("Đại lý"),
          placeholder: t("Chọn đại lý"),
          type: "combobox",
          options: dealerOptions,
          onSearch: setDealerSearch,
          onLoadMore: fetchNextDealers,
          loading: loadingDealers,
        },
      ],
    }),
    [t, dealerOptions, fetchNextDealers, loadingDealers],
  );
  const filter = useFilterPanel(filterConfig, () => setPage(1));

  const {
    data: resData,
    isLoading: loading,
    refetch: fetchList,
  } = useAfterSalesQuery({
    page,
    pageSize,
    search: filter.state.search,
    dateFrom: filter.state.dateFrom,
    dateTo: filter.state.dateTo,
    sortField,
    sortOrder,
    dealerId: filter.state.custom?.dealerId,
  });

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" | undefined = "asc";
    if (sortField === key) {
      if (sortOrder === "asc") direction = "desc";
      else direction = undefined;
    }
    setSortOrder(direction);
    setSortField(direction ? key : undefined);
    setPage(1);
  };

  const data = resData?.items || [];
  const total = resData?.total || 0;

  useEffect(() => {
    const handleRefresh = () => {
      fetchList();
    };
    window.addEventListener("refresh_erp_data", handleRefresh);
    return () => window.removeEventListener("refresh_erp_data", handleRefresh);
  }, [fetchList]);

  const handleRowClick = (row: any) => {
    openDrawer("after-sales", "view", row.lifecycleId, row);
  };

  const rowActions = (row: any) => [
    {
      groupLabel: "TRA CỨU",
      items: [
        {
          label: "Chi tiết",
          icon: <Eye className="w-3.5 h-3.5" />,
          onClick: () => handleRowClick(row),
        },
      ],
    },
  ];

  const columns = [
    {
      key: "expectedDeliveryDate",
      sortKey: "expectedDeliveryDate",
      sortable: true,
      size: 100,
      header: t("Ngày DK"),
      cell: (row: any) =>
        row.expectedDeliveryDate
          ? format(new Date(row.expectedDeliveryDate), "dd/MM/yyyy")
          : "-",
    },
    {
      key: "deliveryDate",
      sortKey: "deliveryDate",
      sortable: true,
      size: 100,
      header: t("Ngày giao"),
      cell: (row: any) =>
        row.deliveryDate
          ? format(new Date(row.deliveryDate), "dd/MM/yyyy")
          : "-",
    },
    {
      key: "itemName",
      header: t("Sản phẩm"),
      cell: (row: any) => (
        <div className="flex flex-col">
          <span>{row.itemName}</span>
          <span className="text-xs text-muted-foreground">{row.sku}</span>
        </div>
      ),
    },
    {
      key: "serialNo",
      header: t("Số Seri"),
      size: 170,
      cell: (row: any) => (
        <div className="flex items-center gap-1.5 group">
          <Button
            variant="link"
            onClick={() => handleRowClick(row)}
            className="font-medium text-primary hover:underline p-0 h-auto flex-1 truncate justify-start"
          >
            {row.serialNo || "-"}
          </Button>
          {row.serialNo && <CopyIconBtn text={row.serialNo} />}
        </div>
      ),
    },
    {
      key: "vinNo",
      header: t("Số Khung"),
      size: 170,
      cell: (row: any) => (
        <div className="flex items-center gap-1.5 group">
          <span className="font-medium text-gray-800 flex-1 truncate">
            {row.vinNo || "-"}
          </span>
          {row.vinNo && <CopyIconBtn text={row.vinNo} />}
        </div>
      ),
    },
    {
      key: "engineNo",
      header: t("Số Máy"),
      size: 170,
      cell: (row: any) => (
        <div className="flex items-center gap-1.5 group">
          <span className="font-medium text-gray-800 flex-1 truncate">
            {row.engineNo || "-"}
          </span>
          {row.engineNo && <CopyIconBtn text={row.engineNo} />}
        </div>
      ),
    },
    {
      key: "soNo",
      header: t("Đơn hàng (SO)"),
      cell: (row: any) => {
        if (!row.soNo) return "—";
        return (
          <Button
            variant="link"
            onClick={() => setPreviewSoNo(row.soNo || null)}
            className="text-primary hover:underline p-0 h-auto"
          >
            {row.soNo}
          </Button>
        );
      },
    },
    {
      key: "trackingAttributes",
      header: t("Thuộc tính xe"),
      size: 250,
      cell: (row: any) => {
        if (
          !row.trackingAttributes ||
          typeof row.trackingAttributes !== "object"
        )
          return "—";
        const attrNames: Record<string, string> = {
          color: "Màu sắc",
          dealer_code: "Mã đại lý",
          dealer_name: "Tên đại lý",
        };
        return (
          <div className="flex flex-wrap gap-1">
            {Object.entries(row.trackingAttributes).map(([k, v]) => (
              <span
                key={k}
                className="inline-flex text-[11px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 border border-gray-200"
              >
                <span className="font-medium mr-1">
                  {attrNames[k] || t(k)}:
                </span>
                {String(v)}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      key: "customerName",
      header: t("Khách hàng"),
      cell: (row: any) => (
        <div className="flex flex-col">
          <span>{row.customerName || "-"}</span>
          <span className="text-xs text-muted-foreground">
            {row.customerPhone}
          </span>
        </div>
      ),
    },
    {
      key: "activationDate",
      sortKey: "activationDate",
      sortable: true,
      header: t("Ngày kích hoạt"),
      cell: (row: any) => {
        if (!row.warrantyActivatedAt) return "-";
        const dateObj = new Date(row.warrantyActivatedAt);
        return (
          <Tooltip content={format(dateObj, "yyyy-MM-dd HH:mm:ss")}>
            <span>{format(dateObj, "yyyy-MM-dd")}</span>
          </Tooltip>
        );
      },
    },
    {
      key: "warrantyActivatedAt",
      header: t("Bảo hành"),
      cell: (row: any) => {
        if (!row.warrantyActivatedAt)
          return <span className="text-gray-400">Chưa kích hoạt</span>;
        const isActive =
          !row.warrantyEndDate || new Date(row.warrantyEndDate) >= new Date();
        return (
          <div className="flex flex-col">
            <span className={isActive ? "text-green-600" : "text-red-600"}>
              {isActive ? "Đang bảo hành" : "Hết bảo hành"}
            </span>
            <span className="text-xs text-muted-foreground">
              Đến:{" "}
              {row.warrantyEndDate
                ? format(new Date(row.warrantyEndDate), "dd/MM/yyyy")
                : "-"}
            </span>
          </div>
        );
      },
    },
    {
      key: "dealerName",
      header: t("Đại lý"),
      cell: (row: any) => row.dealerName || "-",
    },
  ];

  return (
    <>
      <SpreadsheetPageTemplate<any>
        title={t("Hậu mãi & Bảo hành")}
        desc={t("Quản lý thông tin bảo hành và vòng đời sản phẩm.")}
        icon={<Shield className="w-5 h-5" />}
        tableId="after-sales-table"
        items={data}
        columns={columns}
        getRowKey={(row: any) => row.lifecycleId}
        loading={loading}
        sortArray={
          sortField ? [(sortOrder === "desc" ? "-" : "") + sortField] : []
        }
        onSort={handleSort}
        minWidth={1000}
        page={page}
        pageSize={pageSize}
        total={total}
        totalPages={Math.ceil(total / pageSize)}
        onPage={setPage}
        onPageSize={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        onRefresh={fetchList}
        filterConfig={filterConfig}
        filter={filter}
        rowActions={rowActions}
      />

      <AfterSalesDrawer
        open={isOpen && type === "after-sales"}
        onClose={closeDrawer}
        mode={mode as "view" | "edit"}
        data={entityData}
        onSaved={fetchList}
        onToggleEdit={() => {
          openDrawer(
            "after-sales",
            mode === "view" ? "edit" : "view",
            entityData.lifecycleId,
            entityData,
          );
        }}
        dealerOptions={dealerOptions}
        setDealerSearch={setDealerSearch}
        fetchNextDealers={fetchNextDealers}
        loadingDealers={loadingDealers}
      />

      <SoPreviewDrawer
        open={!!previewSoNo}
        onClose={() => setPreviewSoNo(null)}
        soNo={previewSoNo || ""}
      />
    </>
  );
}

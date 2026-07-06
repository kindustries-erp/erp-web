import React, { useState, useEffect, useMemo } from "react";
import { useT } from "@/core/i18n";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate";
import {
  useFilterPanel,
  type FilterPanelConfig,
} from "@/shared/hooks/useFilterPanel";
import { inventoryCoreApi } from "@/modules/inventory-core/api/inventoryCoreApi";
import { useDrawerStore } from "@/shared/stores/useDrawerStore";
import { AfterSalesDrawer } from "./AfterSalesDrawer";
import { format } from "date-fns";
import { Shield, Eye, Copy, Check } from "lucide-react";
import { Tooltip } from "@/core/components/ui/Tooltip";

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
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 50;

  const filterConfig: FilterPanelConfig = useMemo(
    () => ({
      search: { placeholder: t("Tìm theo serial, khách hàng...") },
      period: true,
      noDefaultPeriod: true,
    }),
    [t],
  );
  const filter = useFilterPanel(filterConfig, () => setPage(1));

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await inventoryCoreApi.listSerialLifecycles({
        page,
        pageSize,
        search: filter.state.search,
        dateFrom: filter.state.dateFrom,
        dateTo: filter.state.dateTo,
      });
      setData(res.items);
      setTotal(res.total);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [page, filter.state.search, filter.state.dateFrom, filter.state.dateTo]);

  const handleRowClick = (row: any) => {
    openDrawer("after-sales", "edit", row.lifecycleId, row);
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
      key: "serialNo",
      header: t("Serial / Số máy"),
      size: 250,
      cell: (row: any) => (
        <div className="flex flex-col gap-1.5 text-[13px]">
          {row.vinNo && (
            <div className="flex items-center gap-1.5 group">
              <span className="text-gray-500 whitespace-nowrap">Số khung:</span>
              <span className="font-medium text-gray-800 flex-1 truncate">
                {row.vinNo}
              </span>
              <CopyIconBtn text={row.vinNo} />
            </div>
          )}
          {row.serialNo && (
            <div className="flex items-center gap-1.5 group">
              <span className="text-gray-500 whitespace-nowrap">Số máy:</span>
              <span className="font-medium text-gray-800 flex-1 truncate">
                {row.serialNo}
              </span>
              <CopyIconBtn text={row.serialNo} />
            </div>
          )}
        </div>
      ),
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
      key: "expectedDeliveryDate",
      header: t("Ngày giao dự kiến"),
      cell: (row: any) =>
        row.expectedDeliveryDate
          ? format(new Date(row.expectedDeliveryDate), "dd/MM/yyyy")
          : "-",
    },
    {
      key: "deliveryDate",
      header: t("Ngày giao"),
      cell: (row: any) =>
        row.deliveryDate
          ? format(new Date(row.deliveryDate), "dd/MM/yyyy")
          : "-",
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
      key: "warrantyCode",
      header: t("Mã bảo hành"),
      cell: (row: any) => row.warrantyCode || "-",
    },
    {
      key: "dealerName",
      header: t("Đại lý"),
      cell: (row: any) => row.dealerName || "-",
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
        emptyLabel={t("Không có dữ liệu")}
        minWidth={1000}
        page={page}
        pageSize={pageSize}
        total={total}
        totalPages={Math.ceil(total / pageSize)}
        onPage={setPage}
        onPageSize={() => {}}
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
      />
    </>
  );
}

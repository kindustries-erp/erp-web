import React, { useState, useEffect } from "react";
import { useT } from "@/core/i18n";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate";
import { SearchInput } from "@/shared/components/SearchInput";
import { inventoryCoreApi } from "@/modules/inventory-core/api/inventoryCoreApi";
import { useDrawerStore } from "@/shared/stores/useDrawerStore";
import { useAppStore } from "@/core/config/appStore";
import { AfterSalesDrawer } from "./AfterSalesDrawer";
import { format } from "date-fns";
import { Shield, Eye } from "lucide-react";

export function AfterSalesListPage() {
  const t = useT();
  const { openDrawer, closeDrawer, isOpen, type, mode, entityData } =
    useDrawerStore();
  const { setCustomBreadcrumbs } = useAppStore();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const pageSize = 50;

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await inventoryCoreApi.listSerialLifecycles({
        page,
        pageSize,
        search,
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
  }, [page, search]);

  useEffect(() => {
    setCustomBreadcrumbs([["nav.items.sales"], ["nav.items.afterSales"]]);
    return () => setCustomBreadcrumbs(null);
  }, [setCustomBreadcrumbs]);

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
      cell: (row: any) => (
        <div className="flex flex-col">
          <span className="font-medium text-blue-600">{row.serialNo}</span>
          {row.vinNo && (
            <span className="text-xs text-muted-foreground">
              Khung: {row.vinNo}
            </span>
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
        filter={null as any}
        rowActions={rowActions}
        extraActions={
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder={t("Tìm theo serial, khách hàng...")}
            className="w-64"
          />
        }
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

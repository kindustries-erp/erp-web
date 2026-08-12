import React from "react";
import { FifoUnitLedgerSection } from "./fifo-unit-ledger/FifoUnitLedgerSection";
import { useTranslation } from "react-i18next";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { DrawerSection, DrawerRow } from "@/shared/components/DrawerModal";
import { Badge } from "@/shared/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import api from "@/core/api/axiosInstance";
import { format } from "date-fns";
import { money } from "@/shared/utils/format";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";

interface LedgerEntry {
  id: string;
  direction: "IN" | "OUT";
  qty: string;
  unitCost: string;
  preVatAmount: string;
  transactionDate: string;
  isAdjustment: boolean;
  adjSign: number;
  invoiceNo: string;
  invoiceDate: string;
  buyerName: string;
  sellerName: string;
  licensePlate: string;
  calculatedCogs?: number;
  calculatedUnitCost?: number;
}

interface VinfastPartsStockDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  sku: string;
  catalogData?: any;
}

export function VinfastPartsStockDetailDrawer({
  open,
  onClose,
  sku,
  catalogData,
}: VinfastPartsStockDetailDrawerProps) {
  const { t } = useTranslation(["reports", "common"]);
  const { data: entriesData, isLoading: loading } = useQuery({
    queryKey: ["vinfast-parts", "ledger-history", sku],
    queryFn: async () => {
      const res = await api.get(`/api/v1/vinfast-parts/ledger/${sku}`);
      return res.data as LedgerEntry[];
    },
    enabled: open && !!sku,
  });

  const entries = entriesData || [];
  const inEntries = entries.filter((e) => e.direction === "IN");
  const outEntries = entries.filter((e) => e.direction === "OUT");

  return (
    <StandardFormDrawer
      open={open}
      mode="view"
      onClose={onClose}
      title={t("Lịch sử luân chuyển FIFO (Ledger)", "FIFO Trace Ledger")}
      subtitle={`${sku} - ${catalogData?.name || ""}`}
      titleExtra={
        <Badge
          variant={catalogData?.vehicleType === "CAR" ? "default" : "secondary"}
        >
          {catalogData?.vehicleType === "CAR"
            ? t("Ô tô", "Car")
            : t("Xe máy", "Motorbike")}
        </Badge>
      }
      layout="2-columns"
      size="xl"
      collapsibleRightPanel={true}
      actions={[{ label: t("common:close", "Đóng"), onClick: onClose }]}
      leftPanel={
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4">
            <DrawerSection title={t("Lịch sử Nhập (IN)", "IN History")}>
              {loading ? (
                <div className="p-4 text-center">Loading...</div>
              ) : (
                <div className="max-h-[70vh] overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ngày</TableHead>
                        <TableHead>Hóa đơn</TableHead>
                        <TableHead className="text-right">SL</TableHead>
                        <TableHead className="text-right">Giá nhập</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inEntries.map((e) => (
                        <TableRow key={e.id}>
                          <TableCell>
                            {format(new Date(e.transactionDate), "dd/MM/yyyy")}
                          </TableCell>
                          <TableCell>{e.invoiceNo}</TableCell>
                          <TableCell className="text-right font-medium">
                            {e.isAdjustment && e.adjSign === -1 ? "-" : ""}
                            {Number(e.qty).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            {money(Number(e.unitCost))}
                          </TableCell>
                        </TableRow>
                      ))}
                      {inEntries.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            className="text-center text-muted-foreground"
                          >
                            Không có dữ liệu nhập
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </DrawerSection>

            <DrawerSection title={t("Lịch sử Xuất (OUT)", "OUT History")}>
              {loading ? (
                <div className="p-4 text-center">Loading...</div>
              ) : (
                <div className="max-h-[70vh] overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ngày</TableHead>
                        <TableHead>Hóa đơn</TableHead>
                        <TableHead className="text-right">SL</TableHead>
                        <TableHead className="text-right">
                          Giá vốn (FIFO)
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {outEntries.map((e) => (
                        <TableRow key={e.id}>
                          <TableCell>
                            {format(new Date(e.transactionDate), "dd/MM/yyyy")}
                          </TableCell>
                          <TableCell>{e.invoiceNo}</TableCell>
                          <TableCell className="text-right font-medium">
                            {e.isAdjustment && e.adjSign === -1 ? "-" : ""}
                            {Number(e.qty).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right text-blue-600 font-medium">
                            {money(e.calculatedUnitCost || 0)}
                          </TableCell>
                        </TableRow>
                      ))}
                      {outEntries.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            className="text-center text-muted-foreground"
                          >
                            Không có dữ liệu xuất
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </DrawerSection>
          </div>

          <FifoUnitLedgerSection sku={sku} />
        </div>
      }
      rightPanel={
        <div className="flex flex-col gap-4">
          <DrawerSection title={t("Thông tin phụ tùng", "Part Info")}>
            <DrawerRow
              label={t("Mã phụ tùng", "Part SKU")}
              value={<span className="font-semibold">{sku}</span>}
            />
            <DrawerRow
              label={t("Đơn vị tính", "UOM")}
              value={catalogData?.uom}
            />
            <DrawerRow
              label={t("Tên phụ tùng", "Part Name")}
              value={catalogData?.name}
            />
          </DrawerSection>
          <DrawerSection title={t("Tổng hợp kho", "Stock Summary")}>
            <DrawerRow
              label={t("Tổng Nhập", "Total IN")}
              value={
                <span className="text-green-600 font-semibold">
                  {Number(catalogData?.qtyIn || 0).toLocaleString()}
                </span>
              }
            />
            <DrawerRow
              label={t("Tổng Xuất", "Total OUT")}
              value={
                <span className="text-red-600 font-semibold">
                  {Number(catalogData?.qtyOut || 0).toLocaleString()}
                </span>
              }
            />
            <DrawerRow
              label={t("Tồn cuối", "Balance")}
              value={
                <span className="text-xl font-bold">
                  {Number(catalogData?.qtyBalance || 0).toLocaleString()}
                </span>
              }
            />
          </DrawerSection>
        </div>
      }
    />
  );
}

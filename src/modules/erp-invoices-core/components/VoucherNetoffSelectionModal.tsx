import { useState } from "react";
import { useTranslation } from "react-i18next";
import { DrawerModal } from "@/shared/components/DrawerModal";
import { useQuery } from "@tanstack/react-query";
import { bankStatementApi } from "@/modules/bank-statements/api/bankStatementApi";
import { money } from "@/shared/utils/format";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Search } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  direction: "IN" | "OUT";
  onSelect: (selectedVouchers: { id: string; amount: number }[]) => void;
  existingVoucherIds?: string[];
}

export function VoucherNetoffSelectionModal({
  open,
  onClose,
  direction,
  onSelect,
  existingVoucherIds = [],
}: Props) {
  const { t } = useTranslation("erpInvoices");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [netOffAmounts, setNetOffAmounts] = useState<Record<string, number>>(
    {},
  );

  const { data, isLoading } = useQuery({
    queryKey: ["bank-transactions-for-netoff", direction, search],
    queryFn: () =>
      bankStatementApi.getTransactions({
        page: 1,
        pageSize: 50,
        search,
        transactionType: direction === "IN" ? "OUT" : "IN", // VAT input (buy) -> need payment voucher (money out)
      }),
    enabled: open,
  });

  const vouchers = (data?.items || []).filter(
    (v: any) => !existingVoucherIds.includes(v.id),
  );

  const totalAmount = vouchers.reduce(
    (sum: number, v: any) =>
      sum +
      (direction === "IN"
        ? Number(v.debitAmount || 0)
        : Number(v.creditAmount || 0)),
    0,
  );
  const totalNetOff = Object.values(netOffAmounts).reduce(
    (sum: number, val) => sum + Number(val || 0),
    0,
  );

  const handleSelect = (v: any, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, v.id]);
      setNetOffAmounts((prev) => ({
        ...prev,
        [v.id]:
          direction === "IN"
            ? Number(v.debitAmount || 0)
            : Number(v.creditAmount || 0),
      }));
    } else {
      setSelectedIds((prev) => prev.filter((id) => id !== v.id));
      setNetOffAmounts((prev) => {
        const next = { ...prev };
        delete next[v.id];
        return next;
      });
    }
  };

  const handleAmountChange = (id: string, val: string) => {
    setNetOffAmounts((prev) => ({ ...prev, [id]: Number(val) }));
  };

  const handleSubmit = () => {
    onSelect(
      selectedIds.map((id) => ({
        id,
        amount: netOffAmounts[id] || 0,
      })),
    );
    onClose();
    setSelectedIds([]);
    setNetOffAmounts({});
  };

  return (
    <DrawerModal
      open={open}
      onClose={onClose}
      title={t("selectVoucherToNetoff", "Chọn phiếu thu/chi để cấn trừ")}
      panelClassName="w-full md:w-[95vw] lg:w-[900px] xl:w-[900px]"
      actions={[
        {
          label: t("cancel", "Hủy"),
          variant: "outline",
          onClick: onClose,
        },
        {
          label: t("confirm", "Xác nhận"),
          primary: true,
          disabled: selectedIds.length === 0,
          onClick: handleSubmit,
        },
      ]}
    >
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="pl-9 h-9 w-full border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder={t("searchVoucher", "Tìm kiếm phiếu...")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="max-h-[400px] overflow-y-auto border rounded-md">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="w-10 px-3 py-2"></th>
                <th className="px-3 py-2">{t("date", "Ngày")}</th>
                <th className="px-3 py-2 w-[40%]" style={{ minWidth: "300px" }}>
                  {t("description", "Diễn giải")}
                </th>
                <th className="px-3 py-2 w-48">{t("source", "Nguồn")}</th>
                <th className="px-3 py-2 text-right">
                  {t("amount", "Số tiền")}
                </th>
                <th className="px-3 py-2 text-right w-32">
                  {t("netOffAmount", "Cấn trừ")}
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-gray-500">
                    {t("loading", "Đang tải...")}
                  </td>
                </tr>
              ) : vouchers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-gray-500">
                    {t("noData", "Không có dữ liệu")}
                  </td>
                </tr>
              ) : (
                vouchers.map((v: any) => {
                  const isSelected = selectedIds.includes(v.id);
                  const amount =
                    direction === "IN"
                      ? Number(v.debitAmount || 0)
                      : Number(v.creditAmount || 0);

                  return (
                    <tr key={v.id} className="border-t hover:bg-gray-50">
                      <td className="px-3 py-2 text-center">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(c: any) => handleSelect(v, !!c)}
                        />
                      </td>
                      <td className="px-3 py-2">
                        {new Date(v.transDate).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-2">{v.description || "—"}</td>
                      <td className="px-3 py-2">
                        {v.sourceType === "BANK"
                          ? v.bankAccount?.bankName
                            ? `${v.bankAccount.bankName} - ${v.bankAccount.accountNumber}`
                            : ""
                          : v.cashBook?.name || ""}
                      </td>
                      <td className="px-3 py-2 text-right font-medium">
                        {money(amount)}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {isSelected && (
                          <input
                            className="w-full text-right h-8 border rounded-md px-2 focus:outline-none focus:ring-1 focus:ring-primary"
                            type="number"
                            value={netOffAmounts[v.id] || ""}
                            onChange={(e: any) =>
                              handleAmountChange(v.id, e.target.value)
                            }
                          />
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {vouchers.length > 0 && (
              <tfoot className="bg-gray-50 sticky bottom-0 border-t font-semibold">
                <tr className="bg-gray-50 border-t">
                  <td
                    colSpan={4}
                    className="px-3 py-3 text-right font-semibold"
                  ></td>
                  <td className="px-3 py-3 text-right font-semibold text-blue-600">
                    {money(totalAmount)}
                  </td>
                  <td className="px-3 py-3 text-right font-semibold text-orange-600">
                    {money(totalNetOff)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </DrawerModal>
  );
}

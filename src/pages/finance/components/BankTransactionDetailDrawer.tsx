import { DrawerModal, DrawerSection } from "@/shared/components/DrawerModal";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bankStatementApi } from "@/modules/bank-statements/api/bankStatementApi";
import { Combobox } from "@/shared/components/Combobox";
import { formatGMT7, money } from "@/shared/utils/format";
import { ExternalLink, Save } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { accountingApi } from "@/modules/accounting/api/accountingApi";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  transactionId: string | null;
}

export function BankTransactionDetailDrawer({
  isOpen,
  onClose,
  transactionId,
}: Props) {
  const { data: transaction, isLoading } = useQuery({
    queryKey: ["bank-transaction", transactionId],
    queryFn: () => bankStatementApi.getTransaction(transactionId!),
    enabled: isOpen && !!transactionId,
  });

  const queryClient = useQueryClient();
  const { data: chartOfAccounts } = useQuery({
    queryKey: ["chart-of-accounts", transaction?.branchId],
    queryFn: () =>
      accountingApi.getChartOfAccounts({ branchId: transaction?.branchId }),
    enabled: !!transaction?.branchId,
  });

  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [accountingDescription, setAccountingDescription] =
    useState<string>("");

  useEffect(() => {
    if (transaction) {
      setSelectedAccount(transaction.correspondentAccountingAccountId || "");
      setAccountingDescription(
        transaction.accountingDescription || transaction.description || "",
      );
    } else {
      setSelectedAccount("");
      setAccountingDescription("");
    }
  }, [transaction, isOpen]);

  const updateMutation = useMutation({
    mutationFn: (data: {
      id: string;
      correspondentAccountingAccountId: string | null;
      accountingDescription: string;
    }) =>
      bankStatementApi.updateTransaction(data.id, {
        correspondentAccountingAccountId: data.correspondentAccountingAccountId,
        accountingDescription: data.accountingDescription,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["bank-transaction", transactionId],
      });
      queryClient.invalidateQueries({ queryKey: ["bank-transactions"] });
      toast.success(
        "Đã cập nhật tài khoản đối ứng thành công và tự động đồng bộ sang Nhật ký chung!",
      );
    },
  });

  const handleSaveAccount = () => {
    if (!transactionId) return;
    updateMutation.mutate({
      id: transactionId,
      correspondentAccountingAccountId: selectedAccount || null,
      accountingDescription,
    });
  };

  const openErpInvoice = (id: string) => {
    const event = new CustomEvent("open_erp_document", {
      detail: { type: "erp_invoice", id },
    });
    window.dispatchEvent(event);
  };

  return (
    <DrawerModal
      open={isOpen}
      onClose={onClose}
      title="Chi tiết giao dịch"
      panelClassName="w-full md:w-[95vw] lg:w-[700px] xl:w-[700px]"
    >
      <div className="flex flex-col gap-6">
        <DrawerSection title="Thông tin chung">
          {isLoading ? (
            <div className="text-gray-500 py-4 text-center text-sm">
              Đang tải...
            </div>
          ) : transaction ? (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 block text-xs">
                  Ngày giao dịch
                </span>
                <span className="font-medium">
                  {formatGMT7(transaction.transDate, "date") || "—"}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block text-xs">Tham chiếu</span>
                <span className="font-medium">
                  {transaction.referenceNumber || "—"}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500 block text-xs">Diễn giải</span>
                <span className="font-medium">
                  {transaction.description || "—"}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block text-xs">
                  Số tiền (Vào)
                </span>
                <span className="font-medium text-green-600">
                  {money(transaction.creditAmount) || "—"}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block text-xs">
                  Số tiền (Ra)
                </span>
                <span className="font-medium text-red-600">
                  {money(transaction.debitAmount) || "—"}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-gray-500 py-4 text-center text-sm">
              Không tìm thấy thông tin giao dịch.
            </div>
          )}
        </DrawerSection>

        {transaction && (
          <DrawerSection title="Hóa đơn VAT đã cấn trừ">
            {transaction.invoiceNetOffs &&
            transaction.invoiceNetOffs.length > 0 ? (
              <div className="border rounded-md overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-3 py-2 font-medium">Số HĐ</th>
                      <th className="px-3 py-2 font-medium">
                        Khách hàng / NCC
                      </th>
                      <th className="px-3 py-2 font-medium text-right">
                        Số tiền cấn trừ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {transaction.invoiceNetOffs.map((link: any) => {
                      const inv = link.invoice || link.erpInvoice || {};
                      return (
                        <tr key={link.id} className="hover:bg-gray-50 group">
                          <td className="px-3 py-2">
                            <span
                              className="text-blue-600 hover:underline cursor-pointer flex items-center gap-1"
                              onClick={() => openErpInvoice(inv.id)}
                            >
                              {inv.invoiceNo || "—"}
                              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            {inv.direction === "IN"
                              ? inv.sellerName
                              : inv.buyerName || "—"}
                          </td>
                          <td className="px-3 py-2 text-right font-medium">
                            {money(Number(link.netOffAmount || 0))}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-sm text-gray-500 py-4 text-center border border-dashed rounded bg-gray-50">
                Chưa có hóa đơn nào được cấn trừ.
              </div>
            )}
          </DrawerSection>
        )}
        {transaction && (
          <DrawerSection title="Hạch toán (Tài khoản đối ứng)">
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Tài khoản đối ứng
                  </label>
                  <Combobox
                    options={
                      chartOfAccounts?.map((acc: any) => ({
                        value: acc.id,
                        label: `${acc.accountCode} - ${acc.accountName}`,
                      })) || []
                    }
                    value={selectedAccount}
                    onChange={setSelectedAccount}
                    placeholder="-- Chọn tài khoản đối ứng --"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Diễn giải hạch toán
                  </label>
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                    placeholder="Nhập diễn giải hạch toán..."
                    value={accountingDescription}
                    onChange={(e) => setAccountingDescription(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  variant="primary"
                  onClick={handleSaveAccount}
                  disabled={
                    updateMutation.isPending ||
                    (selectedAccount ===
                      (transaction.correspondentAccountingAccountId || "") &&
                      accountingDescription ===
                        (transaction.accountingDescription ||
                          transaction.description ||
                          ""))
                  }
                >
                  <Save className="w-4 h-4" />
                  {updateMutation.isPending ? "Đang lưu..." : "Lưu & Hạch toán"}
                </Button>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2 italic">
              * Lưu ý: Khi lưu, hệ thống sẽ tự động cập nhật hoặc phát sinh bút
              toán Nhật ký chung tương ứng.
            </p>
          </DrawerSection>
        )}
      </div>
    </DrawerModal>
  );
}

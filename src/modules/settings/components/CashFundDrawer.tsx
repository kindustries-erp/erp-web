import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DrawerModal,
  DrawerSection,
  DrawerField,
} from "@/shared/components/DrawerModal";
import { Button } from "@/shared/components/ui/Button";
import { DatePicker } from "@/shared/components/DatePicker";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Combobox } from "@/shared/components/Combobox";
import {
  bankStatementApi,
  type ErpCashBook,
} from "@/modules/bank-statements/api/bankStatementApi";
import { getBranchOptionsApi } from "@/modules/branches/api/branchApi";
import { useQuery } from "@tanstack/react-query";
import { useAppStore } from "@/core/config/appStore";
import { useT } from "@/core/i18n";
import toast from "react-hot-toast";

interface Props {
  open: boolean;
  onClose: () => void;
  cashBook: ErpCashBook | null;
  onSuccess: () => void;
}

export function CashFundDrawer({ open, onClose, cashBook, onSuccess }: Props) {
  const t = useT();
  const queryClient = useQueryClient();
  const { currentBranchId } = useAppStore();
  const [selectedBranchId, setSelectedBranchId] = useState(
    currentBranchId || "",
  );

  const { data: branchOptions = [] } = useQuery({
    queryKey: ["branchOptions"],
    queryFn: getBranchOptionsApi,
  });

  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("VND");
  const [isActive, setIsActive] = useState(true);
  const [openingBalance, setOpeningBalance] = useState<number>(0);
  const [periodDate, setPeriodDate] = useState("");

  useEffect(() => {
    if (cashBook) {
      setSelectedBranchId(cashBook.branchId ?? currentBranchId ?? "");
      setName(cashBook.name ?? "");
      setCurrency(cashBook.currency ?? "VND");
      setIsActive(cashBook.isActive ?? true);
      setOpeningBalance(cashBook.openingBalance ?? 0);
      setPeriodDate(cashBook.periodDate ?? "");
    } else {
      setSelectedBranchId(currentBranchId || "");
      setName("");
      setCurrency("VND");
      setIsActive(true);
      setOpeningBalance(0);
      setPeriodDate("");
    }
  }, [cashBook, open]);

  const { mutate, isPending } = useMutation({
    mutationFn: () => {
      if (!selectedBranchId) throw new Error("Branch ID is required");
      const payload = {
        branchId: selectedBranchId,
        name: name.trim(),
        currency: currency || "VND",
        isActive,
        openingBalance: openingBalance || 0,
        periodDate: periodDate || undefined,
      };

      if (cashBook) {
        return bankStatementApi.updateCashBook(cashBook.id, payload);
      }
      return bankStatementApi.createCashBook(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["cash-books"],
      });
      queryClient.invalidateQueries({
        queryKey: ["cashBooks"],
      });
      onSuccess();
      onClose();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err.message);
    },
  });

  return (
    <DrawerModal
      open={open}
      onClose={onClose}
      title={cashBook ? t("common.edit") : t("panel.createNew")}
    >
      <div className="space-y-6">
        <DrawerSection title="Thông tin chung">
          <DrawerField label="Chi nhánh *" required>
            <Combobox
              options={branchOptions}
              value={selectedBranchId}
              onChange={setSelectedBranchId}
              placeholder="-- Chọn chi nhánh --"
            />
          </DrawerField>

          <DrawerField label="Tên sổ quỹ *" required>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-input bg-background"
            />
          </DrawerField>

          <DrawerField label="Tiền tệ">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-input bg-background"
            >
              <option value="VND">VND</option>
              <option value="USD">USD</option>
            </select>
          </DrawerField>

          <DrawerField label="Trạng thái">
            <div className="flex items-center space-x-2 h-10">
              <Checkbox
                checked={isActive}
                onCheckedChange={(checked) => setIsActive(!!checked)}
              />
              <span className="text-sm font-medium">Hoạt động</span>
            </div>
          </DrawerField>
        </DrawerSection>

        <DrawerSection title="Số dư ban đầu">
          <DrawerField label="Ngày chốt số dư">
            <DatePicker
              value={periodDate}
              onChange={(val) => setPeriodDate(val)}
              className="w-full h-10 px-3 rounded-md border border-input bg-background"
            />
          </DrawerField>
          <DrawerField label="Số dư">
            <input
              type="number"
              value={openingBalance}
              onChange={(e) => setOpeningBalance(Number(e.target.value))}
              className="w-full h-10 px-3 rounded-md border border-input bg-background"
            />
          </DrawerField>
        </DrawerSection>

        <div className="flex items-center justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button
            onClick={() => mutate()}
            disabled={isPending || !name.trim() || !selectedBranchId}
          >
            {t("common.save")}
          </Button>
        </div>
      </div>
    </DrawerModal>
  );
}

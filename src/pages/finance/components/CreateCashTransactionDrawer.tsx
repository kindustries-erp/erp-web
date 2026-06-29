import React, { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

import { bankStatementApi } from "@/modules/bank-statements/api/bankStatementApi";
import { useAppStore } from "@/core/config/appStore";
import {
  DrawerModal,
  DrawerSection,
  DrawerField,
} from "@/shared/components/DrawerModal";
import { Button } from "@/shared/components/ui/Button";
import { DatePicker } from "@/shared/components/DatePicker";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateCashTransactionDrawer = ({
  isOpen,
  onClose,
  onSuccess,
}: Props) => {
  const currentBranchId = useAppStore((state) => state.currentBranchId);
  const [cashBookId, setCashBookId] = useState("");
  const [transDate, setTransDate] = useState("");
  const [debitAmount, setDebitAmount] = useState<number>(0);
  const [creditAmount, setCreditAmount] = useState<number>(0);
  const [description, setDescription] = useState("");
  const [correspondentName, setCorrespondentName] = useState("");

  const { data: cashBooks } = useQuery({
    queryKey: ["cash-books", currentBranchId],
    queryFn: () => bankStatementApi.getCashBooks(currentBranchId!),
    enabled: isOpen && !!currentBranchId,
  });

  const { mutate: createTransaction, isPending } = useMutation({
    mutationFn: () => {
      if (!currentBranchId) throw new Error("Branch not selected");
      if (!cashBookId) throw new Error("Cash book not selected");
      if (!transDate) throw new Error("Transaction date is required");

      return bankStatementApi.createManualTransaction({
        branchId: currentBranchId,
        sourceType: "CASH",
        cashBookId,
        transDate,
        debitAmount: debitAmount || 0,
        creditAmount: creditAmount || 0,
        description,
        correspondentName,
      });
    },
    onSuccess: () => {
      onSuccess();
      setCashBookId("");
      setTransDate("");
      setDebitAmount(0);
      setCreditAmount(0);
      setDescription("");
      setCorrespondentName("");
    },
    onError: (err: any) => {
      alert(err?.response?.data?.message || err.message);
    },
  });

  return (
    <DrawerModal
      open={isOpen}
      onClose={onClose}
      title="Tạo mới phiếu thu/chi tiền mặt"
    >
      <div className="space-y-6">
        <DrawerSection title="Thông tin chung">
          <DrawerField label="Sổ quỹ *" required>
            <select
              value={cashBookId}
              onChange={(e) => setCashBookId(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-input bg-background"
            >
              <option value="">Chọn sổ quỹ</option>
              {cashBooks?.map((cb) => (
                <option key={cb.id} value={cb.id}>
                  {cb.name}
                </option>
              ))}
            </select>
          </DrawerField>

          <DrawerField label="Ngày giao dịch *" required>
            <DatePicker
              value={transDate}
              onChange={(val) => setTransDate(val)}
              className="w-full h-10 px-3 rounded-md border border-input bg-background"
            />
          </DrawerField>

          <DrawerField label="Người nộp/nhận">
            <input
              type="text"
              value={correspondentName}
              onChange={(e) => setCorrespondentName(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-input bg-background"
              placeholder="Nhập tên người nộp/nhận"
            />
          </DrawerField>
        </DrawerSection>

        <DrawerSection title="Số tiền">
          <DrawerField label="Thu (Phát sinh Nợ)">
            <input
              type="number"
              min="0"
              value={debitAmount || ""}
              onChange={(e) => setDebitAmount(Number(e.target.value))}
              className="w-full h-10 px-3 rounded-md border border-input bg-background"
              placeholder="0"
            />
          </DrawerField>
          <DrawerField label="Chi (Phát sinh Có)">
            <input
              type="number"
              min="0"
              value={creditAmount || ""}
              onChange={(e) => setCreditAmount(Number(e.target.value))}
              className="w-full h-10 px-3 rounded-md border border-input bg-background"
              placeholder="0"
            />
          </DrawerField>
        </DrawerSection>

        <DrawerSection title="Nội dung">
          <DrawerField label="Diễn giải">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 rounded-md border border-input bg-background"
              rows={3}
              placeholder="Nhập diễn giải..."
            />
          </DrawerField>
        </DrawerSection>
      </div>

      <div className="flex justify-end gap-2 mt-6 pt-6 border-t">
        <Button variant="secondary" onClick={onClose} disabled={isPending}>
          Hủy
        </Button>
        <Button
          variant="primary"
          onClick={() => createTransaction()}
          disabled={isPending}
        >
          {isPending ? "Đang lưu..." : "Lưu"}
        </Button>
      </div>
    </DrawerModal>
  );
};

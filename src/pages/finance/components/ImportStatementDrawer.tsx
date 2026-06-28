import React, { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { UploadCloud } from "lucide-react";
import { useT } from "@/core/i18n";
import { bankStatementApi } from "@/modules/bank-statements/api/bankStatementApi";
import { useAppStore } from "@/core/config/appStore";
import {
  DrawerModal,
  DrawerSection,
  DrawerField,
} from "@/shared/components/DrawerModal";
import { Button } from "@/shared/components/ui/Button";

interface ImportStatementDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  type: "bank" | "cash";
  onSuccess: () => void;
}

export const ImportStatementDrawer = ({
  isOpen,
  onClose,
  type,
  onSuccess,
}: ImportStatementDrawerProps) => {
  const t = useT();
  const currentBranchId = useAppStore((state: any) => state.currentBranchId);
  const [file, setFile] = useState<File | null>(null);
  const [accountId, setAccountId] = useState<string>("");

  const { data: accounts } = useQuery({
    queryKey: ["bank-accounts", type, currentBranchId],
    queryFn: async () =>
      type === "bank"
        ? await bankStatementApi.getBankAccounts(currentBranchId)
        : await bankStatementApi.getCashBooks(currentBranchId),
    enabled: isOpen && !!currentBranchId,
  });

  const { mutate: importFile, isPending } = useMutation({
    mutationFn: () => {
      if (!file) throw new Error("File is required");
      return bankStatementApi.importFile({
        file,
        branchId: currentBranchId,
        bankAccountId: type === "bank" ? accountId : undefined,
        cashBookId: type === "cash" ? accountId : undefined,
      });
    },
    onSuccess: (res) => {
      alert(
        t("bankStatement.import.importSuccess").replace(
          "{0}",
          String(res.count),
        ),
      );
      onSuccess();
    },
    onError: (err: any) => {
      alert(err?.response?.data?.message || err.message);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <DrawerModal
      open={isOpen}
      onClose={onClose}
      title={t("bankStatement.import.drawerTitle")}
    >
      <div className="p-4 space-y-6 flex-1">
        <DrawerSection title={t("bankStatement.import.drawerTitle")}>
          <DrawerField
            label={
              type === "bank"
                ? t("bankStatement.import.selectAccount")
                : t("bankStatement.import.selectCashBook")
            }
            required
          >
            <select
              className="w-full border rounded-md p-2"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
            >
              <option value="">-- Chọn --</option>
              {accounts?.map((acc: any) => (
                <option key={acc.id} value={acc.id}>
                  {acc.accountName || acc.name}
                </option>
              ))}
            </select>
          </DrawerField>

          <DrawerField label="File" required>
            <div className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition-colors relative">
              <input
                type="file"
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileChange}
              />
              <UploadCloud className="w-10 h-10 text-gray-400 mb-2" />
              {file ? (
                <span className="text-sm font-medium text-blue-600">
                  {file.name}
                </span>
              ) : (
                <span className="text-sm text-gray-500">
                  {t("bankStatement.import.dropzone")}
                </span>
              )}
            </div>
          </DrawerField>
        </DrawerSection>
      </div>
      <div className="flex justify-end gap-2 p-4 border-t mt-auto">
        <Button variant="outline" onClick={onClose}>
          {t("common.cancel")}
        </Button>
        <Button
          disabled={!file || !accountId || isPending}
          onClick={() => importFile()}
        >
          {isPending
            ? t("bankStatement.import.importing")
            : t("bankStatement.import.confirmImport")}
        </Button>
      </div>
    </DrawerModal>
  );
};

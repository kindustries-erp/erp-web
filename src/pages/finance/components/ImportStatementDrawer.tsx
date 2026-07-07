import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useT } from "@/core/i18n";
import { bankStatementApi } from "@/modules/bank-statements/api/bankStatementApi";
import { useAppStore } from "@/core/config/appStore";
import { DrawerSection, DrawerField } from "@/shared/components/DrawerModal";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { Combobox } from "@/shared/components/Combobox";
import { Attachment } from "@/shared/components/ui/Attachment";
import { FilePreviewDrawer } from "@/shared/components/FilePreviewDrawer";

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
  const [files, setFiles] = useState<File[]>([]);
  const [accountId, setAccountId] = useState<string>("");
  const [previewFile, setPreviewFile] = useState<File | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFiles([]);
      setAccountId("");
    }
  }, [isOpen]);

  const { data: accounts } = useQuery({
    queryKey: ["bank-accounts", type],
    queryFn: async () =>
      type === "bank"
        ? await bankStatementApi.getBankAccounts()
        : await bankStatementApi.getCashBooks(),
    enabled: isOpen,
  });

  const { mutate: submitImport, isPending } = useMutation({
    mutationFn: async () => {
      if (files.length === 0) throw new Error("At least one file is required");
      const selectedAccount = accounts?.find((a: any) => a.id === accountId);
      const branchIdToUse = selectedAccount?.branchId || currentBranchId;

      return bankStatementApi.importFiles({
        files,
        branchId: branchIdToUse,
        bankAccountId: type === "bank" ? accountId : undefined,
        cashBookId: type === "cash" ? accountId : undefined,
      });
    },
    onSuccess: (res: any) => {
      let msg = t("bankStatement.import.importSuccess").replace(
        "{0}",
        String(res.count),
      );
      if (res.skippedCount > 0) {
        msg += t("bankStatement.import.importSkipped").replace(
          "{0}",
          String(res.skippedCount),
        );
      }
      toast.success(msg);
      onSuccess();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err.message);
    },
  });

  const accountOptions =
    accounts?.map((acc: any) => ({
      value: acc.id,
      label: acc.accountName || acc.name,
    })) || [];

  return (
    <>
      <StandardFormDrawer
        open={isOpen}
        onClose={onClose}
        title={t("bankStatement.import.drawerTitle")}
        mode="create"
        layout="1-column"
        size="sm"
        actions={[
          {
            label: t("common.cancel"),
            onClick: onClose,
            variant: "outline",
          },
          {
            label: isPending
              ? t("bankStatement.import.importing")
              : t("bankStatement.import.confirmImport"),
            onClick: () => submitImport(),
            primary: true,
            disabled: files.length === 0 || !accountId || isPending,
            loading: isPending,
          },
        ]}
        leftPanel={
          <div className="space-y-6">
            <DrawerSection title={t("bankStatement.import.drawerTitle")}>
              <DrawerField
                label={
                  type === "bank"
                    ? t("bankStatement.import.selectAccount")
                    : t("bankStatement.import.selectCashBook")
                }
                required
              >
                <Combobox
                  value={accountId}
                  onChange={setAccountId}
                  options={accountOptions}
                  placeholder="-- Chọn --"
                />
              </DrawerField>

              <DrawerField label="File" required>
                <Attachment
                  files={files}
                  onFilesChange={setFiles}
                  accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                  maxFiles={5}
                  maxSizeMb={10}
                  onPreview={setPreviewFile}
                />
              </DrawerField>
            </DrawerSection>
          </div>
        }
      />
      <FilePreviewDrawer
        open={!!previewFile}
        onClose={() => setPreviewFile(null)}
        file={previewFile}
      />
    </>
  );
};

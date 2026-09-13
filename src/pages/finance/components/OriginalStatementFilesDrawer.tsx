import React, { useState } from "react";
import { DrawerModal } from "@/shared/components/DrawerModal";
import { Button } from "@/shared/components/ui/Button";
import { StandardTable } from "@/shared/components/StandardTable";
import { useQuery, useMutation } from "@tanstack/react-query";
import { bankStatementApi } from "@/modules/bank-statements/api/bankStatementApi";
import { TableDateCell } from "@/shared/components/DataTable/TableDateCell";

import { getFileViewUrl } from "@/modules/finance/api/financeApi";
import toast from "react-hot-toast";
import { Trash2, Download, Upload } from "lucide-react";
import { useAppStore } from "@/core/config/appStore";
import { uploadFileApi } from "@/modules/finance/api/financeApi";
import { Combobox } from "@/shared/components/Combobox";
import { PERIOD_OPTS } from "@/modules/finance/utils/financeHelpers";
import { Attachment } from "@/shared/components/ui/Attachment";

export function OriginalStatementFilesDrawer({
  isOpen,
  onClose,
  type,
}: {
  isOpen: boolean;
  onClose: () => void;
  type: "bank" | "cash";
}) {
  const currentBranchId = useAppStore((state: any) => state.currentBranchId);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);

  // Upload Form State
  const [files, setFiles] = useState<File[]>([]);
  const [accountId, setAccountId] = useState<string>("");
  const [periodDate, setPeriodDate] = useState<string>("");
  const [note, setNote] = useState<string>("");

  const { data: accountsData = [] } = useQuery<any[]>({
    queryKey: [type === "bank" ? "bank-accounts" : "cash-books"],
    queryFn: async () => {
      const data =
        type === "bank"
          ? await bankStatementApi.getBankAccounts()
          : await bankStatementApi.getCashBooks();
      return data as any[];
    },
    enabled: isOpen,
  });

  const { data, isFetching, refetch } = useQuery({
    queryKey: ["statement-files", type, page, pageSize],
    queryFn: () =>
      bankStatementApi.getStatementFiles({
        page,
        pageSize,
      }),
    enabled: isOpen,
  });

  const items =
    data?.items?.filter((i: any) =>
      type === "bank" ? !!i.bankAccountId : !!i.cashBookId,
    ) || [];

  const deleteMutation = useMutation({
    mutationFn: (id: string) => bankStatementApi.deleteStatementFile(id),
    onSuccess: () => {
      toast.success("Đã xóa file sao kê");
      refetch();
    },
    onError: () => {
      toast.error("Xóa thất bại");
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (files.length === 0) throw new Error("Chưa chọn file");
      if (!accountId) throw new Error("Chưa chọn tài khoản/sổ quỹ");
      if (!periodDate) throw new Error("Chưa nhập kỳ sao kê");

      // Upload to sys_files
      const uploadRes = await uploadFileApi(files[0]);
      const fileId = uploadRes.id;

      const selectedAccount = accountsData.find((a: any) => a.id === accountId);
      const branchIdToUse = selectedAccount?.branchId || currentBranchId;

      // Create record
      await bankStatementApi.createStatementFile({
        branchId: branchIdToUse,
        bankAccountId: type === "bank" ? accountId : undefined,
        cashBookId: type === "cash" ? accountId : undefined,
        periodDate,
        note,
        fileId,
      });
    },
    onSuccess: () => {
      toast.success("Tải file thành công");
      setShowUploadForm(false);
      setFiles([]);
      setAccountId("");
      setPeriodDate("");
      setNote("");
      refetch();
    },
    onError: (err: any) => {
      toast.error(err.message || "Tải file thất bại");
    },
    onSettled: () => {
      setIsUploading(false);
    },
  });

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    uploadMutation.mutate();
  };

  const columns: any[] = [
    {
      key: "periodDate",
      header: "Kỳ sao kê",
      headerClassName: "text-center",
      className: "align-middle text-left",
      cell: (row: any) => row.periodDate || "--",
      size: 100,
    },
    {
      key: "account",
      header: type === "bank" ? "Ngân hàng" : "Sổ quỹ",
      headerClassName: "text-center",
      className: "align-middle text-left",
      cell: (row: any) => {
        if (type === "bank")
          return row.bankAccount
            ? `${row.bankAccount.bankCode} - ${row.bankAccount.accountNumber}`
            : "--";
        return row.cashBook ? row.cashBook.name : "--";
      },
      size: 150,
    },
    {
      key: "fileName",
      header: "Tên file",
      headerClassName: "text-center",
      className: "align-middle text-left",
      cell: (row: any) => (
        <span
          className="text-slate-800 font-medium hover:underline cursor-pointer"
          onClick={() => window.open(getFileViewUrl(row.fileId), "_blank")}
        >
          {row.fileName}
        </span>
      ),
      size: 200,
    },
    {
      key: "note",
      header: "Ghi chú",
      headerClassName: "text-center",
      className: "align-middle text-left",
      cell: (row: any) => row.note || "--",
      size: 150,
    },
    {
      key: "createdAt",
      header: "Ngày tải lên",
      headerClassName: "text-center",
      className: "align-middle text-left",
      cell: (row: any) => <TableDateCell date={row.createdAt} />,
      size: 150,
    },
    {
      key: "actions",
      header: "",
      headerClassName: "text-center",
      className: "align-middle text-center",
      cell: (row: any) => (
        <div className="flex gap-2 justify-center">
          <Button
            variant="ghost"
            size="icon-sm"
            title="Tải về"
            onClick={() => window.open(getFileViewUrl(row.fileId), "_blank")}
          >
            <Download className="w-4 h-4 text-slate-700 hover:text-slate-900" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            title="Xóa"
            onClick={() => {
              if (window.confirm("Bạn có chắc muốn xóa file này?")) {
                deleteMutation.mutate(row.id);
              }
            }}
          >
            <Trash2 className="w-4 h-4 text-slate-700 hover:text-red-600" />
          </Button>
        </div>
      ),
      size: 100,
    },
  ];

  const accountOptions = accountsData.map((a: any) => ({
    value: a.id,
    label: type === "bank" ? `${a.bankCode} - ${a.accountNumber}` : a.name,
  }));

  return (
    <DrawerModal
      open={isOpen}
      onClose={onClose}
      title="Quản lý sao kê gốc"
      subtitle={type === "bank" ? "Ngân hàng" : "Sổ quỹ"}
      panelClassName="w-[800px]"
    >
      <div className="flex flex-col h-full">
        {showUploadForm ? (
          <form
            onSubmit={handleUploadSubmit}
            className="p-4 bg-slate-50 border rounded-lg mb-4 space-y-4"
          >
            <h4 className="font-semibold text-slate-800">Tải lên sao kê mới</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">
                  {type === "bank" ? "Tài khoản ngân hàng" : "Sổ quỹ"}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <Combobox
                  options={accountOptions}
                  value={accountId}
                  onChange={setAccountId}
                  placeholder="Chọn..."
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">
                  Kỳ sao kê <span className="text-red-500">*</span>
                </label>
                <Combobox
                  options={PERIOD_OPTS}
                  value={periodDate}
                  onChange={(v) => setPeriodDate(v ?? "")}
                  placeholder="Chọn kỳ..."
                />
              </div>
              <div className="space-y-1 col-span-2">
                <label className="text-sm font-medium">
                  File đính kèm (.pdf, .xlsx, .zip){" "}
                  <span className="text-red-500">*</span>
                </label>
                <Attachment
                  files={files}
                  onFilesChange={setFiles}
                  accept=".pdf, .xlsx, .zip"
                  maxFiles={1}
                  maxSizeMb={10}
                />
              </div>
              <div className="space-y-1 col-span-2">
                <label className="text-sm font-medium">Ghi chú</label>
                <input
                  className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={note}
                  onChange={(e: any) => setNote(e.target.value)}
                  placeholder="Ghi chú thêm..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowUploadForm(false)}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={
                  isUploading || files.length === 0 || !accountId || !periodDate
                }
              >
                {isUploading ? "Đang tải..." : "Lưu file"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex justify-end mb-4">
            <Button onClick={() => setShowUploadForm(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Tải lên file sao kê
            </Button>
          </div>
        )}

        <div className="flex-1 overflow-hidden flex flex-col h-full">
          <StandardTable
            tableId={`original-statement-files-${type}`}
            variant="spreadsheet"
            items={items}
            columns={columns}
            getRowKey={(r: any) => r.id}
            loading={isFetching}
            page={page}
            pageSize={pageSize}
            total={data?.total || 0}
            totalPages={data?.totalPages || 0}
            onPage={setPage}
            onPageSize={setPageSize}
            emptyLabel="Không có file sao kê nào"
          />
        </div>
      </div>
    </DrawerModal>
  );
}

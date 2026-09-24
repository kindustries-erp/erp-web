import { useMemo } from "react";
import {
  Building2,
  Plus,
  FileSpreadsheet,
  FolderArchive,
  Settings,
  Eye,
  Pencil,
} from "lucide-react";

export function useBankStatementActions({
  type,
  t,
  handleOpenDetail,
  openCustomFieldsDrawer,
  setIsCreateOpen,
  setIsExportOpen,
  setIsOriginalFilesOpen,
}: {
  type: "bank" | "cash";
  t: (key: string, options?: any) => string;
  handleOpenDetail: (id: string, tab?: string, mode?: "view" | "edit") => void;
  openCustomFieldsDrawer: (moduleKey: string, moduleName: string) => void;
  setIsCreateOpen: (v: boolean) => void;
  setIsExportOpen: (v: boolean) => void;
  setIsOriginalFilesOpen: (v: boolean) => void;
}) {
  const rowActions = useMemo(
    () => (row: any) => [
      {
        groupLabel: t("groupTraCuu", { defaultValue: "Tra cứu" }),
        items: [
          {
            label: t("bankStatement.actionDetail", {
              defaultValue: "Chi tiết giao dịch",
            }),
            icon: <Eye className="w-3.5 h-3.5" />,
            onClick: () => handleOpenDetail(row.id, "txn_details", "view"),
          },
          {
            label: t("bankStatement.actionObjectDetails", {
              defaultValue: "Chi tiết theo đối tượng",
            }),
            icon: <Building2 className="w-3.5 h-3.5" />,
            onClick: () => handleOpenDetail(row.id, "partner", "view"),
          },
        ],
      },
      {
        groupLabel: t("groupThaoTac", { defaultValue: "Thao tác" }),
        items: [
          {
            label: t("bankStatement.actionEdit", {
              defaultValue: "Chỉnh sửa",
            }),
            icon: <Pencil className="w-3.5 h-3.5" />,
            onClick: () => handleOpenDetail(row.id, "txn_details", "edit"),
          },
        ],
      },
      {
        groupLabel: t("groupCauHinh", { defaultValue: "Cấu hình" }),
        items: [
          {
            label: t("bankConfig.customFields", {
              defaultValue: "Cấu hình trường tùy chỉnh",
            }),
            icon: <Settings className="w-3.5 h-3.5 text-violet-500" />,
            onClick: () =>
              openCustomFieldsDrawer(
                "BANK_TXN",
                type === "bank" ? "Sao kê ngân hàng" : "Sổ quỹ tiền mặt",
              ),
          },
        ],
      },
    ],
    [t, type, handleOpenDetail, openCustomFieldsDrawer],
  );

  const createActions = useMemo(
    () => [
      {
        groupLabel: t("groupThaoTac", { defaultValue: "Thao tác" }),
        items: [
          ...(type === "cash"
            ? [
                {
                  label: t("bankStatement.createCash", {
                    defaultValue: "Tạo mới phiếu thu/chi",
                  }),
                  icon: <Plus className="w-4 h-4 text-emerald-600" />,
                  onClick: () => setIsCreateOpen(true),
                },
              ]
            : []),
          {
            label: t("bankStatement.exportExcel", {
              defaultValue: "Xuất Excel",
            }),
            icon: <FileSpreadsheet className="w-4 h-4 text-green-600" />,
            onClick: () => setIsExportOpen(true),
          },
          {
            label: t("bankStatement.originalFiles", {
              defaultValue: "Quản lý file gốc",
            }),
            icon: <FolderArchive className="w-4 h-4 text-emerald-600" />,
            onClick: () => setIsOriginalFilesOpen(true),
          },
        ],
      },
      {
        groupLabel: t("groupCauHinh", { defaultValue: "Cấu hình" }),
        items: [
          {
            label: t("bankConfig.customFields", {
              defaultValue: "Cấu hình trường tùy chỉnh",
            }),
            icon: <Settings className="w-4 h-4 text-violet-500" />,
            onClick: () =>
              openCustomFieldsDrawer(
                "BANK_TXN",
                type === "bank" ? "Sao kê ngân hàng" : "Sổ quỹ tiền mặt",
              ),
          },
        ],
      },
    ],
    [
      t,
      type,
      setIsCreateOpen,
      setIsExportOpen,
      setIsOriginalFilesOpen,
      openCustomFieldsDrawer,
    ],
  );

  return { rowActions, createActions };
}

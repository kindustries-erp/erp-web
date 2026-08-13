import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { useTranslation } from "react-i18next";
import { type ErpInvoice } from "../api/erpInvoicesCoreApi";
import { ChevronDown, RefreshCw } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import {
  ActionDropdown,
  type ActionDropdownItem,
} from "@/shared/components/ActionDropdown";

interface Props {
  open: boolean;
  onClose: () => void;
  editMode: boolean;
  detailInvoice: ErpInvoice | null;
  startEdit: () => void;
  saving: boolean;
  handleSave: (statusOverride?: string) => void;
  cancelEdit: () => void;
  rightPanel?: React.ReactNode;
  children: React.ReactNode;
  onSyncDetail?: () => void;
  loadingDetail?: boolean;
  hideEditToggle?: boolean;
}

function formatTaxInvoiceStatus(val?: number | null) {
  switch (val) {
    case 1:
      return "Mới";
    case 2:
      return "Thay thế";
    case 3:
      return "Điều chỉnh";
    case 4:
      return "Bị thay thế";
    case 5:
      return "Bị điều chỉnh";
    case 6:
      return "Bị hủy";
    default:
      return val?.toString() || "—";
  }
}

export function ErpInvoiceInternalDrawer({
  open,
  onClose,
  editMode,
  detailInvoice,
  startEdit,
  saving,
  handleSave,
  cancelEdit,
  rightPanel,
  children,
  onSyncDetail,
  loadingDetail,
  hideEditToggle = false,
}: Props) {
  const { t } = useTranslation("erpInvoices");

  const editActions = [
    {
      label: t("actionCancel", "Hủy"),
      onClick: cancelEdit,
      variant: "outline" as const,
      disabled: saving,
    },
    {
      label: saving
        ? t("actionSaving", "Đang lưu...")
        : t("actionSaveChange", "Lưu thay đổi"),
      primary: true,
      loading: saving,
      disabled: saving,
      onClick: () => handleSave("CONFIRMED"),
    },
  ];

  const drawerTitle = detailInvoice
    ? `${t("internalTitle", "Thông tin nội bộ")}: ${detailInvoice.invoiceNo}`
    : t("internalTitle", "Thông tin nội bộ");

  let titleExtra: React.ReactNode = undefined;
  if (detailInvoice && detailInvoice.taxInvoiceStatus != null) {
    const lbl = formatTaxInvoiceStatus(detailInvoice.taxInvoiceStatus);
    let badgeClass = "border-slate-200 bg-slate-50 text-slate-700";
    switch (detailInvoice.taxInvoiceStatus) {
      case 1:
        badgeClass = "border-blue-200 bg-blue-50 text-blue-700";
        break;
      case 2:
      case 3:
      case 5:
        badgeClass = "border-amber-200 bg-amber-50 text-amber-700";
        break;
      case 4:
      case 6:
        badgeClass = "border-red-200 bg-red-50 text-red-700";
        break;
    }
    titleExtra = (
      <Badge variant="ghost" className={`border ${badgeClass}`}>
        {lbl}
      </Badge>
    );
  }

  // Dropdown menu items for the left side of the footer (View mode only)
  let footerLeft: React.ReactNode = undefined;

  if (!editMode && onSyncDetail) {
    const dropdownItems: ActionDropdownItem[] = [
      {
        groupLabel: "ĐỒNG BỘ",
        items: [
          {
            label: "Đồng bộ từ GĐT",
            icon: (
              <RefreshCw
                className={`w-4 h-4 ${loadingDetail ? "animate-spin" : ""}`}
              />
            ),
            onClick: onSyncDetail,
            disabled: loadingDetail,
          },
        ],
      },
    ];

    footerLeft = (
      <ActionDropdown
        align="start"
        items={dropdownItems}
        customTrigger={
          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-[color:var(--border)] bg-white hover:bg-[color:var(--bg-muted)] text-[color:var(--fg)] shadow-sm transition-colors"
          >
            <span className="font-semibold text-[color:var(--fg)]">
              Thao tác
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[color:var(--faint)]" />
          </button>
        }
      />
    );
  }

  return (
    <StandardFormDrawer
      open={open}
      mode={editMode ? "edit" : "view"}
      onClose={onClose}
      onToggleEdit={!editMode && !hideEditToggle ? startEdit : undefined}
      title={drawerTitle}
      titleExtra={titleExtra}
      size="xl"
      layout={rightPanel ? "2-columns" : "1-column"}
      collapsibleRightPanel={true}
      confirmOnClose={editMode}
      actions={editMode ? editActions : undefined}
      footerLeft={footerLeft}
      leftPanel={children}
      rightPanel={rightPanel}
    />
  );
}

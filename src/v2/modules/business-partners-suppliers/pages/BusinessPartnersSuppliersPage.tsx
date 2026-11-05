import * as React from "react";
import { Building2, Plus } from "lucide-react";
import { V2Button, V2ConfirmModal, V2ModulePage } from "@/v2/shared/components";
import type { V2ModuleTab } from "@/v2/shared/components";
import {
  useBusinessPartnersQuery,
  BusinessPartnerDrawer,
  BusinessPartnerSyncDialog,
} from "@/v2/core/business-partners";
import type { BusinessPartner } from "@/v2/core/business-partners";
import {
  v2ColumnPreferencesStorage,
  v2ViewPresetStorage,
} from "@/v2/shared/preferences/v2TablePreferenceStorages";
import { businessPartnersSuppliersConfig } from "../businessPartnersSuppliers.config";
import { useBusinessPartnersSuppliersPage } from "./BusinessPartnersSuppliersPage.hook";
import "../businessPartnersSuppliers.locale";

/** Màn Nhà cung cấp: bố cục và nối lõi; dữ liệu và thao tác lấy từ hook của lõi */
export function BusinessPartnersSuppliersPage() {
  const state = useBusinessPartnersSuppliersPage();
  const { t } = state;
  const [syncOpen, setSyncOpen] = React.useState(false);

  const tabs = React.useMemo<V2ModuleTab<BusinessPartner>[]>(
    () => [
      {
        key: "list",
        label: t("v2.businessPartnersSuppliers.list", "Danh sách"),
        kind: "list",
        resetKey: `${state.tableId}-${state.tableKey}`,
        table: {
          tableId: state.tableId,
          columns: state.columns,
          getRowKey: (row) => row.id,
          mode: "server",
          fetchOptions: (params) =>
            businessPartnersSuppliersConfig.api.options(params),
          rowActions: state.rowActions,
          preferencesStorage: v2ColumnPreferencesStorage,
          viewPresetStorage: v2ViewPresetStorage,
          emptyLabel: t(
            "v2.businessPartnersSuppliers.empty",
            "Chưa có dữ liệu nhà cung cấp",
          ),
          toolbar: {
            search: {},
            filterPanel: {},
            enableFullscreen: true,
            viewModes: {
              items: [
                {
                  key: "overview",
                  label: t("v2.common.overview", "Tổng quan"),
                },
                {
                  key: "legal",
                  label: t("v2.partners.views.legal", "Pháp nhân & Thuế"),
                },
                {
                  key: "all",
                  label: t("v2.common.allColumns", "Tất cả cột"),
                },
              ],
              activeKey: state.view,
              onSelect: state.selectView,
            },
          },
        },
        useData: (query) =>
          useBusinessPartnersQuery({
            api: businessPartnersSuppliersConfig.api,
            keys: businessPartnersSuppliersConfig.keys,
            query,
            onError: state.onListError,
          }),
      },
    ],
    [state, t],
  );

  return (
    <V2ModulePage<BusinessPartner>
      title={t("v2.businessPartnersSuppliers.title", "Nhà cung cấp")}
      description={t(
        "v2.businessPartnersSuppliers.description",
        "Quản lý hồ sơ nhà cung cấp và thông tin liên hệ",
      )}
      icon={<Building2 className="h-4 w-4" />}
      tabs={tabs}
      actions={
        state.canCreate ? (
          <div className="flex items-center gap-2">
            <V2Button
              size="sm"
              variant="outline"
              onClick={() => setSyncOpen(true)}
            >
              {t(
                "v2.businessPartnersSuppliers.syncButton",
                "Đồng bộ từ hóa đơn",
              )}
            </V2Button>
            <V2Button
              size="sm"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => state.open(null, "edit")}
            >
              {t("v2.businessPartnersSuppliers.create", "Thêm nhà cung cấp")}
            </V2Button>
          </div>
        ) : undefined
      }
      overlays={
        <>
          <BusinessPartnerSyncDialog
            open={syncOpen}
            onOpenChange={setSyncOpen}
            t={t}
          />
          {state.drawer && (
            <BusinessPartnerDrawer
              key={`${state.drawer.id ?? "new"}-${state.drawer.mode}`}
              config={businessPartnersSuppliersConfig}
              open
              recordId={state.drawer.id}
              mode={state.drawer.mode}
              canUpdate={state.canUpdate}
              onClose={() => state.setDrawer(null)}
            />
          )}
          <V2ConfirmModal
            open={Boolean(state.deleteTarget)}
            title={t(
              "v2.businessPartnersSuppliers.deleteTitle",
              "Xác nhận xóa",
            )}
            message={t(
              "v2.businessPartnersSuppliers.deleteMessage",
              "Bạn có chắc muốn xóa nhà cung cấp này?",
            )}
            confirmLabel={t("v2.businessPartnersSuppliers.deleteLabel", "Xóa")}
            cancelLabel={t("v2.common.cancel", "Hủy")}
            variant="danger"
            isLoading={state.remove.isPending}
            onConfirm={() => {
              if (state.deleteTarget)
                state.remove.mutate(state.deleteTarget.id);
            }}
            onCancel={() => state.setDeleteTarget(null)}
          />
        </>
      }
    />
  );
}

import * as React from "react";
import { Users } from "lucide-react";
import { V2Button, V2ConfirmModal, V2ModulePage } from "@/v2/shared/components";
import type { V2ModuleTab } from "@/v2/shared/components";
import {
  useBusinessPartnersQuery,
  BusinessPartnerDrawer,
} from "@/v2/core/business-partners";
import type { BusinessPartner } from "@/v2/core/business-partners";
import {
  v2ColumnPreferencesStorage,
  v2ViewPresetStorage,
} from "@/v2/shared/preferences/v2TablePreferenceStorages";
import { businessPartnersCustomersConfig } from "../businessPartnersCustomers.config";
import { useBusinessPartnersCustomersPage } from "./BusinessPartnersCustomersPage.hook";
import "../businessPartnersCustomers.locale";

/** Màn Khách hàng: bố cục và nối lõi; dữ liệu và thao tác lấy từ hook của lõi */
export function BusinessPartnersCustomersPage() {
  const state = useBusinessPartnersCustomersPage();
  const { t } = state;

  const tabs = React.useMemo<V2ModuleTab<BusinessPartner>[]>(
    () => [
      {
        key: "list",
        label: t("v2.businessPartnersCustomers.list", "Danh sách"),
        kind: "list",
        resetKey: `${state.tableId}-${state.tableKey}`,
        table: {
          tableId: state.tableId,
          columns: state.columns,
          getRowKey: (row) => row.id,
          mode: "server",
          fetchOptions: (params) =>
            businessPartnersCustomersConfig.api.options(params),
          rowActions: state.rowActions,
          preferencesStorage: v2ColumnPreferencesStorage,
          viewPresetStorage: v2ViewPresetStorage,
          emptyLabel: t(
            "v2.businessPartnersCustomers.empty",
            "Chưa có dữ liệu",
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
            api: businessPartnersCustomersConfig.api,
            keys: businessPartnersCustomersConfig.keys,
            query,
            onError: state.onListError,
          }),
      },
    ],
    [state, t],
  );

  return (
    <V2ModulePage<BusinessPartner>
      title={t("v2.businessPartnersCustomers.title", "Khách hàng")}
      description={t(
        "v2.businessPartnersCustomers.description",
        "Quản lý hồ sơ khách hàng và thông tin liên hệ",
      )}
      icon={<Users className="h-4 w-4" />}
      tabs={tabs}
      actions={
        state.canCreate ? (
          <V2Button size="sm" onClick={() => state.open(null, "edit")}>
            {t("v2.businessPartnersCustomers.create", "Thêm khách hàng")}
          </V2Button>
        ) : undefined
      }
      overlays={
        <>
          {state.drawer && (
            <BusinessPartnerDrawer
              key={`${state.drawer.id ?? "new"}-${state.drawer.mode}`}
              config={businessPartnersCustomersConfig}
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
              "v2.businessPartnersCustomers.deleteTitle",
              "Xác nhận xóa",
            )}
            message={t(
              "v2.businessPartnersCustomers.deleteMessage",
              "Bạn có chắc muốn xóa đối tác này?",
            )}
            confirmLabel={t("v2.businessPartnersCustomers.deleteLabel", "Xóa")}
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

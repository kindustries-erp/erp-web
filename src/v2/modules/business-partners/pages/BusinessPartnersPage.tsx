import * as React from "react";
import { Building2, Plus, Users } from "lucide-react";
import {
  V2Button,
  V2ConfirmModal,
  V2ModulePage,
  type V2ModuleTab,
} from "@/v2/shared/components";
import { useBusinessPartnersQuery } from "../api/queries/useBusinessPartnersQuery";
import type {
  BusinessPartner,
  BusinessPartnerType,
} from "../domain/entities/businessPartner";
import { BusinessPartnerDrawer } from "../drawers/BusinessPartnerDrawer";
import { useBusinessPartnersPage } from "./useBusinessPartnersPage";
import {
  v2ColumnPreferencesStorage,
  v2ViewPresetStorage,
} from "@/v2/shared/preferences/v2TablePreferenceStorages";
import "../businessPartners.locale";

export interface BusinessPartnersPageProps {
  partnerType: BusinessPartnerType;
}

export function BusinessPartnersPage({
  partnerType,
}: BusinessPartnersPageProps) {
  const state = useBusinessPartnersPage(partnerType);
  const supplier = partnerType === "VENDOR";
  const title = state.t(
    supplier ? "v2.partners.suppliersTitle" : "v2.partners.customersTitle",
    supplier ? "Nhà cung cấp" : "Khách hàng",
  );
  const description = state.t(
    supplier
      ? "v2.partners.suppliersDescription"
      : "v2.partners.customersDescription",
    title,
  );
  const tabs = React.useMemo<V2ModuleTab<BusinessPartner>[]>(
    () => [
      {
        key: "list",
        label: state.t("v2.partners.list", "Danh sách"),
        kind: "list",
        resetKey: `${partnerType}-${state.tableKey}`,
        table: {
          tableId: state.tableId,
          columns: state.columns,
          getRowKey: (row) => row.id,
          mode: "server",
          fetchOptions: (params) =>
            import("../api/businessPartnersApi").then(
              ({ businessPartnersV2Api }) =>
                businessPartnersV2Api.options(partnerType, params),
            ),
          rowActions: state.rowActions,
          preferencesStorage: v2ColumnPreferencesStorage,
          viewPresetStorage: v2ViewPresetStorage,
          emptyLabel: state.t("v2.partners.empty", "Không có đối tác phù hợp"),
          toolbar: {
            search: {},
            filterPanel: {},
            enableFullscreen: true,
            viewModes: {
              items: [
                {
                  key: "overview",
                  label: state.t("v2.partners.views.overview", "Tổng quan"),
                },
                {
                  key: "legal",
                  label: state.t("v2.partners.views.legal", "Pháp nhân & Thuế"),
                },
                {
                  key: "all",
                  label: state.t("v2.partners.views.all", "Tất cả cột"),
                },
              ],
              activeKey: state.view,
              onSelect: state.selectView,
            },
          },
        },
        useData: (query) =>
          useBusinessPartnersQuery(partnerType, query, state.onListError),
      },
    ],
    [partnerType, state],
  );

  return (
    <V2ModulePage<BusinessPartner>
      title={title}
      description={description}
      icon={
        supplier ? (
          <Building2 className="h-4 w-4" />
        ) : (
          <Users className="h-4 w-4" />
        )
      }
      tabs={tabs}
      actions={
        state.canCreate ? (
          <V2Button
            size="sm"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => state.open(null, "edit")}
          >
            {state.t(
              supplier
                ? "v2.partners.createSupplier"
                : "v2.partners.createCustomer",
              supplier ? "Thêm nhà cung cấp" : "Thêm khách hàng",
            )}
          </V2Button>
        ) : undefined
      }
      overlays={
        <>
          {state.drawer && (
            <BusinessPartnerDrawer
              open
              partnerId={state.drawer.id}
              mode={state.drawer.mode}
              partnerType={partnerType}
              canUpdate={state.canUpdate}
              onClose={() => state.setDrawer(null)}
            />
          )}
          <V2ConfirmModal
            open={Boolean(state.deleteTarget)}
            title={state.t("v2.partners.delete.title", "Xác nhận xóa")}
            message={
              state.deleteTarget
                ? `${state.t("v2.partners.delete.message", "Bạn có chắc muốn xóa đối tác này?")} ${state.deleteTarget.name}`
                : ""
            }
            confirmLabel={state.t("v2.partners.actions.delete", "Xóa")}
            cancelLabel={state.t("v2.common.cancel", "Hủy")}
            variant="danger"
            isLoading={state.remove.isPending}
            onConfirm={() => {
              if (state.deleteTarget)
                state.remove.mutate(state.deleteTarget.id);
            }}
            onCancel={() => state.setDeleteTarget(null)}
            onOpenChange={(open) => !open && state.setDeleteTarget(null)}
          />
        </>
      }
    />
  );
}

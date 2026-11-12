import * as React from "react";
import { Calculator, ListOrdered, TrendingUp } from "lucide-react";
import type { LoanItem } from "@/v2/core/loans";
import type { V2ModuleTab } from "@/v2/shared/components";
import { V2Icon } from "@/v2/shared/components/atoms";
import {
  v2ColumnPreferencesStorage,
  v2ViewPresetStorage,
} from "@/v2/shared/preferences/v2TablePreferenceStorages";
import { useLoansTableData } from "../../api";
import { ConsolidatedCashflowView } from "../../components/organisms/consolidated-cashflow";
import { LoanSimulatorPage } from "../loan-simulator";
import { LOANS_TABLE_ID } from "./loansList.config";
import { LoansTabKey } from "./loansList.enum";
import type { useLoansListPage } from "./LoansListPage.hook";

type Translate = (key: string, fallback?: string) => string;

export function buildLoansTabs(
  t: Translate,
  state: ReturnType<typeof useLoansListPage>,
): V2ModuleTab<LoanItem>[] {
  return [
    {
      key: LoansTabKey.SIMULATOR,
      label: t("v2.loans.tabs.simulator", "Mô Phỏng & Tính Nhanh"),
      icon: <V2Icon icon={Calculator} size={15} />,
      kind: "dashboard",
      content: (
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-4">
          <LoanSimulatorPage
            onSaved={() => state.setActiveTab(LoansTabKey.LIST)}
          />
        </div>
      ),
    },
    {
      key: LoansTabKey.PROJECTION,
      label: t("v2.loans.tabs.projection", "Dự Báo Dòng Tiền Tương Lai"),
      icon: <V2Icon icon={TrendingUp} size={15} />,
      kind: "dashboard",
      content: (
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-4">
          <ConsolidatedCashflowView />
        </div>
      ),
    },
    {
      key: LoansTabKey.LIST,
      label: t("v2.loans.tabs.list", "Danh Sách Hợp Đồng"),
      icon: <V2Icon icon={ListOrdered} size={15} />,
      kind: "list",
      resetKey: state.filterView.resetKey,
      table: {
        tableId: LOANS_TABLE_ID,
        columns: state.columns,
        getRowKey: (row) => row.id,
        mode: "server",
        fetchOptions: state.fetchOptions,
        rowActions: state.rowActions,
        preferencesStorage: v2ColumnPreferencesStorage,
        viewPresetStorage: v2ViewPresetStorage,
        emptyLabel: t("v2.loans.emptyList", "Chưa có khoản vay nào."),
        toolbar: {
          search: {},
          filterPanel: {},
          filterGroup: state.filterView.filterGroup,
          viewModes: state.filterView.viewModes,
        },
      },
      useData: (query) =>
        useLoansTableData(
          { ...query, ...state.filterView.filter },
          state.onListError,
        ),
    },
  ];
}

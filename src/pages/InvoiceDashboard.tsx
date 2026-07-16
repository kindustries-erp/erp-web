import React from "react";
import { useQuery } from "@tanstack/react-query";
import { LayoutDashboard } from "lucide-react";
import { DashboardTemplate } from "@/shared/components/DashboardTemplate";
import { useFilterPanel } from "@/shared/hooks/useFilterPanel";
import { getBranchesApi } from "@/modules/branches/api/branchApi";
import { PartnerInvoiceDrawer } from "@/modules/erp-invoices-core/components/PartnerInvoiceDrawer";
import { useAuthStore } from "@/modules/auth/domain/authStore";
import { ComingSoon } from "@/pages/ComingSoon";
import { useHasAnyPermission } from "@/shared/hooks/useHasPermission";
import { BranchInvoiceChart } from "./components/BranchInvoiceChart";
import { BranchInvoiceTable } from "./components/BranchInvoiceTable";

export function InvoiceDashboard() {
  const { employee } = useAuthStore();
  const isAdminEmail = employee?.email === "admin@liouni.com";

  const hasPerm = useHasAnyPermission(["invoices"], "read");
  const canView = hasPerm || isAdminEmail;

  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [selectedPartner, setSelectedPartner] = React.useState<{
    taxCode: string;
    partnerName: string;
  } | null>(null);

  const { data: branches = [], isLoading: isLoadingBranches } = useQuery({
    queryKey: ["branches"],
    queryFn: () => getBranchesApi(),
  });

  const filterConfig = React.useMemo(() => {
    const custom: any[] = [
      {
        key: "branchId",
        label: "Chi nhánh",
        placeholder: "Tất cả chi nhánh",
        options: branches.map((b: any) => ({ value: b.id, label: b.name })),
      },
    ];

    return {
      period: true,
      noDefaultPeriod: true,
      custom,
    };
  }, [branches]);

  const filter = useFilterPanel(filterConfig, () => {});

  const handleRowClick = (row: any) => {
    if (row.taxCode) {
      setSelectedPartner({
        taxCode: row.taxCode,
        partnerName: row.partnerName,
      });
      setDrawerOpen(true);
    }
  };

  if (!canView) {
    return <ComingSoon />;
  }

  const selectedBranchId = filter.state.custom.branchId as string | undefined;

  // Determine which sections to render
  const sectionsToRender: Array<{ id: string | null; name: string }> = [];

  if (selectedBranchId) {
    const selectedBranch = branches.find((b: any) => b.id === selectedBranchId);
    if (selectedBranch) {
      sectionsToRender.push({
        id: selectedBranch.id,
        name: selectedBranch.name,
      });
    }
  } else {
    // Show all branches
    branches.forEach((b: any) => {
      sectionsToRender.push({
        id: b.id,
        name: b.name,
      });
    });
    // Plus unclassified
    sectionsToRender.push({
      id: null,
      name: "Chưa phân loại chi nhánh",
    });
  }

  return (
    <DashboardTemplate
      title="Tổng quan Hóa đơn"
      desc="Theo dõi dòng tiền hóa đơn và công nợ đối tác"
      icon={<LayoutDashboard className="h-4 w-4" />}
      filterConfig={filterConfig}
      filter={filter}
      loading={isLoadingBranches}
    >
      <div className="flex flex-col gap-8 mb-8">
        {/* Biến động Hóa đơn (Charts) */}
        <div>
          <h3 className="text-lg font-semibold mb-4">
            Biến động Hóa đơn (Doanh thu / Chi phí)
          </h3>

          {!selectedBranchId && (
            <div className="mb-4">
              <BranchInvoiceChart
                key="chart-all"
                branchId="all"
                branchName="Tất cả chi nhánh (Tổng hợp)"
                filterState={filter.state}
                canView={canView}
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {sectionsToRender.map((section) => (
              <BranchInvoiceChart
                key={`chart-${section.id || "unclassified"}`}
                branchId={section.id}
                branchName={section.name}
                filterState={filter.state}
                canView={canView}
              />
            ))}
          </div>
        </div>

        {/* Công nợ Phải thu (Receivables) */}
        <div>
          <h3 className="text-lg font-semibold mb-4">
            Công nợ Phải thu (Khách hàng)
          </h3>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {sectionsToRender.map((section) => (
              <BranchInvoiceTable
                key={`receivable-${section.id || "unclassified"}`}
                branchId={section.id}
                branchName={section.name}
                filterState={filter.state}
                type="receivable"
                canView={canView}
                onRowClick={handleRowClick}
              />
            ))}
          </div>
        </div>

        {/* Công nợ Phải trả (Payables) */}
        <div>
          <h3 className="text-lg font-semibold mb-4">
            Công nợ Phải trả (Nhà cung cấp)
          </h3>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {sectionsToRender.map((section) => (
              <BranchInvoiceTable
                key={`payable-${section.id || "unclassified"}`}
                branchId={section.id}
                branchName={section.name}
                filterState={filter.state}
                type="payable"
                canView={canView}
                onRowClick={handleRowClick}
              />
            ))}
          </div>
        </div>
      </div>

      <PartnerInvoiceDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        taxCode={selectedPartner?.taxCode}
        partnerName={selectedPartner?.partnerName}
        filterState={filter.state}
      />
    </DashboardTemplate>
  );
}

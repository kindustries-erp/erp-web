import React from "react";
import { DrawerModal } from "@/shared/components/DrawerModal";
import { StandardTable } from "@/shared/components/StandardTable";
import { Wrench, Building2 } from "lucide-react";
import type { GarageCaseSelectionModalProps } from "./GarageCaseSelectionModal.type";
import { useGarageCaseSelectionModal } from "./GarageCaseSelectionModal.hook";

export function GarageCaseSelectionModal({
  open,
  onClose,
  onSelect,
  existingCaseCodes = [],
}: GarageCaseSelectionModalProps) {
  const {
    t,
    page,
    setPage,
    pageSize,
    setPageSize,
    selectedCase,
    branches,
    selectedBranchId,
    setSelectedBranchId,
    cases,
    data,
    isLoading,
    columns,
    handleSelect,
    handleConfirm,
  } = useGarageCaseSelectionModal({
    open,
    onClose,
    onSelect,
    existingCaseCodes,
  });

  return (
    <DrawerModal
      open={open}
      onClose={onClose}
      icon={<Wrench className="w-5 h-5 text-primary" />}
      title={t(
        "Chọn vụ việc / phiếu dịch vụ Garage để ghép nối",
        "Chọn vụ việc / phiếu dịch vụ Garage để ghép nối",
      )}
      panelClassName="w-full md:w-[95vw] lg:w-[1200px] xl:w-[1200px]"
      actions={[
        {
          label: t("cancel", "Hủy"),
          variant: "outline",
          onClick: onClose,
        },
        {
          label: t("confirm", "Ghép nối"),
          primary: true,
          disabled: !selectedCase,
          onClick: handleConfirm,
        },
      ]}
    >
      <div className="flex flex-col h-full min-h-[480px] gap-3">
        {/* Branch Filter Header */}
        {branches && branches.length > 1 && (
          <div className="flex items-center gap-2 px-1 text-xs">
            <Building2 className="w-4 h-4 text-slate-400" />
            <span className="text-slate-600 dark:text-slate-400 font-medium">
              {t("Chi nhánh:", "Chi nhánh:")}
            </span>
            <select
              value={selectedBranchId}
              onChange={(e) => {
                setSelectedBranchId(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1 text-xs font-medium border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {branches.map((b: any) => (
                <option key={b.id || b.externalId} value={b.externalId || b.id}>
                  {b.name || b.branchName || b.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Garage Cases Table */}
        <div className="flex-1">
          <StandardTable<any>
            tableId="garage-case-selection-table"
            items={cases}
            columns={columns}
            getRowKey={(row) => row.id || row.VuViecCode}
            variant="spreadsheet"
            enableColumnResizing={true}
            loading={isLoading}
            page={page}
            pageSize={pageSize}
            total={data?.total || 0}
            totalPages={data?.totalPages || 0}
            onPage={setPage}
            onPageSize={setPageSize}
            minWidth={950}
            onRowClick={(row) => {
              const isExisting =
                existingCaseCodes.includes(row.VuViecCode) ||
                existingCaseCodes.includes(row.id);
              if (!isExisting) {
                handleSelect(row);
              }
            }}
          />
        </div>
      </div>
    </DrawerModal>
  );
}
export default GarageCaseSelectionModal;

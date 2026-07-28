import React, { useState, useEffect } from "react";
import { DrawerModal } from "@/shared/components/DrawerModal";
import { Button } from "@/shared/components/ui/Button";
import { DatePicker } from "@/shared/components/DatePicker";
import { RefreshCw } from "lucide-react";
import { useGarageStore } from "../store/garageStore";
import { useSyncGarageCases } from "../hooks/useGarage";
import { GarageBranchSelector } from "./GarageBranchSelector";

interface GarageCaseSyncDrawerProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function GarageCaseSyncDrawer({
  open,
  onClose,
  onSuccess,
}: GarageCaseSyncDrawerProps) {
  const { selectedBranchId } = useGarageStore();
  const { mutateAsync: syncCases, isPending: isSyncing } = useSyncGarageCases();

  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  useEffect(() => {
    if (open) {
      // Set default dates if needed, or leave empty
      setDateFrom("");
      setDateTo("");
    }
  }, [open]);

  const handleSync = async () => {
    if (!selectedBranchId) return;
    try {
      await syncCases({
        branchId: selectedBranchId,
        from: dateFrom ? dateFrom : undefined,
        to: dateTo ? dateTo : undefined,
      });
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch {
      // Error handled in the mutation
    }
  };

  return (
    <DrawerModal
      open={open}
      onClose={onClose}
      title="Đồng bộ Cases từ Kgara"
      icon={<RefreshCw className="w-5 h-5" />}
      panelClassName="min-[1024px]:w-[640px]"
      actions={[
        {
          label: "Đóng",
          onClick: onClose,
          variant: "outline",
        },
      ]}
    >
      <div className="flex flex-col h-full">
        {/* Selection Area */}
        <div className="flex items-center gap-3 px-[18px] py-3 border-b border-border shrink-0 -mx-[18px] -mt-[18px] mb-4 bg-muted/30">
          <GarageBranchSelector />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-6">
            <div className="text-sm text-muted-foreground">
              Chọn khoảng thời gian để đồng bộ phiếu dịch vụ (Cases) từ hệ thống
              Kgara về ERP. Lưu ý: Nếu không chọn ngày, API có thể sẽ không trả
              về dữ liệu.
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex gap-3">
                <DatePicker
                  value={dateFrom}
                  onChange={setDateFrom}
                  placeholder="Từ ngày"
                  className="flex-1"
                />
                <DatePicker
                  value={dateTo}
                  onChange={setDateTo}
                  placeholder="Đến ngày"
                  className="flex-1"
                />
              </div>

              <div className="flex justify-end items-center mt-2">
                <Button
                  onClick={handleSync}
                  disabled={
                    !selectedBranchId || isSyncing || (!dateFrom && !dateTo)
                  }
                  className="gap-2 w-36 justify-center"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`}
                  />
                  {isSyncing ? "Đang xử lý..." : "Bắt đầu đồng bộ"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DrawerModal>
  );
}

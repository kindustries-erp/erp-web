import React, { useEffect } from "react";
import { useGarageBranches, useSyncGarageBranches } from "../hooks/useGarage";
import { useGarageStore } from "../store/garageStore";
import { RefreshCw } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Combobox } from "@/shared/components/Combobox";

/** Nhãn chi nhánh; chi nhánh không thuộc tài khoản MAIN được gắn thêm mã tài khoản (ví dụ `· OJ`). */
export function formatGarageBranchLabel(branch: {
  name?: string | null;
  code?: string | null;
  accountKey?: string | null;
}): string {
  const base = `${branch.name} (${branch.code})`;
  return branch.accountKey && branch.accountKey !== "MAIN"
    ? `${base} · ${branch.accountKey}`
    : base;
}

export function GarageBranchSelector() {
  const { data: branches, isLoading } = useGarageBranches();
  const { mutate: syncBranches, isPending: isSyncing } =
    useSyncGarageBranches();
  const { selectedBranchId, setSelectedBranchId } = useGarageStore();

  useEffect(() => {
    if (branches && branches.length > 0 && !selectedBranchId) {
      setSelectedBranchId(branches[0].externalId);
    }
  }, [branches, selectedBranchId, setSelectedBranchId]);

  const branchOptions =
    branches?.map((b: any) => ({
      value: b.externalId,
      label: formatGarageBranchLabel(b),
    })) || [];

  return (
    <div className="flex items-center space-x-2 w-full">
      <span className="text-sm font-medium whitespace-nowrap">Branch:</span>
      <Combobox
        options={branchOptions}
        value={selectedBranchId || ""}
        onChange={(val: string) => setSelectedBranchId(val)}
        placeholder="Select a branch"
        className="w-64"
        disabled={isLoading}
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={() => syncBranches()}
        disabled={isSyncing}
        title="Sync Branches"
      >
        <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
      </Button>
    </div>
  );
}

import React, { useEffect } from "react";
import { useGarageBranches, useSyncGarageBranches } from "../hooks/useGarage";
import { useGarageStore } from "../store/garageStore";
import { RefreshCw } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";

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

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm font-medium">Branch:</span>
      <select
        className="form-select text-sm rounded-md border-gray-300"
        value={selectedBranchId}
        onChange={(e) => setSelectedBranchId(e.target.value)}
        disabled={isLoading}
      >
        <option value="">Select a branch</option>
        {branches?.map((b: any) => (
          <option key={b.externalId} value={b.externalId}>
            {b.name} ({b.code})
          </option>
        ))}
      </select>
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

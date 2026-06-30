import React, { useEffect } from "react";
import { useGarageBranches, useSyncGarageBranches } from "../hooks/useGarage";
import { useGarageStore } from "../store/garageStore";
import { RefreshCw } from "lucide-react";

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
      <button
        type="button"
        className="p-2 border rounded-md hover:bg-gray-100 disabled:opacity-50"
        onClick={() => syncBranches()}
        disabled={isSyncing}
        title="Sync Branches"
      >
        <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
      </button>
    </div>
  );
}

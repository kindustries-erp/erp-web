import { useMemo, useState, useCallback } from "react";
import { useAppQuery } from "./useAppQuery";
import {
  getActiveSystemOperationsApi,
  type ErpSystemOperationDto,
  type SystemOperationModule,
} from "@/core/api/systemOperationsApi";

export interface UseSystemOperationLockOptions {
  module?: SystemOperationModule;
  enabled?: boolean;
  pollingInterval?: number;
  idleInterval?: number;
  activeInterval?: number;
}

export interface CheckActionResult {
  isBlocked: boolean;
  reason?: string;
  operation?: ErpSystemOperationDto;
}

export function useSystemOperationLock(
  options: UseSystemOperationLockOptions = {},
) {
  const {
    module,
    enabled = true,
    pollingInterval,
    idleInterval = 15000,
    activeInterval = 2000,
  } = options;

  const [fastCheckUntil, setFastCheckUntil] = useState<number>(0);

  const {
    data: operations = [],
    isLoading,
    isFetching,
    refetch,
  } = useAppQuery<ErpSystemOperationDto[]>({
    queryKey: ["system-operations", "active", module || "ALL"],
    queryFn: () => getActiveSystemOperationsApi(module),
    enabled,
    refetchInterval: (query) => {
      if (!enabled) return false;
      if (pollingInterval) return pollingInterval;

      const now = Date.now();
      const isFast = now < fastCheckUntil;
      const data = query.state.data;
      const hasActive =
        Array.isArray(data) && data.some((op) => op.isBlockingUi);

      // Nếu đang có tác vụ chạy hoặc trong cửa sổ fast-check -> 2s, ngược lại -> 15s
      return hasActive || isFast ? activeInterval : idleInterval;
    },
    refetchIntervalInBackground: false,
    staleTime: 1000,
  });

  const triggerFastCheck = useCallback(
    (durationMs = 10000) => {
      setFastCheckUntil(Date.now() + durationMs);
      void refetch();
    },
    [refetch],
  );

  const blockingOperations = useMemo(() => {
    return operations.filter((op) => op.isBlockingUi);
  }, [operations]);

  const isBlocked = blockingOperations.length > 0;
  const activeOperation = blockingOperations[0] || null;

  const blockedReason = useMemo(() => {
    if (!activeOperation) return null;
    const userStr = activeOperation.userName
      ? ` (Bởi ${activeOperation.userName})`
      : "";
    const targetStr = activeOperation.targetNo
      ? ` [${activeOperation.targetNo}]`
      : "";
    return `Hệ thống đang xử lý: "${activeOperation.operationName}"${targetStr}${userStr}. Thao tác tạm khóa để đảm bảo toàn vẹn dữ liệu.`;
  }, [activeOperation]);

  const isActionBlocked = useMemo(() => {
    return (actionName?: string): CheckActionResult => {
      if (!isBlocked || !activeOperation) {
        return { isBlocked: false };
      }

      for (const op of blockingOperations) {
        // Nếu là khóa cấp MODULE hoặc GLOBAL, hoặc danh sách blockedActions chứa actionName
        const isModuleOrGlobal =
          op.scopeType === "GLOBAL" || op.scopeType === "MODULE";
        const matchesAction =
          !actionName ||
          !op.blockedActions ||
          op.blockedActions.length === 0 ||
          op.blockedActions.includes(actionName);

        if (isModuleOrGlobal || matchesAction) {
          const userStr = op.userName ? ` (${op.userName})` : "";
          const targetStr = op.targetNo ? ` [${op.targetNo}]` : "";
          return {
            isBlocked: true,
            reason: `Hệ thống đang thực hiện "${op.operationName}"${targetStr}${userStr}. Vui lòng chờ hoàn tất.`,
            operation: op,
          };
        }
      }

      return { isBlocked: false };
    };
  }, [isBlocked, activeOperation, blockingOperations]);

  return {
    operations,
    blockingOperations,
    isLoading,
    isFetching,
    isBlocked,
    activeOperation,
    blockedReason,
    isActionBlocked,
    triggerFastCheck,
    refetch,
  };
}

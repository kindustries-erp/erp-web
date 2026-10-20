import React from "react";
import { GarageCashflowTab } from "../components/organisms/garage-cashflow-tab";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { ErpResource, ErpAction } from "@/modules/system/types/rbac";
import { Forbidden } from "@/pages/Forbidden";

export interface GarageCashflowPageProps {
  onOpenCaseDetail?: (caseCode: string) => void;
}

export function GarageCashflowPage({
  onOpenCaseDetail,
}: GarageCashflowPageProps = {}) {
  const canRead = useHasPermission(ErpResource.GARAGE_CASHFLOW, ErpAction.READ);

  if (!canRead) {
    return <Forbidden />;
  }

  return <GarageCashflowTab onOpenCaseDetail={onOpenCaseDetail} />;
}

export default GarageCashflowPage;

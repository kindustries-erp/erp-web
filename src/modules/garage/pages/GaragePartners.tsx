import type { ComponentProps } from "react";
import { GarageDebts } from "./GarageDebts";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { ErpAction, ErpResource } from "@/modules/system/types/rbac";
import { Forbidden } from "@/pages/Forbidden";

export { GarageDebts };

export function GaragePartners(props: ComponentProps<typeof GarageDebts>) {
  const canRead = useHasPermission(ErpResource.GARAGE_DEBTS, ErpAction.READ);

  if (!canRead) return <Forbidden />;

  return <GarageDebts {...props} />;
}

export default GaragePartners;

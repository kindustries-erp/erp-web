import {
  GarageTab,
  type GarageTabProps,
} from "@/modules/garage/components/GarageTab";

export function GarageCasesPage({
  instanceIndex = 1,
  initialTab,
}: GarageTabProps = {}) {
  return <GarageTab instanceIndex={instanceIndex} initialTab={initialTab} />;
}

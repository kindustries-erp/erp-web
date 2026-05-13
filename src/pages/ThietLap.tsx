import { useAppStore } from "@/core/config/appStore";
import { QuyTab } from "@/modules/settings/components/QuyTab";
import { NHTab } from "@/modules/settings/components/NHTab";
import { TKTab } from "@/modules/settings/components/TKTab";

export function ThietLap() {
  const settingsActiveTab = useAppStore((s) => s.settingsActiveTab);
  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto">
      {settingsActiveTab === "quy" && <QuyTab />}
      {settingsActiveTab === "nh" && <NHTab />}
      {settingsActiveTab === "tk" && <TKTab />}
    </div>
  );
}

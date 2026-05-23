import { useEffect } from "react";
import { Truck } from "lucide-react";
import { useAppStore } from "@/core/config/appStore";
import { PageLayout } from "@/shared/components/PageLayout";
import { RoleFilteredPartnersTab } from "@/modules/partners/components/RoleFilteredPartnersTab";

export function NhaCungCap() {
  const { setCustomBreadcrumbs } = useAppStore();

  useEffect(() => {
    setCustomBreadcrumbs([["breadcrumb.accounting"], ["nav.items.suppliers"]]);
    return () => setCustomBreadcrumbs(null);
  }, [setCustomBreadcrumbs]);

  return (
    <PageLayout
      title="Nhà cung cấp"
      desc="Danh sách nhà cung cấp lấy từ master đối tác và filter theo vai trò VENDOR."
      icon={<Truck className="h-4 w-4" />}
      tabs={[{ value: "suppliers", label: "Nhà cung cấp" }]}
      activeTab="suppliers"
      onTabChange={() => {}}
    >
      <RoleFilteredPartnersTab
        role="VENDOR"
        roleLabel="nhà cung cấp"
        title="Nhà cung cấp"
        desc="Tạo mới/cập nhật nhà cung cấp từ master đối tác."
      />
    </PageLayout>
  );
}

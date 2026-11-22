import { useEffect } from "react";
import { Users } from "lucide-react";
import { useAppStore } from "@/core/config/appStore";
import { PageLayout } from "@/shared/components/PageLayout";
import { RoleFilteredPartnersTab } from "@/modules/partners/components/RoleFilteredPartnersTab";

export function KhachHang() {
  const { setCustomBreadcrumbs } = useAppStore();

  useEffect(() => {
    setCustomBreadcrumbs([["breadcrumb.accounting"], ["nav.items.customers"]]);
    return () => setCustomBreadcrumbs(null);
  }, [setCustomBreadcrumbs]);

  return (
    <PageLayout
      title="Khách hàng"
      desc="Danh sách khách hàng lấy từ master đối tác và filter theo vai trò CUSTOMER."
      icon={<Users className="h-4 w-4" />}
      tabs={[{ value: "customers", label: "Khách hàng" }]}
      activeTab="customers"
      onTabChange={() => {}}
    >
      <RoleFilteredPartnersTab
        role="CUSTOMER"
        roleLabel="khách hàng"
        title="Khách hàng"
        desc="Tạo mới/cập nhật khách hàng từ master đối tác."
      />
    </PageLayout>
  );
}

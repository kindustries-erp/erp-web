import { Building2, Users } from "lucide-react";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { Forbidden } from "@/pages/Forbidden";
import { BusinessPartnersListPage } from "@/modules/business-partners-core/components/BusinessPartnersListPage";

export function ErpBusinessPartnersPage({
  partnerType,
  title,
  desc,
}: {
  partnerType: "CUSTOMER" | "VENDOR";
  title: string;
  desc: string;
}) {
  const canRead = useHasPermission("business_partners", "read");

  if (!canRead) return <Forbidden />;

  const icon =
    partnerType === "VENDOR" ? (
      <Building2 className="h-4 w-4" />
    ) : (
      <Users className="h-4 w-4" />
    );

  return (
    <BusinessPartnersListPage
      partnerType={partnerType}
      title={title}
      desc={desc}
      icon={icon}
    />
  );
}

export function ErpCustomersPage() {
  return (
    <ErpBusinessPartnersPage
      partnerType="CUSTOMER"
      title="Khách hàng"
      desc="Tạo và quản lý khách hàng bằng business partner API core trên Neon."
    />
  );
}

export function ErpSuppliersPage() {
  return (
    <ErpBusinessPartnersPage
      partnerType="VENDOR"
      title="Nhà cung cấp"
      desc="Tạo và quản lý nhà cung cấp bằng business partner API core trên Neon."
    />
  );
}

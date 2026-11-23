import { Badge } from "@/v2/shared/ui";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { isBusinessPartnerInactive } from "../../../domain/rules/businessPartnerRules";

export interface BusinessPartnerStatusBadgeProps {
  status: string;
}

/** Nhãn trạng thái đối tác dùng chung giữa cột bảng và tiêu đề drawer */
export function BusinessPartnerStatusBadge({
  status,
}: BusinessPartnerStatusBadgeProps) {
  const { t } = useV2Translation();
  const inactive = isBusinessPartnerInactive(status);

  return (
    <Badge variant={inactive ? "secondary" : "default"}>
      {inactive
        ? t("v2.partners.status.inactive", "Ngưng hoạt động")
        : t("v2.partners.status.active", "Hoạt động")}
    </Badge>
  );
}

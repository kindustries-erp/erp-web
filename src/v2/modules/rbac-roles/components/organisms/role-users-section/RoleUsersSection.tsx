import { V2Badge, V2BadgeVariant } from "@/v2/shared/components/atoms/v2-badge";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
import { V2MultiSelect } from "@/v2/shared/components/molecules/v2-multi-select";
import { DrawerSection } from "@/v2/shared/components/molecules/v2-drawer-section";

export interface SystemUserOption {
  id: string;
  display: string;
  roleName: string | null;
}

interface RoleUsersSectionProps {
  viewing: boolean;
  loading: boolean;
  selectedUserIds: string[];
  allUsers: SystemUserOption[];
  onUsersChange: (ids: string[]) => void;
  t: (key: string, fallback?: string) => string;
}

export function RoleUsersSection({
  viewing,
  loading,
  selectedUserIds,
  allUsers,
  onUsersChange,
  t,
}: RoleUsersSectionProps) {
  const userOptions = allUsers.map((u) => ({
    value: u.id,
    label: u.roleName ? `${u.display} (${u.roleName})` : u.display,
  }));

  return (
    <DrawerSection
      title={t("v2.rbacRoles.tabs.users", "Người dùng được gán vai trò")}
      titleExtra={
        selectedUserIds.length > 0 ? (
          <V2Text variant="body-sm" color="muted" weight="medium">
            {selectedUserIds.length}{" "}
            {t("v2.rbacRoles.columns.users", "người dùng").toLowerCase()}
          </V2Text>
        ) : undefined
      }
    >
      {loading ? (
        <div className="h-9 w-full bg-muted/60 animate-pulse rounded-md" />
      ) : viewing ? (
        <div className="flex flex-wrap gap-1.5 min-h-[32px] items-center">
          {selectedUserIds.length > 0 ? (
            allUsers
              .filter((u) => selectedUserIds.includes(u.id))
              .map((u) => (
                <V2Badge
                  key={u.id}
                  variant={V2BadgeVariant.OUTLINE}
                  className="px-2.5 py-1 text-xs font-normal border-border bg-muted/60 dark:bg-muted/30 text-foreground"
                >
                  {u.display}
                </V2Badge>
              ))
          ) : (
            <V2Text variant="body-sm" color="muted" className="italic">
              {t("v2.rbacRoles.users.empty", "Chưa có người dùng nào được gán")}
            </V2Text>
          )}
        </div>
      ) : (
        <V2MultiSelect
          options={userOptions}
          value={selectedUserIds}
          onValueChange={onUsersChange}
          placeholder={t(
            "v2.rbacRoles.users.placeholder",
            "Chọn người dùng...",
          )}
          searchPlaceholder={t(
            "v2.rbacRoles.users.searchPlaceholder",
            "Tìm theo email hoặc tên...",
          )}
          emptyLabel={t(
            "v2.rbacRoles.users.emptyFound",
            "Không tìm thấy người dùng nào",
          )}
        />
      )}
    </DrawerSection>
  );
}

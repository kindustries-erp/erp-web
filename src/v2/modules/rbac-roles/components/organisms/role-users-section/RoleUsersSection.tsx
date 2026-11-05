import { Badge } from "@/v2/shared/ui";
import { MultiSelect } from "@/shared/components/MultiSelect";
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
          <span className="text-xs font-medium text-muted-foreground">
            {selectedUserIds.length}{" "}
            {t("v2.rbacRoles.columns.users", "người dùng").toLowerCase()}
          </span>
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
                <Badge
                  key={u.id}
                  variant="secondary"
                  className="px-2.5 py-0.5 text-xs font-normal"
                >
                  {u.display}
                </Badge>
              ))
          ) : (
            <span className="text-xs text-muted-foreground italic">
              {t("v2.rbacRoles.users.empty", "Chưa có người dùng nào được gán")}
            </span>
          )}
        </div>
      ) : (
        <MultiSelect
          options={userOptions}
          value={selectedUserIds}
          onChange={onUsersChange}
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

import { useState } from "react";
import { useAppStore } from "@/core/config/appStore";
import { useAuthStore } from "@/modules/auth/domain/authStore";
import { UserProfileModal } from "@/modules/auth/components/UserProfileModal";
import { GlobalSettingsDrawer } from "@/core/components/layout/GlobalSettingsDrawer";
import { SystemChangelogDrawer } from "@/core/components/SystemChangelogDrawer";
import { CompanyProfileDrawer } from "../../CompanyProfileDrawer";
import { useCompanyProfile } from "../../../api/companyProfileApi";
import type { PageKey } from "@/shared/types";
import { cn } from "@/shared/utils";
import { TooltipProvider } from "@/core/components/ui/Tooltip";
import { useT } from "@/core/i18n";

import { useFaviconEffect } from "./hooks/useFaviconEffect";
import { SidebarHeader } from "./components/SidebarHeader";
import { SidebarNav } from "./components/SidebarNav";
import { SidebarBottom } from "./components/SidebarBottom";

export function Sidebar() {
  const {
    currentPage,
    sidebarCollapsed,
    mobileSidebarOpen,
    navigate,
    toggleSidebar,
    setMobileSidebarOpen,
    companyProfileOpen,
    setCompanyProfileOpen,
  } = useAppStore();
  const { employee } = useAuthStore();
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [changelogOpen, setChangelogOpen] = useState(false);

  const { data: companyProfile } = useCompanyProfile();

  const t = useT();
  const appName = t("nav.appName");
  const displayName =
    employee?.full_name ?? employee?.email ?? t("nav.bottom.userFallback");
  const av = displayName
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((w: string) => w[0].toUpperCase())
    .join("");

  const navTo = (p: PageKey) => {
    navigate(p);
    setMobileSidebarOpen(false);
  };
  const c = mobileSidebarOpen ? false : sidebarCollapsed;

  useFaviconEffect(companyProfile, appName);

  return (
    <TooltipProvider>
      <>
        {mobileSidebarOpen && (
          <div
            className="mobile-sidebar-overlay fixed inset-0 bg-black/35 z-[299]"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        <aside
          className={cn(
            "sidebar",
            c && "collapsed",
            mobileSidebarOpen && "mobile-open",
          )}
        >
          <SidebarHeader
            c={c}
            sidebarCollapsed={sidebarCollapsed}
            hoverExpanded={false}
            toggleSidebar={toggleSidebar}
            setCompanyProfileOpen={setCompanyProfileOpen}
            companyProfile={companyProfile}
          />
          <SidebarNav c={c} currentPage={currentPage} navTo={navTo} />
          <SidebarBottom
            c={c}
            av={av}
            displayName={displayName}
            setProfileOpen={setProfileOpen}
            setSettingsOpen={setSettingsOpen}
            setChangelogOpen={setChangelogOpen}
          />
        </aside>
      </>
      <UserProfileModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
      />
      <GlobalSettingsDrawer
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
      <CompanyProfileDrawer
        open={companyProfileOpen}
        onClose={() => setCompanyProfileOpen(false)}
      />
      <SystemChangelogDrawer
        open={changelogOpen}
        onClose={() => setChangelogOpen(false)}
      />
    </TooltipProvider>
  );
}

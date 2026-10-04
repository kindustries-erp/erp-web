import { V2Dictionary } from "./vi";

export const v2En: V2Dictionary = {
  v2: {
    common: {
      close: "Close",
      save: "Save",
      cancel: "Cancel",
      loading: "Loading...",
      error: "An error occurred",
      actions: "Actions",
      overview: "Overview",
    },
    sidebar: {
      appName: "ERP",
      appSubtitle: "Enterprise Management System",
      collapse: "Collapse sidebar",
      expand: "Expand sidebar",
      notifications: "Notifications",
      userFallback: "Administrator",
      toggleSidebar: "Toggle sidebar",
    },
    topbar: {
      quickSearchPlaceholder: "Search menus, documents (Ctrl K)...",
      quickSearchShortcut: "Ctrl K",
      quickSearchAria: "Quick system search",
      languageSwitchAria: "Switch display language",
      selectLanguage: "Select language",
      branchLabel: "Branch",
      languageVi: "Tiếng Việt",
      languageEn: "English",
      mainBranch: "Main Branch",
    },
    tabBar: {
      ariaLabel: "Multi-task tab bar",
      closeTab: "Close tab {{name}}",
      closeTabShort: "Close tab",
    },
    welcome: {
      badgeReady: "V2 Platform Ready",
      heroTitle: "ERP V2 Application Shell",
      heroSubtitle:
        "Modern frontend architecture with Floating 2-Cards design, Shadcn UI Primitives, and zero-risk Dual-Run alongside V1.",
      exploreBtn: "Explore V2 Interface",
      backV1Btn: "Back to ERP V1",
      featuresTitle: "V2 Architectural Pillars",
      featureSplitTitle: "Automated Platform Split",
      featureSplitDesc:
        "Seamlessly switch dedicated interfaces tailored for Desktop and Mobile.",
      featureAtomicTitle: "5-Tier Atomic Design",
      featureAtomicDesc:
        "Strict modular hierarchy controlling file limits under 180 LoC.",
      featureDualRunTitle: "Parallel Dual-Run",
      featureDualRunDesc:
        "Runs independently at /v2/* preserving 100% stability of V1 system.",
      featureTestingTitle: "Co-located Testing",
      featureTestingDesc:
        "100% components backed by automated unit tests safeguarding quality.",
      badgeResponsive: "Responsive",
      badgeArchitecture: "Architecture",
      badgeStability: "Stability",
      badgeQuality: "Quality Gate",
    },
  },
};

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
      headerAriaLabel: "Drawer top navigation tabs",
      subAriaLabel: "Drawer sub navigation tabs",
      buttonGroupAriaLabel: "Button group tabs",
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
    modal: {
      close: "Close",
      defaultTitle: "Dialog",
      dragHandleAria: "Drag to close dialog",
    },
    confirmModal: {
      defaultTitle: "Confirm action",
      defaultConfirm: "Confirm",
      defaultCancel: "Cancel",
      processing: "Processing...",
    },
    drawer: {
      edit: "Edit",
      editMode: "Switch to edit mode",
      viewMode: "View mode",
      fullscreen: "Full screen",
      exitFullscreen: "Exit full screen",
      collapseRightPanel: "Collapse right panel",
      expandRightPanel: "Expand right panel",
      closeDrawer: "Close",
      closeConfirmTitle: "Confirm closing form",
      closeConfirmDesc:
        "The form is in edit mode. Are you sure you want to close and discard unsaved changes?",
      closeWithoutSaving: "Close without saving",
      continueEdit: "Continue editing",
      emptyTimeline: "No activity history yet",
      expandSection: "Expand section",
      collapseSection: "Collapse section",
      relatedInfo: "Related Information",
      expand: "Expand",
      collapse: "Collapse",
    },
    dropdown: {
      optionsTitle: "Action options",
    },
  },
};

import React from "react";
import type { Preview } from "@storybook/react";
import "@/v2/shared/styles/index.css";
import { applyV2Theme, type V2Theme } from "@/v2/shared/theme";
import { useAppStore } from "@/core/config/appStore";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      disable: true,
    },
    layout: "centered",
  },
  globalTypes: {
    theme: {
      name: "Theme",
      description: "Hệ thống Theme V2",
      defaultValue: "default",
      toolbar: {
        icon: "paintbrush",
        items: [
          { value: "default", title: "Mặc định (Light)" },
          { value: "classic", title: "Cổ điển (Classic)" },
          { value: "orcaq", title: "OrcaQ" },
          { value: "midnight", title: "Midnight (Dark)" },
        ],
        showName: true,
      },
    },
    locale: {
      name: "Locale",
      description: "Ngôn ngữ hiển thị V2",
      defaultValue: "vi",
      toolbar: {
        icon: "globe",
        items: [
          { value: "vi", title: "🇻🇳 Tiếng Việt" },
          { value: "en", title: "🇬🇧 English" },
        ],
        showName: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const selectedTheme = (context.globals.theme || "default") as V2Theme;
      const selectedLocale = (context.globals.locale || "vi") as "vi" | "en";

      // 1. Apply V2 Theme classes to document element
      applyV2Theme(selectedTheme);

      // 2. Sync Locale with V2 Store
      try {
        if (useAppStore.getState().locale !== selectedLocale) {
          useAppStore.getState().setLocale(selectedLocale);
        }
      } catch {
        // Safe fallback
      }

      return (
        <div className="v2-storybook-canvas w-full min-h-[120px] p-6 rounded-xl flex items-center justify-center bg-background text-foreground transition-colors duration-200">
          <Story />
        </div>
      );
    },
  ],
};

export default preview;

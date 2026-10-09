import type { StorybookConfig } from "@storybook/react-vite";
import path from "path";

const config: StorybookConfig = {
  stories: ["../src/v2/**/*.stories.@(js|jsx|mjs|ts|tsx)", "../src/v2/use-cases/**/*.mdx"],
  addons: ["@storybook/addon-essentials", "@storybook/addon-interactions"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  docs: {
    autodocs: "tag",
  },
  async viteFinal(viteConfig) {
    // Filter out VitePWA plugin in Storybook to avoid service worker caching
    const filteredPlugins = (viteConfig.plugins || []).filter((plugin: any) => {
      const name =
        plugin && typeof plugin === "object" && "name" in plugin
          ? plugin.name
          : "";
      return !name.includes("pwa");
    });

    return {
      ...viteConfig,
      plugins: filteredPlugins,
      resolve: {
        ...viteConfig.resolve,
        alias: {
          ...viteConfig.resolve?.alias,
          "@/v2": path.resolve(__dirname, "../src/v2"),
          "@": path.resolve(__dirname, "../src"),
        },
      },
    };
  },
};

export default config;

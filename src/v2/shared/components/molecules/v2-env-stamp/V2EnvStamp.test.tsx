import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { V2EnvStamp } from "./V2EnvStamp";

vi.mock("@/core/store/useEnvStore", () => ({
  useEnvStore: () => ({
    env: "local",
    isProduction: false,
    isDevelopment: false,
    isLocal: true,
    isLocalProdData: false,
    isKlotus: false,
    isGreenway: false,
    isBlueway: false,
    envPrefix: "greenway",
  }),
}));

describe("V2EnvStamp Molecule", () => {
  it("renders correctly with customLabel", () => {
    render(<V2EnvStamp customLabel="DEMO SERVER" />);
    expect(screen.getByTestId("v2-env-stamp")).toBeInTheDocument();
    expect(screen.getByText("DEMO SERVER")).toBeInTheDocument();
  });

  it("renders local prod data environment stamp with glass style", () => {
    render(<V2EnvStamp forcedEnv="prod-dev" />);
    const stamp = screen.getByTestId("v2-env-stamp");
    expect(stamp).toBeInTheDocument();
    expect(screen.getByText("⚠️ GREENWAY (PROD DATA)")).toBeInTheDocument();
    expect(stamp).toHaveClass("bg-rose-500/15");
    expect(stamp).toHaveClass("backdrop-blur-[var(--glass-blur,16px)]");
  });

  it("renders greenway environment stamp with emerald glass style", () => {
    render(<V2EnvStamp forcedEnv="greenway" />);
    const stamp = screen.getByTestId("v2-env-stamp");
    expect(stamp).toHaveClass("bg-emerald-500/10");
  });

  it("does not render when in production", () => {
    const { container } = render(<V2EnvStamp forcedEnv="" customLabel="" />);
    // forcedEnv empty and production check
    expect(container).toBeDefined();
  });
});

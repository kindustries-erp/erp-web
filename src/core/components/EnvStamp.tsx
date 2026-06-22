import React from "react";

export function EnvStamp() {
  const env = typeof __APP_ENV__ !== "undefined" ? __APP_ENV__ : "development";

  if (env === "production" || env === "klotus-production") {
    return null;
  }

  let text: string;
  if (env === "development") {
    text = "Development";
  } else if (env === "klotus-staging") {
    text = "Klotus Demo";
  } else if (env === "greenway-staging") {
    text = "Greenway Demo";
  } else {
    // Generic fallback: takes the first word before the dash and capitalizes it
    const parts = env.split("-");
    const name = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    text = `${name} Demo`;
  }

  return (
    <div className="fixed top-0 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none px-4 py-1.5 bg-amber-500/90 text-white text-xs font-bold uppercase tracking-widest backdrop-blur-md rounded-b-xl shadow-md border-b border-x border-amber-400/50 transition-all">
      {text}
    </div>
  );
}

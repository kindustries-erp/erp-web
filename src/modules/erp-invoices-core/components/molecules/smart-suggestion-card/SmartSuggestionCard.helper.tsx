import React from "react";

export function highlightText(
  text: string,
  patterns?: string | string[],
): React.ReactNode {
  if (!text || !patterns) return text;
  const list = (Array.isArray(patterns) ? patterns : [patterns]).filter(
    (p) => p && p.trim().length > 0,
  );
  if (list.length === 0) return text;

  const escaped = list.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const regex = new RegExp(`(${escaped.join("|")})`, "gi");
  const parts = text.split(regex);

  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark
        key={i}
        className="bg-amber-200 text-amber-900 rounded-sm px-0.5 not-italic dark:bg-amber-900/60 dark:text-amber-200"
      >
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

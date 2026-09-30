import React from "react";

export function RequiredIndicator({ isRequired }: { isRequired?: boolean }) {
  if (!isRequired) return null;
  return <span className="text-destructive font-bold ml-0.5">*</span>;
}

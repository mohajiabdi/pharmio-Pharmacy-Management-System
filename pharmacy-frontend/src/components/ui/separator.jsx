import * as React from "react";

export function Separator({ className = "", ...props }) {
  return (
    <div
      role="separator"
      className={`shrink-0 bg-border h-[1px] w-full ${className}`}
      {...props}
    />
  );
}

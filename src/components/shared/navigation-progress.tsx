"use client";

import { AppProgressBar } from "next-nprogress-bar";

export function NavigationProgress() {
  return (
    <AppProgressBar
      height="3px"
      color="#0ea5e9"
      options={{ showSpinner: false }}
      shallowRouting
    />
  );
}

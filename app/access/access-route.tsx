"use client";

import Home from "../page";
import AccessStateDemo from "./access-state-demo";
import type { DemoAccess } from "./demo-access";

const legacyProgressApiOrigin = "https://career-compass-2026.hresghi.chatgpt.site";

function progressApiOrigin() {
  if (typeof window !== "undefined" && window.location.hostname.includes(".edgeone.")) {
    return window.location.origin;
  }
  return legacyProgressApiOrigin;
}

export default function AccessRoute({ access }: { access: DemoAccess }) {
  if (access.status === "completed" || access.status === "revoked") {
    return <AccessStateDemo access={access} />;
  }

  return <Home accessToken={access.token} apiBaseUrl={progressApiOrigin()} />;
}

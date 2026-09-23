"use client";

import { usePathname } from "next/navigation";
import { AdminShell } from "./AdminShell";

type AdminFrameProps = {
  children: React.ReactNode;
  adminName?: string;
  adminRole?: string;
  initials?: string;
};

function activeTab(pathname: string): "profile" | "dashboard" | "users" | "facilities" | "home-care" | "payments" | "clinical-monitoring" | "ai-operations" | "notifications" | "support-management" | "roles" | "audit" | "settings" {
  if (pathname.startsWith("/profile")) {
    return "profile";
  }

  if (pathname.startsWith("/users")) {
    return "users";
  }

  if (pathname.startsWith("/facilities")) {
    return "facilities";
  }

  if (pathname.startsWith("/home-care")) {
    return "home-care";
  }

  if (pathname.startsWith("/payments")) {
    return "payments";
  }

  if (pathname.startsWith("/notifications")) {
    return "notifications";
  }

  if (pathname.startsWith("/ai-operations")) {
    return "ai-operations";
  }

  if (pathname.startsWith("/support-management")) {
    return "support-management";
  }

  if (pathname.startsWith("/settings")) {
    return "settings";
  }

  if (pathname.startsWith("/audit-logs")) {
    return "audit";
  }

  if (pathname.startsWith("/roles-permissions")) {
    return "roles";
  }
  if (pathname.startsWith("/clinical-monitoring")) {
    return "clinical-monitoring";
  }

  return "dashboard";
}

export function AdminFrame({ children, adminName, adminRole, initials }: AdminFrameProps) {
  const pathname = usePathname();

  return (
    <AdminShell active={activeTab(pathname)} adminName={adminName} adminRole={adminRole} initials={initials}>
      {children}
    </AdminShell>
  );
}

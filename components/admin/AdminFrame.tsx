"use client";

import { usePathname } from "next/navigation";
import { AdminShell } from "./AdminShell";

type AdminFrameProps = {
  children: React.ReactNode;
  adminName?: string;
  adminRole?: string;
  initials?: string;
};

function activeTab(pathname: string): "dashboard" | "users" | "facilities" {
  if (pathname.startsWith("/users")) {
    return "users";
  }

  if (pathname.startsWith("/facilities")) {
    return "facilities";
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

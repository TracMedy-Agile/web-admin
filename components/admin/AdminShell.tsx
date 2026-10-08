"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BellIcon,
  BotIcon,
  BuildingIcon,
  CardIcon,
  ChevronDownIcon,
  ClipboardIcon,
  DashboardIcon,
  HeartPulseIcon,
  HomeIcon,
  SearchIcon,
  SettingsIcon,
  ShieldIcon,
  UsersIcon,
} from "./AdminIcons";

type AdminTab = "profile" | "dashboard" | "users" | "facilities" | "home-care" | "payments" | "clinical-monitoring" | "ai-operations" | "notifications" | "support-management" | "roles" | "audit" | "settings";

type AdminShellProps = {
  children: React.ReactNode;
  active: AdminTab;
  adminName?: string;
  adminRole?: string;
  initials?: string;
};

const navItems = [
  { key: "dashboard", label: "Dashboard", href: "/dashboard", icon: DashboardIcon },
  { key: "users", label: "Users", href: "/users", icon: UsersIcon },
  { key: "facilities", label: "Facilities", href: "/facilities", icon: BuildingIcon },
  { key: "home-care", label: "Home Care Network", href: "/home-care", icon: HomeIcon },
  { key: "payments", label: "Payments", href: "/payments", icon: CardIcon },
  { key: "clinical-monitoring", label: "Clinical Monitoring", href: "/clinical-monitoring", icon: HeartPulseIcon },
  { key: "ai-operations", label: "AI Operations", href: "/ai-operations", icon: BotIcon },
  { key: "notifications", label: "Notifications", href: "/notifications", icon: BellIcon },
  { key: "support-management", label: "Support Management", href: "/support-management", icon: ClipboardIcon },
  { key: "roles", label: "Roles And Permissions", href: "/roles-permissions", icon: ShieldIcon },
  { key: "audit", label: "Audit Logs", href: "/audit-logs", icon: ClipboardIcon },
  { key: "settings", label: "Settings", href: "/settings", icon: SettingsIcon },
] as const;

const pageTitles: Record<AdminTab, string> = {
  profile: "Profile",
  dashboard: "Dashboard",
  users: "Users",
  facilities: "Facilities",
  "home-care": "Home Care Network",
  payments: "Payments",
  "clinical-monitoring": "Clinical Monitoring",
  "ai-operations": "AI Operations",
  notifications: "Notifications",
  "support-management": "Support Management",
  roles: "Roles & Permissions",
  audit: "Audit Logs",
  settings: "Settings",
};

export function AdminShell({ children, active, adminName = "Roland Richard", adminRole = "Super Admin", initials = "RR" }: AdminShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="flex h-screen overflow-hidden bg-admin-page text-admin-ink max-lg:flex-col">
      <aside className={["shrink-0 border-admin-border bg-white transition-[width] duration-200 lg:h-screen lg:border-r", collapsed ? "lg:w-[72px]" : "lg:w-[240px]"].join(" ")}>
        <div className={["flex h-[88px] items-center border-b border-admin-border lg:border-b-0", collapsed ? "justify-center px-2" : "justify-between px-4"].join(" ")}>
          <div className="flex items-center gap-3">
            <Image src="/tracmedy_logo.svg" alt="Tracmedy" width={30} height={30} priority className="h-[30px] w-[30px]" />
            {collapsed ? null : <span className="text-[14px] font-bold tracking-normal text-admin-blue">TRACMEDY</span>}
          </div>
          <button type="button" aria-label={collapsed ? "Expand navigation" : "Collapse navigation"} aria-expanded={!collapsed} title={collapsed ? "Expand navigation" : "Collapse navigation"} onClick={() => setCollapsed((value) => !value)} className={["grid h-8 w-8 place-items-center rounded-[6px] border border-admin-muted/50 text-admin-muted", collapsed ? "absolute inset-0 h-full w-full rounded-none border-0 opacity-0 focus:opacity-100" : ""].join(" ")}> 
            <span className={collapsed ? "hidden" : "h-4 w-[3px] rounded-full bg-current"} />
          </button>
        </div>

        <nav className="flex gap-1 overflow-x-auto px-3 py-4 lg:block lg:max-h-[calc(100vh-88px)] lg:space-y-2 lg:overflow-y-auto lg:px-0 lg:pt-7">
          {navItems.map((item) => {
            const Icon = item.icon;
            const selected = item.key === active;
            const className = [
              "relative flex h-[52px] shrink-0 items-center gap-3 text-[14px] font-medium tracking-normal transition lg:w-full",
              selected ? "bg-admin-sidebar-active text-admin-blue" : "text-admin-ink hover:bg-admin-soft",
            ].join(" ");

            const linkClassName = [className, collapsed ? "justify-center px-0" : "px-4"].join(" ");

            return (
              <Link key={item.key} href={item.href} aria-current={selected ? "page" : undefined} title={collapsed ? item.label : undefined} className={linkClassName}>
                {selected ? <span className="absolute left-0 top-0 hidden h-full w-1 bg-admin-blue lg:block" /> : null}
                <Icon className="h-6 w-6 shrink-0" />
                {collapsed ? null : <span className="whitespace-nowrap">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex min-h-[88px] items-center justify-between gap-5 border-b border-admin-border bg-white px-6 lg:px-8">
          <h1 className="text-[20px] font-semibold tracking-normal text-admin-ink">{pageTitles[active]}</h1>
          <div className="flex flex-1 items-center justify-end gap-6">
            <label className="relative hidden w-full max-w-[350px] lg:block">
              <span className="sr-only">Search</span>
              <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-admin-neutral" />
              <input className="h-[50px] w-full rounded-[8px] border border-admin-muted/60 bg-white pl-11 pr-4 text-[13px] text-admin-ink outline-none placeholder:text-admin-neutral focus:border-admin-blue focus:ring-4 focus:ring-admin-blue/10" placeholder="Search patients, alerts..." />
            </label>
            <button type="button" aria-label="Notifications" className="grid h-11 w-11 place-items-center rounded-full bg-admin-blue-soft text-admin-blue">
              <BellIcon className="h-5 w-5" />
            </button>
            <Link href="/profile" className="flex items-center gap-3 rounded-[8px] px-2 py-1.5 hover:bg-admin-soft" aria-label="Open admin profile">
              <div className="grid h-11 w-11 place-items-center rounded-full bg-admin-blue text-[15px] font-bold text-white">{initials}</div>
              <div className="hidden sm:block">
                <p className="text-[13px] font-semibold leading-5 text-admin-ink">{adminName}</p>
                <p className="text-[12px] leading-5 text-admin-muted">{adminRole}</p>
              </div>
              <ChevronDownIcon className="h-5 w-5 text-admin-ink" />
            </Link>
          </div>
        </header>

        <div className="admin-compact min-h-0 flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}




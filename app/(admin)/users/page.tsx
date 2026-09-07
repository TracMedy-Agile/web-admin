import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  BanIcon,
  CalendarIcon,
  CardIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
  DownloadIcon,
  EditIcon,
  EyeActionIcon,
  IdIcon,
  MailSmallIcon,
  PhoneIcon,
  SearchIcon,
  UserCheckIcon,
  UsersIcon,
  UserXIcon,
} from "@/components/admin/AdminIcons";
import { getAdminOverview, getAdminSessionToken, getAdminUserDetail, getAdminUsersList, getAdminUsersSummary, updateAdminUserStatus } from "@/lib/server/admin-overview";

type UsersPageProps = {
  searchParams: Promise<{ user?: string; state?: string; page?: string; pageSize?: string; search?: string; status?: string; dateFrom?: string; dateTo?: string }>;
};

type UserRow = {
  id: string;
  initials?: string;
  avatarUrl?: string;
  name: string;
  email: string;
  status: "Active" | "Suspended" | "Inactive" | "Pending" | "Locked";
  plan: "PLUS" | "FREE";
  dateJoined: string;
  lastActivity: string;
  phone: string;
  allowedActions: string[];
  billingCycle: string;
  lastPayment: string;
  nextBillingDate: string;
};


function formatCount(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

function statusClass(status: UserRow["status"]): string {
  if (status === "Active") {
    return "bg-admin-green-soft text-admin-success";
  }

  if (status === "Suspended") {
    return "bg-admin-red-soft text-admin-red";
  }

  if (status === "Pending" || status === "Locked") {
    return "bg-admin-neutral-soft text-admin-muted";
  }

  return "bg-admin-neutral-soft text-admin-muted";
}

function normalizeUserStatus(value: string): UserRow["status"] {
  if (value === "active") {
    return "Active";
  }

  if (value === "suspended") {
    return "Suspended";
  }

  if (value === "locked") {
    return "Locked";
  }

  if (value === "pending") {
    return "Pending";
  }

  return "Inactive";
}

function normalizePlan(value: string): UserRow["plan"] {
  return value.toUpperCase() === "PLUS" ? "PLUS" : "FREE";
}

function userRowsFromApi(rows: Array<{ id: string; fullName: string; email: string; status: string; plan: string; dateJoined: string; lastActivityLabel: string; allowedActions: string[] }>): UserRow[] {
  return rows.map((row) => ({
    id: row.id,
    name: row.fullName,
    email: row.email,
    status: normalizeUserStatus(row.status),
    plan: normalizePlan(row.plan),
    dateJoined: row.dateJoined,
    lastActivity: row.lastActivityLabel,
    phone: "--",
    allowedActions: row.allowedActions,
    billingCycle: "--",
    lastPayment: "--",
    nextBillingDate: "--",
  }));
}

function userRowFromDetail(detail: { id: string; initials: string; avatarUrl: string; fullName: string; email: string; status: string; plan: string; dateJoined: string; lastLoginLabel: string; phoneNumber: string | null; allowedActions: string[]; billingCycle: string | null; lastPaymentDate: string | null; nextBillingDate: string | null }): UserRow {
  return {
    id: detail.id,
    initials: detail.initials,
    avatarUrl: detail.avatarUrl,
    name: detail.fullName,
    email: detail.email,
    status: normalizeUserStatus(detail.status),
    plan: normalizePlan(detail.plan),
    dateJoined: detail.dateJoined,
    lastActivity: detail.lastLoginLabel,
    phone: detail.phoneNumber ?? "--",
    allowedActions: detail.allowedActions,
    billingCycle: detail.billingCycle ?? "--",
    lastPayment: detail.lastPaymentDate ?? "--",
    nextBillingDate: detail.nextBillingDate ?? "--",
  };
}

function statusActionFromForm(value: FormDataEntryValue | null): "activate" | "suspend" | null {
  return value === "activate" || value === "suspend" ? value : null;
}

async function changeUserStatusAction(formData: FormData): Promise<void> {
  "use server";

  const userId = formData.get("userId");
  const action = statusActionFromForm(formData.get("action"));
  if (typeof userId !== "string" || !userId.trim() || !action) {
    return;
  }

  const token = await getAdminSessionToken();
  if (!token) {
    redirect("/login");
  }

  await updateAdminUserStatus(token, userId, action);
  revalidatePath("/users");
}

function StatusActionButton({ user, action }: { user: UserRow; action: "activate" | "suspend" }) {
  const isSuspend = action === "suspend";
  return (
    <form action={changeUserStatusAction}>
      <input type="hidden" name="userId" value={user.id} />
      <input type="hidden" name="action" value={action} />
      <button type="submit" aria-label={(isSuspend ? "Suspend " : "Activate ") + user.name} className={isSuspend ? "text-admin-red" : "text-admin-success"}>
        {isSuspend ? <BanIcon className="h-5 w-5" /> : <UserCheckIcon className="h-5 w-5" />}
      </button>
    </form>
  );
}

function trendLabel(trendPercent: number | null | undefined, deltaLabel?: string | null): string {
  if (deltaLabel) {
    return deltaLabel;
  }

  if (typeof trendPercent === "number" && Number.isFinite(trendPercent)) {
    return (trendPercent >= 0 ? "+" : "") + trendPercent.toFixed(1) + "%";
  }

  return "No Data";
}

function MetricCard({ title, value, trend, icon, tone }: { title: string; value: string; trend: string; icon: React.ReactNode; tone: "blue" | "green" | "red" | "gray" }) {
  const toneClass = {
    blue: "bg-admin-blue-soft text-admin-blue",
    green: "bg-admin-green-soft text-admin-success",
    red: "bg-admin-red-soft text-admin-red",
    gray: "bg-admin-blue-soft text-admin-blue",
  }[tone];
  const trendClass = trend.includes("-") ? "bg-admin-red-soft text-admin-red" : trend === "0%" || trend === "No Data" ? "bg-admin-neutral-soft text-admin-neutral" : "bg-admin-green-soft text-admin-success";

  return (
    <article className="admin-panel-shadow rounded-[8px] border border-admin-border bg-white px-6 py-6">
      <div className={["grid h-12 w-12 place-items-center rounded-[10px]", toneClass].join(" ")}>{icon}</div>
      <div className="mt-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-admin-ink/80">{title}</p>
          <p className="mt-2 text-[24px] font-bold tracking-normal text-admin-ink">{value}</p>
        </div>
        <span className={["rounded-full px-3 py-1 text-[13px] font-bold", trendClass].join(" ")}>{trend}</span>
      </div>
    </article>
  );
}

function SubscriptionOverview({ empty, plusUsers, freeUsers, subscriberGrowthPercent }: { empty: boolean; plusUsers: number; freeUsers: number; subscriberGrowthPercent: number }) {
  const totalSubscribers = plusUsers + freeUsers;
  const plusPercent = totalSubscribers > 0 ? Math.round((plusUsers / totalSubscribers) * 100) : 0;
  const freePercent = totalSubscribers > 0 ? 100 - plusPercent : 0;
  const growthLabel = (subscriberGrowthPercent >= 0 ? "+" : "") + subscriberGrowthPercent.toFixed(1) + "%";
  return (
    <section className="admin-panel-shadow rounded-[10px] border border-admin-border bg-white px-6 py-8">
      <h3 className="text-[15px] font-bold uppercase tracking-[0.04em] text-admin-ink">Subscription Overview</h3>
      <div className="mt-8 flex flex-col gap-10 lg:flex-row lg:items-center">
        <div className="grid h-[118px] w-[118px] place-items-center rounded-full p-[15px]" style={{ background: empty ? "var(--color-admin-disabled)" : "conic-gradient(var(--color-admin-blue) 0 " + plusPercent + "%, var(--color-admin-disabled) " + plusPercent + "% 100%)" }}>
          <div className="grid h-full w-full place-items-center rounded-full bg-white text-center">
            <div>
              <p className="text-[18px] font-bold text-admin-blue">{empty ? "0" : formatCount(totalSubscribers)}</p>
              <p className="text-[9px] font-bold uppercase text-admin-muted">Total</p>
            </div>
          </div>
        </div>
        <div className="grid flex-1 gap-8 md:grid-cols-2">
          <div className="flex items-center gap-4">
            <span className="h-3 w-3 rounded-full bg-admin-blue" />
            <div>
              <p className="text-[13px] font-medium text-admin-muted">Tracmedy Plus</p>
              <p className="text-[16px] font-bold text-admin-ink">{empty ? "0" : formatCount(plusUsers)} <span className="text-[12px] font-medium text-admin-muted">({empty ? 0 : plusPercent}%)</span></p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="h-3 w-3 rounded-full bg-admin-disabled" />
            <div>
              <p className="text-[13px] font-medium text-admin-muted">Tracmedy Free</p>
              <p className="text-[16px] font-bold text-admin-ink">{empty ? "0" : formatCount(freeUsers)} <span className="text-[12px] font-medium text-admin-muted">({empty ? 0 : freePercent}%)</span></p>
            </div>
          </div>
          {!empty ? <p className="border-t border-admin-border pt-3 text-[12px] italic text-admin-muted md:col-span-2">Monthly subscriber growth: {growthLabel} since last quarter.</p> : null}
        </div>
      </div>
    </section>
  );
}

function UsersFilters({ search, status, exportHref }: { search: string; status: string; exportHref: string }) {
  return (
    <form action="/users" className="flex flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-4">
      <div className="grid gap-4 md:grid-cols-[326px_120px_120px_150px]">
        <label className="relative">
          <span className="sr-only">Search users</span>
          <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-admin-muted" />
          <input name="search" defaultValue={search} className="h-9 w-full rounded-[7px] border border-admin-border bg-white pl-12 pr-3 text-[14px] text-admin-ink outline-none placeholder:text-admin-muted focus:border-admin-blue" placeholder="Search by name, email, or ID..." />
        </label>
        <select name="status" aria-label="Filter by status" defaultValue={status} className="h-9 rounded-[7px] border border-admin-border bg-white px-3 text-[14px] text-admin-muted outline-none focus:border-admin-blue">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="locked">Locked</option>
          <option value="suspended">Suspended</option>
        </select>
        <select aria-label="Filter by plan" className="h-9 rounded-[7px] border border-admin-border bg-white px-3 text-[14px] text-admin-muted outline-none focus:border-admin-blue">
          <option>All Plans</option>
        </select>
        <button type="button" className="flex h-9 items-center justify-between rounded-[7px] border border-admin-border bg-white px-3 text-[14px] text-admin-muted">
          <span>Date Range</span>
          <CalendarIcon className="h-4 w-4" />
        </button>
      </div>
      <a href={exportHref} className="flex h-9 items-center gap-2 px-3 text-[14px] font-medium text-admin-ink">
        <DownloadIcon className="h-5 w-5" />
        Export
      </a>
    </form>
  );
}

function UsersTable({ users, totalItems, page, pageSize, totalPages, search, status, exportHref }: { users: UserRow[]; totalItems: number; page: number; pageSize: number; totalPages: number; search: string; status: string; exportHref: string }) {
  const empty = users.length === 0;
  const firstItem = totalItems > 0 ? (page - 1) * pageSize + 1 : 0;
  const lastItem = totalItems > 0 ? Math.min(firstItem + users.length - 1, totalItems) : 0;
  const pageItems = Array.from({ length: Math.min(totalPages, 3) }, (_, index) => index + 1);

  return (
    <section className="bg-white">
      <UsersFilters search={search} status={status} exportHref={exportHref} />
      {empty ? (
        <div className="grid min-h-[410px] place-items-center border-t border-admin-border px-6 text-center">
          <div className="max-w-[370px]">
            <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-admin-neutral-soft text-admin-neutral">
              <UserXIcon className="h-12 w-12" />
            </div>
            <h3 className="mt-7 text-[22px] font-bold text-admin-ink">No Users Yet</h3>
            <p className="mt-3 text-[16px] leading-6 text-admin-ink/80">
              There are no registered app users yet. Once users create an account, they will appear here for you to manage and monitor.
            </p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto px-4">
          <table className="w-full min-w-[980px] border-collapse text-left">
            <thead className="bg-admin-table-head text-[12px] font-bold uppercase tracking-normal text-admin-ink/80">
              <tr>
                <th className="px-6 py-5">User ID</th>
                <th className="px-6 py-5">Patient Name</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5">Plan</th>
                <th className="px-6 py-5">Date Joined</th>
                <th className="px-6 py-5">Last Activity</th>
                <th className="px-6 py-5">Action</th>
              </tr>
            </thead>
            <tbody className="text-[14px] text-admin-ink">
              {users.map((user) => (
                <tr key={user.id} className="border-b border-admin-border/70 last:border-b-0">
                  <td className="px-6 py-4 font-medium text-admin-text/85">{user.id}</td>
                  <td className="px-6 py-4">
                    <p className="font-semibold">{user.name}</p>
                    <p className="mt-0.5 text-[12px] text-admin-muted">{user.email}</p>
                  </td>
                  <td className="px-6 py-4"><span className={["rounded-full px-3 py-1.5 text-[12px] font-medium", statusClass(user.status)].join(" ")}>{user.status}</span></td>
                  <td className="px-6 py-4 font-medium text-admin-text/90">{user.plan}</td>
                  <td className="px-6 py-4 text-admin-text/90">{user.dateJoined}</td>
                  <td className="px-6 py-4 text-admin-text/90">{user.lastActivity}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      {user.allowedActions.includes("view") ? <Link href={{ pathname: "/users", query: { user: user.id } }} aria-label={"View " + user.name} className="text-admin-blue"><EyeActionIcon className="h-5 w-5" /></Link> : null}
                      {user.allowedActions.includes("activate") ? <StatusActionButton user={user} action="activate" /> : null}
                      {user.allowedActions.includes("suspend") ? <StatusActionButton user={user} action="suspend" /> : null}
                      {user.allowedActions.includes("deactivate") ? <button type="button" aria-label={"Deactivate " + user.name} className="text-admin-neutral"><UserXIcon className="h-5 w-5" /></button> : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <footer className="flex min-h-[64px] items-center justify-between border-t border-admin-border px-4 text-[14px] text-admin-muted">
        <span>{empty ? "Showing 0 of 0 Users" : "Showing " + firstItem + "-" + lastItem + " of " + totalItems + " Users"}</span>
        {!empty ? (
          <div className="flex items-center gap-3 text-admin-ink">
            <Link href={{ pathname: "/users", query: { search, status, page: Math.max(page - 1, 1).toString() } }} aria-label="Previous page" className="grid h-8 w-8 place-items-center rounded-[7px] border border-admin-border text-admin-neutral"><ChevronLeftIcon className="h-4 w-4" /></Link>
            {pageItems.map((pageNumber) => pageNumber === page ? <span key={pageNumber} className="grid h-8 w-8 place-items-center rounded-[7px] bg-admin-blue font-bold text-white">{pageNumber}</span> : <Link key={pageNumber} href={{ pathname: "/users", query: { search, status, page: pageNumber.toString() } }}>{pageNumber}</Link>)}
            {totalPages > 4 ? <span>...</span> : null}
            {totalPages > 3 ? (totalPages === page ? <span className="grid h-8 w-8 place-items-center rounded-[7px] bg-admin-blue font-bold text-white">{totalPages}</span> : <Link href={{ pathname: "/users", query: { search, status, page: totalPages.toString() } }}>{totalPages}</Link>) : null}
            <Link href={{ pathname: "/users", query: { search, status, page: Math.min(page + 1, totalPages).toString() } }} aria-label="Next page" className="grid h-8 w-8 place-items-center rounded-[7px] border border-admin-blue text-admin-blue"><ChevronRightIcon className="h-4 w-4" /></Link>
          </div>
        ) : null}
      </footer>
    </section>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex min-h-[68px] items-center gap-4 border-b border-admin-border px-4 last:border-b-0">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-[8px] bg-admin-soft text-admin-muted">{icon}</div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.05em] text-admin-muted">{label}</p>
        <p className="mt-1 text-[15px] font-medium text-admin-text">{value}</p>
      </div>
    </div>
  );
}

function UserProfileDrawer({ user }: { user: UserRow }) {
  const initials = user.initials ?? user.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  const drawerAction = user.allowedActions.includes("suspend") ? "suspend" : user.allowedActions.includes("activate") ? "activate" : null;
  const drawerButtonClass = drawerAction === "activate" ? "border-admin-success bg-admin-success" : "border-[#f04444] bg-[#f04444]";

  return (
    <div className="fixed inset-0 z-50 bg-admin-overlay backdrop-blur-[3px]">
      <aside className="ml-auto flex h-dvh w-full max-w-[600px] flex-col bg-white shadow-2xl">
        <header className="flex h-[104px] items-center justify-between border-b border-admin-border px-8">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-admin-blue text-[20px] font-bold text-white">{initials}</div>
            <div>
              <h2 className="text-[22px] font-bold text-admin-ink">{user.name}</h2>
              <div className="mt-2 flex gap-2">
                <span className={["rounded-full px-3 py-1 text-[12px] font-medium", statusClass(user.status)].join(" ")}>{user.status}</span>
                <span className="rounded-full border border-admin-blue bg-admin-blue-soft px-3 py-1 text-[12px] font-bold text-admin-blue">{user.plan}</span>
              </div>
            </div>
          </div>
          <Link href="/users" aria-label="Close profile" className="text-admin-text"><CloseIcon className="h-7 w-7" /></Link>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-8 py-8">
          <section>
            <h3 className="text-[13px] font-bold uppercase tracking-[0.12em] text-admin-muted">User Information</h3>
            <div className="mt-4 overflow-hidden rounded-[8px] border border-admin-border">
              <DetailRow icon={<IdIcon className="h-5 w-5" />} label="User ID" value={user.id} />
              <DetailRow icon={<MailSmallIcon className="h-5 w-5" />} label="Email Address" value={user.email} />
              <DetailRow icon={<PhoneIcon className="h-5 w-5" />} label="Phone Number" value={user.phone} />
              <DetailRow icon={<UsersIcon className="h-5 w-5" />} label="Account Status" value={user.status} />
            </div>
          </section>

          <section className="mt-7">
            <h3 className="text-[13px] font-bold uppercase tracking-[0.12em] text-admin-muted">Subscription Details</h3>
            <div className="mt-4 overflow-hidden rounded-[8px] border border-admin-border">
              <DetailRow icon={<CardIcon className="h-5 w-5" />} label="Plan" value={user.plan === "PLUS" ? "Plus" : "Free"} />
              <div className="grid border-b border-admin-border md:grid-cols-2">
                <DetailRow icon={<CalendarIcon className="h-5 w-5" />} label="Last Payment" value={user.lastPayment} />
                <DetailRow icon={<CalendarIcon className="h-5 w-5" />} label="Next Billing Date" value={user.nextBillingDate} />
              </div>
              <DetailRow icon={<CalendarIcon className="h-5 w-5" />} label="Billing Cycle" value={user.billingCycle} />
            </div>
          </section>

          <section className="mt-7">
            <h3 className="text-[13px] font-bold uppercase tracking-[0.12em] text-admin-muted">Account Details</h3>
            <div className="mt-4 overflow-hidden rounded-[8px] border border-admin-border">
              <DetailRow icon={<CalendarIcon className="h-5 w-5" />} label="Date Joined" value={user.dateJoined} />
              <DetailRow icon={<CalendarIcon className="h-5 w-5" />} label="Last Login" value={user.lastActivity} />
            </div>
          </section>
        </div>

        <footer className="sticky bottom-0 z-10 grid grid-cols-2 gap-4 border-t border-admin-border bg-white px-9 py-5">
          <button type="button" className="flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-[8px] border border-admin-blue text-[16px] font-bold text-admin-blue"><EditIcon className="h-5 w-5" />Edit</button>
          {drawerAction ? (
            <form action={changeUserStatusAction}>
              <input type="hidden" name="userId" value={user.id} />
              <input type="hidden" name="action" value={drawerAction} />
              <button type="submit" className={["flex h-12 w-full items-center justify-center gap-2 whitespace-nowrap rounded-[8px] border text-[16px] font-bold text-white", drawerButtonClass].join(" ")}>{drawerAction === "suspend" ? <BanIcon className="h-5 w-5" /> : <UserCheckIcon className="h-5 w-5" />}{drawerAction === "suspend" ? "Suspend User" : "Activate User"}</button>
            </form>
          ) : null}
        </footer>
      </aside>
    </div>
  );
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const token = await getAdminSessionToken();
  if (!token) {
    redirect("/login");
  }

  const params = await searchParams;
  const query = { page: params.page, pageSize: params.pageSize, search: params.search, status: params.status, dateFrom: params.dateFrom, dateTo: params.dateTo };
  const [overview, usersSummary, usersList, userDetail] = await Promise.all([getAdminOverview(token), getAdminUsersSummary(token), getAdminUsersList(token, query), params.user ? getAdminUserDetail(token, params.user) : Promise.resolve(null)]);
  const showingProfile = Boolean(params.user);
  const empty = params.state === "empty";
  const users = empty ? [] : usersList ? userRowsFromApi(usersList.items) : [];
  const selectedUser = showingProfile && userDetail ? userRowFromDetail(userDetail) : null;
  const totalUsers = empty ? 0 : usersSummary?.totalUsers ?? overview?.summary?.totalUsers?.value ?? 0;
  const activeUsers = empty ? 0 : usersSummary?.activeUsers ?? 0;
  const suspendedUsers = empty ? 0 : usersSummary?.suspendedUsers ?? 0;
  const inactiveUsers = empty ? 0 : usersSummary?.inactiveUsers ?? 0;
  const plusUsers = empty ? 0 : usersSummary?.plusUsers ?? 0;
  const freeUsers = empty ? 0 : usersSummary?.freeUsers ?? 0;
  const subscriberGrowthPercent = empty ? 0 : usersSummary?.subscriberGrowthPercent ?? 0;
  const totalUsersTrend = empty ? "No Data" : trendLabel(overview?.summary?.totalUsers?.trendPercent, overview?.summary?.totalUsers?.deltaLabel);
  const currentPage = usersList?.page ?? 1;
  const pageSize = usersList?.pageSize ?? Math.max(users.length, 1);
  const totalPages = usersList?.totalPages ?? 1;
  const totalItems = empty ? 0 : usersList?.totalItems ?? users.length;
  const exportParams = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (typeof value === "string" && value.trim()) {
      exportParams.set(key, value);
    }
  }
  const exportHref = "/api/admin/users/export" + (exportParams.toString() ? "?" + exportParams.toString() : "");

  return (
    <>
      <main className="px-6 py-7 lg:px-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h2 className="text-[26px] font-bold tracking-normal text-admin-ink">Users</h2>
            <p className="mt-2 text-[16px] font-medium text-admin-muted">Manage all registered users</p>
          </div>
          <a href={exportHref} className="flex h-12 items-center gap-2 rounded-[10px] bg-admin-blue px-5 text-[16px] font-bold text-white">
            <DownloadIcon className="h-5 w-5" />
            Export
          </a>
        </div>

        <section className="mt-7 grid gap-4 lg:grid-cols-4">
          <MetricCard title="Total Users" value={formatCount(totalUsers)} trend={totalUsersTrend} icon={<UsersIcon className="h-8 w-8" />} tone="blue" />
          <MetricCard title="Active Users" value={formatCount(activeUsers)} trend="No Data" icon={<UserCheckIcon className="h-8 w-8" />} tone="green" />
          <MetricCard title="Suspended" value={formatCount(suspendedUsers)} trend="No Data" icon={<BanIcon className="h-8 w-8" />} tone="red" />
          <MetricCard title="Inactive" value={formatCount(inactiveUsers)} trend="No Data" icon={<UserXIcon className="h-8 w-8" />} tone="gray" />
        </section>

        <div className="mt-8">
          <SubscriptionOverview empty={empty} plusUsers={plusUsers} freeUsers={freeUsers} subscriberGrowthPercent={subscriberGrowthPercent} />
        </div>

        <div className="mt-8 overflow-hidden rounded-[10px] bg-white">
          <UsersTable users={users} totalItems={totalItems} page={currentPage} pageSize={pageSize} totalPages={totalPages} search={params.search ?? ""} status={params.status ?? ""} exportHref={exportHref} />
        </div>
      </main>

      {selectedUser ? <UserProfileDrawer user={selectedUser} /> : null}
    </>
  );
}

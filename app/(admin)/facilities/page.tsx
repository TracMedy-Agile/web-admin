import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  BanIcon,
  BriefcaseIcon,
  BuildingIcon,
  CalendarIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
  DownloadIcon,
  EditIcon,
  EyeActionIcon,
  IdIcon,
  MailSmallIcon,
  MapPinIcon,
  PhoneIcon,
  PlusIcon,
  ReceiptIcon,
  SearchIcon,
  UsersIcon,
  WalletIcon,
} from "@/components/admin/AdminIcons";
import { getAdminFacilitiesList, getAdminFacilitiesSummary, getAdminFacilityDetail, getAdminSessionToken, registerAdminFacility, updateAdminFacilityStatus } from "@/lib/server/admin-overview";

type FacilitiesPageProps = {
  searchParams: Promise<{ state?: string; register?: string; facility?: string; suspend?: string; payments?: string; page?: string; pageSize?: string; search?: string; status?: string; dateFrom?: string; dateTo?: string }>;
};

type FacilityStatus = "Active" | "Suspended" | "Inactive";
type PaymentStatus = "Successful" | "Pending" | "Processing" | "Finding Provider" | "Reversed";

type FacilityRow = {
  id: string;
  tracId: string;
  hospital: string;
  email: string;
  location: string;
  status: FacilityStatus;
  dateRegistered: string;
};

type FacilityDetail = {
  id: string;
  initials: string;
  name: string;
  status: FacilityStatus;
  tracId: string;
  email: string;
  phone: string;
  address: string;
  hospitalType: string;
  connectedPatients: string;
  contactName: string;
  contactRole: string;
  contactEmail: string;
  contactPhone: string;
  subscriptionStart: string;
  nextBillingDate: string;
  subscriptionStatus: string;
  payments: Array<{ amount: string; date: string; status: string }>;
  allowedActions: string[];
};

type TransactionRow = {
  id: string;
  purpose: string;
  amount: string;
  dueDate: string;
  nextBillingDate: string;
  status: PaymentStatus;
};

const naira = "\u20a6";

function formatCount(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

function normalizeFacilityStatus(value: string): FacilityStatus {
  if (value === "active") {
    return "Active";
  }

  if (value === "suspended") {
    return "Suspended";
  }

  return "Inactive";
}

function formatDateLabel(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(date);
}

function facilityRowsFromApi(rows: Array<{ id: string; tracId: string; facilityName: string; email: string | null; locationLabel: string | null; status: string; dateRegistered: string; allowedActions: string[] }>): FacilityRow[] {
  return rows.map((row) => ({
    id: row.id,
    tracId: row.tracId,
    hospital: row.facilityName,
    email: row.email ?? "--",
    location: row.locationLabel ?? "--",
    status: normalizeFacilityStatus(row.status),
    dateRegistered: formatDateLabel(row.dateRegistered),
  }));
}
const paymentTransactions: TransactionRow[] = [
  { id: "TRC-TXN- 10045", purpose: "License Fee", amount: naira + "50,000", dueDate: "5 Sep, 2026", nextBillingDate: "1 Sep, 2026", status: "Successful" },
  { id: "TRC-TXN- 10046", purpose: "License Fee", amount: naira + "50,000", dueDate: "5 Sep, 2026", nextBillingDate: "1 Sep, 2026", status: "Successful" },
  { id: "TRC-TXN- 10047", purpose: "3 Care Episodes", amount: naira + "15,000", dueDate: "5 Sep, 2026", nextBillingDate: "1 Sep, 2026", status: "Successful" },
  { id: "TRC-TXN- 10048", purpose: "License Fee", amount: naira + "50,000", dueDate: "5 Sep, 2026", nextBillingDate: "1 Sep, 2026", status: "Pending" },
  { id: "TRC-TXN- 10049", purpose: "License Fee", amount: naira + "50,000", dueDate: "5 Aug, 2026", nextBillingDate: "5 Sep, 2026", status: "Successful" },
  { id: "TRC-TXN- 10050", purpose: "License Fee", amount: naira + "50,000", dueDate: "5 Aug, 2026", nextBillingDate: "5 Sep, 2026", status: "Processing" },
  { id: "TRC-TXN- 10051", purpose: "License Fee", amount: naira + "50,000", dueDate: "5 Jul, 2026", nextBillingDate: "5 Aug, 2026", status: "Pending" },
  { id: "TRC-TXN- 10052", purpose: "License Fee", amount: naira + "50,000", dueDate: "5 Jul, 2026", nextBillingDate: "5 Aug, 2026", status: "Finding Provider" },
  { id: "TRC-TXN- 10054", purpose: "5 Care Episodes", amount: naira + "25,000", dueDate: "5 Jul, 2026", nextBillingDate: "5 Aug, 2026", status: "Reversed" },
];

function valueOrPlaceholder(value: string | null): string {
  return value && value.trim() ? value : "--";
}

function labelFromApiValue(value: string | null): string {
  if (!value || !value.trim()) {
    return "--";
  }

  return value
    .split(/[_-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function optionalDateLabel(value: string | null): string {
  return value ? formatDateLabel(value) : "--";
}

function facilityDetailFromApi(detail: {
  id: string;
  tracId: string;
  initials: string;
  facilityName: string;
  email: string | null;
  phoneNumber: string | null;
  address: string | null;
  hospitalType: string;
  connectedPatientsCount: number;
  status: string;
  contactPerson: { name: string | null; role: string | null; email: string | null; phoneNumber: string | null };
  subscription: { startDate: string | null; nextBillingDate: string | null; status: string | null };
  recentPayments: { entries: Array<{ amount: string; date: string; status: string }> };
  allowedActions: string[];
}): FacilityDetail {
  return {
    id: detail.id,
    initials: detail.initials,
    name: detail.facilityName,
    status: normalizeFacilityStatus(detail.status),
    tracId: detail.tracId,
    email: valueOrPlaceholder(detail.email),
    phone: valueOrPlaceholder(detail.phoneNumber),
    address: valueOrPlaceholder(detail.address),
    hospitalType: labelFromApiValue(detail.hospitalType),
    connectedPatients: formatCount(detail.connectedPatientsCount),
    contactName: valueOrPlaceholder(detail.contactPerson.name),
    contactRole: valueOrPlaceholder(detail.contactPerson.role),
    contactEmail: valueOrPlaceholder(detail.contactPerson.email),
    contactPhone: valueOrPlaceholder(detail.contactPerson.phoneNumber),
    subscriptionStart: optionalDateLabel(detail.subscription.startDate),
    nextBillingDate: optionalDateLabel(detail.subscription.nextBillingDate),
    subscriptionStatus: labelFromApiValue(detail.subscription.status),
    payments: detail.recentPayments.entries.map((payment) => ({
      amount: payment.amount,
      date: formatDateLabel(payment.date),
      status: labelFromApiValue(payment.status),
    })),
    allowedActions: detail.allowedActions,
  };
}
function optionalFormString(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function facilityTypeFromForm(value: FormDataEntryValue | null): "hospital" | "clinic" | "pharmacy" | "laboratory" | "nursing_home" | undefined {
  return value === "hospital" || value === "clinic" || value === "pharmacy" || value === "laboratory" || value === "nursing_home" ? value : undefined;
}

function statusActionFromForm(value: FormDataEntryValue | null): "activate" | "suspend" | null {
  return value === "activate" || value === "suspend" ? value : null;
}

async function changeFacilityStatusAction(formData: FormData): Promise<void> {
  "use server";

  const facilityId = formData.get("facilityId");
  const action = statusActionFromForm(formData.get("action"));
  if (typeof facilityId !== "string" || !facilityId.trim() || !action) {
    return;
  }

  const token = await getAdminSessionToken();
  if (!token) {
    redirect("/login");
  }

  const result = await updateAdminFacilityStatus(token, facilityId, action);
  if (!result) {
    redirect("/facilities?facility=" + encodeURIComponent(facilityId));
  }

  revalidatePath("/facilities");
  redirect("/facilities?facility=" + encodeURIComponent(facilityId));
}

async function registerFacilityAction(formData: FormData): Promise<void> {
  "use server";

  const name = optionalFormString(formData, "name");
  if (!name) {
    return;
  }

  const token = await getAdminSessionToken();
  if (!token) {
    redirect("/login");
  }

  const result = await registerAdminFacility(token, {
    name,
    email: optionalFormString(formData, "email"),
    phoneNumber: optionalFormString(formData, "phoneNumber"),
    address: optionalFormString(formData, "address"),
    type: facilityTypeFromForm(formData.get("type")),
  });

  if (!result) {
    redirect("/facilities?register=1");
  }

  revalidatePath("/facilities");
  redirect("/facilities");
}

function exportHref(search: string, status: string): string {
  const params = new URLSearchParams();
  if (search.trim()) {
    params.set("search", search);
  }
  if (status.trim()) {
    params.set("status", status);
  }

  const query = params.toString();
  return "/api/admin/facilities/export" + (query ? "?" + query : "");
}
function statusClass(status: FacilityStatus): string {
  if (status === "Active") {
    return "bg-admin-green-soft text-admin-success";
  }

  if (status === "Suspended") {
    return "bg-admin-red-soft text-admin-red";
  }

  return "bg-admin-neutral-soft text-admin-muted";
}

function paymentStatusClass(status: PaymentStatus): string {
  if (status === "Successful" || status === "Finding Provider") {
    return "bg-admin-green-soft text-admin-success";
  }

  if (status === "Processing") {
    return "bg-admin-blue-soft text-admin-blue";
  }

  if (status === "Pending") {
    return "bg-[#fff3df] text-[#ff9b05]";
  }

  return "bg-admin-neutral-soft text-admin-text/80";
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="admin-panel-shadow grid min-h-[104px] place-items-center rounded-[8px] border border-admin-border bg-white px-5 py-5 text-center">
      <div>
        <p className="text-[26px] font-bold leading-8 text-admin-ink">{value}</p>
        <p className="mt-2 text-[11px] font-medium uppercase tracking-normal text-admin-muted">{label}</p>
      </div>
    </article>
  );
}

function PaymentMetricCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <article className="admin-panel-shadow min-h-[166px] rounded-[10px] border border-admin-border bg-white px-6 py-6">
      <div className="grid h-12 w-12 place-items-center rounded-[10px] bg-admin-blue-soft text-admin-blue">{icon}</div>
      <p className="mt-5 text-[12px] font-bold uppercase tracking-[0.05em] text-admin-text/90">{label}</p>
      <p className="mt-2 text-[26px] font-bold leading-8 text-admin-ink">{value}</p>
    </article>
  );
}

function pageQuery(search: string, status: string, page: number): Record<string, string> {
  const query: Record<string, string> = { page: page.toString() };
  if (search.trim()) {
    query.search = search;
  }
  if (status.trim()) {
    query.status = status;
  }
  return query;
}

function FacilitiesFilters({ search, status, exportUrl }: { search: string; status: string; exportUrl: string }) {
  return (
    <form action="/facilities" className="flex flex-col gap-4 px-4 py-4 xl:flex-row xl:items-center xl:justify-between">
      <div className="grid gap-4 md:grid-cols-[326px_120px_120px_150px]">
        <label className="relative">
          <span className="sr-only">Search facilities</span>
          <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-admin-muted" />
          <input name="search" defaultValue={search} className="h-9 w-full rounded-[7px] border border-admin-border bg-white pl-12 pr-3 text-[14px] text-admin-ink outline-none placeholder:text-admin-muted focus:border-admin-blue" placeholder="Search by name, email, or ID..." />
        </label>
        <select name="status" aria-label="Filter by status" defaultValue={status} className="h-9 rounded-[7px] border border-admin-border bg-white px-3 text-[14px] text-admin-muted outline-none focus:border-admin-blue">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="inactive">Inactive</option>
        </select>
        <button type="button" className="flex h-9 items-center justify-between rounded-[7px] border border-admin-border bg-white px-3 text-[14px] text-admin-muted">
          <span>All Plans</span>
          <ChevronDownIcon className="h-4 w-4" />
        </button>
        <button type="button" className="flex h-9 items-center justify-between rounded-[7px] border border-admin-border bg-white px-3 text-[14px] text-admin-muted">
          <span>Date Range</span>
          <CalendarIcon className="h-4 w-4" />
        </button>
      </div>
      <button type="submit" className="sr-only">Apply filters</button>
      <a href={exportUrl} className="flex h-9 items-center gap-2 px-3 text-[14px] font-medium text-admin-ink">
        <DownloadIcon className="h-5 w-5" />
        Export
      </a>
    </form>
  );
}

function FacilitiesTable({ facilities, totalItems, page, pageSize, totalPages, search, status, exportUrl }: { facilities: FacilityRow[]; totalItems: number; page: number; pageSize: number; totalPages: number; search: string; status: string; exportUrl: string }) {
  const empty = facilities.length === 0;
  const firstItem = totalItems > 0 ? (page - 1) * pageSize + 1 : 0;
  const lastItem = totalItems > 0 ? Math.min(firstItem + facilities.length - 1, totalItems) : 0;
  const pageItems = Array.from({ length: Math.min(Math.max(totalPages, 1), 3) }, (_, index) => index + 1);

  return (
    <section className="overflow-hidden rounded-[10px] bg-white">
      <FacilitiesFilters search={search} status={status} exportUrl={exportUrl} />
      {empty ? (
        <div className="grid min-h-[417px] place-items-center px-6 pb-10 pt-8 text-center">
          <div className="max-w-[520px]">
            <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-admin-neutral-soft text-admin-neutral">
              <BuildingIcon className="h-12 w-12" />
            </div>
            <h3 className="mt-7 text-[22px] font-bold text-admin-ink">No Facilities Yet</h3>
            <p className="mx-auto mt-3 max-w-[500px] text-[16px] leading-6 text-admin-text/90">
              There are no registered healthcare facilities yet. Once you register a facility, they&apos;ll appear here for you to manage and monitor.
            </p>
            <Link href="/facilities?register=1" className="mx-auto mt-7 flex h-12 w-fit items-center gap-2 rounded-[10px] bg-admin-blue px-5 text-[16px] font-bold text-white">
              <PlusIcon className="h-5 w-5" />
              Register Facility
            </Link>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto px-4">
          <table className="w-full min-w-[980px] border-collapse text-left">
            <thead className="bg-admin-table-head text-[12px] font-medium uppercase tracking-normal text-admin-text/90">
              <tr>
                <th className="px-6 py-5">Trac ID</th>
                <th className="px-6 py-5">Hospital</th>
                <th className="px-6 py-5">Location</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5">Date Registered</th>
                <th className="px-6 py-5">Action</th>
              </tr>
            </thead>
            <tbody className="text-[14px] text-admin-text/90">
              {facilities.map((facility) => (
                <tr key={facility.id} className="border-b border-admin-border/55 last:border-b-0">
                  <td className="px-6 py-3.5 font-medium">{facility.tracId}</td>
                  <td className="px-6 py-3.5">
                    <p className="font-semibold text-admin-ink">{facility.hospital}</p>
                    <p className="mt-0.5 text-[12px] text-admin-muted">{facility.email}</p>
                  </td>
                  <td className="whitespace-pre-line px-6 py-3.5 leading-5">{facility.location}</td>
                  <td className="px-6 py-3.5">
                    <span className={["rounded-full px-3 py-1.5 text-[12px] font-medium", statusClass(facility.status)].join(" ")}>{facility.status}</span>
                  </td>
                  <td className="px-6 py-3.5">{facility.dateRegistered}</td>
                  <td className="px-6 py-3.5">
                    <Link href={{ pathname: "/facilities", query: { facility: facility.id } }} className="inline-flex items-center gap-2 font-semibold text-admin-blue" aria-label={"View " + facility.hospital + " profile"}>
                      <EyeActionIcon className="h-5 w-5" />
                      View Profile
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!empty ? (
        <footer className="flex min-h-[64px] items-center justify-between border-t border-admin-border px-4 text-[14px] text-admin-muted">
          <span>{"Showing " + firstItem + "-" + lastItem + " of " + totalItems + " Facilities"}</span>
          <div className="flex items-center gap-3 text-admin-ink">
            <Link href={{ pathname: "/facilities", query: pageQuery(search, status, Math.max(page - 1, 1)) }} aria-label="Previous page" className="grid h-8 w-8 place-items-center rounded-[7px] border border-admin-border text-admin-neutral"><ChevronLeftIcon className="h-4 w-4" /></Link>
            {pageItems.map((pageNumber) => pageNumber === page ? <span key={pageNumber} className="grid h-8 w-8 place-items-center rounded-[7px] bg-admin-blue font-bold text-white">{pageNumber}</span> : <Link key={pageNumber} href={{ pathname: "/facilities", query: pageQuery(search, status, pageNumber) }}>{pageNumber}</Link>)}
            {totalPages > 4 ? <span>...</span> : null}
            {totalPages > 3 ? (totalPages === page ? <span className="grid h-8 w-8 place-items-center rounded-[7px] bg-admin-blue font-bold text-white">{totalPages}</span> : <Link href={{ pathname: "/facilities", query: pageQuery(search, status, totalPages) }}>{totalPages}</Link>) : null}
            <Link href={{ pathname: "/facilities", query: pageQuery(search, status, Math.min(page + 1, totalPages)) }} aria-label="Next page" className="grid h-8 w-8 place-items-center rounded-[7px] border border-admin-blue text-admin-blue"><ChevronRightIcon className="h-4 w-4" /></Link>
          </div>
        </footer>
      ) : null}
    </section>
  );
}
function Field({ label, placeholder, name, wide = false }: { label: string; placeholder: string; name?: string; wide?: boolean }) {
  return (
    <label className={wide ? "md:col-span-2" : undefined}>
      <span className="text-[14px] font-bold tracking-normal text-admin-ink">{label}</span>
      <input name={name} required={name === "name"} className="mt-3 h-12 w-full rounded-[7px] border border-admin-muted/45 bg-white px-4 text-[14px] text-admin-ink outline-none placeholder:text-admin-neutral focus:border-admin-blue" placeholder={placeholder} />
    </label>
  );
}

function SelectField({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <label>
      <span className="text-[14px] font-bold tracking-normal text-admin-ink">{label}</span>
      <span className="mt-3 flex h-12 items-center justify-between rounded-[7px] border border-admin-muted/45 bg-white px-4 text-[14px] text-admin-text">
        {placeholder}
        <ChevronDownIcon className="h-4 w-4 text-admin-muted" />
      </span>
    </label>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-[18px] font-bold uppercase tracking-[0.08em] text-admin-blue">{children}</h3>;
}

function RegisterFacilityModal() {
  const services = ["General Practice", "Pharmacy", "Laboratory", "Radiology", "Specialist Care"];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-admin-overlay px-5 py-[60px] backdrop-blur-[3px]">
      <form action={registerFacilityAction} className="mx-auto flex min-h-[1040px] w-full max-w-[896px] flex-col overflow-hidden rounded-[12px] bg-white shadow-2xl">
        <header className="flex min-h-[90px] items-center justify-between bg-admin-field px-8">
          <h2 className="text-[22px] font-bold text-admin-ink">Register Facility</h2>
          <Link href="/facilities" aria-label="Close registration form" className="text-admin-text"><CloseIcon className="h-6 w-6" /></Link>
        </header>

        <div className="flex-1 px-8 py-6">
          <SectionTitle>Basic Information</SectionTitle>
          <div className="mt-4 grid gap-x-4 gap-y-3 md:grid-cols-2">
            <Field name="name" label="Hospital Name" placeholder="Kaiser Hospital" />
            <Field name="email" label="Hospital Email Address" placeholder="admin@hospital.com" />
            <Field name="phoneNumber" label="Phone Number" placeholder="+234 800 000 0000" />
            <Field name="address" label="Hospital Address" placeholder="43 Crescent Avenue, Gbagada, Lagos" />
            <Field label="City" placeholder="Lagos" />
            <Field label="State" placeholder="Lagos" />
            <Field label="Country" placeholder="Nigeria" wide />
          </div>

          <div className="mt-8">
            <SectionTitle>Contact Person</SectionTitle>
            <div className="mt-4 grid gap-x-4 gap-y-3 md:grid-cols-2">
              <Field label="Contact Person Name" placeholder="Dr. Jane Doe" />
              <SelectField label="Role" placeholder="Select role" />
              <Field label="Contact Email" placeholder="contact@hospital.com" />
              <Field label="Contact Phone Number" placeholder="+234 800 000 0000" />
            </div>
          </div>

          <div className="mt-8">
            <SectionTitle>Hospital Details</SectionTitle>
            <div className="mt-4 grid gap-x-4 gap-y-3 md:grid-cols-2">
              <input type="hidden" name="type" value="hospital" />
              <SelectField label="Hospital Type" placeholder="Select type" />
              <SelectField label="Hospital Size" placeholder="Select size" />
              <Field label="Number of Branches" placeholder="1" />
              <Field label="Label Text" placeholder="Text Area" />
            </div>
          </div>

          <div className="mt-8">
            <SectionTitle>Services Offered</SectionTitle>
            <div className="mt-4 grid gap-2 md:grid-cols-4">
              {services.map((service) => (
                <label key={service} className="flex h-[43px] items-center gap-2 rounded-[7px] border border-admin-muted/45 px-3 text-[12px] font-medium text-admin-ink">
                  <input type="checkbox" className="h-4 w-4 rounded border-admin-muted/60 accent-admin-blue" />
                  {service}
                </label>
              ))}
            </div>
          </div>
        </div>

        <footer className="flex min-h-[82px] items-center justify-end gap-8 border-t border-admin-border bg-admin-field px-6">
          <Link href="/facilities" className="text-[14px] font-bold text-admin-text">Cancel</Link>
          <button type="submit" className="h-12 rounded-[10px] bg-admin-blue px-6 text-[16px] font-bold text-white">Register Facility</button>
        </footer>
      </form>
    </div>
  );
}

function DetailItem({ icon, label, value, pill }: { icon: React.ReactNode; label: string; value: string; pill?: boolean }) {
  return (
    <div className="flex min-h-[67px] items-center gap-4 border-b border-admin-border px-4 last:border-b-0">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-[8px] bg-admin-soft text-admin-muted">{icon}</div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.04em] text-admin-muted">{label}</p>
        {pill ? <span className={["mt-1 inline-flex rounded-full px-3 py-1 text-[12px] font-medium", statusClass(value as FacilityStatus)].join(" ")}>{value}</span> : <p className="mt-1 text-[15px] font-medium text-admin-ink">{value}</p>}
      </div>
    </div>
  );
}

function DetailsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-7 first:mt-0">
      <h3 className="text-[13px] font-bold uppercase tracking-[0.12em] text-admin-muted">{title}</h3>
      <div className="mt-4 overflow-hidden rounded-[8px] border border-admin-border bg-white">{children}</div>
    </section>
  );
}

function FacilityDetailsDrawer({ facility, suspended }: { facility: FacilityDetail; suspended?: boolean }) {
  const drawerAction = facility.allowedActions.includes("suspend") ? "suspend" : facility.allowedActions.includes("activate") ? "activate" : null;

  return (
    <div className="fixed inset-0 z-50 bg-admin-overlay backdrop-blur-[3px]">
      <aside className="ml-auto flex h-dvh w-full max-w-[600px] flex-col bg-white shadow-2xl">
        <header className="flex min-h-[104px] items-center justify-between border-b border-admin-border px-8">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-admin-blue text-[20px] font-bold text-white">{facility.initials}</div>
            <div>
              <h2 className="text-[22px] font-bold text-admin-ink">{facility.name}</h2>
              <span className={["mt-2 inline-flex rounded-full px-3 py-1 text-[12px] font-medium", statusClass(facility.status)].join(" ")}>{facility.status}</span>
            </div>
          </div>
          <Link href="/facilities" aria-label="Close facility details" className="text-admin-text"><CloseIcon className="h-7 w-7" /></Link>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-8 py-8">
          <DetailsSection title="Hospital Information">
            <DetailItem icon={<IdIcon className="h-5 w-5" />} label="Trac ID" value={facility.tracId} />
            <DetailItem icon={<MailSmallIcon className="h-5 w-5" />} label="Email" value={facility.email} />
            <DetailItem icon={<PhoneIcon className="h-5 w-5" />} label="Phone Number" value={facility.phone} />
            <DetailItem icon={<MapPinIcon className="h-5 w-5" />} label="Address" value={facility.address} />
            <DetailItem icon={<BuildingIcon className="h-5 w-5" />} label="Hospital Type" value={facility.hospitalType} />
            <DetailItem icon={<UsersIcon className="h-5 w-5" />} label="Connected Patients" value={facility.connectedPatients} />
            <DetailItem icon={<UsersIcon className="h-5 w-5" />} label="Status" value={facility.status} pill />
          </DetailsSection>

          <DetailsSection title="Contact Person">
            <DetailItem icon={<UsersIcon className="h-5 w-5" />} label="Name" value={facility.contactName} />
            <DetailItem icon={<BriefcaseIcon className="h-5 w-5" />} label="Role" value={facility.contactRole} />
            <DetailItem icon={<MailSmallIcon className="h-5 w-5" />} label="Email" value={facility.contactEmail} />
            <DetailItem icon={<PhoneIcon className="h-5 w-5" />} label="Phone Number" value={facility.contactPhone} />
          </DetailsSection>

          <DetailsSection title="Subscription Details">
            <DetailItem icon={<CalendarIcon className="h-5 w-5" />} label="Start Date" value={facility.subscriptionStart} />
            <DetailItem icon={<CalendarIcon className="h-5 w-5" />} label="Next Billing Date" value={facility.nextBillingDate} />
            <DetailItem icon={<UsersIcon className="h-5 w-5" />} label="Status" value={facility.subscriptionStatus} />
          </DetailsSection>

          <section className="mt-7">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-[13px] font-bold uppercase tracking-[0.12em] text-admin-muted">Payment History</h3>
              <Link href="/facilities?payments=1" className="flex items-center gap-2 text-[13px] font-bold text-admin-blue">View all <ChevronRightIcon className="h-4 w-4" /></Link>
            </div>
            <div className="mt-4 overflow-hidden rounded-[8px] border border-admin-border bg-white">
              {facility.payments.length > 0 ? facility.payments.map((payment) => (
                <div key={payment.date + payment.amount} className="flex min-h-[69px] items-center justify-between border-b border-admin-border px-4 last:border-b-0">
                  <div>
                    <p className="text-[14px] font-bold text-admin-ink">{payment.amount}</p>
                    <p className="mt-1 text-[12px] text-admin-muted">{payment.date}</p>
                  </div>
                  <span className="rounded-full bg-admin-green-soft px-3 py-1 text-[12px] font-medium text-admin-success">{payment.status}</span>
                </div>
              )) : <p className="px-4 py-5 text-[14px] font-medium text-admin-muted">No payments yet</p>}
            </div>
          </section>
        </div>

        <footer className="sticky bottom-0 z-10 grid grid-cols-2 gap-4 border-t border-admin-border bg-white px-9 py-6">
          <button type="button" className="flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-[8px] border border-admin-blue text-[16px] font-bold text-admin-blue"><EditIcon className="h-5 w-5" />Edit</button>
          {drawerAction === "suspend" ? (
            <Link href={{ pathname: "/facilities", query: { facility: facility.id, suspend: "1" } }} className="flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-[8px] border border-[#f04444] bg-[#f04444] text-[16px] font-bold text-white"><BanIcon className="h-5 w-5" />Suspend Facility</Link>
          ) : null}
          {drawerAction === "activate" ? (
            <form action={changeFacilityStatusAction}>
              <input type="hidden" name="facilityId" value={facility.id} />
              <input type="hidden" name="action" value="activate" />
              <button type="submit" className="flex h-12 w-full items-center justify-center gap-2 whitespace-nowrap rounded-[8px] border border-admin-success bg-admin-success text-[16px] font-bold text-white"><UsersIcon className="h-5 w-5" />Activate Facility</button>
            </form>
          ) : null}
        </footer>
      </aside>
      {suspended ? <SuspendFacilityModal facility={facility} /> : null}
    </div>
  );
}

function SuspendFacilityModal({ facility }: { facility: FacilityDetail }) {
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-admin-overlay px-5 backdrop-blur-[2px]">
      <form action={changeFacilityStatusAction} className="w-full max-w-[520px] overflow-hidden rounded-[10px] bg-white shadow-2xl">
        <input type="hidden" name="facilityId" value={facility.id} />
        <input type="hidden" name="action" value="suspend" />
        <header className="flex min-h-[88px] items-center justify-between px-8">
          <h2 className="text-[22px] font-bold text-admin-ink">Suspend This Facility?</h2>
          <Link href={{ pathname: "/facilities", query: { facility: facility.id } }} aria-label="Close suspend facility modal" className="text-admin-text"><CloseIcon className="h-6 w-6" /></Link>
        </header>
        <div className="px-8 pb-10">
          <p className="max-w-[410px] text-[16px] leading-7 text-admin-muted">
            {facility.name} will be suspended and lose access to the platform until reactivated. This action can be reversed later.
          </p>
        </div>
        <footer className="flex min-h-[82px] items-center justify-end gap-8 border-t border-admin-border bg-admin-field px-6">
          <Link href={{ pathname: "/facilities", query: { facility: facility.id } }} className="text-[14px] font-bold text-admin-text">Cancel</Link>
          <button type="submit" className="h-12 rounded-[10px] bg-[#f04444] px-6 text-[16px] font-bold text-white">Suspend Facility</button>
        </footer>
      </form>
    </div>
  );
}

function PaymentHistoryPage() {
  const filters = ["All Time", "7 Days", "30 Days", "Custom"];

  return (
    <main className="px-6 py-7 lg:px-8">
      <nav className="flex items-center gap-2 text-[13px] font-bold text-admin-text/85">
        <BuildingIcon className="h-4 w-4 text-admin-muted" />
        <Link href="/facilities" className="text-admin-text/85">Facilities</Link>
        <ChevronRightIcon className="h-4 w-4 text-admin-muted" />
        <Link href="/facilities?facility=TRC-001" className="text-admin-text/85">Kaiser Hospital</Link>
        <ChevronRightIcon className="h-4 w-4 text-admin-muted" />
        <span className="text-admin-ink">Payment History</span>
      </nav>

      <section className="mt-7 flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex items-start gap-5">
          <Link href="/facilities?facility=TRC-001" aria-label="Back to Kaiser Hospital" className="mt-1 grid h-10 w-10 place-items-center rounded-full border border-admin-border text-admin-text">
            <ChevronLeftIcon className="h-6 w-6" />
          </Link>
          <div>
            <h2 className="text-[26px] font-bold text-admin-ink">Payment History</h2>
            <p className="mt-3 text-[16px] text-admin-text/90">View all subscription and Care Episode payments for <strong>Kaiser Hospital.</strong></p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-6">
          <div className="grid h-9 grid-cols-4 rounded-[7px] bg-admin-blue-soft p-1 text-[13px] font-bold text-admin-ink">
            {filters.map((filter) => (
              <button key={filter} type="button" className={filter === "30 Days" ? "rounded-[6px] bg-white px-5 text-admin-blue" : "px-5"}>{filter}</button>
            ))}
          </div>
          <button type="button" className="flex h-12 items-center gap-2 rounded-[10px] bg-admin-blue px-5 text-[16px] font-bold text-white">
            <DownloadIcon className="h-5 w-5" />
            Export
          </button>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <PaymentMetricCard icon={<ReceiptIcon className="h-8 w-8" />} label="Total Transactions" value="30" />
        <PaymentMetricCard icon={<BriefcaseIcon className="h-8 w-8" />} label="Paid Care Episodes" value="18" />
        <PaymentMetricCard icon={<WalletIcon className="h-8 w-8" />} label="Care Episode Revenue" value={naira + "90,000"} />
        <PaymentMetricCard icon={<WalletIcon className="h-8 w-8" />} label="Subscription Revenue" value={naira + "750,000"} />
        <PaymentMetricCard icon={<CardStackIcon />} label="Total Revenue" value={naira + "840,000"} />
      </section>

      <section className="mt-8 overflow-hidden rounded-[10px] bg-white px-6 pt-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <label className="relative w-full max-w-[520px]">
            <span className="sr-only">Search transactions</span>
            <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-admin-muted" />
            <input className="h-9 w-full rounded-[7px] border border-admin-border bg-white pl-12 pr-3 text-[14px] text-admin-ink outline-none placeholder:text-admin-muted focus:border-admin-blue" placeholder="Search By Transaction ID, Gateway Reference Facility or Request ID..." />
          </label>
          <div className="grid gap-4 md:grid-cols-3">
            {["All Status", "All Category", "Payment Method"].map((label) => (
              <button key={label} type="button" className="flex h-9 min-w-[116px] items-center justify-between gap-4 rounded-[7px] border border-admin-border bg-white px-3 text-[14px] text-admin-muted">
                {label}
                <ChevronDownIcon className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[1040px] border-collapse text-left">
            <thead className="bg-admin-table-head text-[12px] font-medium uppercase tracking-normal text-admin-text/90">
              <tr>
                <th className="px-3 py-5">Transaction ID</th>
                <th className="px-3 py-5">Plan / Purpose</th>
                <th className="px-3 py-5">Amount</th>
                <th className="px-3 py-5">Due Date</th>
                <th className="px-3 py-5">Next Billing Date</th>
                <th className="px-3 py-5">Status</th>
                <th className="px-3 py-5">Action</th>
              </tr>
            </thead>
            <tbody className="text-[14px] text-admin-text/90">
              {paymentTransactions.map((transaction) => (
                <tr key={transaction.id} className="border-b border-admin-border/35 last:border-b-0">
                  <td className="px-3 py-[22px]">{transaction.id}</td>
                  <td className="px-3 py-[22px] text-admin-ink">{transaction.purpose}</td>
                  <td className="px-3 py-[22px]">{transaction.amount}</td>
                  <td className="px-3 py-[22px]">{transaction.dueDate}</td>
                  <td className="px-3 py-[22px]">{transaction.nextBillingDate}</td>
                  <td className="px-3 py-[22px]"><span className={["rounded-full px-3 py-1.5 text-[12px] font-medium", paymentStatusClass(transaction.status)].join(" ")}>{transaction.status}</span></td>
                  <td className="px-3 py-[22px]"><button type="button" className="inline-flex items-center gap-2 font-semibold text-admin-blue"><EyeActionIcon className="h-5 w-5" />View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <footer className="flex min-h-[64px] items-center justify-between border-t border-admin-border text-[14px] text-admin-muted">
          <span>Showing 1-10 of 72 Transactions</span>
          <div className="flex items-center gap-3 text-admin-ink">
            <button type="button" aria-label="Previous page" className="grid h-8 w-8 place-items-center rounded-[7px] border border-admin-border text-admin-neutral"><ChevronLeftIcon className="h-4 w-4" /></button>
            <span className="grid h-8 w-8 place-items-center rounded-[7px] bg-admin-blue font-bold text-white">1</span>
            <span>2</span>
            <span>3</span>
            <span>...</span>
            <span>29</span>
            <button type="button" aria-label="Next page" className="grid h-8 w-8 place-items-center rounded-[7px] border border-admin-blue text-admin-blue"><ChevronRightIcon className="h-4 w-4" /></button>
          </div>
        </footer>
      </section>
    </main>
  );
}

function CardStackIcon() {
  return (
    <span className="relative grid h-8 w-8 place-items-center text-admin-blue">
      <WalletIcon className="absolute left-0 top-1 h-6 w-6" />
      <WalletIcon className="absolute bottom-1 right-0 h-6 w-6" />
    </span>
  );
}

function FacilitiesOverviewPage({ empty, facilities, summary, page, pageSize, totalItems, totalPages, search, status, exportUrl }: { empty: boolean; facilities: FacilityRow[]; summary: { total: number; active: number; suspended: number; inactive: number }; page: number; pageSize: number; totalItems: number; totalPages: number; search: string; status: string; exportUrl: string }) {
  const visibleFacilities = empty ? [] : facilities;
  const visibleSummary = empty ? { total: 0, active: 0, suspended: 0, inactive: 0 } : summary;

  return (
    <main className="px-6 py-7 lg:px-8">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-[26px] font-bold tracking-normal text-admin-ink">Facilities</h2>
          <p className="mt-2 text-[16px] font-medium text-admin-muted">Register and manage healthcare facilities</p>
        </div>
        <div className="flex flex-wrap gap-6">
          <a href={exportUrl} className="flex h-12 items-center gap-2 rounded-[10px] bg-admin-blue px-5 text-[16px] font-bold text-white">
            <DownloadIcon className="h-5 w-5" />
            Export
          </a>
          <Link href="/facilities?register=1" className="flex h-12 items-center gap-2 rounded-[10px] bg-admin-blue px-5 text-[16px] font-bold text-white">
            <PlusIcon className="h-5 w-5" />
            Register Facility
          </Link>
        </div>
      </div>

      <section className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Total Facilities" value={formatCount(visibleSummary.total)} />
        <SummaryCard label="Active Facilities" value={formatCount(visibleSummary.active)} />
        <SummaryCard label="Suspended Facilities" value={formatCount(visibleSummary.suspended)} />
        <SummaryCard label="Inactive Facilities" value={formatCount(visibleSummary.inactive)} />
      </section>

      <div className="mt-8">
        <FacilitiesTable facilities={visibleFacilities} totalItems={empty ? 0 : totalItems} page={page} pageSize={pageSize} totalPages={totalPages} search={search} status={status} exportUrl={exportUrl} />
      </div>
    </main>
  );
}
export default async function FacilitiesPage({ searchParams }: FacilitiesPageProps) {
  const token = await getAdminSessionToken();
  if (!token) {
    redirect("/login");
  }

  const params = await searchParams;
  const empty = params.state === "empty";
  const showRegister = params.register === "1";
  const showDetails = Boolean(params.facility);
  const showSuspend = params.suspend === "1";
  const showPayments = params.payments === "1";

  if (showPayments) {
    return <PaymentHistoryPage />;
  }

  const query = { page: params.page, pageSize: params.pageSize, search: params.search, status: params.status, dateFrom: params.dateFrom, dateTo: params.dateTo };
  const [summary, facilitiesList, facilityDetail] = empty ? [null, null, null] : await Promise.all([
    getAdminFacilitiesSummary(token),
    getAdminFacilitiesList(token, query),
    params.facility ? getAdminFacilityDetail(token, params.facility) : Promise.resolve(null),
  ]);
  const facilitiesExportHref = exportHref(params.search ?? "", params.status ?? "");
  const facilities = facilitiesList ? facilityRowsFromApi(facilitiesList.items) : [];
  const selectedFacility = showDetails && facilityDetail ? facilityDetailFromApi(facilityDetail) : null;
  const currentPage = facilitiesList?.page ?? 1;
  const pageSize = facilitiesList?.pageSize ?? Math.max(facilities.length, 1);
  const totalItems = facilitiesList?.totalItems ?? facilities.length;
  const totalPages = facilitiesList?.totalPages ?? 1;

  return (
    <>
      <FacilitiesOverviewPage
        empty={empty}
        facilities={facilities}
        summary={summary ?? { total: 0, active: 0, suspended: 0, inactive: 0 }}
        page={currentPage}
        pageSize={pageSize}
        totalItems={totalItems}
        totalPages={totalPages}
        search={params.search ?? ""}
        status={params.status ?? ""}
        exportUrl={facilitiesExportHref}
      />
      {showRegister ? <RegisterFacilityModal /> : null}
      {selectedFacility ? <FacilityDetailsDrawer facility={selectedFacility} suspended={showSuspend} /> : null}
    </>
  );
}
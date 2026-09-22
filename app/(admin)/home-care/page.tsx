import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  BriefcaseIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
  DownloadIcon,
  EyeActionIcon,
  HeartPulseIcon,
  HomeIcon,
  IdIcon,
  MailSmallIcon,
  MapPinIcon,
  PhoneIcon,
  PlusIcon,
  SearchIcon,
  UserCheckIcon,
  UsersIcon,
} from "@/components/admin/AdminIcons";
import { getAdminSessionToken } from "@/lib/server/admin-overview";
import { HomeCareRequestFilters, type FilterOptions } from "@/components/admin/HomeCareRequestFilters";
import { cancelAdminHomeCareQuote, cancelAdminHomeCareRequest, holdAdminHomeCareRequest, cancelAdminHomeCareVisit, changeAdminHomeCareProvider, confirmAdminHomeCareAssignment, createAdminHomeCareProvider, createAdminHomeCareQuote, getAdminHomeCareAssignmentOptions, resendAdminHomeCareQuote, getAdminHomeCareOverview, getAdminHomeCarePaymentSummary, getAdminHomeCareProviderDetail, getAdminHomeCareProviderDocument, getAdminHomeCareProviderAssignments, getAdminHomeCareProviderFormOptions, getAdminHomeCareProviderMatches, getAdminHomeCareProviderOverview, getAdminHomeCareProviders, getAdminHomeCareRequestDetail, getAdminHomeCareRequestDocument, getAdminHomeCareRequestFilterOptions, getAdminHomeCareRequests, getAdminHomeCareVisitCancellationReasons, getAdminHomeCareVisitDetail, getAdminHomeCareVisits, saveAdminHomeCareProviderDraft, selectAdminHomeCareProvisionalProvider, sendAdminHomeCareDraftQuote, uploadAdminHomeCareProviderFile, updateAdminHomeCareProvider, type AdminHomeCareAssignmentOptions, type AdminHomeCarePaymentSummary, type AdminHomeCareProviderAssignment, type AdminHomeCareProviderCreatePayload, type AdminHomeCareProviderDetail, type AdminHomeCareProviderDocument, type AdminHomeCareProviderFormOptions, type AdminHomeCareProviderOverview, type AdminHomeCareProviderRow, type AdminHomeCareProviderUpload, type AdminHomeCareProviderUpdatePayload, type AdminHomeCareProviderCandidate, type AdminHomeCareRequestDetail, type AdminHomeCareRequestDocument, type AdminHomeCareVisitCancellationOptions, type AdminHomeCareVisitDetail, type AdminHomeCareVisitRow } from "@/lib/server/admin-home-care";

type HomeCareSearchParams = {
  filters?: string;
  request?: string;
  selectedProvider?: string;
  payment?: string;
  changeProvider?: string;
  confirmProvider?: string;
  cancelQuote?: string;
  holdRequest?: string;
  holdError?: string;
  cancelRequest?: string;
  cancelError?: string;
  resendError?: string;
  editProvider?: string;
  providerUpdateError?: string;
 cancelVisit?: string;
  visitCancelError?: string;
  previewDocument?: string;
  view?: string;
  visit?: string;
  provider?: string;
  providerDocument?: string;
  addProvider?: string;
  providerCreated?: string;
  draftSaved?: string;
  providerId?: string;
  formError?: string;
  professionalCategory?: string;
  availability?: string;
  verificationStatus?: string;
  coverageArea?: string;
  order?: string;
  page?: string;
  limit?: string;
  search?: string;
  origin?: string;
  statuses?: string | string[];
  serviceCategory?: string;
  dateRange?: string;
  dateFrom?: string;
  dateTo?: string;
  location?: string;
  sort?: string;
};

type HomeCarePageProps = {
  searchParams: Promise<HomeCareSearchParams>;
};

type RequestStatusTone = "green" | "blue" | "orange" | "red" | "gray";

type HomeCareRequest = {
  id: string;
  reference: string;
  patient: string;
  origin: string;
  hospital: string;
  service: string;
  category: string;
  location: string;
  submitted: string;
  status: string;
  statusTone: RequestStatusTone;
};

function formString(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function formStringArray(formData: FormData, key: string): string[] {
  return formData.getAll(key).filter((value): value is string => typeof value === "string" && value.trim().length > 0).map((value) => value.trim());
}

function formFile(formData: FormData, key: string): File | undefined {
  const value = formData.get(key);
  return value instanceof File && value.size > 0 ? value : undefined;
}

function formNumber(formData: FormData, key: string): number | undefined {
  const value = formString(formData, key);
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function providerPayloadFromForm(formData: FormData): AdminHomeCareProviderCreatePayload {
  const state = formString(formData, "state") ?? "";
  const city = formString(formData, "city") ?? "";
  const lga = formString(formData, "lga");
  const serviceRadius = formNumber(formData, "serviceRadius");
  const qualificationTitle = formString(formData, "qualificationTitle");
  const qualificationInstitution = formString(formData, "qualificationInstitution");
  const qualificationYear = formNumber(formData, "qualificationYear");
  const qualifications = qualificationTitle || qualificationInstitution || qualificationYear !== undefined ? [{ title: qualificationTitle, institution: qualificationInstitution, year: qualificationYear }] : [];

  return {
    name: formString(formData, "name") ?? "",
    professionalRole: formString(formData, "professionalRole") ?? "",
    identificationNumber: formString(formData, "identificationNumber") ?? "",
    serviceCategories: formStringArray(formData, "serviceCategories"),
    email: formString(formData, "email") ?? "",
    phone: formString(formData, "phone") ?? "",
    gender: formString(formData, "gender"),
    dateOfBirth: formString(formData, "dateOfBirth"),
    address: formString(formData, "address"),
    city,
    state,
    lga,
    serviceRadius,
    yearsOfExperience: formNumber(formData, "yearsOfExperience"),
    licenseNumber: formString(formData, "licenseNumber"),
    licensingAuthority: formString(formData, "licensingAuthority"),
    licenseExpiryDate: formString(formData, "licenseExpiryDate"),
    qualifications,
    availability: formString(formData, "availability") ?? "available",
    coverageAreas: state || city || lga || serviceRadius !== undefined ? [{ state, city, lga, serviceRadius }] : [],
    serviceCapabilities: formStringArray(formData, "serviceCapabilities"),
  };
}

function hasRequiredProviderFields(payload: AdminHomeCareProviderCreatePayload): boolean {
  return Boolean(payload.name && payload.professionalRole && payload.identificationNumber && payload.email && payload.phone && payload.city && payload.state && payload.serviceCategories.length > 0);
}

async function uploadProviderDocument(token: string, formData: FormData, key: string, docType: string): Promise<AdminHomeCareProviderUpload | null> {
  const file = formFile(formData, key);
  return file ? uploadAdminHomeCareProviderFile(token, file, docType) : null;
}

async function saveProviderAction(formData: FormData): Promise<void> {
  "use server";

  const token = await getAdminSessionToken();
  if (!token) {
    redirect("/login");
  }

  const payload = providerPayloadFromForm(formData);
  const intent = formString(formData, "intent");
  if (intent === "draft") {
    await saveAdminHomeCareProviderDraft(token, payload as unknown as Record<string, unknown>);
    revalidatePath("/home-care");
    redirect("/home-care?view=providers&addProvider=1&draftSaved=1");
  }

  if (!hasRequiredProviderFields(payload)) {
    redirect("/home-care?view=providers&addProvider=1&formError=missing");
  }

  const profilePhoto = await uploadProviderDocument(token, formData, "profilePhoto", "profile_photo");
  const licenseFile = await uploadProviderDocument(token, formData, "licenseFile", "license");
  const governmentIdFile = await uploadProviderDocument(token, formData, "governmentIdFile", "government_id");
  const certificateFile = await uploadProviderDocument(token, formData, "certificateFile", "practice_certificate");
  const documents = [licenseFile, governmentIdFile, certificateFile].filter((file): file is AdminHomeCareProviderUpload => file !== null);

  await createAdminHomeCareProvider(token, {
    ...payload,
    avatarUrl: profilePhoto?.url,
    verificationDocuments: documents.map((file) => ({
      requestType: file.docType,
      fileUrl: file.url,
      fileName: file.fileName,
      fileType: file.fileType,
      fileSize: file.fileSizeBytes ?? undefined,
    })),
  });

  revalidatePath("/home-care");
  redirect("/home-care?view=providers&providerCreated=1");
}
async function updateProviderAction(formData: FormData): Promise<void> {
  "use server";

  const providerId = formString(formData, "providerId");
  if (!providerId) {
    return;
  }

  const token = await getAdminSessionToken();
  if (!token) {
    redirect("/login");
  }

  const csvValues = (key: string): string[] => (formString(formData, key) ?? "").split(",").map((value) => value.trim()).filter(Boolean);
  const payload: AdminHomeCareProviderUpdatePayload = {
    name: formString(formData, "name"),
    professionalRole: formString(formData, "professionalRole"),
    email: formString(formData, "email"),
    phone: formString(formData, "phone"),
    city: formString(formData, "city"),
    state: formString(formData, "state"),
    lga: formString(formData, "lga"),
    serviceRadius: formNumber(formData, "serviceRadius"),
    yearsOfExperience: formNumber(formData, "yearsOfExperience"),
    licenseNumber: formString(formData, "licenseNumber"),
    licensingAuthority: formString(formData, "licensingAuthority"),
    licenseExpiryDate: formString(formData, "licenseExpiryDate"),
    availability: formString(formData, "availability"),
    verificationStatus: formString(formData, "verificationStatus"),
    isActive: formData.get("isActive") === "true",
    serviceCategories: csvValues("serviceCategories"),
    serviceCapabilities: csvValues("serviceCapabilities"),
  };

  const success = await updateAdminHomeCareProvider(token, providerId, payload);
  revalidatePath("/home-care");
  redirect("/home-care?view=providers&provider=" + encodeURIComponent(providerId) + (success ? "" : "&editProvider=1&providerUpdateError=1"));
}
async function selectProviderAction(formData: FormData): Promise<void> {
  "use server";

  const requestId = formString(formData, "requestId");
  const providerId = formString(formData, "providerId");
  if (!requestId || !providerId) {
    return;
  }

  const token = await getAdminSessionToken();
  if (!token) {
    redirect("/login");
  }

  await selectAdminHomeCareProvisionalProvider(token, requestId, providerId);
  revalidatePath("/home-care");
  redirect("/home-care?request=" + encodeURIComponent(requestId) + "&selectedProvider=" + encodeURIComponent(providerId));
}

async function saveQuoteAction(formData: FormData): Promise<void> {
  "use server";

  const requestId = formString(formData, "requestId");
  const serviceUnitRate = formNumber(formData, "serviceUnitRate");
  const numberOfVisits = formNumber(formData, "numberOfVisits");
  const serviceFee = formNumber(formData, "serviceFee");
  const travelFee = formNumber(formData, "travelFee");
  const platformFee = formNumber(formData, "platformFee");
  if (!requestId || serviceUnitRate === undefined || numberOfVisits === undefined || serviceFee === undefined || travelFee === undefined || platformFee === undefined) {
    return;
  }

  const token = await getAdminSessionToken();
  if (!token) {
    redirect("/login");
  }

  await createAdminHomeCareQuote(token, requestId, {
    serviceUnitRate,
    numberOfVisits: Math.max(1, Math.round(numberOfVisits)),
    serviceFee,
    travelFee,
    platformFee,
    discount: formNumber(formData, "discount") ?? 0,
    validityHours: Math.max(1, Math.round(formNumber(formData, "validityHours") ?? 24)),
    patientNote: formString(formData, "patientNote"),
    operationsNote: formString(formData, "operationsNote"),
    provisionalProviderId: formString(formData, "provisionalProviderId"),
    sendNow: formData.get("sendNow") === "true",
  });
  revalidatePath("/home-care");
  redirect("/home-care?request=" + encodeURIComponent(requestId));
}

async function resendQuoteAction(formData: FormData): Promise<void> {
  "use server";

  const requestId = formString(formData, "requestId");
  const quoteId = formString(formData, "quoteId");
  if (!requestId || !quoteId) {
    return;
  }

  const token = await getAdminSessionToken();
  if (!token) {
    redirect("/login");
  }

  const payload = {
    quoteId,
    serviceUnitRate: formNumber(formData, "serviceUnitRate"),
    numberOfVisits: formNumber(formData, "numberOfVisits"),
    serviceFee: formNumber(formData, "serviceFee"),
    travelFee: formNumber(formData, "travelFee"),
    platformFee: formNumber(formData, "platformFee"),
    discount: formNumber(formData, "discount"),
    validityHours: formNumber(formData, "validityHours"),
    patientNote: formString(formData, "patientNote"),
    operationsNote: formString(formData, "operationsNote"),
    provisionalProviderId: formString(formData, "provisionalProviderId"),
  };

  const success = await resendAdminHomeCareQuote(token, requestId, payload);
  revalidatePath("/home-care");
  redirect("/home-care?request=" + encodeURIComponent(requestId) + (success ? "" : "&resendError=1"));
}
async function sendDraftQuoteAction(formData: FormData): Promise<void> {
  "use server";

  const requestId = formString(formData, "requestId");
  if (!requestId) {
    return;
  }

  const token = await getAdminSessionToken();
  if (!token) {
    redirect("/login");
  }

  await sendAdminHomeCareDraftQuote(token, requestId);
  revalidatePath("/home-care");
  redirect("/home-care?request=" + encodeURIComponent(requestId));
}
async function cancelQuoteAction(formData: FormData): Promise<void> {
  "use server";

  const requestId = formString(formData, "requestId");
  if (!requestId) {
    return;
  }

  const token = await getAdminSessionToken();
  if (!token) {
    redirect("/login");
  }

  await cancelAdminHomeCareQuote(token, requestId, formString(formData, "reason"));
  revalidatePath("/home-care");
  redirect("/home-care?request=" + encodeURIComponent(requestId));
}
async function cancelRequestAction(formData: FormData): Promise<void> {
  "use server";

  const requestId = formString(formData, "requestId");
  const reason = formString(formData, "reason");
  if (!requestId || !reason) {
    return;
  }

  const token = await getAdminSessionToken();
  if (!token) {
    redirect("/login");
  }

  const success = await cancelAdminHomeCareRequest(token, requestId, reason, formString(formData, "note"));
  revalidatePath("/home-care");
  redirect("/home-care?request=" + encodeURIComponent(requestId) + (success ? "" : "&cancelRequest=1&cancelError=1"));
}
async function holdRequestAction(formData: FormData): Promise<void> {
  "use server";

  const requestId = formString(formData, "requestId");
  const reason = formString(formData, "reason");
  if (!requestId || !reason) {
    return;
  }

  const token = await getAdminSessionToken();
  if (!token) {
    redirect("/login");
  }

  const success = await holdAdminHomeCareRequest(token, requestId, reason);
  revalidatePath("/home-care");
  redirect("/home-care?request=" + encodeURIComponent(requestId) + (success ? "" : "&holdRequest=1&holdError=1"));
}
async function cancelVisitAction(formData: FormData): Promise<void> {
  "use server";

  const visitId = formString(formData, "visitId");
  const reasonCode = formString(formData, "reasonCode");
  if (!visitId || !reasonCode) {
    return;
  }

  const token = await getAdminSessionToken();
  if (!token) {
    redirect("/login");
  }

  const success = await cancelAdminHomeCareVisit(token, visitId, {
    reasonCode,
    details: formString(formData, "details"),
  });
  revalidatePath("/home-care");
  redirect("/home-care?view=visits&visit=" + encodeURIComponent(visitId) + (success ? "" : "&cancelVisit=1&visitCancelError=1"));
}
async function changeProviderAction(formData: FormData): Promise<void> {
  "use server";

  const requestId = formString(formData, "requestId");
  const providerId = formString(formData, "providerId");
  if (!requestId || !providerId) {
    return;
  }

  const token = await getAdminSessionToken();
  if (!token) {
    redirect("/login");
  }

  await changeAdminHomeCareProvider(token, requestId, providerId);
  revalidatePath("/home-care");
  redirect("/home-care?request=" + encodeURIComponent(requestId) + "&selectedProvider=" + encodeURIComponent(providerId));
}
async function confirmProviderAction(formData: FormData): Promise<void> {
  "use server";

  const requestId = formString(formData, "requestId");
  const providerId = formString(formData, "providerId");
  if (!requestId || !providerId) {
    return;
  }

  const token = await getAdminSessionToken();
  if (!token) {
    redirect("/login");
  }

  await confirmAdminHomeCareAssignment(token, requestId, {
    providerId,
    scheduledDate: formString(formData, "scheduledDate"),
    scheduledTime: formString(formData, "scheduledTime"),
  });
  revalidatePath("/home-care");
  redirect("/home-care?request=" + encodeURIComponent(requestId));
}
function formatCount(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatDateLabel(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function originLabel(value: string | null | undefined): string {
  if (value === "hospital" || value === "clinician_ordered") {
    return "Clinician Ordered";
  }

  if (value === "direct") {
    return "Direct Request";
  }

  return labelFromApiValue(value);
}

function labelFromApiValue(value: string | null | undefined): string {
  if (!value || !value.trim()) {
    return "--";
  }

  return value
    .split(/[_-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function deltaLabel(value: number | null | undefined): string {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "No Data";
  }

  return (value >= 0 ? "+" : "") + value.toFixed(1) + "%";
}

function statusTone(status: string): RequestStatusTone {
  if (status === "ready_for_assignment" || status === "provider_assigned" || status === "completed") {
    return "green";
  }

  if (status === "finding_provider" || status === "awaiting_documents") {
    return "blue";
  }

  if (status === "awaiting_payment" || status === "pending_review" || status === "pending") {
    return "orange";
  }

  if (status === "cancelled") {
    return "red";
  }

  return "gray";
}

function statusClass(tone: RequestStatusTone): string {
  if (tone === "green") {
    return "bg-admin-green-soft text-admin-success";
  }

  if (tone === "blue") {
    return "bg-admin-blue-soft text-admin-blue";
  }

  if (tone === "orange") {
    return "bg-[#fff3df] text-[#ff8a00]";
  }

  if (tone === "red") {
    return "bg-admin-red-soft text-admin-red";
  }

  return "bg-admin-neutral-soft text-admin-muted";
}

function requestRowsFromApi(rows: Array<{ requestId: string; bookingReference: string; patientName: string | null; origin: string; hospitalName: string | null; serviceName: string | null; serviceCategory: string | null; location: string; submittedAt: string; status: string }>): HomeCareRequest[] {
  return rows.map((row) => ({
    id: row.requestId,
    reference: row.bookingReference,
    patient: row.patientName ?? "--",
    origin: originLabel(row.origin),
    hospital: row.hospitalName ?? "Direct Request",
    service: row.serviceName ?? "--",
    category: labelFromApiValue(row.serviceCategory),
    location: row.location || "--",
    submitted: formatDateLabel(row.submittedAt),
    status: labelFromApiValue(row.status),
    statusTone: statusTone(row.status),
  }));
}

function queryWithoutFilter(params: HomeCareSearchParams): Record<string, string | string[]> {
  const query: Record<string, string | string[]> = {};
  for (const [key, value] of Object.entries(params)) {
    if (key !== "filters" && key !== "request" && key !== "selectedProvider" && key !== "payment" && key !== "changeProvider" && key !== "confirmProvider" && key !== "cancelQuote" && key !== "holdRequest" && key !== "holdError" && key !== "cancelRequest" && key !== "cancelError" && key !== "cancelVisit" && key !== "visitCancelError" && key !== "previewDocument" && key !== "providerDocument" && key !== "editProvider" && key !== "providerUpdateError" && key !== "addProvider" && value !== undefined && value !== "") {
      query[key] = value;
    }
  }
  return query;
}

function requestViewQuery(params: Record<string, string | string[]>, origin?: string): Record<string, string | string[]> {
  const next = { ...params };
  delete next.page;
  delete next.view;
  delete next.provider;
  delete next.providerDocument;
  delete next.editProvider;
  delete next.providerUpdateError;
  delete next.addProvider;
  delete next.providerCreated;
  delete next.draftSaved;
  delete next.formError;
  delete next.professionalCategory;
  delete next.availability;
  delete next.verificationStatus;
  delete next.coverageArea;
  delete next.order;
  delete next.providerId;
  delete next.visit;

  if (origin) {
    next.origin = origin;
  } else {
    delete next.origin;
  }

  return next;
}

function providerViewQuery(params: Record<string, string | string[]>): Record<string, string | string[]> {
  const next: Record<string, string | string[]> = { ...params, view: "providers" };
  delete next.page;
  delete next.request;
  delete next.selectedProvider;
  delete next.payment;
  delete next.changeProvider;
  delete next.confirmProvider;
  delete next.cancelQuote;
  delete next.previewDocument;
  delete next.origin;
  delete next.statuses;
  delete next.serviceCategory;
  delete next.dateRange;
  delete next.dateFrom;
  delete next.dateTo;
  delete next.location;
  delete next.visit;
  return next;
}
function activeVisitsViewQuery(params: Record<string, string | string[]>): Record<string, string | string[]> {
  const next: Record<string, string | string[]> = { ...params, view: "visits" };
  delete next.page;
  delete next.request;
  delete next.selectedProvider;
  delete next.payment;
  delete next.changeProvider;
  delete next.confirmProvider;
  delete next.cancelQuote;
  delete next.previewDocument;
  delete next.provider;
  delete next.providerDocument;
  delete next.addProvider;
  delete next.providerCreated;
  delete next.draftSaved;
  delete next.formError;
  delete next.professionalCategory;
  delete next.availability;
  delete next.verificationStatus;
  delete next.coverageArea;
  delete next.order;
  delete next.visit;
  return next;
}
function requestPageQuery(params: Record<string, string | string[]>, page: number): Record<string, string | string[]> {
  return { ...params, page: page.toString() };
}

function visitsExportHref(params: Record<string, string | string[]>): string {
  const query = new URLSearchParams();
  for (const key of ["search", "statuses", "serviceCategory", "providerId", "origin", "location", "sort"]) {
    const value = params[key];
    if (Array.isArray(value)) {
      value.forEach((item) => query.append(key, item));
    } else if (typeof value === "string" && value) {
      query.set(key, value);
    }
  }

  const text = query.toString();
  return "/api/admin/home-care/visits/export" + (text ? "?" + text : "");
}

function providerExportHref(params: Record<string, string | string[]>): string {
  const query = new URLSearchParams();
  for (const key of ["search", "professionalCategory", "availability", "verificationStatus", "coverageArea", "sort", "order"]) {
    const value = params[key];
    if (typeof value === "string" && value) {
      query.set(key, value);
    }
  }

  const text = query.toString();
  return "/api/admin/home-care/providers/export" + (text ? "?" + text : "");
}

function exportHref(params: Record<string, string | string[]>): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      value.forEach((item) => query.append(key, item));
    } else if (value) {
      query.set(key, value);
    }
  }

  const text = query.toString();
  return "/api/admin/home-care/requests/export" + (text ? "?" + text : "");
}
function MetricCard({ title, value, trend, icon, tone }: { title: string; value: string; trend: string; icon: React.ReactNode; tone: "blue" | "green" | "orange" | "gray" }) {
  const toneClass = {
    blue: "bg-admin-blue-soft text-admin-blue",
    green: "bg-admin-green-soft text-admin-success",
    orange: "bg-[#fff3df] text-[#ff8a00]",
    gray: "bg-admin-neutral-soft text-admin-muted",
  }[tone];
  const trendClass = trend.includes("-") ? "bg-admin-red-soft text-admin-red" : trend === "No Data" ? "bg-admin-neutral-soft text-admin-neutral" : "bg-admin-green-soft text-admin-success";

  return (
    <article className="admin-panel-shadow rounded-[8px] border border-admin-border bg-white px-6 py-6">
      <div className={["grid h-12 w-12 place-items-center rounded-[10px]", toneClass].join(" ")}>{icon}</div>
      <div className="mt-4 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[12px] font-bold uppercase tracking-normal text-admin-ink/80">{title}</p>
          <p className="mt-2 text-[24px] font-bold tracking-normal text-admin-ink">{value}</p>
        </div>
        <span className={["rounded-full px-2 py-1 text-[10px] font-bold", trendClass].join(" ")}>{trend}</span>
      </div>
    </article>
  );
}

function RequestFilters({ params, showFilters, options }: { params: Record<string, string | string[]>; showFilters: boolean; options: FilterOptions }) {
  return <HomeCareRequestFilters params={params} initiallyOpen={showFilters} options={options} />;
}

function RequestsTable({ requests, totalItems, page, limit, totalPages, params, showFilters, filterOptions }: { requests: HomeCareRequest[]; totalItems: number; page: number; limit: number; totalPages: number; params: Record<string, string | string[]>; showFilters: boolean; filterOptions: FilterOptions }) {
  const empty = requests.length === 0;
const firstItem = totalItems > 0 ? (page - 1) * limit + 1 : 0;
  const lastItem = totalItems > 0 ? Math.min(firstItem + requests.length - 1, totalItems) : 0;
  const pageItems = Array.from({ length: Math.min(Math.max(totalPages, 1), 3) }, (_, index) => index + 1);

  return (
    <section className="relative overflow-hidden rounded-[10px] bg-white">
      <RequestFilters params={params} showFilters={showFilters} options={filterOptions} />
      {empty ? (
        <div className="grid min-h-[417px] place-items-center border-t border-admin-border px-6 pb-10 pt-8 text-center">
          <div className="max-w-[440px]">
            <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-admin-neutral-soft text-admin-neutral">
              <HomeIcon className="h-12 w-12" />
            </div>
            <h3 className="mt-7 text-[22px] font-bold text-admin-ink">No Requests Yet</h3>
            <p className="mx-auto mt-3 text-[16px] leading-6 text-admin-text/90">Incoming home care requests will appear here once patients or clinicians create them.</p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto px-4">
          <table className="w-full min-w-[1160px] border-collapse text-left">
            <thead className="bg-admin-table-head text-[12px] font-bold uppercase tracking-normal text-admin-ink/80">
              <tr>
                <th className="px-5 py-5">Request ID</th>
                <th className="px-5 py-5">Patient Name</th>
                <th className="px-5 py-5">Origin</th>
                <th className="px-5 py-5">Service</th>
                <th className="px-5 py-5">Location</th>
                <th className="px-5 py-5">Submitted</th>
                <th className="px-5 py-5">Status</th>
                <th className="px-5 py-5">Action</th>
              </tr>
            </thead>
            <tbody className="text-[14px] text-admin-ink">
              {requests.map((request) => (
                <tr key={request.id} className="border-b border-admin-border/70 last:border-b-0">
                  <td className="px-5 py-4 font-medium text-admin-text/85">{request.reference}</td>
                  <td className="px-5 py-4">
                    <p className="font-semibold">{request.patient}</p>
                    <p className="mt-0.5 text-[12px] text-admin-muted">{request.hospital}</p>
                  </td>
                  <td className="px-5 py-4 text-admin-text/90">{request.origin}</td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-admin-ink">{request.service}</p>
                    <p className="mt-0.5 text-[12px] text-admin-muted">{request.category}</p>
                  </td>
                  <td className="px-5 py-4 text-admin-text/90">{request.location}</td>
                  <td className="px-5 py-4 text-admin-text/90">{request.submitted}</td>
                  <td className="px-5 py-4"><span className={["rounded-full px-3 py-1.5 text-[12px] font-medium", statusClass(request.statusTone)].join(" ")}>{request.status}</span></td>
                  <td className="px-5 py-4">
                    <Link href={{ pathname: "/home-care", query: { ...params, request: request.id } }} className="inline-flex items-center gap-2 font-semibold text-admin-blue" aria-label={"View " + request.reference}>
                      <EyeActionIcon className="h-5 w-5" />
                      View
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
          <span>{"Showing " + firstItem + "-" + lastItem + " of " + totalItems + " Requests"}</span>
          <div className="flex items-center gap-3 text-admin-ink">
            <Link href={{ pathname: "/home-care", query: requestPageQuery(params, Math.max(page - 1, 1)) }} aria-label="Previous page" className="grid h-8 w-8 place-items-center rounded-[7px] border border-admin-border text-admin-neutral"><ChevronLeftIcon className="h-4 w-4" /></Link>
            {pageItems.map((pageNumber) => pageNumber === page ? <span key={pageNumber} className="grid h-8 w-8 place-items-center rounded-[7px] bg-admin-blue font-bold text-white">{pageNumber}</span> : <Link key={pageNumber} href={{ pathname: "/home-care", query: requestPageQuery(params, pageNumber) }}>{pageNumber}</Link>)}
            {totalPages > 4 ? <span>...</span> : null}
            {totalPages > 3 ? (totalPages === page ? <span className="grid h-8 w-8 place-items-center rounded-[7px] bg-admin-blue font-bold text-white">{totalPages}</span> : <Link href={{ pathname: "/home-care", query: requestPageQuery(params, totalPages) }}>{totalPages}</Link>) : null}
            <Link href={{ pathname: "/home-care", query: requestPageQuery(params, Math.min(page + 1, totalPages)) }} aria-label="Next page" className="grid h-8 w-8 place-items-center rounded-[7px] border border-admin-blue text-admin-blue"><ChevronRightIcon className="h-4 w-4" /></Link>
          </div>
        </footer>
      ) : null}
    </section>
  );
}
function filterLabel(key: string, value: string): string {
  if (key === "search") {
    return "Search: " + value;
  }

  if (key === "origin") {
    return "Origin: " + originLabel(value);
  }

  if (key === "statuses") {
    return "Status: " + labelFromApiValue(value);
  }

  if (key === "serviceCategory") {
    return "Category: " + labelFromApiValue(value);
  }

  if (key === "dateRange") {
    return "Date: " + labelFromApiValue(value);
  }

  if (key === "dateFrom") {
    return "From: " + value;
  }

  if (key === "dateTo") {
    return "To: " + value;
  }

  if (key === "location") {
    return "Location: " + value;
  }

  return labelFromApiValue(value);
}

function removeFilterQuery(params: Record<string, string | string[]>, key: string, value?: string): Record<string, string | string[]> {
  const next: Record<string, string | string[]> = {};
  for (const [entryKey, entryValue] of Object.entries(params)) {
    if (entryKey === "page") {
      continue;
    }

    if (entryKey !== key) {
      next[entryKey] = entryValue;
      continue;
    }

    if (Array.isArray(entryValue) && value) {
      const remaining = entryValue.filter((item) => item !== value);
      if (remaining.length > 0) {
        next[entryKey] = remaining;
      }
    }
  }
  return next;
}

function filterChips(params: Record<string, string | string[]>): Array<{ key: string; value: string; label: string; query: Record<string, string | string[]> }> {
  const chips: Array<{ key: string; value: string; label: string; query: Record<string, string | string[]> }> = [];
  for (const [key, value] of Object.entries(params)) {
    if (key === "page" || key === "limit" || key === "sort") {
      continue;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => chips.push({ key, value: item, label: filterLabel(key, item), query: removeFilterQuery(params, key, item) }));
    } else if (value) {
      chips.push({ key, value, label: filterLabel(key, value), query: removeFilterQuery(params, key) });
    }
  }
  return chips;
}

function SelectedFilters({ params }: { params: Record<string, string | string[]> }) {
  const chips = filterChips(params);
  if (chips.length === 0) {
    return null;
  }

  return (
    <section className="mb-5 flex flex-wrap items-center justify-between gap-4 rounded-[10px] border border-admin-border bg-white px-4 py-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-[13px] font-bold tracking-normal text-admin-muted">Active Filters:</span>
        {chips.map((chip) => (
          <Link key={chip.key + chip.value} href={{ pathname: "/home-care", query: chip.query }} className="inline-flex min-h-8 items-center gap-2 rounded-full bg-admin-blue-soft px-3 text-[13px] font-bold text-admin-blue">
            {chip.label}
            <CloseIcon className="h-4 w-4" />
          </Link>
        ))}
      </div>
      <Link href="/home-care" className="text-[14px] font-bold text-admin-blue">Clear All</Link>
    </section>
  );
}
function fieldText(source: Record<string, unknown>, key: string, fallback = "--"): string {
  const value = source[key];
  if (typeof value === "string" && value.trim()) {
    return value;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return new Intl.NumberFormat("en-US").format(value);
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return fallback;
}

function fieldDate(source: Record<string, unknown>, key: string, fallback = "--"): string {
  const value = source[key];
  if (typeof value !== "string" || !value.trim()) {
    return fallback;
  }

  return formatDateLabel(value);
}

function nestedField(source: Record<string, unknown>, key: string): Record<string, unknown> {
  const value = source[key];
  return value !== null && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function dateInputText(source: Record<string, unknown>, key: string): string {
  const value = source[key];
  if (typeof value !== "string" || !value.trim()) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 10);
  }

  return date.toISOString().slice(0, 10);
}
function currencyText(value: unknown): string {
  if (typeof value === "number" && Number.isFinite(value)) {
    return new Intl.NumberFormat("en-NG", { currency: "NGN", maximumFractionDigits: 0, style: "currency" }).format(value);
  }

  if (typeof value === "string" && value.trim()) {
    return value;
  }

  return "--";
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[12px] font-bold uppercase tracking-normal text-admin-muted">{label}</dt>
      <dd className="mt-1 break-words text-[14px] font-semibold text-admin-ink">{value}</dd>
    </div>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[8px] border border-admin-border bg-white p-5">
      <h3 className="text-[16px] font-bold text-admin-ink">{title}</h3>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function RequirementChip({ label, value }: { label: string; value: unknown }) {
  const enabled = value === true || (typeof value === "string" && value.trim().length > 0 && value !== "false" && value !== "not_required");
  return (
    <span className={["inline-flex min-h-9 items-center rounded-full px-3 text-[13px] font-bold", enabled ? "bg-admin-green-soft text-admin-success" : "bg-admin-neutral-soft text-admin-muted"].join(" ")}>{label + ": " + (enabled ? "Required" : "Not Required")}</span>
  );
}

function ProviderMatchCard({ candidate, requestId, selected }: { candidate: AdminHomeCareProviderCandidate; requestId: string; selected: boolean }) {
  return (
    <article className={["rounded-[8px] border bg-white p-4", selected ? "border-admin-blue ring-2 ring-admin-blue-soft" : "border-admin-border"].join(" ")}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[15px] font-bold text-admin-ink">{candidate.name}</p>
          <p className="mt-1 text-[13px] font-medium text-admin-muted">{candidate.profession}</p>
        </div>
        {selected ? <span className="rounded-full bg-admin-green-soft px-3 py-1 text-[12px] font-bold text-admin-success">Selected</span> : candidate.isRecommended ? <span className="rounded-full bg-admin-blue-soft px-3 py-1 text-[12px] font-bold text-admin-blue">Recommended</span> : null}
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-[13px]">
        <DetailRow label="Score" value={Math.round(candidate.score).toString() + "%"} />
        <DetailRow label="Load" value={candidate.currentLoad.toString()} />
        <DetailRow label="Distance" value={candidate.distanceKm === null ? "--" : candidate.distanceKm.toFixed(1) + " km"} />
        <DetailRow label="Rating" value={candidate.rating === null ? "--" : candidate.rating.toFixed(1)} />
      </dl>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full bg-admin-green-soft px-3 py-1 text-[12px] font-bold text-admin-success">{labelFromApiValue(candidate.availability)}</span>
        <span className="rounded-full bg-admin-neutral-soft px-3 py-1 text-[12px] font-bold text-admin-muted">{labelFromApiValue(candidate.verificationStatus)}</span>
      </div>
      <form action={selectProviderAction} className="mt-4">
        <input type="hidden" name="requestId" value={requestId} />
        <input type="hidden" name="providerId" value={candidate.providerId} />
        <button type="submit" className={["h-10 w-full rounded-[8px] text-[14px] font-bold", selected ? "border border-admin-success bg-white text-admin-success" : "bg-admin-blue text-white"].join(" ")}>{selected ? "Selected Provider" : "Select Provider"}</button>
      </form>
    </article>
  );
}
function RequestDetailsDrawer({ detail, matches, closeQuery, requestId, selectedProviderId, showPayment, showChangeProvider, showConfirmProvider, showCancelQuote, showHoldRequest, holdError, showCancelRequest, cancelError, resendError, documentPreview, previewDocumentId, paymentSummary, assignmentOptions }: { detail: AdminHomeCareRequestDetail | null; matches: AdminHomeCareProviderCandidate[]; closeQuery: Record<string, string | string[]>; requestId: string; selectedProviderId?: string; showPayment: boolean; showChangeProvider: boolean; showConfirmProvider: boolean; showCancelQuote: boolean; showHoldRequest: boolean; holdError: boolean; showCancelRequest: boolean; cancelError: boolean; resendError: boolean; documentPreview: AdminHomeCareRequestDocument | null; previewDocumentId?: string; paymentSummary: AdminHomeCarePaymentSummary | null; assignmentOptions: AdminHomeCareAssignmentOptions | null }) {
  const overview = detail?.requestOverview ?? {};
  const patient = detail?.patientInformation ?? {};
  const service = detail?.serviceInformation ?? {};
  const requirements = detail?.requestRequirements ?? {};
  const requestedDateTime = nestedField(service, "requestedDateTime");
  const quote = detail?.quote ?? null;
  const status = fieldText(overview, "status", detail ? "--" : "Unavailable");
  const persistedProviderId = quote ? fieldText(quote, "provisionalProviderId", "") : "";
  const activeProviderId = selectedProviderId || persistedProviderId;
  const visitsValue = Number(fieldText(service, "visits", fieldText(overview, "numberOfVisits", "1")).replace(/,/g, ""));
  const defaultVisits = Number.isFinite(visitsValue) && visitsValue > 0 ? Math.round(visitsValue) : 1;
  const confirmProvider = assignmentOptions?.provider ?? matches.find((candidate) => candidate.providerId === activeProviderId) ?? null;
  const confirmProviderId = fieldText(confirmProvider ?? {}, "providerId", activeProviderId);

  return (
    <div className="fixed inset-0 z-50 bg-admin-overlay backdrop-blur-[3px]">
      <aside className="ml-auto flex h-dvh w-full max-w-[1120px] flex-col bg-admin-bg shadow-2xl">
        <header className="flex min-h-[92px] items-center justify-between border-b border-admin-border bg-white px-6 lg:px-8">
          <div className="min-w-0">
            <p className="text-[13px] font-bold uppercase tracking-normal text-admin-muted">Home Care Request</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h2 className="truncate text-[22px] font-bold text-admin-ink">{fieldText(overview, "bookingReference", requestId)}</h2>
              <span className={["rounded-full px-3 py-1.5 text-[12px] font-bold", statusClass(statusTone(status))].join(" ")}>{labelFromApiValue(status)}</span>
            </div>
          </div>
          <Link href={{ pathname: "/home-care", query: closeQuery }} aria-label="Close request details" className="grid h-10 w-10 place-items-center rounded-[8px] border border-admin-border text-admin-text"><CloseIcon className="h-6 w-6" /></Link>
        </header>

        {detail ? (
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 lg:px-8">
            {detail && status !== "cancelled" ? (
              <div className="mb-5 flex flex-wrap justify-end gap-3">
                {!["suspended"].includes(status) ? <Link href={{ pathname: "/home-care", query: { ...closeQuery, request: requestId, holdRequest: "1" } }} className="h-11 rounded-[8px] border border-admin-red/30 px-5 py-3 text-[14px] font-bold text-admin-red">Place Request On Hold</Link> : null}
                <Link href={{ pathname: "/home-care", query: { ...closeQuery, request: requestId, cancelRequest: "1" } }} className="h-11 rounded-[8px] bg-admin-red px-5 py-3 text-[14px] font-bold text-white">Cancel Request</Link>
              </div>
            ) : null}
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
              <div className="space-y-5">
                <DetailSection title="Request Overview">
                  <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <DetailRow label="Origin" value={originLabel(fieldText(overview, "origin"))} />
                    <DetailRow label="Service" value={fieldText(overview, "serviceName")} />
                    <DetailRow label="Category" value={labelFromApiValue(fieldText(overview, "serviceCategory"))} />
                    <DetailRow label="Submitted" value={fieldDate(overview, "submittedDate")} />
                    <DetailRow label="Expected Start" value={fieldDate(overview, "expectedStartDate")} />
                    <DetailRow label="Visits" value={fieldText(overview, "numberOfVisits")} />
                    <DetailRow label="Clinician" value={fieldText(overview, "clinicianName")} />
                    <DetailRow label="Stage" value={labelFromApiValue(detail.stepperStage)} />
                  </dl>
                </DetailSection>

                <DetailSection title="Patient Information">
                  <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <DetailRow label="Name" value={fieldText(patient, "name")} />
                    <DetailRow label="Patient ID" value={fieldText(patient, "patientId")} />
                    <DetailRow label="Age" value={fieldText(patient, "age")} />
                    <DetailRow label="Gender" value={labelFromApiValue(fieldText(patient, "gender"))} />
                    <DetailRow label="Phone" value={fieldText(patient, "phone")} />
                    <DetailRow label="Linked Hospital" value={fieldText(patient, "linkedHospital")} />
                    <div className="sm:col-span-2 lg:col-span-3"><DetailRow label="Address" value={fieldText(patient, "address")} /></div>
                  </dl>
                </DetailSection>

                <DetailSection title="Service Information">
                  <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <DetailRow label="Frequency" value={fieldText(service, "frequency")} />
                    <DetailRow label="Duration" value={fieldText(service, "duration")} />
                    <DetailRow label="Visits" value={fieldText(service, "visits")} />
                    <DetailRow label="Requested Date" value={fieldDate(requestedDateTime, "date")} />
                    <DetailRow label="Requested Time" value={fieldText(requestedDateTime, "time")} />
                    <DetailRow label="Category" value={labelFromApiValue(fieldText(service, "category"))} />
                    <div className="sm:col-span-2 lg:col-span-3"><DetailRow label="Clinical Instructions" value={fieldText(service, "clinicalInstructions")} /></div>
                  </dl>
                </DetailSection>

                <DetailSection title="Request Requirements">
                  <div className="flex flex-wrap gap-3">
                    <RequirementChip label="Referral" value={requirements.referral} />
                    <RequirementChip label="Prescription" value={requirements.prescription} />
                    <RequirementChip label="Doctor's Note" value={requirements.doctorsNote} />
                    <RequirementChip label="Clinical Review" value={requirements.clinicalReview} />
                  </div>
                </DetailSection>

                <DetailSection title="Uploaded Documents">
                  {detail.uploadedDocuments.length > 0 ? (
                    <div className="divide-y divide-admin-border">
                      {detail.uploadedDocuments.map((document, index) => {
                        const previewUrl = fieldText(document, "previewUrl", "");
                        return (
                          <div key={fieldText(document, "documentId", index.toString())} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="text-[14px] font-bold text-admin-ink">{fieldText(document, "fileName", "Document")}</p>
                              <p className="mt-1 text-[13px] text-admin-muted">{labelFromApiValue(fieldText(document, "fileType")) + " - " + fieldDate(document, "uploadDate")}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="rounded-full bg-admin-neutral-soft px-3 py-1 text-[12px] font-bold text-admin-muted">{labelFromApiValue(fieldText(document, "verificationStatus"))}</span>
                              {fieldText(document, "documentId", "") ? <Link href={{ pathname: "/home-care", query: { ...closeQuery, request: requestId, previewDocument: fieldText(document, "documentId", "") } }} className="font-bold text-admin-blue">Preview</Link> : previewUrl ? <a href={previewUrl} className="font-bold text-admin-blue">Preview</a> : null}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : <p className="text-[14px] font-medium text-admin-muted">No uploaded documents yet.</p>}
                </DetailSection>

                <DetailSection title="Operational Timeline">
                  {detail.operationalTimeline.length > 0 ? (
                    <ol className="space-y-4">
                      {detail.operationalTimeline.map((event, index) => (
                        <li key={fieldText(event, "id", index.toString())} className="grid gap-2 border-l-2 border-admin-blue-soft pl-4">
                          <p className="text-[14px] font-bold text-admin-ink">{fieldText(event, "event")}</p>
                          <p className="text-[13px] font-medium text-admin-muted">{fieldText(event, "actor") + " - " + labelFromApiValue(fieldText(event, "actorRole")) + " - " + fieldDate(event, "timestamp")}</p>
                          {fieldText(event, "details") !== "--" ? <p className="text-[13px] leading-5 text-admin-text/85">{fieldText(event, "details")}</p> : null}
                        </li>
                      ))}
                    </ol>
                  ) : <p className="text-[14px] font-medium text-admin-muted">No timeline activity yet.</p>}
                </DetailSection>
              </div>

              <div className="space-y-5">
                <DetailSection title="Provider Matches">
                  <div className="space-y-4">
                    {matches.length > 0 ? matches.map((candidate) => <ProviderMatchCard key={candidate.providerId} candidate={candidate} requestId={requestId} selected={candidate.providerId === activeProviderId} />) : <p className="text-[14px] font-medium text-admin-muted">No provider matches yet.</p>}
                  </div>
                </DetailSection>
                <DetailSection title="Quote Summary">
                  {quote ? (
                    <dl className="grid gap-4">
                      <DetailRow label="Quote Number" value={fieldText(quote, "quoteNumber")} />
                      <DetailRow label="Status" value={labelFromApiValue(fieldText(quote, "status"))} />
                      <DetailRow label="Service Fee" value={currencyText(quote.serviceFee)} />
                      <DetailRow label="Travel Fee" value={currencyText(quote.travelFee)} />
                      <DetailRow label="Platform Fee" value={currencyText(quote.platformFee)} />
                      <DetailRow label="Discount" value={currencyText(quote.discount)} />
                      <DetailRow label="Total" value={currencyText(quote.totalAmount)} />
                      <DetailRow label="Expires" value={fieldDate(quote, "expiresAt")} />
                    </dl>
                  ) : <p className="text-[14px] font-medium text-admin-muted">No quote has been created for this request.</p>}
                  <form action={saveQuoteAction} className="mt-5 grid gap-4 border-t border-admin-border pt-5">
                    <input type="hidden" name="requestId" value={requestId} />
                    <input type="hidden" name="provisionalProviderId" value={activeProviderId} />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label>
                        <span className="text-[12px] font-bold uppercase tracking-normal text-admin-muted">Unit Rate</span>
                        <input name="serviceUnitRate" type="number" min="0" step="0.01" defaultValue={quote ? fieldText(quote, "serviceUnitRate", "0") : "0"} className="mt-2 h-10 w-full rounded-[7px] border border-admin-border px-3 text-[14px] text-admin-ink outline-none focus:border-admin-blue" />
                      </label>
                      <label>
                        <span className="text-[12px] font-bold uppercase tracking-normal text-admin-muted">Visits</span>
                        <input name="numberOfVisits" type="number" min="1" step="1" defaultValue={quote ? fieldText(quote, "numberOfVisits", defaultVisits.toString()) : defaultVisits.toString()} className="mt-2 h-10 w-full rounded-[7px] border border-admin-border px-3 text-[14px] text-admin-ink outline-none focus:border-admin-blue" />
                      </label>
                      <label>
                        <span className="text-[12px] font-bold uppercase tracking-normal text-admin-muted">Service Fee</span>
                        <input name="serviceFee" type="number" min="0" step="0.01" defaultValue={quote ? fieldText(quote, "serviceFee", "0") : "0"} className="mt-2 h-10 w-full rounded-[7px] border border-admin-border px-3 text-[14px] text-admin-ink outline-none focus:border-admin-blue" />
                      </label>
                      <label>
                        <span className="text-[12px] font-bold uppercase tracking-normal text-admin-muted">Travel Fee</span>
                        <input name="travelFee" type="number" min="0" step="0.01" defaultValue={quote ? fieldText(quote, "travelFee", "0") : "0"} className="mt-2 h-10 w-full rounded-[7px] border border-admin-border px-3 text-[14px] text-admin-ink outline-none focus:border-admin-blue" />
                      </label>
                      <label>
                        <span className="text-[12px] font-bold uppercase tracking-normal text-admin-muted">Platform Fee</span>
                        <input name="platformFee" type="number" min="0" step="0.01" defaultValue={quote ? fieldText(quote, "platformFee", "0") : "0"} className="mt-2 h-10 w-full rounded-[7px] border border-admin-border px-3 text-[14px] text-admin-ink outline-none focus:border-admin-blue" />
                      </label>
                      <label>
                        <span className="text-[12px] font-bold uppercase tracking-normal text-admin-muted">Discount</span>
                        <input name="discount" type="number" min="0" step="0.01" defaultValue={quote ? fieldText(quote, "discount", "0") : "0"} className="mt-2 h-10 w-full rounded-[7px] border border-admin-border px-3 text-[14px] text-admin-ink outline-none focus:border-admin-blue" />
                      </label>
                    </div>
                    <label>
                      <span className="text-[12px] font-bold uppercase tracking-normal text-admin-muted">Validity Hours</span>
                      <input name="validityHours" type="number" min="1" step="1" defaultValue={quote ? fieldText(quote, "validityHours", "24") : "24"} className="mt-2 h-10 w-full rounded-[7px] border border-admin-border px-3 text-[14px] text-admin-ink outline-none focus:border-admin-blue" />
                    </label>
                    <label>
                      <span className="text-[12px] font-bold uppercase tracking-normal text-admin-muted">Patient Note</span>
                      <textarea name="patientNote" rows={3} defaultValue={quote ? fieldText(quote, "patientNote", "") : ""} className="mt-2 w-full rounded-[7px] border border-admin-border px-3 py-2 text-[14px] text-admin-ink outline-none focus:border-admin-blue" />
                    </label>
                    <label>
                      <span className="text-[12px] font-bold uppercase tracking-normal text-admin-muted">Operations Note</span>
                      <textarea name="operationsNote" rows={3} defaultValue={quote ? fieldText(quote, "operationsNote", "") : ""} className="mt-2 w-full rounded-[7px] border border-admin-border px-3 py-2 text-[14px] text-admin-ink outline-none focus:border-admin-blue" />
                    </label>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <button type="submit" name="sendNow" value="false" className="h-11 rounded-[8px] border border-admin-blue text-[14px] font-bold text-admin-blue">Save Draft</button>
                      <button type="submit" name="sendNow" value="true" className="h-11 rounded-[8px] bg-admin-blue text-[14px] font-bold text-white">Send Quote</button>
                    </div>
                  </form>
                  {quote ? (
                    <div className="mt-5 grid gap-3 border-t border-admin-border pt-5 sm:grid-cols-2">
                      <Link href={{ pathname: "/home-care", query: { ...closeQuery, request: requestId, payment: "1" } }} className="flex h-11 items-center justify-center rounded-[8px] border border-admin-blue text-[14px] font-bold text-admin-blue">View Payment</Link>
                      <Link href={{ pathname: "/home-care", query: { ...closeQuery, request: requestId, changeProvider: "1" } }} className="flex h-11 items-center justify-center rounded-[8px] bg-admin-blue text-[14px] font-bold text-white">Change Provider</Link>
                      <Link href={{ pathname: "/home-care", query: { ...closeQuery, request: requestId, cancelQuote: "1" } }} className="flex h-11 items-center justify-center rounded-[8px] bg-admin-red text-[14px] font-bold text-white">Cancel Quote</Link>
                    </div>
                  ) : null}
                  {activeProviderId ? (
                    <Link href={{ pathname: "/home-care", query: { ...closeQuery, request: requestId, confirmProvider: "1" } }} className="mt-3 flex h-11 items-center justify-center rounded-[8px] bg-admin-success text-[14px] font-bold text-white">Confirm Provider</Link>
                  ) : null}
                  {resendError ? <p className="mt-3 rounded-[8px] border border-admin-red/30 bg-admin-red-soft px-4 py-3 text-[14px] font-semibold text-admin-red">Unable to resend this quote. Confirm the quote is still active and try again.</p> : null}
                  {quote && fieldText(quote, "status") === "draft" ? (
                    <form action={sendDraftQuoteAction} className="mt-3">
                      <input type="hidden" name="requestId" value={requestId} />
                      <button type="submit" className="h-11 w-full rounded-[8px] bg-admin-success text-[14px] font-bold text-white">Send Existing Draft</button>
                    </form>
                  ) : null}
                  {quote && !["draft", "cancelled"].includes(fieldText(quote, "status")) ? (
                    <form action={resendQuoteAction} className="mt-3">
                      <input type="hidden" name="requestId" value={requestId} />
                      <input type="hidden" name="quoteId" value={fieldText(quote, "quoteId", fieldText(quote, "id", ""))} />
                      <input type="hidden" name="serviceUnitRate" value={fieldText(quote, "serviceUnitRate", "")} />
                      <input type="hidden" name="numberOfVisits" value={fieldText(quote, "numberOfVisits", defaultVisits.toString())} />
                      <input type="hidden" name="serviceFee" value={fieldText(quote, "serviceFee", "")} />
                      <input type="hidden" name="travelFee" value={fieldText(quote, "travelFee", "")} />
                      <input type="hidden" name="platformFee" value={fieldText(quote, "platformFee", "")} />
                      <input type="hidden" name="discount" value={fieldText(quote, "discount", "")} />
                      <input type="hidden" name="validityHours" value={fieldText(quote, "validityHours", "")} />
                      <input type="hidden" name="patientNote" value={fieldText(quote, "patientNote", "")} />
                      <input type="hidden" name="operationsNote" value={fieldText(quote, "operationsNote", "")} />
                      <input type="hidden" name="provisionalProviderId" value={activeProviderId} />
                      <button type="submit" className="h-11 w-full rounded-[8px] border border-admin-blue text-[14px] font-bold text-admin-blue">Resend Quote</button>
                    </form>
                  ) : null}
                </DetailSection>
                {showPayment ? (
                  <DetailSection title="Payment Confirmed">
                    <PaymentSummaryCard payment={paymentSummary} />
                  </DetailSection>
                ) : null}
                {showPayment ? (
                  <DetailSection title="Assignment Provider">
                    <AssignmentProviderCard assignment={assignmentOptions} />
                  </DetailSection>
                ) : null}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid min-h-0 flex-1 place-items-center px-6 text-center">
            <div className="max-w-[420px] rounded-[8px] border border-admin-border bg-white p-8">
              <h3 className="text-[20px] font-bold text-admin-ink">Request Details Unavailable</h3>
              <p className="mt-3 text-[14px] leading-6 text-admin-muted">This request could not be loaded from the admin Home Care endpoint.</p>
              <Link href={{ pathname: "/home-care", query: closeQuery }} className="mt-6 inline-flex h-11 items-center rounded-[8px] bg-admin-blue px-5 text-[14px] font-bold text-white">Back to requests</Link>
            </div>
          </div>
        )}
      </aside>
      {showChangeProvider ? <ChangeProviderModal matches={matches} requestId={requestId} activeProviderId={activeProviderId} /> : null}
      {showConfirmProvider ? <ConfirmProviderModal provider={confirmProvider} providerId={confirmProviderId} requestId={requestId} requestedDateTime={requestedDateTime} /> : null}
      {showCancelQuote ? <CancelQuoteModal quote={quote} requestId={requestId} /> : null}
      {showHoldRequest ? <HoldRequestModal requestId={requestId} holdError={holdError} /> : null}
      {showCancelRequest ? <CancelRequestModal requestId={requestId} cancelError={cancelError} /> : null}
      {previewDocumentId ? <DocumentPreviewModal documentPreview={documentPreview} requestId={requestId} documentId={previewDocumentId} /> : null}
    </div>
  );
}
function PaymentSummaryCard({ payment }: { payment: AdminHomeCarePaymentSummary | null }) {
  if (!payment) {
    return <p className="text-[14px] font-medium text-admin-muted">Payment details could not be loaded.</p>;
  }

  if (payment.hasQuote === false) {
    return <p className="text-[14px] font-medium text-admin-muted">{fieldText(payment, "message", "No quote has been sent to the patient.")}</p>;
  }

  return (
    <dl className="grid gap-4">
      <DetailRow label="Payment Status" value={labelFromApiValue(fieldText(payment, "paymentStatus"))} />
      <DetailRow label="Total Amount" value={currencyText(payment.totalAmount)} />
      <DetailRow label="Payment Method" value={labelFromApiValue(fieldText(payment, "paymentMethod"))} />
      <DetailRow label="Reference" value={fieldText(payment, "paymentReference")} />
      <DetailRow label="Payment Date" value={fieldDate(payment, "paymentDate")} />
      <DetailRow label="Quote Expiry" value={fieldDate(payment, "quoteExpiry")} />
    </dl>
  );
}

function AssignmentProviderCard({ assignment }: { assignment: AdminHomeCareAssignmentOptions | null }) {
  if (!assignment?.isPreselected || !assignment.provider) {
    return <p className="text-[14px] font-medium text-admin-muted">No provider has been preselected for assignment yet.</p>;
  }

  const provider = assignment.provider;
  return (
    <dl className="grid gap-4">
      <DetailRow label="Provider" value={fieldText(provider, "name")} />
      <DetailRow label="Profession" value={fieldText(provider, "profession")} />
      <DetailRow label="Availability" value={labelFromApiValue(fieldText(provider, "availability"))} />
      <DetailRow label="Verification" value={labelFromApiValue(fieldText(provider, "verificationStatus"))} />
      <DetailRow label="Current Load" value={fieldText(provider, "currentLoad")} />
    </dl>
  );
}

function ChangeProviderModal({ matches, requestId, activeProviderId }: { matches: AdminHomeCareProviderCandidate[]; requestId: string; activeProviderId: string }) {
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-admin-overlay px-5 backdrop-blur-[2px]">
      <section className="flex max-h-[88dvh] w-full max-w-[620px] flex-col overflow-hidden rounded-[10px] bg-white shadow-2xl">
        <header className="flex min-h-[84px] items-center justify-between border-b border-admin-border px-6">
          <div>
            <h3 className="text-[22px] font-bold text-admin-ink">Change Provider</h3>
            <p className="mt-1 text-[14px] font-medium text-admin-muted">Select another matched provider for this request.</p>
          </div>
          <Link href={{ pathname: "/home-care", query: { request: requestId } }} aria-label="Close change provider" className="text-admin-text"><CloseIcon className="h-6 w-6" /></Link>
        </header>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-6">
          {matches.length > 0 ? matches.map((candidate) => {
            const selected = candidate.providerId === activeProviderId;
            return (
              <article key={candidate.providerId} className={["rounded-[8px] border p-4", selected ? "border-admin-blue bg-admin-blue-soft" : "border-admin-border bg-white"].join(" ")}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-[16px] font-bold text-admin-ink">{candidate.name}</p>
                    <p className="mt-1 text-[13px] font-medium text-admin-muted">{candidate.profession + " - " + labelFromApiValue(candidate.availability)}</p>
                  </div>
                  <form action={changeProviderAction}>
                    <input type="hidden" name="requestId" value={requestId} />
                    <input type="hidden" name="providerId" value={candidate.providerId} />
                    <button type="submit" className={["h-10 rounded-[8px] px-4 text-[14px] font-bold", selected ? "border border-admin-success bg-white text-admin-success" : "bg-admin-blue text-white"].join(" ")}>{selected ? "Current Provider" : "Change Provider"}</button>
                  </form>
                </div>
              </article>
            );
          }) : <p className="text-[14px] font-medium text-admin-muted">No alternative providers are available right now.</p>}
        </div>
      </section>
    </div>
  );
}
function ConfirmProviderModal({ provider, providerId, requestId, requestedDateTime }: { provider: Record<string, unknown> | null; providerId: string; requestId: string; requestedDateTime: Record<string, unknown> }) {
  const hasProvider = Boolean(providerId);

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-admin-overlay px-5 backdrop-blur-[2px]">
      <section className="w-full max-w-[520px] overflow-hidden rounded-[10px] bg-white shadow-2xl">
        <header className="flex min-h-[84px] items-center justify-between border-b border-admin-border px-6">
          <div>
            <h3 className="text-[22px] font-bold text-admin-ink">Confirm Provider</h3>
            <p className="mt-1 text-[14px] font-medium text-admin-muted">Review the selected provider before assignment.</p>
          </div>
          <Link href={{ pathname: "/home-care", query: { request: requestId } }} aria-label="Close confirm provider" className="text-admin-text"><CloseIcon className="h-6 w-6" /></Link>
        </header>
        <form action={confirmProviderAction} className="px-6 py-6">
          <input type="hidden" name="requestId" value={requestId} />
          <input type="hidden" name="providerId" value={providerId} />
          {hasProvider ? (
            <div className="rounded-[8px] border border-admin-border bg-admin-bg p-4">
              <p className="text-[16px] font-bold text-admin-ink">{fieldText(provider ?? {}, "name", "Selected provider")}</p>
              <p className="mt-1 text-[13px] font-medium text-admin-muted">{fieldText(provider ?? {}, "profession")}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <DetailRow label="Availability" value={labelFromApiValue(fieldText(provider ?? {}, "availability"))} />
                <DetailRow label="Current Load" value={fieldText(provider ?? {}, "currentLoad")} />
              </div>
            </div>
          ) : <p className="rounded-[8px] bg-admin-red-soft p-4 text-[14px] font-medium text-admin-red">Select a provider before confirming assignment.</p>}
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label>
              <span className="text-[12px] font-bold uppercase tracking-normal text-admin-muted">Scheduled Date</span>
              <input name="scheduledDate" type="date" defaultValue={dateInputText(requestedDateTime, "date")} className="mt-2 h-11 w-full rounded-[7px] border border-admin-border px-3 text-[14px] text-admin-ink outline-none focus:border-admin-blue" />
            </label>
            <label>
              <span className="text-[12px] font-bold uppercase tracking-normal text-admin-muted">Scheduled Time</span>
              <input name="scheduledTime" defaultValue={fieldText(requestedDateTime, "time", "")} className="mt-2 h-11 w-full rounded-[7px] border border-admin-border px-3 text-[14px] text-admin-ink outline-none focus:border-admin-blue" placeholder="09:00 AM" />
            </label>
          </div>
          <footer className="mt-7 flex items-center justify-end gap-4 border-t border-admin-border pt-5">
            <Link href={{ pathname: "/home-care", query: { request: requestId } }} className="text-[14px] font-bold text-admin-text">Cancel</Link>
            <button type="submit" disabled={!hasProvider} className="h-11 rounded-[8px] bg-admin-blue px-5 text-[14px] font-bold text-white disabled:bg-admin-disabled disabled:text-admin-muted">Confirm Assignment</button>
          </footer>
        </form>
      </section>
    </div>
  );
}
function DocumentPreviewModal({ documentPreview, requestId, documentId }: { documentPreview: AdminHomeCareRequestDocument | null; requestId: string; documentId: string }) {
  const previewUrl = fieldText(documentPreview ?? {}, "previewUrl", "");
  const fileName = fieldText(documentPreview ?? {}, "fileName", "Document preview");
  const fileType = fieldText(documentPreview ?? {}, "fileType", "").toLowerCase();
  const canPreviewInline = previewUrl.match(/\.(png|jpe?g|webp|gif|pdf)(\?|$)/i) !== null || fileType.includes("image") || fileType.includes("pdf");

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-admin-overlay px-5 backdrop-blur-[2px]">
      <section className="flex h-[86vh] w-full max-w-[980px] flex-col overflow-hidden rounded-[10px] bg-white shadow-2xl">
        <header className="flex min-h-[84px] items-center justify-between border-b border-admin-border px-6">
          <div className="min-w-0">
            <p className="text-[13px] font-bold uppercase tracking-normal text-admin-muted">Document Preview</p>
            <h3 className="truncate text-[22px] font-bold text-admin-ink">{fileName}</h3>
          </div>
          <Link href={{ pathname: "/home-care", query: { request: requestId } }} aria-label="Close document preview" className="text-admin-text"><CloseIcon className="h-6 w-6" /></Link>
        </header>
        <div className="grid min-h-0 flex-1 gap-0 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="border-b border-admin-border bg-admin-bg p-6 lg:border-b-0 lg:border-r">
            <dl className="grid gap-4">
              <DetailRow label="Document ID" value={fieldText(documentPreview ?? {}, "documentId", documentId)} />
              <DetailRow label="Type" value={labelFromApiValue(fieldText(documentPreview ?? {}, "requestType", fieldText(documentPreview ?? {}, "fileType")))} />
              <DetailRow label="Status" value={labelFromApiValue(fieldText(documentPreview ?? {}, "verificationStatus"))} />
              <DetailRow label="Uploaded" value={fieldDate(documentPreview ?? {}, "uploadDate")} />
              <DetailRow label="File Size" value={fieldText(documentPreview ?? {}, "fileSize")} />
            </dl>
            {previewUrl ? <a href={previewUrl} target="_blank" rel="noreferrer" className="mt-6 flex h-11 items-center justify-center rounded-[8px] bg-admin-blue text-[14px] font-bold text-white">Open Original</a> : null}
          </aside>
          <div className="min-h-0 bg-white p-6">
            {previewUrl ? (
              canPreviewInline ? (
                <iframe title={fileName} src={previewUrl} className="h-full min-h-[420px] w-full rounded-[8px] border border-admin-border bg-admin-bg" />
              ) : (
                <div className="grid h-full min-h-[420px] place-items-center rounded-[8px] border border-admin-border bg-admin-bg p-8 text-center">
                  <div>
                    <h4 className="text-[18px] font-bold text-admin-ink">Preview unavailable</h4>
                    <p className="mt-2 text-[14px] font-medium text-admin-muted">This file type cannot be rendered inline.</p>
                    <a href={previewUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex h-11 items-center rounded-[8px] bg-admin-blue px-5 text-[14px] font-bold text-white">Open Original</a>
                  </div>
                </div>
              )
            ) : (
              <div className="grid h-full min-h-[420px] place-items-center rounded-[8px] border border-admin-border bg-admin-bg p-8 text-center">
                <div>
                  <h4 className="text-[18px] font-bold text-admin-ink">Document unavailable</h4>
                  <p className="mt-2 text-[14px] font-medium text-admin-muted">The preview endpoint did not return a document URL.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
function CancelRequestModal({ requestId, cancelError }: { requestId: string; cancelError: boolean }) {
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-admin-overlay px-5 backdrop-blur-[2px]">
      <section className="w-full max-w-[520px] overflow-hidden rounded-[10px] bg-white shadow-2xl">
        <header className="flex min-h-[84px] items-center justify-between border-b border-admin-border px-6">
          <div>
            <p className="text-[13px] font-bold uppercase tracking-normal text-admin-red">Request action</p>
            <h3 className="text-[22px] font-bold text-admin-ink">Cancel request</h3>
            <p className="mt-1 text-[14px] font-medium text-admin-muted">This will cancel the request and notify the patient.</p>
          </div>
          <Link href={{ pathname: "/home-care", query: { request: requestId } }} aria-label="Close cancel request" className="text-admin-text"><CloseIcon className="h-6 w-6" /></Link>
        </header>
        <form action={cancelRequestAction} className="px-6 py-6">
          <input type="hidden" name="requestId" value={requestId} />
          {cancelError ? <div className="mb-4 rounded-[8px] border border-admin-red/30 bg-admin-red-soft px-4 py-3 text-[14px] font-semibold text-admin-red">Unable to cancel this request. Confirm the request is still active and try again.</div> : null}
          <label className="block">
            <span className="text-[12px] font-bold uppercase tracking-normal text-admin-muted">Reason</span>
            <textarea name="reason" required rows={4} className="mt-2 w-full resize-none rounded-[7px] border border-admin-border px-3 py-3 text-[14px] text-admin-ink outline-none focus:border-admin-blue" placeholder="Add a cancellation reason" />
          </label>
          <label className="mt-5 block">
            <span className="text-[12px] font-bold uppercase tracking-normal text-admin-muted">Additional note</span>
            <textarea name="note" rows={3} className="mt-2 w-full resize-none rounded-[7px] border border-admin-border px-3 py-3 text-[14px] text-admin-ink outline-none focus:border-admin-blue" placeholder="Add context for the cancellation" />
          </label>
          <footer className="mt-7 flex items-center justify-end gap-4 border-t border-admin-border pt-5">
            <Link href={{ pathname: "/home-care", query: { request: requestId } }} className="text-[14px] font-bold text-admin-text">Keep Request Active</Link>
            <button type="submit" className="h-11 rounded-[8px] bg-admin-red px-5 text-[14px] font-bold text-white">Cancel Request</button>
          </footer>
        </form>
      </section>
    </div>
  );
}function HoldRequestModal({ requestId, holdError }: { requestId: string; holdError: boolean }) {
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-admin-overlay px-5 backdrop-blur-[2px]">
      <section className="w-full max-w-[520px] overflow-hidden rounded-[10px] bg-white shadow-2xl">
        <header className="flex min-h-[84px] items-center justify-between border-b border-admin-border px-6">
          <div>
            <p className="text-[13px] font-bold uppercase tracking-normal text-admin-red">Request action</p>
            <h3 className="text-[22px] font-bold text-admin-ink">Place request on hold</h3>
            <p className="mt-1 text-[14px] font-medium text-admin-muted">Add a reason before pausing this request.</p>
          </div>
          <Link href={{ pathname: "/home-care", query: { request: requestId } }} aria-label="Close hold request" className="text-admin-text"><CloseIcon className="h-6 w-6" /></Link>
        </header>
        <form action={holdRequestAction} className="px-6 py-6">
          <input type="hidden" name="requestId" value={requestId} />
          {holdError ? <div className="mb-4 rounded-[8px] border border-admin-red/30 bg-admin-red-soft px-4 py-3 text-[14px] font-semibold text-admin-red">Unable to place this request on hold. Confirm the request is still active and try again.</div> : null}
          <label className="block">
            <span className="text-[12px] font-bold uppercase tracking-normal text-admin-muted">Reason</span>
            <textarea name="reason" required rows={4} className="mt-2 w-full resize-none rounded-[7px] border border-admin-border px-3 py-3 text-[14px] text-admin-ink outline-none focus:border-admin-blue" placeholder="Add a reason for placing this request on hold" />
          </label>
          <footer className="mt-7 flex items-center justify-end gap-4 border-t border-admin-border pt-5">
            <Link href={{ pathname: "/home-care", query: { request: requestId } }} className="text-[14px] font-bold text-admin-text">Keep Request Active</Link>
            <button type="submit" className="h-11 rounded-[8px] bg-admin-red px-5 text-[14px] font-bold text-white">Place On Hold</button>
          </footer>
        </form>
      </section>
    </div>
  );
}function CancelQuoteModal({ quote, requestId }: { quote: Record<string, unknown> | null; requestId: string }) {
  const hasQuote = quote !== null;

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-admin-overlay px-5 backdrop-blur-[2px]">
      <section className="w-full max-w-[520px] overflow-hidden rounded-[10px] bg-white shadow-2xl">
        <header className="flex min-h-[84px] items-center justify-between border-b border-admin-border px-6">
          <div>
            <p className="text-[13px] font-bold uppercase tracking-normal text-admin-red">Cancel Quote</p>
            <h3 className="text-[22px] font-bold text-admin-ink">Cancel Active Quote</h3>
            <p className="mt-1 text-[14px] font-medium text-admin-muted">This will void the current quote for this request.</p>
          </div>
          <Link href={{ pathname: "/home-care", query: { request: requestId } }} aria-label="Close cancel quote" className="text-admin-text"><CloseIcon className="h-6 w-6" /></Link>
        </header>
        <form action={cancelQuoteAction} className="px-6 py-6">
          <input type="hidden" name="requestId" value={requestId} />
          {hasQuote ? (
            <div className="rounded-[8px] border border-admin-border bg-admin-bg p-4">
              <DetailRow label="Quote Number" value={fieldText(quote, "quoteNumber")} />
              <DetailRow label="Status" value={labelFromApiValue(fieldText(quote, "status"))} />
              <DetailRow label="Total" value={currencyText(quote.totalAmount)} />
            </div>
          ) : (
            <p className="rounded-[8px] border border-admin-border bg-admin-bg p-4 text-[14px] font-medium text-admin-muted">No active quote is available for cancellation.</p>
          )}
          <label className="mt-5 block">
            <span className="text-[12px] font-bold uppercase tracking-normal text-admin-muted">Reason</span>
            <textarea name="reason" rows={4} className="mt-2 w-full rounded-[7px] border border-admin-border px-3 py-2 text-[14px] text-admin-ink outline-none focus:border-admin-blue" placeholder="Add a cancellation reason" />
          </label>
          <footer className="mt-7 flex items-center justify-end gap-4 border-t border-admin-border pt-5">
            <Link href={{ pathname: "/home-care", query: { request: requestId } }} className="text-[14px] font-bold text-admin-text">Keep Quote</Link>
            <button type="submit" disabled={!hasQuote} className="h-11 rounded-[8px] bg-admin-red px-5 text-[14px] font-bold text-white disabled:bg-admin-disabled disabled:text-admin-muted">Cancel Quote</button>
          </footer>
        </form>
      </section>
    </div>
  );
}
function activeVisitStatusTone(status: string): RequestStatusTone {
  if (status === "completed") {
    return "green";
  }

  if (status === "provider_en_route" || status === "provider_arrived" || status === "in_progress") {
    return "blue";
  }

  if (status === "scheduled") {
    return "orange";
  }

  if (status === "cancelled") {
    return "red";
  }

  return "gray";
}

function VisitDetailsDrawer({ detail, visitId, closeQuery, showCancelVisit, cancellationOptions, cancelError }: { detail: AdminHomeCareVisitDetail | null; visitId: string; closeQuery: Record<string, string | string[]>; showCancelVisit: boolean; cancellationOptions: AdminHomeCareVisitCancellationOptions | null; cancelError: boolean }) {
  const patient = detail?.patientInfo ?? {};
  const visitStatus = detail?.visitStatus ?? {};
  const service = detail?.serviceDetails ?? {};
  const provider = detail?.providerInfo ?? {};
  const contacts = detail?.contactInfo ?? {};
  const patientContact = nestedField(contacts, "patient");
  const providerContact = nestedField(contacts, "provider");
  const timeline = detail?.visitTimeline ?? [];
  const cancellation = detail?.cancellation ?? null;
  const currentStatus = fieldText(visitStatus, "currentStatus", detail ? "--" : "Unavailable");
  const canCancel = detail !== null && currentStatus !== "completed" && currentStatus !== "cancelled";

  return (
    <div className="fixed inset-0 z-50 bg-admin-overlay backdrop-blur-[3px]">
      <section className="ml-auto flex h-dvh w-full max-w-[1120px] flex-col bg-white shadow-2xl">
        <header className="flex min-h-[92px] items-center justify-between border-b border-admin-border px-7">
          <div className="min-w-0">
            <p className="text-[13px] font-bold uppercase tracking-normal text-admin-muted">Active Visit Details</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h2 className="truncate text-[22px] font-bold text-admin-ink">{fieldText(patient, "reference", visitId)}</h2>
              <span className={['rounded-full px-3 py-1.5 text-[12px] font-bold', statusClass(activeVisitStatusTone(currentStatus))].join(" ")}>{labelFromApiValue(currentStatus)}</span>
            </div>
          </div>
          <Link href={{ pathname: "/home-care", query: closeQuery }} aria-label="Close visit details" className="text-admin-text"><CloseIcon className="h-7 w-7" /></Link>
        </header>

        {!detail ? (
          <div className="grid flex-1 place-items-center px-7 text-center"><div><h3 className="text-[22px] font-bold text-admin-ink">Visit Not Found</h3><p className="mt-2 text-[14px] font-medium text-admin-muted">The visit details could not be loaded.</p></div></div>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto bg-admin-bg px-7 py-6">
            <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
              <div className="space-y-5">
                <DetailSection title="Patient Information">
                  <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <DetailRow label="Name" value={fieldText(patient, "name")} />
                    <DetailRow label="Reference" value={fieldText(patient, "reference", visitId)} />
                    <DetailRow label="Phone" value={fieldText(patient, "phone")} />
                    <DetailRow label="Service" value={fieldText(patient, "service")} />
                    <div className="sm:col-span-2 lg:col-span-3"><DetailRow label="Address" value={fieldText(patient, "address")} /></div>
                  </dl>
                </DetailSection>

                <DetailSection title="Visit Status">
                  <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <DetailRow label="Visit ID" value={visitId} />
                    <DetailRow label="Current Status" value={labelFromApiValue(currentStatus)} />
                    <DetailRow label="Origin" value={originLabel(fieldText(visitStatus, "origin"))} />
                    <DetailRow label="Scheduled For" value={fieldDate(visitStatus, "scheduledFor")} />
                    <DetailRow label="Last Updated" value={fieldDate(visitStatus, "lastUpdated")} />
                  </dl>
                </DetailSection>

                <DetailSection title="Service Details">
                  <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <DetailRow label="Service" value={fieldText(service, "service")} />
                    <DetailRow label="Category" value={labelFromApiValue(fieldText(service, "category"))} />
                    <DetailRow label="Origin" value={originLabel(fieldText(service, "origin"))} />
                    <DetailRow label="Date" value={fieldDate(service, "date")} />
                    <DetailRow label="Time" value={fieldText(service, "time")} />
                    <DetailRow label="Duration" value={fieldText(service, "duration")} />
                    <div className="sm:col-span-2 lg:col-span-3"><DetailRow label="Clinical Instructions" value={fieldText(service, "clinicalInstructions")} /></div>
                  </dl>
                </DetailSection>

                <DetailSection title="Visit Timeline">
                  {timeline.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[720px] text-left text-[13px]">
                        <thead className="bg-admin-table-head text-[12px] uppercase text-admin-muted"><tr><th className="px-4 py-3">Event</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actor</th><th className="px-4 py-3">Time</th></tr></thead>
                        <tbody>
                          {timeline.map((item, index) => <tr key={fieldText(item, "id", index.toString())} className="border-b border-admin-border last:border-b-0"><td className="px-4 py-3 font-semibold text-admin-ink">{labelFromApiValue(fieldText(item, "event"))}</td><td className="px-4 py-3"><span className={['rounded-full px-3 py-1 text-[12px] font-bold', statusClass(activeVisitStatusTone(fieldText(item, "status")))].join(" ")}>{labelFromApiValue(fieldText(item, "status"))}</span></td><td className="px-4 py-3 text-admin-text">{fieldText(item, "actor")}</td><td className="px-4 py-3 text-admin-text">{fieldDate(item, "timestamp")}</td></tr>)}
                        </tbody>
                      </table>
                    </div>
                  ) : <p className="text-[14px] font-medium text-admin-muted">No timeline events yet.</p>}
                </DetailSection>
              </div>

              <div className="space-y-5">
                <DetailSection title="Provider Information">
                  <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                    <DetailRow label="Provider ID" value={fieldText(provider, "providerId")} />
                    <DetailRow label="Name" value={fieldText(provider, "name")} />
                    <DetailRow label="Profession" value={fieldText(provider, "profession")} />
                    <DetailRow label="Organization" value={fieldText(provider, "organization")} />
                    <DetailRow label="Phone" value={fieldText(provider, "phone")} />
                    <DetailRow label="Email" value={fieldText(provider, "email")} />
                  </dl>
                </DetailSection>

                <DetailSection title="Contact Information">
                  <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                    <DetailRow label="Patient" value={fieldText(patientContact, "name")} />
                    <DetailRow label="Patient Phone" value={fieldText(patientContact, "phone")} />
                    <DetailRow label="Provider" value={fieldText(providerContact, "name")} />
                    <DetailRow label="Provider Phone" value={fieldText(providerContact, "phone")} />
                  </dl>
                </DetailSection>

                {canCancel ? (
                  <DetailSection title="Visit Actions">
                    <Link href={{ pathname: "/home-care", query: { ...closeQuery, visit: visitId, cancelVisit: "1" } }} className="flex h-11 items-center justify-center rounded-[8px] bg-admin-red text-[14px] font-bold text-white">Cancel Visit</Link>
                  </DetailSection>
                ) : null}

                <DetailSection title="Operational Note">
                  <p className="text-[14px] font-medium leading-6 text-admin-text">{detail.operationalNote ?? "No operational note recorded."}</p>
                </DetailSection>

                {cancellation ? (
                  <DetailSection title="Cancellation">
                    <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                      <DetailRow label="Cancelled At" value={fieldDate(cancellation, "at")} />
                      <DetailRow label="Reason" value={labelFromApiValue(fieldText(cancellation, "reason"))} />
                      <DetailRow label="Cancelled By" value={fieldText(cancellation, "cancelledBy")} />
                      <DetailRow label="Details" value={fieldText(cancellation, "details")} />
                    </dl>
                  </DetailSection>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </section>
      {showCancelVisit && detail && canCancel ? <CancelVisitModal detail={detail} visitId={visitId} cancellationOptions={cancellationOptions} closeQuery={{ ...closeQuery, visit: visitId }} cancelError={cancelError} /> : null}
    </div>
  );
}

function CancelVisitModal({ detail, visitId, cancellationOptions, closeQuery, cancelError }: { detail: AdminHomeCareVisitDetail; visitId: string; cancellationOptions: AdminHomeCareVisitCancellationOptions | null; closeQuery: Record<string, string | string[]>; cancelError: boolean }) {
  const patient = detail.patientInfo;
  const provider = detail.providerInfo;
  const service = detail.serviceDetails;
  const reasons = cancellationOptions?.reasons ?? [];

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-admin-overlay px-5 backdrop-blur-[2px]">
      <section className="w-full max-w-[560px] overflow-hidden rounded-[10px] bg-white shadow-2xl">
        <header className="flex min-h-[84px] items-center justify-between border-b border-admin-border px-6">
          <div>
            <p className="text-[13px] font-bold uppercase tracking-normal text-admin-red">Cancel Visit</p>
            <h3 className="mt-1 text-[20px] font-bold text-admin-ink">{fieldText(patient, "reference", visitId)}</h3>
          </div>
          <Link href={{ pathname: "/home-care", query: closeQuery }} aria-label="Close cancel visit" className="text-admin-text"><CloseIcon className="h-6 w-6" /></Link>
        </header>
        <form action={cancelVisitAction} className="px-6 py-6">
          <input type="hidden" name="visitId" value={visitId} />
          {cancelError ? <div className="mb-4 rounded-[8px] border border-admin-red/30 bg-admin-red-soft px-4 py-3 text-[14px] font-semibold text-admin-red">Unable to cancel this visit. Confirm the visit is still active and try again.</div> : null}
          <div className="rounded-[8px] border border-admin-border bg-admin-bg p-4">
            <dl className="grid gap-4 sm:grid-cols-2">
              <DetailRow label="Patient" value={fieldText(patient, "name")} />
              <DetailRow label="Provider" value={fieldText(provider, "name")} />
              <DetailRow label="Service" value={fieldText(service, "service")} />
              <DetailRow label="Scheduled" value={fieldDate(service, "date")} />
            </dl>
          </div>
          <label className="mt-5 block">
            <span className="text-[12px] font-bold uppercase tracking-normal text-admin-muted">Reason</span>
            <select name="reasonCode" required disabled={reasons.length === 0} className="mt-2 h-11 w-full rounded-[7px] border border-admin-border bg-white px-3 text-[14px] text-admin-ink outline-none focus:border-admin-blue disabled:bg-admin-neutral-soft disabled:text-admin-muted">
              <option value="">Select reason</option>
              {reasons.map((reason) => <option key={reason} value={reason}>{labelFromApiValue(reason)}</option>)}
            </select>
          </label>
          <label className="mt-4 block">
            <span className="text-[12px] font-bold uppercase tracking-normal text-admin-muted">Details</span>
            <textarea name="details" rows={4} className="mt-2 w-full resize-none rounded-[7px] border border-admin-border px-3 py-3 text-[14px] text-admin-ink outline-none focus:border-admin-blue" placeholder="Add cancellation context for audit and notifications" />
          </label>
          {reasons.length === 0 ? <p className="mt-3 text-[13px] font-medium text-admin-red">Cancellation reasons could not be loaded.</p> : null}
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Link href={{ pathname: "/home-care", query: closeQuery }} className="flex h-11 items-center justify-center rounded-[8px] border border-admin-blue text-[14px] font-bold text-admin-blue">Keep Visit</Link>
            <button type="submit" disabled={reasons.length === 0} className="h-11 rounded-[8px] bg-admin-red text-[14px] font-bold text-white disabled:bg-admin-muted">Cancel Visit</button>
          </div>
        </form>
      </section>
    </div>
  );
}
function ActiveVisitsView({ visits, totalItems, page, limit, totalPages, params, exportUrl }: { visits: AdminHomeCareVisitRow[]; totalItems: number; page: number; limit: number; totalPages: number; params: Record<string, string | string[]>; exportUrl: string }) {
  const empty = visits.length === 0;
  const firstItem = totalItems > 0 ? (page - 1) * limit + 1 : 0;
  const lastItem = totalItems > 0 ? Math.min(firstItem + visits.length - 1, totalItems) : 0;
  const pageItems = Array.from({ length: Math.min(Math.max(totalPages, 1), 3) }, (_, index) => index + 1);
  const selectedStatuses = Array.isArray(params.statuses) ? params.statuses : typeof params.statuses === "string" ? [params.statuses] : [];

  return (
    <section className="relative overflow-hidden rounded-[10px] bg-white">
      <form action="/home-care" className="flex flex-col gap-4 px-4 py-4 xl:flex-row xl:items-start xl:justify-between">
        <input type="hidden" name="view" value="visits" />
        <div className="grid gap-4 md:grid-cols-[300px_180px_170px_160px_160px]">
          <label className="relative">
            <span className="sr-only">Search active visits</span>
            <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-admin-muted" />
            <input name="search" defaultValue={typeof params.search === "string" ? params.search : ""} className="h-9 w-full rounded-[7px] border border-admin-border bg-white pl-12 pr-3 text-[14px] text-admin-ink outline-none placeholder:text-admin-muted focus:border-admin-blue" placeholder="Search visit, patient, provider..." />
          </label>
          <select name="serviceCategory" aria-label="Filter by service category" defaultValue={typeof params.serviceCategory === "string" ? params.serviceCategory : ""} className="h-9 rounded-[7px] border border-admin-border bg-white px-3 text-[14px] text-admin-muted outline-none focus:border-admin-blue">
            <option value="">All Categories</option>
            <option value="nursing">Nursing</option>
            <option value="physiotherapy">Physiotherapy</option>
            <option value="lab">Lab</option>
            <option value="doctor_visit">Doctor Visit</option>
          </select>
          <select name="origin" aria-label="Filter by origin" defaultValue={typeof params.origin === "string" ? params.origin : ""} className="h-9 rounded-[7px] border border-admin-border bg-white px-3 text-[14px] text-admin-muted outline-none focus:border-admin-blue">
            <option value="">All Origins</option>
            <option value="direct">Direct</option>
            <option value="hospital">Clinician Ordered</option>
          </select>
          <input name="providerId" defaultValue={typeof params.providerId === "string" ? params.providerId : ""} className="h-9 rounded-[7px] border border-admin-border bg-white px-3 text-[14px] text-admin-ink outline-none placeholder:text-admin-muted focus:border-admin-blue" placeholder="Provider ID" />
          <input name="location" defaultValue={typeof params.location === "string" ? params.location : ""} className="h-9 rounded-[7px] border border-admin-border bg-white px-3 text-[14px] text-admin-ink outline-none placeholder:text-admin-muted focus:border-admin-blue" placeholder="Location" />
          <div className="md:col-span-5 flex flex-wrap gap-3">
            {["scheduled", "provider_en_route", "provider_arrived", "in_progress", "completed", "cancelled"].map((status) => (
              <label key={status} className="flex min-h-9 items-center gap-2 rounded-full border border-admin-border px-3 text-[12px] font-bold text-admin-text">
                <input type="checkbox" name="statuses" value={status} defaultChecked={selectedStatuses.includes(status)} className="h-3.5 w-3.5 accent-admin-blue" />
                {labelFromApiValue(status)}
              </label>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button type="submit" className="h-9 rounded-[7px] bg-admin-blue px-4 text-[14px] font-bold text-white">Apply</button>
          <a href={exportUrl} className="flex h-9 items-center gap-2 px-3 text-[14px] font-medium text-admin-ink"><DownloadIcon className="h-5 w-5" />Export</a>
        </div>
      </form>

      {empty ? (
        <div className="grid min-h-[417px] place-items-center border-t border-admin-border px-6 pb-10 pt-8 text-center">
          <div className="max-w-[440px]"><div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-admin-blue-soft text-admin-blue"><HeartPulseIcon className="h-12 w-12" /></div><h3 className="mt-7 text-[22px] font-bold text-admin-ink">No Active Visits Yet</h3><p className="mx-auto mt-3 text-[16px] leading-6 text-admin-text/90">Scheduled and live home care visits will appear here.</p></div>
        </div>
      ) : (
        <div className="overflow-x-auto px-4">
          <table className="w-full min-w-[1080px] border-collapse text-left">
            <thead className="bg-admin-table-head text-[12px] font-bold uppercase tracking-normal text-admin-ink/80"><tr><th className="px-5 py-5">Visit ID</th><th className="px-5 py-5">Patient</th><th className="px-5 py-5">Service</th><th className="px-5 py-5">Provider</th><th className="px-5 py-5">Origin</th><th className="px-5 py-5">Scheduled</th><th className="px-5 py-5">Status</th><th className="px-5 py-5">Action</th></tr></thead>
            <tbody className="text-[14px] text-admin-ink">
              {visits.map((visit) => (
                <tr key={visit.visitId} className="border-b border-admin-border/70 last:border-b-0">
                  <td className="px-5 py-4"><p className="font-semibold text-admin-ink">{visit.visitId}</p><p className="mt-0.5 text-[12px] text-admin-muted">{visit.bookingReference ?? "--"}</p></td>
                  <td className="px-5 py-4 text-admin-text/90">{visit.patientName ?? "--"}</td>
                  <td className="px-5 py-4"><p className="text-admin-text/90">{visit.serviceName ?? "--"}</p><p className="mt-0.5 text-[12px] text-admin-muted">{labelFromApiValue(visit.serviceCategory)}</p></td>
                  <td className="px-5 py-4 text-admin-text/90">{visit.providerName ?? "--"}</td>
                  <td className="px-5 py-4 text-admin-text/90">{originLabel(visit.visitOrigin)}</td>
                  <td className="px-5 py-4 text-admin-text/90">{formatDateLabel(visit.scheduledDateTime)}</td>
                  <td className="px-5 py-4"><span className={['rounded-full px-3 py-1.5 text-[12px] font-medium', statusClass(activeVisitStatusTone(visit.status))].join(" ")}>{labelFromApiValue(visit.status)}</span></td>
                  <td className="px-5 py-4"><Link href={{ pathname: "/home-care", query: { ...params, view: "visits", visit: visit.visitId } }} className="inline-flex items-center gap-2 font-semibold text-admin-blue" aria-label={"View visit " + visit.visitId}><EyeActionIcon className="h-5 w-5" />View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!empty ? (
        <footer className="flex min-h-[64px] items-center justify-between border-t border-admin-border px-4 text-[14px] text-admin-muted">
          <span>{"Showing " + firstItem + "-" + lastItem + " of " + totalItems + " Visits"}</span>
          <div className="flex items-center gap-3 text-admin-ink"><Link href={{ pathname: "/home-care", query: requestPageQuery(params, Math.max(page - 1, 1)) }} aria-label="Previous page" className="grid h-8 w-8 place-items-center rounded-[7px] border border-admin-border text-admin-neutral"><ChevronLeftIcon className="h-4 w-4" /></Link>{pageItems.map((pageNumber) => pageNumber === page ? <span key={pageNumber} className="grid h-8 w-8 place-items-center rounded-[7px] bg-admin-blue font-bold text-white">{pageNumber}</span> : <Link key={pageNumber} href={{ pathname: "/home-care", query: requestPageQuery(params, pageNumber) }}>{pageNumber}</Link>)}{totalPages > 4 ? <span>...</span> : null}{totalPages > 3 ? (totalPages === page ? <span className="grid h-8 w-8 place-items-center rounded-[7px] bg-admin-blue font-bold text-white">{totalPages}</span> : <Link href={{ pathname: "/home-care", query: requestPageQuery(params, totalPages) }}>{totalPages}</Link>) : null}<Link href={{ pathname: "/home-care", query: requestPageQuery(params, Math.min(page + 1, totalPages)) }} aria-label="Next page" className="grid h-8 w-8 place-items-center rounded-[7px] border border-admin-blue text-admin-blue"><ChevronRightIcon className="h-4 w-4" /></Link></div>
        </footer>
      ) : null}
    </section>
  );
}
function ProviderMetricCard({ title, value, tone }: { title: string; value: number; tone: RequestStatusTone }) {
  return (
    <article className="rounded-[8px] border border-admin-border bg-white px-5 py-5 shadow-sm">
      <p className="text-[12px] font-bold uppercase tracking-normal text-admin-muted">{title}</p>
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-[24px] font-bold text-admin-ink">{formatCount(value)}</p>
        <span className={["h-3 w-3 rounded-full", statusClass(tone).split(" ")[0]].join(" ")} />
      </div>
    </article>
  );
}

function providerInitials(name: string): string {
  const initials = name.split(" ").filter(Boolean).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join("");
  return initials || "HC";
}

function providerStatusTone(status: string): RequestStatusTone {
  if (status === "available" || status === "verified") {
    return "green";
  }

  if (status === "busy" || status === "pending") {
    return "orange";
  }

  if (status === "offline" || status === "on_leave") {
    return "gray";
  }

  if (status === "suspended" || status === "expired") {
    return "red";
  }

  return "blue";
}

function ProviderNetworkView({ overview, providers, totalItems, page, limit, totalPages, params, exportUrl }: { overview: AdminHomeCareProviderOverview | null; providers: AdminHomeCareProviderRow[]; totalItems: number; page: number; limit: number; totalPages: number; params: Record<string, string | string[]>; exportUrl: string }) {
  const empty = providers.length === 0;
  const firstItem = totalItems > 0 ? (page - 1) * limit + 1 : 0;
  const lastItem = totalItems > 0 ? Math.min(firstItem + providers.length - 1, totalItems) : 0;
  const pageItems = Array.from({ length: Math.min(Math.max(totalPages, 1), 3) }, (_, index) => index + 1);

  return (
    <section className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ProviderMetricCard title="Total Providers" value={overview?.totalProviders ?? 0} tone="blue" />
        <ProviderMetricCard title="Available" value={overview?.available ?? 0} tone="green" />
        <ProviderMetricCard title="Busy" value={overview?.busy ?? 0} tone="orange" />
        <ProviderMetricCard title="Pending Verification" value={overview?.pendingVerification ?? 0} tone="gray" />
      </div>

      <section className="relative overflow-hidden rounded-[10px] bg-white">
        <form action="/home-care" className="flex flex-col gap-4 px-4 py-4 xl:flex-row xl:items-center xl:justify-between">
          <input type="hidden" name="view" value="providers" />
          <div className="grid gap-4 md:grid-cols-[326px_190px_150px_170px_150px]">
            <label className="relative">
              <span className="sr-only">Search providers</span>
              <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-admin-muted" />
              <input name="search" defaultValue={typeof params.search === "string" ? params.search : ""} className="h-9 w-full rounded-[7px] border border-admin-border bg-white pl-12 pr-3 text-[14px] text-admin-ink outline-none placeholder:text-admin-muted focus:border-admin-blue" placeholder="Search by name, category, coverage..." />
            </label>
            <select name="professionalCategory" aria-label="Filter by professional category" defaultValue={typeof params.professionalCategory === "string" ? params.professionalCategory : ""} className="h-9 rounded-[7px] border border-admin-border bg-white px-3 text-[14px] text-admin-muted outline-none focus:border-admin-blue">
              <option value="">All Categories</option>
              <option value="Registered Nurse">Registered Nurse</option>
              <option value="Home Care Doctor">Home Care Doctor</option>
              <option value="Physiotherapist">Physiotherapist</option>
              <option value="Community Health Worker">Community Health Worker</option>
            </select>
            <select name="availability" aria-label="Filter by availability" defaultValue={typeof params.availability === "string" ? params.availability : ""} className="h-9 rounded-[7px] border border-admin-border bg-white px-3 text-[14px] text-admin-muted outline-none focus:border-admin-blue">
              <option value="">All Availability</option>
              <option value="available">Available</option>
              <option value="busy">Busy</option>
              <option value="on_leave">On Leave</option>
              <option value="offline">Offline</option>
            </select>
            <select name="verificationStatus" aria-label="Filter by verification" defaultValue={typeof params.verificationStatus === "string" ? params.verificationStatus : ""} className="h-9 rounded-[7px] border border-admin-border bg-white px-3 text-[14px] text-admin-muted outline-none focus:border-admin-blue">
              <option value="">All Verification</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
              <option value="expired">Expired</option>
              <option value="suspended">Suspended</option>
            </select>
            <input name="coverageArea" defaultValue={typeof params.coverageArea === "string" ? params.coverageArea : ""} className="h-9 rounded-[7px] border border-admin-border bg-white px-3 text-[14px] text-admin-ink outline-none placeholder:text-admin-muted focus:border-admin-blue" placeholder="Coverage" />
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" className="h-9 rounded-[7px] bg-admin-blue px-4 text-[14px] font-bold text-white">Apply</button>
            <Link href={{ pathname: "/home-care", query: { ...params, view: "providers", addProvider: "1" } }} className="flex h-9 items-center gap-2 rounded-[7px] bg-admin-blue px-4 text-[14px] font-bold text-white"><PlusIcon className="h-4 w-4" />Add Provider</Link>
            <a href={exportUrl} className="flex h-9 items-center gap-2 px-3 text-[14px] font-medium text-admin-ink"><DownloadIcon className="h-5 w-5" />Export</a>
          </div>
        </form>
        {empty ? (
          <div className="grid min-h-[417px] place-items-center border-t border-admin-border px-6 pb-10 pt-8 text-center">
            <div className="max-w-[440px]"><div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-admin-blue-soft text-admin-blue"><UserCheckIcon className="h-12 w-12" /></div><h3 className="mt-7 text-[22px] font-bold text-admin-ink">No Providers Yet</h3><p className="mx-auto mt-3 text-[16px] leading-6 text-admin-text/90">Providers added to the Home Care Network will appear here.</p></div>
          </div>
        ) : (
          <div className="overflow-x-auto px-4">
            <table className="w-full min-w-[1080px] border-collapse text-left">
              <thead className="bg-admin-table-head text-[12px] font-bold uppercase tracking-normal text-admin-ink/80"><tr><th className="px-5 py-5">Provider</th><th className="px-5 py-5">Category</th><th className="px-5 py-5">Coverage</th><th className="px-5 py-5">Availability</th><th className="px-5 py-5">Verification</th><th className="px-5 py-5">Active Visits</th><th className="px-5 py-5">Rating</th><th className="px-5 py-5">Action</th></tr></thead>
              <tbody className="text-[14px] text-admin-ink">
                {providers.map((provider) => (
                  <tr key={provider.providerId} className="border-b border-admin-border/70 last:border-b-0">
                    <td className="px-5 py-4"><div className="flex items-center gap-3"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-admin-blue-soft bg-cover bg-center text-[13px] font-bold text-admin-blue" style={provider.avatarUrl ? { backgroundImage: `url(${provider.avatarUrl})` } : undefined}>{provider.avatarUrl ? null : providerInitials(provider.name)}</div><div><p className="font-semibold text-admin-ink">{provider.name}</p><p className="mt-0.5 text-[12px] text-admin-muted">{provider.providerId}</p></div></div></td>
                    <td className="px-5 py-4 text-admin-text/90">{provider.profession}</td>
                    <td className="px-5 py-4 text-admin-text/90">{provider.coverageArea}</td>
                    <td className="px-5 py-4"><span className={["rounded-full px-3 py-1.5 text-[12px] font-medium", statusClass(providerStatusTone(provider.availabilityStatus))].join(" ")}>{labelFromApiValue(provider.availabilityStatus)}</span></td>
                    <td className="px-5 py-4"><span className={["rounded-full px-3 py-1.5 text-[12px] font-medium", statusClass(providerStatusTone(provider.verificationStatus))].join(" ")}>{labelFromApiValue(provider.verificationStatus)}</span></td>
                    <td className="px-5 py-4 text-admin-text/90">{formatCount(provider.activeVisitCount)}</td>
                    <td className="px-5 py-4 text-admin-text/90">{provider.rating === null ? "--" : provider.rating.toFixed(1)}</td>
                    <td className="px-5 py-4"><Link href={{ pathname: "/home-care", query: { ...params, provider: provider.providerId } }} className="inline-flex items-center gap-2 font-semibold text-admin-blue" aria-label={"View " + provider.name}><EyeActionIcon className="h-5 w-5" />View</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!empty ? (
          <footer className="flex min-h-[64px] items-center justify-between border-t border-admin-border px-4 text-[14px] text-admin-muted">
            <span>{"Showing " + firstItem + "-" + lastItem + " of " + totalItems + " Providers"}</span>
            <div className="flex items-center gap-3 text-admin-ink"><Link href={{ pathname: "/home-care", query: requestPageQuery(params, Math.max(page - 1, 1)) }} aria-label="Previous page" className="grid h-8 w-8 place-items-center rounded-[7px] border border-admin-border text-admin-neutral"><ChevronLeftIcon className="h-4 w-4" /></Link>{pageItems.map((pageNumber) => pageNumber === page ? <span key={pageNumber} className="grid h-8 w-8 place-items-center rounded-[7px] bg-admin-blue font-bold text-white">{pageNumber}</span> : <Link key={pageNumber} href={{ pathname: "/home-care", query: requestPageQuery(params, pageNumber) }}>{pageNumber}</Link>)}{totalPages > 4 ? <span>...</span> : null}{totalPages > 3 ? (totalPages === page ? <span className="grid h-8 w-8 place-items-center rounded-[7px] bg-admin-blue font-bold text-white">{totalPages}</span> : <Link href={{ pathname: "/home-care", query: requestPageQuery(params, totalPages) }}>{totalPages}</Link>) : null}<Link href={{ pathname: "/home-care", query: requestPageQuery(params, Math.min(page + 1, totalPages)) }} aria-label="Next page" className="grid h-8 w-8 place-items-center rounded-[7px] border border-admin-blue text-admin-blue"><ChevronRightIcon className="h-4 w-4" /></Link></div>
          </footer>
        ) : null}
      </section>
    </section>
  );
}
function providerListText(value: unknown): string {
  if (Array.isArray(value)) {
    const labels = value.map((item) => {
      if (typeof item === "string") {
        return labelFromApiValue(item);
      }
      if (item && typeof item === "object") {
        const record = item as Record<string, unknown>;
        return [fieldText(record, "city", ""), fieldText(record, "state", ""), fieldText(record, "lga", "")].filter((part) => part && part !== "--").join(", ");
      }
      return "";
    }).filter(Boolean);
    return labels.length > 0 ? labels.join(", ") : "--";
  }

  return "--";
}

function ProviderDetailsDrawer({ detail, assignments, documentPreview, selectedDocumentId, providerId, closeQuery, showEditProvider, providerUpdateError }: { detail: AdminHomeCareProviderDetail | null; assignments: AdminHomeCareProviderAssignment[]; documentPreview: AdminHomeCareProviderDocument | null; selectedDocumentId?: string; providerId: string; closeQuery: Record<string, string | string[]>; showEditProvider: boolean; providerUpdateError: boolean }) {
  const overview = detail?.overview ?? {};
  const professional = detail?.professionalInfo ?? {};
  const coverage = detail?.coverage ?? {};
  const metrics = detail?.performanceMetrics ?? {};
  const assignmentRows = assignments.length > 0 ? assignments : detail?.currentAssignments ?? [];
  const documents = detail?.verificationDocuments ?? [];
  const timeline = detail?.activityTimeline ?? [];
  const name = fieldText(overview, "name", "Provider");
  const avatarUrl = fieldText(overview, "avatarUrl", "");

  return (
    <div className="fixed inset-0 z-50 bg-admin-overlay backdrop-blur-[3px]">
      <section className="ml-auto flex h-dvh w-full max-w-[1120px] flex-col bg-white shadow-2xl">
        <header className="flex min-h-[92px] items-center justify-between border-b border-admin-border px-7">
          <div className="flex min-w-0 items-center gap-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-admin-blue-soft bg-cover bg-center text-[16px] font-bold text-admin-blue" style={avatarUrl ? { backgroundImage: `url(${avatarUrl})` } : undefined}>{avatarUrl ? null : providerInitials(name)}</div>
            <div className="min-w-0">
              <h2 className="truncate text-[22px] font-bold text-admin-ink">{name}</h2>
              <p className="mt-1 text-[14px] font-medium text-admin-muted">{fieldText(overview, "category") + " - " + fieldText(overview, "coverageLabel")}</p>
            </div>
          </div>
          <div className="flex items-center gap-3"><Link href={{ pathname: "/home-care", query: { ...closeQuery, provider: providerId, editProvider: "1" } }} className="h-10 rounded-[8px] bg-admin-blue px-4 py-2 text-[13px] font-bold text-white">Edit Provider</Link><Link href={{ pathname: "/home-care", query: closeQuery }} aria-label="Close provider details" className="text-admin-text"><CloseIcon className="h-7 w-7" /></Link></div>
        </header>

        {!detail ? (
          <div className="grid flex-1 place-items-center px-7 text-center"><div><h3 className="text-[22px] font-bold text-admin-ink">Provider Not Found</h3><p className="mt-2 text-[14px] font-medium text-admin-muted">The provider details could not be loaded.</p></div></div>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto bg-admin-bg px-7 py-6">
            <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
              <div className="space-y-5">
                <DetailSection title="Provider Overview">
                  <div className="mb-4 flex flex-wrap gap-2">
                    <span className={['rounded-full px-3 py-1.5 text-[12px] font-bold', statusClass(providerStatusTone(fieldText(overview, "verificationStatus")))].join(" ")}>{labelFromApiValue(fieldText(overview, "verificationStatus"))}</span>
                    <span className={['rounded-full px-3 py-1.5 text-[12px] font-bold', statusClass(providerStatusTone(fieldText(overview, "availability")))].join(" ")}>{labelFromApiValue(fieldText(overview, "availability"))}</span>
                  </div>
                  <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <DetailRow label="Provider ID" value={fieldText(overview, "providerId", providerId)} />
                    <DetailRow label="Category" value={fieldText(overview, "category")} />
                    <DetailRow label="Coverage" value={fieldText(overview, "coverageLabel")} />
                    <DetailRow label="Email" value={fieldText(overview, "email")} />
                    <DetailRow label="Phone" value={fieldText(overview, "phone")} />
                    <DetailRow label="Rating" value={fieldText(overview, "rating")} />
                  </dl>
                </DetailSection>

                <DetailSection title="Professional Information">
                  <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <DetailRow label="License Number" value={fieldText(professional, "licenseNumber")} />
                    <DetailRow label="Licensing Authority" value={fieldText(professional, "licensingAuthority")} />
                    <DetailRow label="License Expiry" value={fieldDate(professional, "licenseExpiryDate")} />
                    <DetailRow label="Experience" value={fieldText(professional, "yearsOfExperience") + " years"} />
                    <div className="sm:col-span-2 lg:col-span-3"><DetailRow label="Qualifications" value={providerListText(professional.qualifications)} /></div>
                  </dl>
                </DetailSection>

                <DetailSection title="Coverage & Services">
                  <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <DetailRow label="State" value={fieldText(coverage, "state")} />
                    <DetailRow label="City" value={fieldText(coverage, "city")} />
                    <DetailRow label="LGA" value={fieldText(coverage, "lga")} />
                    <DetailRow label="Radius" value={fieldText(coverage, "serviceRadius") + " km"} />
                    <div className="sm:col-span-2 lg:col-span-3"><DetailRow label="Service Categories" value={providerListText(coverage.serviceCategories)} /></div>
                    <div className="sm:col-span-2 lg:col-span-3"><DetailRow label="Capabilities" value={providerListText(coverage.serviceCapabilities)} /></div>
                  </dl>
                </DetailSection>

                <DetailSection title="Current Assignments">
                  {assignmentRows.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[720px] text-left text-[13px]">
                        <thead className="bg-admin-table-head text-[12px] uppercase text-admin-muted"><tr><th className="px-4 py-3">Visit ID</th><th className="px-4 py-3">Patient</th><th className="px-4 py-3">Service</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Status</th></tr></thead>
                        <tbody>
                          {assignmentRows.map((assignment, index) => <tr key={fieldText(assignment, "visitId", index.toString())} className="border-b border-admin-border last:border-b-0"><td className="px-4 py-3 font-semibold text-admin-ink">{fieldText(assignment, "visitId")}</td><td className="px-4 py-3 text-admin-text">{fieldText(assignment, "patientName")}</td><td className="px-4 py-3 text-admin-text">{fieldText(assignment, "service")}</td><td className="px-4 py-3 text-admin-text">{fieldDate(assignment, "visitDate")}</td><td className="px-4 py-3"><span className={['rounded-full px-3 py-1 text-[12px] font-bold', statusClass(statusTone(fieldText(assignment, "status")))].join(" ")}>{labelFromApiValue(fieldText(assignment, "status"))}</span></td></tr>)}
                        </tbody>
                      </table>
                    </div>
                  ) : <p className="text-[14px] font-medium text-admin-muted">No current assignments.</p>}
                </DetailSection>
              </div>

              <div className="space-y-5">
                <DetailSection title="Performance Metrics">
                  <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                    <DetailRow label="Total Assignments" value={fieldText(metrics, "totalAssignments")} />
                    <DetailRow label="Completed Visits" value={fieldText(metrics, "completedVisits")} />
                    <DetailRow label="Cancelled Visits" value={fieldText(metrics, "cancelledVisits")} />
                    <DetailRow label="Average Rating" value={fieldText(metrics, "avgRating")} />
                    <DetailRow label="Response Time" value={fieldText(metrics, "avgResponseTime")} />
                    <DetailRow label="Current Load" value={fieldText(metrics, "currentLoad")} />
                  </dl>
                </DetailSection>

                <DetailSection title="Verification Documents">
                  {documents.length > 0 ? <div className="divide-y divide-admin-border">{documents.map((document, index) => { const documentId = fieldText(document, "documentId", index.toString()); return <div key={documentId} className="py-3 first:pt-0 last:pb-0"><p className="text-[14px] font-bold text-admin-ink">{fieldText(document, "fileName")}</p><p className="mt-1 text-[12px] font-medium text-admin-muted">{labelFromApiValue(fieldText(document, "verificationStatus")) + " - " + fieldDate(document, "uploadDate")}</p><Link href={{ pathname: "/home-care", query: { ...closeQuery, provider: providerId, providerDocument: documentId } }} className="mt-2 inline-flex text-[13px] font-bold text-admin-blue">Preview</Link></div>; })}</div> : <p className="text-[14px] font-medium text-admin-muted">No verification documents uploaded.</p>}
                </DetailSection>

                {selectedDocumentId ? <DetailSection title="Document Preview"><dl className="grid gap-4"><DetailRow label="Document ID" value={fieldText(documentPreview ?? {}, "documentId", selectedDocumentId)} /><DetailRow label="File Name" value={fieldText(documentPreview ?? {}, "fileName")} /><DetailRow label="Status" value={labelFromApiValue(fieldText(documentPreview ?? {}, "verificationStatus"))} /><DetailRow label="Uploaded" value={fieldDate(documentPreview ?? {}, "uploadDate")} /></dl>{fieldText(documentPreview ?? {}, "previewUrl", "") ? <a href={fieldText(documentPreview ?? {}, "previewUrl", "")} target="_blank" rel="noreferrer" className="mt-5 flex h-10 items-center justify-center rounded-[8px] bg-admin-blue text-[14px] font-bold text-white">Open Original</a> : null}</DetailSection> : null}

                <DetailSection title="Activity Timeline">
                  {timeline.length > 0 ? <ol className="space-y-4">{timeline.map((event, index) => <li key={fieldText(event, "id", index.toString())} className="border-l-2 border-admin-blue-soft pl-4"><p className="text-[14px] font-bold text-admin-ink">{labelFromApiValue(fieldText(event, "event"))}</p><p className="mt-1 text-[12px] font-medium text-admin-muted">{fieldText(event, "actor") + " - " + fieldDate(event, "timestamp")}</p>{fieldText(event, "details") !== "--" ? <p className="mt-1 text-[13px] leading-5 text-admin-text/85">{fieldText(event, "details")}</p> : null}</li>)}</ol> : <p className="text-[14px] font-medium text-admin-muted">No provider activity yet.</p>}
                </DetailSection>
              </div>
            </div>
          </div>
        )}
      </section>
      {showEditProvider && detail ? <EditProviderModal detail={detail} providerId={providerId} closeQuery={closeQuery} providerUpdateError={providerUpdateError} /> : null}
    </div>
  );
}
function EditProviderModal({ detail, providerId, closeQuery, providerUpdateError }: { detail: AdminHomeCareProviderDetail; providerId: string; closeQuery: Record<string, string | string[]>; providerUpdateError: boolean }) {
  const overview = detail.overview;
  const professional = detail.professionalInfo;
  const coverage = detail.coverage;
  const statusValue = fieldText(overview, "availability", "available");
  const verificationValue = fieldText(overview, "verificationStatus", "pending");
  const activeValue = fieldText(overview, "isActive", "true");

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-admin-overlay px-5 py-6 backdrop-blur-[2px]">
      <section className="max-h-[92dvh] w-full max-w-[720px] overflow-y-auto rounded-[10px] bg-white shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-admin-border px-6 py-5">
          <div>
            <p className="text-[13px] font-bold uppercase tracking-normal text-admin-blue">Provider Details</p>
            <h3 className="mt-1 text-[22px] font-bold text-admin-ink">Edit Provider</h3>
            <p className="mt-1 text-[14px] font-medium text-admin-muted">Update the provider profile and availability.</p>
          </div>
          <Link href={{ pathname: "/home-care", query: closeQuery }} aria-label="Close edit provider" className="text-admin-text"><CloseIcon className="h-6 w-6" /></Link>
        </header>
        <form action={updateProviderAction} className="space-y-5 px-6 py-6">
          <input type="hidden" name="providerId" value={providerId} />
          {providerUpdateError ? <div className="rounded-[8px] border border-admin-red/30 bg-admin-red-soft px-4 py-3 text-[14px] font-semibold text-admin-red">Unable to update this provider. Check the values and try again.</div> : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <label><span className="text-[12px] font-bold uppercase text-admin-muted">Name</span><input required name="name" defaultValue={fieldText(overview, "name", "")} className="mt-2 h-11 w-full rounded-[7px] border border-admin-border px-3 text-[14px] text-admin-ink outline-none focus:border-admin-blue" /></label>
            <label><span className="text-[12px] font-bold uppercase text-admin-muted">Professional Role</span><input name="professionalRole" defaultValue={fieldText(overview, "category", "")} className="mt-2 h-11 w-full rounded-[7px] border border-admin-border px-3 text-[14px] text-admin-ink outline-none focus:border-admin-blue" /></label>
            <label><span className="text-[12px] font-bold uppercase text-admin-muted">Email</span><input required type="email" name="email" defaultValue={fieldText(overview, "email", "")} className="mt-2 h-11 w-full rounded-[7px] border border-admin-border px-3 text-[14px] text-admin-ink outline-none focus:border-admin-blue" /></label>
            <label><span className="text-[12px] font-bold uppercase text-admin-muted">Phone</span><input name="phone" defaultValue={fieldText(overview, "phone", "")} className="mt-2 h-11 w-full rounded-[7px] border border-admin-border px-3 text-[14px] text-admin-ink outline-none focus:border-admin-blue" /></label>
            <label><span className="text-[12px] font-bold uppercase text-admin-muted">City</span><input name="city" defaultValue={fieldText(coverage, "city", "")} className="mt-2 h-11 w-full rounded-[7px] border border-admin-border px-3 text-[14px] text-admin-ink outline-none focus:border-admin-blue" /></label>
            <label><span className="text-[12px] font-bold uppercase text-admin-muted">State</span><input name="state" defaultValue={fieldText(coverage, "state", "")} className="mt-2 h-11 w-full rounded-[7px] border border-admin-border px-3 text-[14px] text-admin-ink outline-none focus:border-admin-blue" /></label>
            <label><span className="text-[12px] font-bold uppercase text-admin-muted">LGA</span><input name="lga" defaultValue={fieldText(coverage, "lga", "")} className="mt-2 h-11 w-full rounded-[7px] border border-admin-border px-3 text-[14px] text-admin-ink outline-none focus:border-admin-blue" /></label>
            <label><span className="text-[12px] font-bold uppercase text-admin-muted">Service Radius (km)</span><input type="number" min="0" name="serviceRadius" defaultValue={fieldText(coverage, "serviceRadius", "")} className="mt-2 h-11 w-full rounded-[7px] border border-admin-border px-3 text-[14px] text-admin-ink outline-none focus:border-admin-blue" /></label>
            <label><span className="text-[12px] font-bold uppercase text-admin-muted">Years of Experience</span><input type="number" min="0" name="yearsOfExperience" defaultValue={fieldText(professional, "yearsOfExperience", "")} className="mt-2 h-11 w-full rounded-[7px] border border-admin-border px-3 text-[14px] text-admin-ink outline-none focus:border-admin-blue" /></label>
            <label><span className="text-[12px] font-bold uppercase text-admin-muted">License Number</span><input name="licenseNumber" defaultValue={fieldText(professional, "licenseNumber", "")} className="mt-2 h-11 w-full rounded-[7px] border border-admin-border px-3 text-[14px] text-admin-ink outline-none focus:border-admin-blue" /></label>
            <label><span className="text-[12px] font-bold uppercase text-admin-muted">Licensing Authority</span><input name="licensingAuthority" defaultValue={fieldText(professional, "licensingAuthority", "")} className="mt-2 h-11 w-full rounded-[7px] border border-admin-border px-3 text-[14px] text-admin-ink outline-none focus:border-admin-blue" /></label>
            <label><span className="text-[12px] font-bold uppercase text-admin-muted">License Expiry</span><input type="date" name="licenseExpiryDate" defaultValue={fieldText(professional, "licenseExpiryDate", "").slice(0, 10)} className="mt-2 h-11 w-full rounded-[7px] border border-admin-border px-3 text-[14px] text-admin-ink outline-none focus:border-admin-blue" /></label>
            <label><span className="text-[12px] font-bold uppercase text-admin-muted">Availability<select name="availability" defaultValue={statusValue} className="mt-2 h-11 w-full rounded-[7px] border border-admin-border bg-white px-3 text-[14px] text-admin-ink"><option value="available">Available</option><option value="busy">Busy</option><option value="on_leave">On Leave</option><option value="offline">Offline</option></select></span></label>
            <label><span className="text-[12px] font-bold uppercase text-admin-muted">Verification<select name="verificationStatus" defaultValue={verificationValue} className="mt-2 h-11 w-full rounded-[7px] border border-admin-border bg-white px-3 py-3 text-[14px] text-admin-ink"><option value="pending">Pending</option><option value="verified">Verified</option><option value="rejected">Rejected</option><option value="expired">Expired</option><option value="suspended">Suspended</option></select></span></label>
          </div>
          <label className="block"><span className="text-[12px] font-bold uppercase text-admin-muted">Service Categories (comma separated)</span><input name="serviceCategories" defaultValue={providerListText(coverage.serviceCategories)} className="mt-2 h-11 w-full rounded-[7px] border border-admin-border px-3 text-[14px] text-admin-ink outline-none focus:border-admin-blue" /></label>
          <label className="block"><span className="text-[12px] font-bold uppercase text-admin-muted">Service Capabilities (comma separated)</span><input name="serviceCapabilities" defaultValue={providerListText(coverage.serviceCapabilities)} className="mt-2 h-11 w-full rounded-[7px] border border-admin-border px-3 text-[14px] text-admin-ink outline-none focus:border-admin-blue" /></label>
          <label className="block"><span className="text-[12px] font-bold uppercase text-admin-muted">Account Status<select name="isActive" defaultValue={activeValue === "false" ? "false" : "true"} className="mt-2 h-11 w-full rounded-[8px] border border-admin-border bg-white px-3 text-[14px] text-admin-ink"><option value="true">Active</option><option value="false">Inactive</option></select></span></label>
          <footer className="flex justify-end gap-3 border-t border-admin-border pt-5">
            <Link href={{ pathname: "/home-care", query: closeQuery }} className="rounded-[8px] px-4 py-3 text-[14px] font-bold text-admin-muted">Cancel</Link>
            <button type="submit" className="rounded-[8px] bg-admin-blue px-5 py-3 text-[14px] font-bold text-white">Save Changes</button>
          </footer>
        </form>
      </section>
    </div>
  );
}function providerOptionsOrFallback(options: AdminHomeCareProviderFormOptions | null): AdminHomeCareProviderFormOptions {
  return {
    genders: options?.genders.length ? options.genders : ["male", "female"],
    professionalCategories: options?.professionalCategories.length ? options.professionalCategories : ["Registered Nurse", "Home Care Doctor", "Physiotherapist", "Community Health Worker"],
    serviceCapabilities: options?.serviceCapabilities.length ? options.serviceCapabilities : ["Nursing Assessment", "Medication Administration", "Wound Care", "Physiotherapy"],
    states: options?.states.length ? options.states : ["Lagos", "Abuja (FCT)", "Rivers", "Oyo"],
    cities: options?.cities ?? [],
    lgas: options?.lgas ?? [],
    availabilityStatuses: options?.availabilityStatuses.length ? options.availabilityStatuses : ["available", "busy", "on_leave", "offline"],
    defaultAccountStatus: options?.defaultAccountStatus ?? "pending_verification",
  };
}

function FieldLabel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="min-w-0">
      <span className="text-[13px] font-bold text-admin-ink">{label}</span>
      {children}
    </label>
  );
}

function AddProviderPanel({ options, closeQuery, formError, draftSaved }: { options: AdminHomeCareProviderFormOptions | null; closeQuery: Record<string, string | string[]>; formError: boolean; draftSaved: boolean }) {
  const resolved = providerOptionsOrFallback(options);
  const inputClass = "mt-2 h-11 w-full rounded-[7px] border border-admin-border bg-white px-3 text-[14px] text-admin-ink outline-none placeholder:text-admin-muted focus:border-admin-blue";
  const fileClass = "mt-2 block w-full rounded-[7px] border border-dashed border-admin-border bg-admin-neutral-soft px-3 py-3 text-[13px] text-admin-muted file:mr-3 file:rounded-[6px] file:border-0 file:bg-admin-blue file:px-3 file:py-2 file:text-[13px] file:font-bold file:text-white";

  return (
    <div className="fixed inset-0 z-50 bg-admin-overlay backdrop-blur-[3px]">
      <section className="ml-auto flex h-dvh w-full max-w-[980px] flex-col bg-white shadow-2xl">
        <header className="flex min-h-[86px] items-center justify-between border-b border-admin-border px-7">
          <div>
            <h2 className="text-[22px] font-bold text-admin-ink">Add Provider</h2>
            <p className="mt-1 text-[14px] font-medium text-admin-muted">Create a provider profile for Home Care Network verification</p>
          </div>
          <Link href={{ pathname: "/home-care", query: closeQuery }} aria-label="Close add provider" className="text-admin-text"><CloseIcon className="h-7 w-7" /></Link>
        </header>

        <form action={saveProviderAction} className="min-h-0 flex-1 overflow-y-auto px-7 py-6">
          {formError ? <div className="mb-5 rounded-[8px] border border-admin-red/30 bg-admin-red-soft px-4 py-3 text-[14px] font-semibold text-admin-red">Complete provider name, role, registration ID, email, phone, state, city, and at least one service category.</div> : null}
          {draftSaved ? <div className="mb-5 rounded-[8px] border border-admin-blue/20 bg-admin-blue-soft px-4 py-3 text-[14px] font-semibold text-admin-blue">Provider draft saved.</div> : null}

          <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
            <div className="space-y-5">
              <section className="rounded-[10px] border border-admin-border bg-white p-5">
                <div className="mb-5 flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-[8px] bg-admin-blue-soft text-admin-blue"><BriefcaseIcon className="h-5 w-5" /></span><h3 className="text-[17px] font-bold text-admin-ink">Professional Information</h3></div>
                <div className="grid gap-4 md:grid-cols-2">
                  <FieldLabel label="Full Name"><input name="name" className={inputClass} placeholder="Provider name" /></FieldLabel>
                  <FieldLabel label="Professional Role"><select name="professionalRole" className={inputClass} defaultValue=""><option value="" disabled>Select role</option>{resolved.professionalCategories.map((item) => <option key={item} value={item}>{item}</option>)}</select></FieldLabel>
                  <FieldLabel label="Registration / ID Number"><input name="identificationNumber" className={inputClass} placeholder="Professional ID" /></FieldLabel>
                  <FieldLabel label="Years of Experience"><input name="yearsOfExperience" type="number" min="0" className={inputClass} placeholder="0" /></FieldLabel>
                  <FieldLabel label="Gender"><select name="gender" className={inputClass} defaultValue=""><option value="">Not specified</option>{resolved.genders.map((item) => <option key={item} value={item}>{labelFromApiValue(item)}</option>)}</select></FieldLabel>
                  <FieldLabel label="Date of Birth"><input name="dateOfBirth" type="date" className={inputClass} /></FieldLabel>
                </div>
              </section>

              <section className="rounded-[10px] border border-admin-border bg-white p-5">
                <div className="mb-5 flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-[8px] bg-admin-green-soft text-admin-success"><MapPinIcon className="h-5 w-5" /></span><h3 className="text-[17px] font-bold text-admin-ink">Coverage & Services</h3></div>
                <div className="grid gap-4 md:grid-cols-2">
                  <FieldLabel label="State"><select name="state" className={inputClass} defaultValue=""><option value="" disabled>Select state</option>{resolved.states.map((item) => <option key={item} value={item}>{item}</option>)}</select></FieldLabel>
                  <FieldLabel label="City"><input name="city" className={inputClass} placeholder="City" list="provider-cities" /><datalist id="provider-cities">{resolved.cities.map((item) => <option key={item} value={item} />)}</datalist></FieldLabel>
                  <FieldLabel label="LGA"><input name="lga" className={inputClass} placeholder="LGA" list="provider-lgas" /><datalist id="provider-lgas">{resolved.lgas.map((item) => <option key={item} value={item} />)}</datalist></FieldLabel>
                  <FieldLabel label="Service Radius (km)"><input name="serviceRadius" type="number" min="0" className={inputClass} placeholder="25" /></FieldLabel>
                  <FieldLabel label="Availability"><select name="availability" className={inputClass} defaultValue="available">{resolved.availabilityStatuses.map((item) => <option key={item} value={item}>{labelFromApiValue(item)}</option>)}</select></FieldLabel>
                  <FieldLabel label="Address"><input name="address" className={inputClass} placeholder="Street address" /></FieldLabel>
                </div>
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {resolved.professionalCategories.map((item) => <label key={item} className="flex min-h-10 items-center gap-3 rounded-[7px] border border-admin-border px-3 text-[13px] font-medium text-admin-text"><input type="checkbox" name="serviceCategories" value={item} className="h-4 w-4 accent-admin-blue" />{item}</label>)}
                </div>
              </section>

              <section className="rounded-[10px] border border-admin-border bg-white p-5">
                <div className="mb-5 flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-[8px] bg-admin-neutral-soft text-admin-neutral"><IdIcon className="h-5 w-5" /></span><h3 className="text-[17px] font-bold text-admin-ink">License & Verification</h3></div>
                <div className="grid gap-4 md:grid-cols-2">
                  <FieldLabel label="License Number"><input name="licenseNumber" className={inputClass} placeholder="License number" /></FieldLabel>
                  <FieldLabel label="Licensing Authority"><input name="licensingAuthority" className={inputClass} placeholder="Authority" /></FieldLabel>
                  <FieldLabel label="License Expiry"><input name="licenseExpiryDate" type="date" className={inputClass} /></FieldLabel>
                  <FieldLabel label="Qualification"><input name="qualificationTitle" className={inputClass} placeholder="Qualification" /></FieldLabel>
                  <FieldLabel label="Institution"><input name="qualificationInstitution" className={inputClass} placeholder="Institution" /></FieldLabel>
                  <FieldLabel label="Year"><input name="qualificationYear" type="number" min="1900" className={inputClass} placeholder="2026" /></FieldLabel>
                </div>
              </section>
            </div>

            <aside className="space-y-5">
              <section className="rounded-[10px] border border-admin-border bg-white p-5">
                <h3 className="text-[17px] font-bold text-admin-ink">Contact</h3>
                <div className="mt-4 space-y-4">
                  <FieldLabel label="Email"><div className="relative"><MailSmallIcon className="absolute left-3 top-[21px] h-5 w-5 text-admin-muted" /><input name="email" type="email" className={inputClass + " pl-10"} placeholder="email@example.com" /></div></FieldLabel>
                  <FieldLabel label="Phone"><div className="relative"><PhoneIcon className="absolute left-3 top-[21px] h-5 w-5 text-admin-muted" /><input name="phone" className={inputClass + " pl-10"} placeholder="+234" /></div></FieldLabel>
                </div>
              </section>

              <section className="rounded-[10px] border border-admin-border bg-white p-5">
                <h3 className="text-[17px] font-bold text-admin-ink">Capabilities</h3>
                <div className="mt-4 grid gap-3">
                  {resolved.serviceCapabilities.map((item) => <label key={item} className="flex min-h-10 items-center gap-3 rounded-[7px] border border-admin-border px-3 text-[13px] font-medium text-admin-text"><input type="checkbox" name="serviceCapabilities" value={item} className="h-4 w-4 accent-admin-blue" />{item}</label>)}
                </div>
              </section>

              <section className="rounded-[10px] border border-admin-border bg-white p-5">
                <h3 className="text-[17px] font-bold text-admin-ink">Uploads</h3>
                <div className="mt-4 space-y-4">
                  <FieldLabel label="Profile Photo"><input name="profilePhoto" type="file" accept="image/*" className={fileClass} /></FieldLabel>
                  <FieldLabel label="License Document"><input name="licenseFile" type="file" className={fileClass} /></FieldLabel>
                  <FieldLabel label="Government ID"><input name="governmentIdFile" type="file" className={fileClass} /></FieldLabel>
                  <FieldLabel label="Practice Certificate"><input name="certificateFile" type="file" className={fileClass} /></FieldLabel>
                </div>
              </section>
            </aside>
          </div>

          <footer className="sticky bottom-0 mt-6 flex items-center justify-end gap-3 border-t border-admin-border bg-white py-5">
            <Link href={{ pathname: "/home-care", query: closeQuery }} className="flex h-11 items-center justify-center rounded-[8px] border border-admin-blue px-5 text-[14px] font-bold text-admin-blue">Cancel</Link>
            <button type="submit" name="intent" value="draft" className="h-11 rounded-[8px] border border-admin-border px-5 text-[14px] font-bold text-admin-ink">Save Draft</button>
            <button type="submit" name="intent" value="submit" className="h-11 rounded-[8px] bg-admin-blue px-5 text-[14px] font-bold text-white">Submit Provider</button>
          </footer>
        </form>
      </section>
    </div>
  );
}
export default async function HomeCarePage({ searchParams }: HomeCarePageProps) {
  const token = await getAdminSessionToken();
  if (!token) {
    redirect("/login");
  }

  const params = await searchParams;
  const cleanParams = queryWithoutFilter(params);
  const isProviderNetworkView = params.view === "providers";
  const isActiveVisitsView = params.view === "visits";
  const showAddProvider = isProviderNetworkView && params.addProvider === "1";
  const showFilters = !isProviderNetworkView && !isActiveVisitsView && params.filters === "1";
  const selectedRequestId = !isProviderNetworkView && !isActiveVisitsView && typeof params.request === "string" && params.request.trim() ? params.request : undefined;
  const selectedProviderId = typeof params.selectedProvider === "string" && params.selectedProvider.trim() ? params.selectedProvider : undefined;
  const showPayment = params.payment === "1";
  const showChangeProvider = params.changeProvider === "1";
  const showConfirmProvider = params.confirmProvider === "1";
  const showCancelQuote = params.cancelQuote === "1";
  const showHoldRequest = params.holdRequest === "1";
  const showCancelRequest = params.cancelRequest === "1";
  const showCancelVisit = params.cancelVisit === "1";
  const selectedDocumentId = typeof params.previewDocument === "string" && params.previewDocument.trim() ? params.previewDocument : undefined;
  const selectedNetworkProviderId = isProviderNetworkView && typeof params.provider === "string" && params.provider.trim() ? params.provider : undefined;
  const selectedProviderDocumentId = selectedNetworkProviderId && typeof params.providerDocument === "string" && params.providerDocument.trim() ? params.providerDocument : undefined;
  const showEditProvider = params.editProvider === "1";
  const selectedVisitId = isActiveVisitsView && typeof params.visit === "string" && params.visit.trim() ? params.visit : undefined;
  const showProviderDetails = Boolean(selectedNetworkProviderId) && !showAddProvider;
  const query = {
    page: params.page,
    limit: params.limit,
    search: params.search,
    origin: params.origin,
    statuses: params.statuses,
    serviceCategory: params.serviceCategory,
    dateRange: params.dateRange,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
    location: params.location,
    sort: params.sort,
  };
  const providerQuery = {
    page: params.page,
    limit: params.limit,
    search: params.search,
    professionalCategory: params.professionalCategory,
    availability: params.availability,
    verificationStatus: params.verificationStatus,
    coverageArea: params.coverageArea,
    sort: params.sort,
    order: params.order,
  };
  const visitQuery = {
    page: params.page,
    limit: params.limit,
    search: params.search,
    statuses: params.statuses,
    serviceCategory: params.serviceCategory,
    providerId: params.providerId,
    origin: params.origin,
    location: params.location,
    sort: params.sort,
  };

  const [overview, requestList, providerOverview, providerList, visitList, visitDetail, cancellationOptions, providerFormOptions, providerDetail, providerAssignments, providerDocumentPreview, filterOptions, requestDetail, providerMatches, paymentSummary, assignmentOptions, documentPreview] = await Promise.all([
    getAdminHomeCareOverview(token),
    isProviderNetworkView ? Promise.resolve(null) : getAdminHomeCareRequests(token, query),
    isProviderNetworkView ? getAdminHomeCareProviderOverview(token) : Promise.resolve(null),
    isProviderNetworkView ? getAdminHomeCareProviders(token, providerQuery) : Promise.resolve(null),
    isActiveVisitsView ? getAdminHomeCareVisits(token, visitQuery) : Promise.resolve(null),
    selectedVisitId ? getAdminHomeCareVisitDetail(token, selectedVisitId) : Promise.resolve(null),
    selectedVisitId && showCancelVisit ? getAdminHomeCareVisitCancellationReasons(token) : Promise.resolve(null),
    showAddProvider ? getAdminHomeCareProviderFormOptions(token) : Promise.resolve(null),
    selectedNetworkProviderId ? getAdminHomeCareProviderDetail(token, selectedNetworkProviderId) : Promise.resolve(null),
    selectedNetworkProviderId ? getAdminHomeCareProviderAssignments(token, selectedNetworkProviderId) : Promise.resolve([]),
    selectedNetworkProviderId && selectedProviderDocumentId ? getAdminHomeCareProviderDocument(token, selectedNetworkProviderId, selectedProviderDocumentId) : Promise.resolve(null),
    !isProviderNetworkView && !isActiveVisitsView ? getAdminHomeCareRequestFilterOptions(token) : Promise.resolve(null),
    selectedRequestId ? getAdminHomeCareRequestDetail(token, selectedRequestId) : Promise.resolve(null),
    selectedRequestId ? getAdminHomeCareProviderMatches(token, selectedRequestId) : Promise.resolve([]),
    selectedRequestId && showPayment ? getAdminHomeCarePaymentSummary(token, selectedRequestId) : Promise.resolve(null),
    selectedRequestId && showConfirmProvider ? getAdminHomeCareAssignmentOptions(token, selectedRequestId) : Promise.resolve(null),
    selectedRequestId && selectedDocumentId ? getAdminHomeCareRequestDocument(token, selectedRequestId, selectedDocumentId) : Promise.resolve(null),
  ]);
  const requests = requestRowsFromApi(requestList?.rows ?? []);
  const pagination = requestList?.pagination ?? { page: 1, limit: 20, total: requests.length, totalPages: 1 };
  const providers = providerList?.rows ?? [];
  const providerPagination = providerList?.pagination ?? { page: 1, limit: 20, total: providers.length, totalPages: 1 };
  const visits = visitList?.rows ?? [];
  const visitPagination = visitList?.pagination ?? { page: 1, limit: 20, total: visits.length, totalPages: 1 };
  const exportUrl = exportHref(cleanParams);
  const providerExportUrl = providerExportHref(cleanParams);
  const visitExportUrl = visitsExportHref(cleanParams);

  const pageTitle = isActiveVisitsView ? "Active Visits" : isProviderNetworkView ? "Provider Network" : "Home Care Network";
  const pageSubtitle = isActiveVisitsView ? "Monitor scheduled, live, completed, and cancelled home care visits" : isProviderNetworkView ? "Monitor provider coverage, verification, and availability" : "Track incoming requests, provider matching, and active visits";

  return (
    <>
      <main className="px-6 py-7 lg:px-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-[26px] font-bold tracking-normal text-admin-ink">{pageTitle}</h2>
            <p className="mt-2 text-[16px] font-medium text-admin-muted">{pageSubtitle}</p>
          </div>
          <a href={isActiveVisitsView ? visitExportUrl : isProviderNetworkView ? providerExportUrl : exportUrl} className="flex h-12 w-fit items-center gap-2 rounded-[10px] bg-admin-blue px-5 text-[16px] font-bold text-white">
            <DownloadIcon className="h-5 w-5" />
            Export
          </a>
        </div>

        {!isProviderNetworkView && !isActiveVisitsView ? (
          <section className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard title="Total Requests" value={formatCount(overview?.totalRequests ?? 0)} trend={deltaLabel(overview?.totalRequestsDelta)} icon={<UsersIcon className="h-6 w-6" />} tone="blue" />
            <MetricCard title="Pending Assignments" value={formatCount(overview?.pendingAssignments ?? 0)} trend={formatCount(overview?.urgentAssignments ?? 0) + " urgent"} icon={<HomeIcon className="h-6 w-6" />} tone="orange" />
            <MetricCard title="Active Visits" value={formatCount(overview?.activeVisits ?? 0)} trend={overview?.activeVisitsLiveLabel ?? "0 Live now"} icon={<HeartPulseIcon className="h-6 w-6" />} tone="green" />
            <MetricCard title="Completed Visits" value={formatCount(overview?.completedVisits ?? 0)} trend={deltaLabel(overview?.completedVisitsDelta)} icon={<UserCheckIcon className="h-6 w-6" />} tone="gray" />
          </section>
        ) : null}

        <section className="mt-8 flex flex-wrap items-center gap-5 border-b border-admin-border text-[15px] font-bold text-admin-muted">
          <Link href={{ pathname: "/home-care", query: requestViewQuery(cleanParams) }} className={["px-1 pb-4", !isProviderNetworkView && !isActiveVisitsView ? "border-b-2 border-admin-blue text-admin-blue" : "text-admin-muted"].join(" ")}>Incoming Requests</Link>
          <Link href={{ pathname: "/home-care", query: providerViewQuery(cleanParams) }} className={["px-1 pb-4", isProviderNetworkView ? "border-b-2 border-admin-blue text-admin-blue" : "text-admin-muted"].join(" ")}>Provider Network</Link>
          <Link href={{ pathname: "/home-care", query: activeVisitsViewQuery(cleanParams) }} className={["px-1 pb-4", isActiveVisitsView ? "border-b-2 border-admin-blue text-admin-blue" : "text-admin-muted"].join(" ")}>Active Visits</Link>
        </section>

        <div className="mt-6">
          {isActiveVisitsView ? (
            <ActiveVisitsView visits={visits} totalItems={visitPagination.total} page={visitPagination.page} limit={visitPagination.limit} totalPages={visitPagination.totalPages} params={cleanParams} exportUrl={visitExportUrl} />
          ) : isProviderNetworkView ? (
            <ProviderNetworkView overview={providerOverview} providers={providers} totalItems={providerPagination.total} page={providerPagination.page} limit={providerPagination.limit} totalPages={providerPagination.totalPages} params={cleanParams} exportUrl={providerExportUrl} />
          ) : (
            <>
              <SelectedFilters params={cleanParams} />
              <RequestsTable requests={requests} totalItems={pagination.total} page={pagination.page} limit={pagination.limit} totalPages={pagination.totalPages} params={cleanParams} showFilters={showFilters} filterOptions={filterOptions ?? { origins: [], statuses: [], serviceCategories: [], locations: [] }} />
            </>
          )}
        </div>
      </main>

      {showAddProvider ? <AddProviderPanel options={providerFormOptions} closeQuery={providerViewQuery(cleanParams)} formError={params.formError === "missing"} draftSaved={params.draftSaved === "1"} /> : null}
      {showProviderDetails && selectedNetworkProviderId ? <ProviderDetailsDrawer detail={providerDetail} assignments={providerAssignments} documentPreview={providerDocumentPreview} selectedDocumentId={selectedProviderDocumentId} providerId={selectedNetworkProviderId} closeQuery={providerViewQuery(cleanParams)} showEditProvider={showEditProvider} providerUpdateError={params.providerUpdateError === "1"} /> : null}
      {selectedVisitId ? <VisitDetailsDrawer detail={visitDetail} visitId={selectedVisitId} closeQuery={activeVisitsViewQuery(cleanParams)} showCancelVisit={showCancelVisit} cancellationOptions={cancellationOptions} cancelError={params.visitCancelError === "1"} /> : null}
      {selectedRequestId ? <RequestDetailsDrawer detail={requestDetail} matches={providerMatches} closeQuery={cleanParams} requestId={selectedRequestId} selectedProviderId={selectedProviderId} showPayment={showPayment} showChangeProvider={showChangeProvider} showConfirmProvider={showConfirmProvider} showCancelQuote={showCancelQuote} showHoldRequest={showHoldRequest} holdError={params.holdError === "1"} showCancelRequest={showCancelRequest} cancelError={params.cancelError === "1"} resendError={params.resendError === "1"} documentPreview={documentPreview} previewDocumentId={selectedDocumentId} paymentSummary={paymentSummary} assignmentOptions={assignmentOptions} /> : null}
    </>
  );
}











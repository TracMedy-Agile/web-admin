import { backendUrl, envelopeData, isRecord, readJson } from "@/lib/server/auth-response";

export type AdminHomeCareOverview = {
  totalRequests: number;
  totalRequestsDelta: number | null;
  pendingAssignments: number;
  urgentAssignments: number;
  activeVisits: number;
  activeVisitsLiveLabel: string;
  completedVisits: number;
  completedVisitsDelta: number | null;
};

export type AdminHomeCareRequestRow = {
  requestId: string;
  bookingReference: string;
  patientName: string | null;
  origin: string;
  hospitalName: string | null;
  serviceName: string | null;
  serviceCategory: string | null;
  location: string;
  submittedAt: string;
  status: string;
  legacyStatus: string;
};

export type AdminHomeCareRequestsList = {
  rows: AdminHomeCareRequestRow[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type AdminHomeCareVisitRow = {
  visitId: string;
  patientName: string | null;
  serviceName: string | null;
  serviceCategory: string | null;
  providerName: string | null;
  visitOrigin: string | null;
  scheduledDateTime: string;
  status: string;
  bookingReference: string | null;
};

export type AdminHomeCareVisitsList = {
  rows: AdminHomeCareVisitRow[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type AdminHomeCareVisitDetail = {
  patientInfo: Record<string, unknown>;
  visitStatus: Record<string, unknown>;
  serviceDetails: Record<string, unknown>;
  providerInfo: Record<string, unknown>;
  visitTimeline: Record<string, unknown>[];
  contactInfo: Record<string, unknown>;
  operationalNote: string | null;
  cancellation: Record<string, unknown> | null;
};

export type AdminHomeCareVisitCancellationOptions = {
  reasons: string[];
};

export type AdminHomeCareVisitCancelPayload = {
  reasonCode: string;
  details?: string;
};

export type AdminHomeCareVisitsQuery = {
  page?: string;
  limit?: string;
  search?: string;
  statuses?: string | string[];
  serviceCategory?: string;
  providerId?: string;
  origin?: string;
  location?: string;
  sort?: string;
};

export type AdminHomeCareProviderOverview = {
  totalProviders: number;
  available: number;
  busy: number;
  offline: number;
  pendingVerification: number;
  suspended: number;
  expiredLicences: number;
};

export type AdminHomeCareProviderRow = {
  providerId: string;
  name: string;
  profession: string;
  coverageArea: string;
  verificationStatus: string;
  availabilityStatus: string;
  activeVisitCount: number;
  rating: number | null;
  avatarUrl: string | null;
};

export type AdminHomeCareProvidersList = {
  rows: AdminHomeCareProviderRow[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type AdminHomeCareProviderFormOptions = {
  genders: string[];
  professionalCategories: string[];
  serviceCapabilities: string[];
  states: string[];
  cities: string[];
  lgas: string[];
  availabilityStatuses: string[];
  defaultAccountStatus: string;
};

export type AdminHomeCareProviderUpload = {
  url: string;
  resourceType: string | null;
  fileName: string;
  fileType: string;
  fileSizeBytes: number | null;
  docType: string;
};

export type AdminHomeCareProviderDetail = {
  overview: Record<string, unknown>;
  professionalInfo: Record<string, unknown>;
  coverage: Record<string, unknown>;
  performanceMetrics: Record<string, unknown>;
  currentAssignments: Record<string, unknown>[];
  verificationDocuments: Record<string, unknown>[];
  activityTimeline: Record<string, unknown>[];
};

export type AdminHomeCareProviderAssignment = Record<string, unknown>;

export type AdminHomeCareProviderDocument = Record<string, unknown>;

export type AdminHomeCareProviderUpdatePayload = {
  name?: string;
  professionalRole?: string;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  lga?: string;
  serviceRadius?: number;
  yearsOfExperience?: number;
  licenseNumber?: string;
  licensingAuthority?: string;
  licenseExpiryDate?: string;
  availability?: string;
  verificationStatus?: string;
  isActive?: boolean;
  serviceCategories?: string[];
  serviceCapabilities?: string[];
  coverageAreas?: Record<string, unknown>[];
  qualifications?: Record<string, unknown>[];
};
export type AdminHomeCareProviderCreatePayload = {
  name: string;
  professionalRole: string;
  identificationNumber: string;
  serviceCategories: string[];
  email: string;
  phone: string;
  gender?: string;
  dateOfBirth?: string;
  address?: string;
  city: string;
  state: string;
  lga?: string;
  serviceRadius?: number;
  yearsOfExperience?: number;
  licenseNumber?: string;
  licensingAuthority?: string;
  licenseExpiryDate?: string;
  qualifications?: Record<string, unknown>[];
  availability?: string;
  coverageAreas?: Record<string, unknown>[];
  serviceCapabilities?: string[];
  avatarUrl?: string;
  verificationDocuments?: Array<{
    requestType: string;
    fileUrl: string;
    fileName: string;
    fileType: string;
    fileSize?: number;
  }>;
};

export type AdminHomeCareProvidersQuery = {
  page?: string;
  limit?: string;
  search?: string;
  professionalCategory?: string;
  availability?: string;
  verificationStatus?: string;
  coverageArea?: string;
  sort?: string;
  order?: string;
};
export type AdminHomeCareRequestFilterOptions = {
  origins: string[];
  statuses: string[];
  serviceCategories: string[];
  locations: string[];
};

export type AdminHomeCareRequestsQuery = {
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

export type AdminHomeCareQuoteResendPayload = {
  quoteId: string;
  serviceUnitRate?: number;
  numberOfVisits?: number;
  serviceFee?: number;
  travelFee?: number;
  platformFee?: number;
  discount?: number;
  validityHours?: number;
  patientNote?: string;
  operationsNote?: string;
  provisionalProviderId?: string;
};
export type AdminHomeCareQuotePayload = {
  serviceUnitRate: number;
  numberOfVisits: number;
  serviceFee: number;
  travelFee: number;
  platformFee: number;
  discount?: number;
  validityHours?: number;
  patientNote?: string;
  operationsNote?: string;
  provisionalProviderId?: string;
  sendNow?: boolean;
};
function numberValue(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function stringValue(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) {
    return value;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return undefined;
}

function nullableStringValue(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function stringArrayValue(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0) : [];
}

function normalizeOverview(value: unknown): AdminHomeCareOverview | null {
  if (!isRecord(value)) {
    return null;
  }

  return {
    totalRequests: numberValue(value.totalRequests) ?? 0,
    totalRequestsDelta: numberValue(value.totalRequestsDelta) ?? null,
    pendingAssignments: numberValue(value.pendingAssignments) ?? 0,
    urgentAssignments: numberValue(value.urgentAssignments) ?? 0,
    activeVisits: numberValue(value.activeVisits) ?? 0,
    activeVisitsLiveLabel: stringValue(value.activeVisitsLiveLabel) ?? "0 Live now",
    completedVisits: numberValue(value.completedVisits) ?? 0,
    completedVisitsDelta: numberValue(value.completedVisitsDelta) ?? null,
  };
}

function normalizeRequestRow(value: unknown): AdminHomeCareRequestRow | null {
  if (!isRecord(value)) {
    return null;
  }

  const requestId = stringValue(value.requestId);
  const bookingReference = stringValue(value.bookingReference);
  const origin = stringValue(value.origin);
  const submittedAt = stringValue(value.submittedAt);
  const status = stringValue(value.status);
  const legacyStatus = stringValue(value.legacyStatus) ?? status;
  if (!requestId || !bookingReference || !origin || !submittedAt || !status || !legacyStatus) {
    return null;
  }

  return {
    requestId,
    bookingReference,
    patientName: nullableStringValue(value.patientName),
    origin,
    hospitalName: nullableStringValue(value.hospitalName),
    serviceName: nullableStringValue(value.serviceName),
    serviceCategory: nullableStringValue(value.serviceCategory),
    location: stringValue(value.location) ?? "--",
    submittedAt,
    status,
    legacyStatus,
  };
}

function normalizeRequestsList(value: unknown): AdminHomeCareRequestsList | null {
  if (!isRecord(value)) {
    return null;
  }

  const rows = Array.isArray(value.rows) ? value.rows.map(normalizeRequestRow).filter((row): row is AdminHomeCareRequestRow => row !== null) : [];
  const paginationSource = isRecord(value.pagination) ? value.pagination : {};

  return {
    rows,
    pagination: {
      page: numberValue(paginationSource.page) ?? 1,
      limit: numberValue(paginationSource.limit) ?? rows.length,
      total: numberValue(paginationSource.total) ?? rows.length,
      totalPages: numberValue(paginationSource.totalPages) ?? 1,
    },
  };
}

function normalizeVisitRow(value: unknown): AdminHomeCareVisitRow | null {
  if (!isRecord(value)) {
    return null;
  }

  const visitId = stringValue(value.visitId);
  const scheduledDateTime = stringValue(value.scheduledDateTime);
  const status = stringValue(value.status);
  if (!visitId || !scheduledDateTime || !status) {
    return null;
  }

  return {
    visitId,
    patientName: nullableStringValue(value.patientName),
    serviceName: nullableStringValue(value.serviceName),
    serviceCategory: nullableStringValue(value.serviceCategory),
    providerName: nullableStringValue(value.providerName),
    visitOrigin: nullableStringValue(value.visitOrigin),
    scheduledDateTime,
    status,
    bookingReference: nullableStringValue(value.bookingReference),
  };
}

function normalizeVisitsList(value: unknown): AdminHomeCareVisitsList | null {
  if (!isRecord(value)) {
    return null;
  }

  const rows = Array.isArray(value.rows) ? value.rows.map(normalizeVisitRow).filter((row): row is AdminHomeCareVisitRow => row !== null) : [];
  const paginationSource = isRecord(value.pagination) ? value.pagination : {};

  return {
    rows,
    pagination: {
      page: numberValue(paginationSource.page) ?? 1,
      limit: numberValue(paginationSource.limit) ?? rows.length,
      total: numberValue(paginationSource.total) ?? rows.length,
      totalPages: numberValue(paginationSource.totalPages) ?? 1,
    },
  };
}

function normalizeVisitDetail(value: unknown): AdminHomeCareVisitDetail | null {
  if (!isRecord(value)) {
    return null;
  }

  return {
    patientInfo: isRecord(value.patientInfo) ? value.patientInfo : {},
    visitStatus: isRecord(value.visitStatus) ? value.visitStatus : {},
    serviceDetails: isRecord(value.serviceDetails) ? value.serviceDetails : {},
    providerInfo: isRecord(value.providerInfo) ? value.providerInfo : {},
    visitTimeline: recordArrayValue(value.visitTimeline),
    contactInfo: isRecord(value.contactInfo) ? value.contactInfo : {},
    operationalNote: nullableStringValue(value.operationalNote),
    cancellation: isRecord(value.cancellation) ? value.cancellation : null,
  };
}

function normalizeVisitCancellationOptions(value: unknown): AdminHomeCareVisitCancellationOptions | null {
  if (!isRecord(value)) {
    return null;
  }

  return { reasons: stringArrayValue(value.reasons) };
}

function normalizeProviderFormOptions(value: unknown): AdminHomeCareProviderFormOptions | null {
  if (!isRecord(value)) {
    return null;
  }

  return {
    genders: stringArrayValue(value.genders),
    professionalCategories: stringArrayValue(value.professionalCategories),
    serviceCapabilities: stringArrayValue(value.serviceCapabilities),
    states: stringArrayValue(value.states),
    cities: stringArrayValue(value.cities),
    lgas: stringArrayValue(value.lgas),
    availabilityStatuses: stringArrayValue(value.availabilityStatuses),
    defaultAccountStatus: stringValue(value.defaultAccountStatus) ?? "pending_verification",
  };
}

function normalizeProviderUpload(value: unknown): AdminHomeCareProviderUpload | null {
  if (!isRecord(value)) {
    return null;
  }

  const url = stringValue(value.url);
  const fileName = stringValue(value.fileName);
  const fileType = stringValue(value.fileType);
  const docType = stringValue(value.docType);
  if (!url || !fileName || !fileType || !docType) {
    return null;
  }

  return {
    url,
    resourceType: nullableStringValue(value.resourceType),
    fileName,
    fileType,
    fileSizeBytes: numberValue(value.fileSizeBytes) ?? null,
    docType,
  };
}


function normalizeProviderDetail(value: unknown): AdminHomeCareProviderDetail | null {
  if (!isRecord(value)) {
    return null;
  }

  return {
    overview: isRecord(value.overview) ? value.overview : {},
    professionalInfo: isRecord(value.professionalInfo) ? value.professionalInfo : {},
    coverage: isRecord(value.coverage) ? value.coverage : {},
    performanceMetrics: isRecord(value.performanceMetrics) ? value.performanceMetrics : {},
    currentAssignments: recordArrayValue(value.currentAssignments),
    verificationDocuments: recordArrayValue(value.verificationDocuments),
    activityTimeline: recordArrayValue(value.activityTimeline),
  };
}

function normalizeProviderOverview(value: unknown): AdminHomeCareProviderOverview | null {
  if (!isRecord(value)) {
    return null;
  }

  return {
    totalProviders: numberValue(value.totalProviders) ?? 0,
    available: numberValue(value.available) ?? 0,
    busy: numberValue(value.busy) ?? 0,
    offline: numberValue(value.offline) ?? 0,
    pendingVerification: numberValue(value.pendingVerification) ?? 0,
    suspended: numberValue(value.suspended) ?? 0,
    expiredLicences: numberValue(value.expiredLicences) ?? 0,
  };
}

function normalizeProviderRow(value: unknown): AdminHomeCareProviderRow | null {
  if (!isRecord(value)) {
    return null;
  }

  const providerId = stringValue(value.providerId);
  const name = stringValue(value.name);
  const profession = stringValue(value.profession);
  const coverageArea = stringValue(value.coverageArea);
  const verificationStatus = stringValue(value.verificationStatus);
  const availabilityStatus = stringValue(value.availabilityStatus);
  if (!providerId || !name || !profession || !coverageArea || !verificationStatus || !availabilityStatus) {
    return null;
  }

  return {
    providerId,
    name,
    profession,
    coverageArea,
    verificationStatus,
    availabilityStatus,
    activeVisitCount: numberValue(value.activeVisitCount) ?? 0,
    rating: numberValue(value.rating) ?? null,
    avatarUrl: nullableStringValue(value.avatarUrl),
  };
}

function normalizeProvidersList(value: unknown): AdminHomeCareProvidersList | null {
  if (!isRecord(value)) {
    return null;
  }

  const rows = Array.isArray(value.rows) ? value.rows.map(normalizeProviderRow).filter((row): row is AdminHomeCareProviderRow => row !== null) : [];
  const paginationSource = isRecord(value.pagination) ? value.pagination : {};

  return {
    rows,
    pagination: {
      page: numberValue(paginationSource.page) ?? 1,
      limit: numberValue(paginationSource.limit) ?? rows.length,
      total: numberValue(paginationSource.total) ?? rows.length,
      totalPages: numberValue(paginationSource.totalPages) ?? 1,
    },
  };
}
function normalizeRequestFilterOptions(value: unknown): AdminHomeCareRequestFilterOptions | null {
  if (!isRecord(value)) {
    return null;
  }

  return {
    origins: stringArrayValue(value.origins),
    statuses: stringArrayValue(value.statuses),
    serviceCategories: stringArrayValue(value.serviceCategories),
    locations: stringArrayValue(value.locations),
  };
}

function appendQuery(params: URLSearchParams, key: string, value: string | string[] | undefined): void {
  if (Array.isArray(value)) {
    value.filter(Boolean).forEach((item) => params.append(key, item));
    return;
  }

  if (typeof value === "string" && value.trim()) {
    params.set(key, value);
  }
}

function visitsQueryString(query: AdminHomeCareVisitsQuery): string {
  const params = new URLSearchParams();
  appendQuery(params, "page", query.page);
  appendQuery(params, "limit", query.limit);
  appendQuery(params, "search", query.search);
  appendQuery(params, "statuses", query.statuses);
  appendQuery(params, "serviceCategory", query.serviceCategory);
  appendQuery(params, "providerId", query.providerId);
  appendQuery(params, "origin", query.origin);
  appendQuery(params, "location", query.location);
  appendQuery(params, "sort", query.sort);
  return params.toString();
}

function providerQueryString(query: AdminHomeCareProvidersQuery): string {
  const params = new URLSearchParams();
  appendQuery(params, "page", query.page);
  appendQuery(params, "limit", query.limit);
  appendQuery(params, "search", query.search);
  appendQuery(params, "professionalCategory", query.professionalCategory);
  appendQuery(params, "availability", query.availability);
  appendQuery(params, "verificationStatus", query.verificationStatus);
  appendQuery(params, "coverageArea", query.coverageArea);
  appendQuery(params, "sort", query.sort);
  appendQuery(params, "order", query.order);
  return params.toString();
}
function requestsQueryString(query: AdminHomeCareRequestsQuery): string {
  const params = new URLSearchParams();
  appendQuery(params, "page", query.page);
  appendQuery(params, "limit", query.limit);
  appendQuery(params, "search", query.search);
  appendQuery(params, "origin", query.origin);
  appendQuery(params, "statuses", query.statuses);
  appendQuery(params, "serviceCategory", query.serviceCategory);
  appendQuery(params, "dateRange", query.dateRange);
  appendQuery(params, "dateFrom", query.dateFrom);
  appendQuery(params, "dateTo", query.dateTo);
  appendQuery(params, "location", query.location);
  appendQuery(params, "sort", query.sort);
  return params.toString();
}

async function fetchAdminHomeCareJson(path: string, token: string): Promise<unknown> {
  const response = await fetch(backendUrl() + path, {
    method: "GET",
    headers: { Authorization: "Bearer " + token },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  return envelopeData(await readJson(response));
}

async function postAdminHomeCarePayload(path: string, token: string, body?: Record<string, unknown>): Promise<unknown> {
  const response = await fetch(backendUrl() + path, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body ?? {}),
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  return envelopeData(await readJson(response));
}

async function postAdminHomeCareJson(path: string, token: string, body?: Record<string, unknown>): Promise<boolean> {
  return (await postAdminHomeCarePayload(path, token, body)) !== null;
}

async function patchAdminHomeCareJson(path: string, token: string, body: Record<string, unknown>): Promise<boolean> {
  const response = await fetch(backendUrl() + path, {
    method: "PATCH",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  return response.ok;
}
async function postAdminHomeCareUpload(path: string, token: string, body: FormData): Promise<unknown> {
  const response = await fetch(backendUrl() + path, {
    method: "POST",
    headers: { Authorization: "Bearer " + token },
    body,
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  return envelopeData(await readJson(response));
}

export async function getAdminHomeCareVisits(token: string, query: AdminHomeCareVisitsQuery): Promise<AdminHomeCareVisitsList | null> {
  try {
    const queryString = visitsQueryString(query);
    const payload = await fetchAdminHomeCareJson("/admin/home-care/visits" + (queryString ? "?" + queryString : ""), token);
    return normalizeVisitsList(payload);
  } catch {
    return null;
  }
}

export async function getAdminHomeCareVisitDetail(token: string, visitId: string): Promise<AdminHomeCareVisitDetail | null> {
  try {
    const payload = await fetchAdminHomeCareJson("/admin/home-care/visits/" + encodeURIComponent(visitId), token);
    return normalizeVisitDetail(payload);
  } catch {
    return null;
  }
}

export async function getAdminHomeCareVisitCancellationReasons(token: string): Promise<AdminHomeCareVisitCancellationOptions | null> {
  try {
    const payload = await fetchAdminHomeCareJson("/admin/home-care/visits/cancellation-reasons", token);
    return normalizeVisitCancellationOptions(payload);
  } catch {
    return null;
  }
}

export async function cancelAdminHomeCareVisit(token: string, visitId: string, payload: AdminHomeCareVisitCancelPayload): Promise<boolean> {
  try {
    return postAdminHomeCareJson("/admin/home-care/visits/" + encodeURIComponent(visitId) + "/cancel", token, payload);
  } catch {
    return false;
  }
}

export async function getAdminHomeCareProviderFormOptions(token: string): Promise<AdminHomeCareProviderFormOptions | null> {
  try {
    return normalizeProviderFormOptions(await fetchAdminHomeCareJson("/admin/home-care/providers/form-options", token));
  } catch {
    return null;
  }
}

export async function getAdminHomeCareProviderOverview(token: string): Promise<AdminHomeCareProviderOverview | null> {
  try {
    return normalizeProviderOverview(await fetchAdminHomeCareJson("/admin/home-care/providers/overview", token));
  } catch {
    return null;
  }
}
export async function getAdminHomeCareProviders(token: string, query: AdminHomeCareProvidersQuery): Promise<AdminHomeCareProvidersList | null> {
  try {
    const queryString = providerQueryString(query);
    const payload = await fetchAdminHomeCareJson("/admin/home-care/providers" + (queryString ? "?" + queryString : ""), token);
    return normalizeProvidersList(payload);
  } catch {
    return null;
  }
}
export async function getAdminHomeCareOverview(token: string): Promise<AdminHomeCareOverview | null> {
  try {
    return normalizeOverview(await fetchAdminHomeCareJson("/admin/home-care/overview", token));
  } catch {
    return null;
  }
}

export async function getAdminHomeCareRequests(token: string, query: AdminHomeCareRequestsQuery): Promise<AdminHomeCareRequestsList | null> {
  try {
    const queryString = requestsQueryString(query);
    const payload = await fetchAdminHomeCareJson("/admin/home-care/requests" + (queryString ? "?" + queryString : ""), token);
    return normalizeRequestsList(payload);
  } catch {
    return null;
  }
}

export async function getAdminHomeCareRequestFilterOptions(token: string): Promise<AdminHomeCareRequestFilterOptions | null> {
  try {
    return normalizeRequestFilterOptions(await fetchAdminHomeCareJson("/admin/home-care/requests/filter-options", token));
  } catch {
    return null;
  }
}
export type AdminHomeCareAssignmentConfirmPayload = {
  providerId: string;
  scheduledDate?: string;
  scheduledTime?: string;
};
export type AdminHomeCarePaymentSummary = Record<string, unknown>;
export type AdminHomeCareRequestDocument = Record<string, unknown>;

export type AdminHomeCareAssignmentOptions = {
  isPreselected: boolean;
  provider: Record<string, unknown> | null;
};
export type AdminHomeCareProviderCandidate = {
  providerId: string;
  name: string;
  profession: string;
  distanceKm: number | null;
  currentLoad: number;
  availability: string;
  verificationStatus: string;
  rating: number | null;
  score: number;
  isRecommended: boolean;
};

export type AdminHomeCareRequestDetail = {
  requestOverview: Record<string, unknown>;
  patientInformation: Record<string, unknown>;
  serviceInformation: Record<string, unknown>;
  requestRequirements: Record<string, unknown>;
  uploadedDocuments: Array<Record<string, unknown>>;
  operationalTimeline: Array<Record<string, unknown>>;
  stepperStage: string;
  quote: Record<string, unknown> | null;
  visit: Record<string, unknown> | null;
};

function recordValue(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {};
}

function recordArrayValue(value: unknown): Array<Record<string, unknown>> {
  return Array.isArray(value) ? value.filter(isRecord) : [];
}

function normalizeRequestDetail(value: unknown): AdminHomeCareRequestDetail | null {
  if (!isRecord(value)) {
    return null;
  }

  const overview = recordValue(value.requestOverview);
  const stepperStage = stringValue(value.stepperStage);
  if (!stringValue(overview.id) || !stepperStage) {
    return null;
  }

  return {
    requestOverview: overview,
    patientInformation: recordValue(value.patientInformation),
    serviceInformation: recordValue(value.serviceInformation),
    requestRequirements: recordValue(value.requestRequirements),
    uploadedDocuments: recordArrayValue(value.uploadedDocuments),
    operationalTimeline: recordArrayValue(value.operationalTimeline),
    stepperStage,
    quote: isRecord(value.quote) ? value.quote : null,
    visit: isRecord(value.visit) ? value.visit : null,
  };
}

function normalizeAssignmentOptions(value: unknown): AdminHomeCareAssignmentOptions | null {
  if (!isRecord(value)) {
    return null;
  }

  return {
    isPreselected: value.isPreselected === true,
    provider: isRecord(value.provider) ? value.provider : null,
  };
}
function normalizeProviderCandidate(value: unknown): AdminHomeCareProviderCandidate | null {
  if (!isRecord(value)) {
    return null;
  }

  const providerId = stringValue(value.providerId);
  const name = stringValue(value.name);
  const profession = stringValue(value.profession);
  const availability = stringValue(value.availability);
  const verificationStatus = stringValue(value.verificationStatus);
  const score = numberValue(value.score);
  if (!providerId || !name || !profession || !availability || !verificationStatus || score === undefined) {
    return null;
  }

  return {
    providerId,
    name,
    profession,
    distanceKm: numberValue(value.distanceKm) ?? null,
    currentLoad: numberValue(value.currentLoad) ?? 0,
    availability,
    verificationStatus,
    rating: numberValue(value.rating) ?? null,
    score,
    isRecommended: value.isRecommended === true,
  };
}

export async function getAdminHomeCareRequestDetail(token: string, requestId: string): Promise<AdminHomeCareRequestDetail | null> {
  try {
    const payload = await fetchAdminHomeCareJson("/admin/home-care/requests/" + encodeURIComponent(requestId), token);
    return normalizeRequestDetail(payload);
  } catch {
    return null;
  }
}

export async function cancelAdminHomeCareRequest(token: string, requestId: string, reason: string, note?: string): Promise<boolean> {
  try {
    return postAdminHomeCareJson("/admin/home-care/requests/" + encodeURIComponent(requestId) + "/cancel", token, { reason, note });
  } catch {
    return false;
  }
}
export async function holdAdminHomeCareRequest(token: string, requestId: string, reason: string): Promise<boolean> {
  try {
    return postAdminHomeCareJson("/admin/home-care/requests/" + encodeURIComponent(requestId) + "/hold", token, { reason });
  } catch {
    return false;
  }
}
export async function getAdminHomeCareProviderMatches(token: string, requestId: string): Promise<AdminHomeCareProviderCandidate[]> {
  try {
    const payload = await fetchAdminHomeCareJson("/admin/home-care/requests/" + encodeURIComponent(requestId) + "/provider-matches", token);
    return Array.isArray(payload) ? payload.map(normalizeProviderCandidate).filter((candidate): candidate is AdminHomeCareProviderCandidate => candidate !== null) : [];
  } catch {
    return [];
  }
}
export async function selectAdminHomeCareProvisionalProvider(token: string, requestId: string, providerId: string): Promise<boolean> {
  try {
    return postAdminHomeCareJson("/admin/home-care/requests/" + encodeURIComponent(requestId) + "/quote/provisional-provider", token, { providerId });
  } catch {
    return false;
  }
}

export async function createAdminHomeCareQuote(token: string, requestId: string, payload: AdminHomeCareQuotePayload): Promise<boolean> {
  try {
    return postAdminHomeCareJson("/admin/home-care/requests/" + encodeURIComponent(requestId) + "/quote", token, payload);
  } catch {
    return false;
  }
}

export async function resendAdminHomeCareQuote(token: string, requestId: string, payload: AdminHomeCareQuoteResendPayload): Promise<boolean> {
  try {
    return postAdminHomeCareJson("/admin/home-care/requests/" + encodeURIComponent(requestId) + "/quote/resend", token, payload);
  } catch {
    return false;
  }
}
export async function sendAdminHomeCareDraftQuote(token: string, requestId: string): Promise<boolean> {
  try {
    return postAdminHomeCareJson("/admin/home-care/requests/" + encodeURIComponent(requestId) + "/quote/send", token);
  } catch {
    return false;
  }
}
export async function cancelAdminHomeCareQuote(token: string, requestId: string, reason?: string): Promise<boolean> {
  try {
    return postAdminHomeCareJson("/admin/home-care/requests/" + encodeURIComponent(requestId) + "/quote/cancel", token, { reason });
  } catch {
    return false;
  }
}

export async function getAdminHomeCarePaymentSummary(token: string, requestId: string): Promise<AdminHomeCarePaymentSummary | null> {
  try {
    const payload = await fetchAdminHomeCareJson("/admin/home-care/requests/" + encodeURIComponent(requestId) + "/payment", token);
    return isRecord(payload) ? payload : null;
  } catch {
    return null;
  }
}

export async function getAdminHomeCareRequestDocument(token: string, requestId: string, documentId: string): Promise<AdminHomeCareRequestDocument | null> {
  try {
    const payload = await fetchAdminHomeCareJson("/admin/home-care/requests/" + encodeURIComponent(requestId) + "/documents/" + encodeURIComponent(documentId), token);
    return isRecord(payload) ? payload : null;
  } catch {
    return null;
  }
}

export async function getAdminHomeCareAssignmentOptions(token: string, requestId: string): Promise<AdminHomeCareAssignmentOptions | null> {
  try {
    const payload = await fetchAdminHomeCareJson("/admin/home-care/requests/" + encodeURIComponent(requestId) + "/assignment/options", token);
    return normalizeAssignmentOptions(payload);
  } catch {
    return null;
  }
}

export async function changeAdminHomeCareProvider(token: string, requestId: string, providerId: string): Promise<boolean> {
  try {
    return postAdminHomeCareJson("/admin/home-care/requests/" + encodeURIComponent(requestId) + "/assignment/change-provider", token, { providerId });
  } catch {
    return false;
  }
}
export async function confirmAdminHomeCareAssignment(token: string, requestId: string, payload: AdminHomeCareAssignmentConfirmPayload): Promise<boolean> {
  try {
    return postAdminHomeCareJson("/admin/home-care/requests/" + encodeURIComponent(requestId) + "/assignment/confirm", token, payload);
  } catch {
    return false;
  }
}





export async function uploadAdminHomeCareProviderFile(token: string, file: File, docType: string): Promise<AdminHomeCareProviderUpload | null> {
  try {
    const body = new FormData();
    body.set("file", file);
    body.set("docType", docType);
    return normalizeProviderUpload(await postAdminHomeCareUpload("/admin/home-care/providers/uploads", token, body));
  } catch {
    return null;
  }
}

export async function updateAdminHomeCareProvider(token: string, providerId: string, payload: AdminHomeCareProviderUpdatePayload): Promise<boolean> {
  try {
    return patchAdminHomeCareJson("/admin/home-care/providers/" + encodeURIComponent(providerId), token, payload as Record<string, unknown>);
  } catch {
    return false;
  }
}
export async function createAdminHomeCareProvider(token: string, payload: AdminHomeCareProviderCreatePayload): Promise<boolean> {
  try {
    return postAdminHomeCareJson("/admin/home-care/providers", token, payload);
  } catch {
    return false;
  }
}

export async function saveAdminHomeCareProviderDraft(token: string, payload: Record<string, unknown>): Promise<boolean> {
  try {
    return postAdminHomeCareJson("/admin/home-care/providers/drafts", token, { payload });
  } catch {
    return false;
  }
}
export async function getAdminHomeCareProviderDetail(token: string, providerId: string): Promise<AdminHomeCareProviderDetail | null> {
  try {
    const payload = await fetchAdminHomeCareJson("/admin/home-care/providers/" + encodeURIComponent(providerId), token);
    return normalizeProviderDetail(payload);
  } catch {
    return null;
  }
}

export async function getAdminHomeCareProviderAssignments(token: string, providerId: string): Promise<AdminHomeCareProviderAssignment[]> {
  try {
    const payload = await fetchAdminHomeCareJson("/admin/home-care/providers/" + encodeURIComponent(providerId) + "/assignments", token);
    return recordArrayValue(payload);
  } catch {
    return [];
  }
}

export async function getAdminHomeCareProviderDocument(token: string, providerId: string, documentId: string): Promise<AdminHomeCareProviderDocument | null> {
  try {
    const payload = await fetchAdminHomeCareJson("/admin/home-care/providers/" + encodeURIComponent(providerId) + "/documents/" + encodeURIComponent(documentId), token);
    return isRecord(payload) ? payload : null;
  } catch {
    return null;
  }
}




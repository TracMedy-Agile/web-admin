"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDownIcon, CloseIcon, FilterIcon, SearchIcon } from "./AdminIcons";
export type FilterOptions = {
  origins: string[];
  statuses: string[];
  serviceCategories: string[];
  locations: string[];
};

type FilterParams = Record<string, string | string[]>;

type HomeCareRequestFiltersProps = {
  params: FilterParams;
  initiallyOpen: boolean;
  options: FilterOptions;
};

function labelFromApiValue(value: string): string {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function originLabel(value: string): string {
  if (value === "hospital") return "Hospital";
  if (value === "patient") return "Patient";
  if (value === "clinician") return "Clinician";
  return labelFromApiValue(value);
}

function queryWithoutFilter(params: FilterParams): URLSearchParams {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (key === "filters" || key === "page") continue;
    if (Array.isArray(value)) {
      value.forEach((item) => query.append(key, item));
    } else if (value) {
      query.set(key, value);
    }
  }
  return query;
}

export function HomeCareRequestFilters({ params, initiallyOpen, options }: HomeCareRequestFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(initiallyOpen);
  const selectedStatus = Array.isArray(params.statuses) ? params.statuses[0] : params.statuses ?? "";


  function closeFilters() {
    setOpen(false);
    router.replace(`${pathname}?${queryWithoutFilter(params).toString()}`);
  }

  return (
    <div className="relative flex flex-col gap-4 px-4 py-4 xl:flex-row xl:items-center xl:justify-between">
      <form action="/home-care" className="min-w-0 flex-1">
        <input type="hidden" name="origin" value={typeof params.origin === "string" ? params.origin : ""} />
        <input type="hidden" name="serviceCategory" value={typeof params.serviceCategory === "string" ? params.serviceCategory : ""} />
        <input type="hidden" name="dateRange" value={typeof params.dateRange === "string" ? params.dateRange : ""} />
        <input type="hidden" name="location" value={typeof params.location === "string" ? params.location : ""} />
        <label className="relative block w-full max-w-[484px]">
          <span className="sr-only">Search requests</span>
          <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-admin-muted" />
          <input name="search" defaultValue={typeof params.search === "string" ? params.search : ""} className="h-9 w-full rounded-[7px] border border-admin-border bg-white pl-12 pr-3 text-[14px] text-admin-ink outline-none placeholder:text-admin-muted focus:border-admin-blue" placeholder="Search Request ID, Patient, Hospital..." />
        </label>
      </form>
      <div className="flex items-center gap-4">
        <button type="button" onClick={() => setOpen((current) => !current)} aria-expanded={open} className="flex h-9 items-center gap-2 rounded-[7px] border border-admin-border bg-white px-3 text-[14px] text-admin-muted">
          <span>Filters</span>
          <FilterIcon className="h-4 w-4" />
        </button>
        <button type="button" className="flex h-9 items-center gap-2 rounded-[7px] border border-admin-border bg-white px-3 text-[14px] text-admin-muted">
          <span>Sort</span>
          <ChevronDownIcon className="h-4 w-4" />
        </button>
      </div>
      {open ? (
        <div className="pointer-events-none absolute inset-0 z-40">
          <aside className="pointer-events-auto absolute right-0 top-[68px] w-[min(400px,calc(100vw-2rem))] rounded-[8px] border border-admin-border bg-white shadow-2xl xl:right-[118px]">
            <header className="flex items-center justify-between px-4 py-4">
              <h2 className="text-[22px] font-bold text-admin-ink">Filter Incoming Request</h2>
              <button type="button" onClick={closeFilters} aria-label="Close filters" className="text-admin-text"><CloseIcon className="h-6 w-6" /></button>
            </header>
            <form action="/home-care" onSubmit={() => setOpen(false)}>
              <div className="space-y-4 px-4 pb-4">
                <label>
                  <span className="text-[14px] font-bold tracking-normal text-admin-ink">Request Origin</span>
                  <select name="origin" defaultValue={typeof params.origin === "string" ? params.origin : ""} className="mt-3 h-12 w-full rounded-[7px] border border-admin-border bg-white px-4 text-[14px] text-admin-muted outline-none focus:border-admin-blue">
                    <option value="">All Origins</option>
                    {options.origins.map((origin) => <option key={origin} value={origin}>{originLabel(origin)}</option>)}
                  </select>
                </label>
                <label>
                  <span className="text-[14px] font-bold tracking-normal text-admin-ink">Status</span>
                  <select name="statuses" defaultValue={selectedStatus} className="mt-3 h-10 w-full rounded-[7px] border border-admin-border bg-white px-4 text-[14px] text-admin-muted outline-none focus:border-admin-blue">
                    <option value="">All Status</option>
                    {options.statuses.map((status) => <option key={status} value={status}>{labelFromApiValue(status)}</option>)}
                  </select>
                </label>
                <label>
                  <span className="text-[14px] font-bold tracking-normal text-admin-ink">Service Category</span>
                  <select name="serviceCategory" defaultValue={typeof params.serviceCategory === "string" ? params.serviceCategory : ""} className="mt-3 h-12 w-full rounded-[7px] border border-admin-border bg-white px-4 text-[14px] text-admin-muted outline-none focus:border-admin-blue">
                    <option value="">All Category</option>
                    {options.serviceCategories.map((category) => <option key={category} value={category}>{labelFromApiValue(category)}</option>)}
                  </select>
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label>
                    <span className="text-[14px] font-bold tracking-normal text-admin-ink">Date Range</span>
                    <select name="dateRange" defaultValue={typeof params.dateRange === "string" ? params.dateRange : "7d"} className="mt-3 h-12 w-full rounded-[7px] border border-admin-border bg-white px-4 text-[14px] text-admin-muted outline-none focus:border-admin-blue">
                      <option value="">All Time</option><option value="7d">Last 7 Days</option><option value="30d">Last 30 Days</option><option value="custom">Custom</option>
                    </select>
                  </label>
                  <label>
                    <span className="text-[14px] font-bold tracking-normal text-admin-ink">Location</span>
                    <select name="location" defaultValue={typeof params.location === "string" ? params.location : ""} className="mt-3 h-12 w-full rounded-[7px] border border-admin-border bg-white px-4 text-[14px] text-admin-muted outline-none focus:border-admin-blue">
                      <option value="">City or Region</option>
                      {options.locations.map((location) => <option key={location} value={location}>{location}</option>)}
                    </select>
                  </label>
                </div>
                <input type="hidden" name="search" value={typeof params.search === "string" ? params.search : ""} />
                <input type="hidden" name="sort" value={typeof params.sort === "string" ? params.sort : ""} />
              </div>
              <footer className="flex items-center justify-between border-t border-admin-border px-4 py-4">
                <button type="button" onClick={() => router.replace(pathname)} className="text-[14px] font-bold text-admin-blue">Clear All</button>
                <button type="submit" className="h-12 rounded-[8px] bg-admin-blue px-5 text-[16px] font-bold text-white">Apply Filters</button>
              </footer>
            </form>
          </aside>
        </div>
      ) : null}
    </div>
  );
}

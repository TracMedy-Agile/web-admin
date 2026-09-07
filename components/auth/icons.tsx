import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

export function BrandIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 44 44" fill="none" aria-hidden="true" {...props}>
      <rect width="44" height="44" rx="10" fill="currentColor" />
      <path d="M12 14h20" stroke="white" strokeWidth="3" strokeLinecap="round" />
      <path d="M22 14v18" stroke="white" strokeWidth="3" strokeLinecap="round" />
      <path d="M15 24h14" stroke="white" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function MailIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M4 6.75h16v10.5H4V6.75Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="m4.75 7.5 7.25 5.25 7.25-5.25" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function EyeIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M3.75 12s2.9-5.25 8.25-5.25S20.25 12 20.25 12s-2.9 5.25-8.25 5.25S3.75 12 3.75 12Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 14.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M5 12h13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="m13 6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function AlertIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M12 8v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 16.75h.01" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M10.25 4.8 2.7 18a2 2 0 0 0 1.74 3h15.12A2 2 0 0 0 21.3 18L13.75 4.8a2 2 0 0 0-3.5 0Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

export function ShieldLockIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 28 28" fill="none" aria-hidden="true" {...props}>
      <path d="M14 3.5 22 7v5.2c0 5-3.25 9.6-8 11.3-4.75-1.7-8-6.3-8-11.3V7l8-3.5Z" fill="currentColor" />
      <path d="M10.75 14h6.5v4.75h-6.5V14Z" stroke="var(--color-admin-panel)" strokeWidth="1.4" />
      <path d="M12 14v-1.4a2 2 0 0 1 4 0V14" stroke="var(--color-admin-panel)" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="m5 12.5 4.25 4.25L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SmallCheckIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
      <path d="m3.5 8.25 3 3L12.75 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SmallCircleIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
      <circle cx="8" cy="8" r="3.25" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export function InfoIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 10.75v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 7.5h.01" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

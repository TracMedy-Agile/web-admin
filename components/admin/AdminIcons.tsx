import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function Icon({ children, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      {children}
    </svg>
  );
}

export function DashboardIcon(props: IconProps) {
  return <Icon {...props}><path d="M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></Icon>;
}

export function UsersIcon(props: IconProps) {
  return <Icon {...props}><path d="M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.5 20a5.5 5.5 0 0 1 11 0M17 10.5a2.5 2.5 0 1 0-1-4.8M16.5 14.5a4.8 4.8 0 0 1 4 4.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></Icon>;
}

export function BuildingIcon(props: IconProps) {
  return <Icon {...props}><path d="M5 20V5.5A1.5 1.5 0 0 1 6.5 4h8A1.5 1.5 0 0 1 16 5.5V20M3.5 20h17M8 8h1.5M12 8h1.5M8 11.5h1.5M12 11.5h1.5M8 15h1.5M12 15h1.5M18 10h1.5A1.5 1.5 0 0 1 21 11.5V20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></Icon>;
}

export function HomeIcon(props: IconProps) {
  return <Icon {...props}><path d="m4 11 8-7 8 7v8a1 1 0 0 1-1 1h-4.5v-5h-5v5H5a1 1 0 0 1-1-1v-8Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></Icon>;
}

export function CardIcon(props: IconProps) {
  return <Icon {...props}><path d="M4 6.5h16v11H4v-11ZM4 10h16M7 14h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></Icon>;
}

export function HeartPulseIcon(props: IconProps) {
  return <Icon {...props}><path d="M20 8.8c0 5.2-8 10-8 10s-8-4.8-8-10A4.4 4.4 0 0 1 11.6 5l.4.4.4-.4A4.4 4.4 0 0 1 20 8.8Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /><path d="M7 12h2l1.2-2.5 2 5 1.4-2.5H17" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></Icon>;
}

export function BotIcon(props: IconProps) {
  return <Icon {...props}><path d="M8 8h8a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-4a3 3 0 0 1 3-3ZM12 8V5M9 13h.01M15 13h.01M9 18l-1.5 2M16.5 18 18 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></Icon>;
}

export function BellIcon(props: IconProps) {
  return <Icon {...props}><path d="M18 9a6 6 0 1 0-12 0c0 7-2 7-2 9h16c0-2-2-2-2-9ZM9.5 21a3 3 0 0 0 5 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></Icon>;
}

export function ShieldIcon(props: IconProps) {
  return <Icon {...props}><path d="M12 3.5 19 6v5.5c0 4.4-2.8 8.2-7 9.5-4.2-1.3-7-5.1-7-9.5V6l7-2.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></Icon>;
}

export function ClipboardIcon(props: IconProps) {
  return <Icon {...props}><path d="M8 5h8M9 3h6v4H9V3ZM6 5h-.5A1.5 1.5 0 0 0 4 6.5v13A1.5 1.5 0 0 0 5.5 21h13a1.5 1.5 0 0 0 1.5-1.5v-13A1.5 1.5 0 0 0 18.5 5H18M8 12h8M8 16h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></Icon>;
}

export function SettingsIcon(props: IconProps) {
  return <Icon {...props}><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" stroke="currentColor" strokeWidth="1.8" /><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.6 8.6a1.7 1.7 0 0 0-.34-1.88l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6c.4-.14.75-.34 1-.6a1.7 1.7 0 0 0 .4-1.1V3a2 2 0 1 1 4 0v.09A1.7 1.7 0 0 0 15.4 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9c.14.4.34.75.6 1 .28.25.67.4 1.1.4H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51.6Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></Icon>;
}

export function SearchIcon(props: IconProps) {
  return <Icon {...props}><path d="m20 20-4.25-4.25M10.75 17.5a6.75 6.75 0 1 0 0-13.5 6.75 6.75 0 0 0 0 13.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></Icon>;
}

export function DownloadIcon(props: IconProps) {
  return <Icon {...props}><path d="M12 4v10M8 10l4 4 4-4M4 18.5h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></Icon>;
}

export function ChevronDownIcon(props: IconProps) {
  return <Icon {...props}><path d="m7 9 5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></Icon>;
}

export function ChevronRightIcon(props: IconProps) {
  return <Icon {...props}><path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></Icon>;
}

export function ChevronLeftIcon(props: IconProps) {
  return <Icon {...props}><path d="m15 6-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></Icon>;
}

export function EyeActionIcon(props: IconProps) {
  return <Icon {...props}><path d="M3.5 12s3-5 8.5-5 8.5 5 8.5 5-3 5-8.5 5-8.5-5-8.5-5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><path d="M12 14.2a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4Z" stroke="currentColor" strokeWidth="1.8" /></Icon>;
}

export function UserCheckIcon(props: IconProps) {
  return <Icon {...props}><path d="M9.5 11a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4ZM4 20a5.5 5.5 0 0 1 10.2-2.85M16 19l1.8 1.8L21 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></Icon>;
}

export function UserXIcon(props: IconProps) {
  return <Icon {...props}><path d="M9.5 11a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4ZM4 20a5.5 5.5 0 0 1 10.2-2.85M17 7l4 4M21 7l-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></Icon>;
}

export function BanIcon(props: IconProps) {
  return <Icon {...props}><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM6 18 18 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></Icon>;
}

export function CloseIcon(props: IconProps) {
  return <Icon {...props}><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></Icon>;
}

export function EditIcon(props: IconProps) {
  return <Icon {...props}><path d="m4 20 4.2-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></Icon>;
}

export function CalendarIcon(props: IconProps) {
  return <Icon {...props}><path d="M7 4v3M17 4v3M4.5 8.5h15M6 6h12a1.5 1.5 0 0 1 1.5 1.5V19A1.5 1.5 0 0 1 18 20.5H6A1.5 1.5 0 0 1 4.5 19V7.5A1.5 1.5 0 0 1 6 6Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></Icon>;
}

export function MailSmallIcon(props: IconProps) {
  return <Icon {...props}><path d="M4.5 7h15v10h-15V7ZM5.2 7.7 12 12.4l6.8-4.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></Icon>;
}

export function PhoneIcon(props: IconProps) {
  return <Icon {...props}><path d="M7.5 4.5 10 8l-1.6 1.6a11 11 0 0 0 6 6L16 14l3.5 2.5-.6 3.1c-.15.8-.85 1.4-1.68 1.35C9.5 20.5 3.5 14.5 3.05 6.78 3 5.95 3.6 5.25 4.4 5.1l3.1-.6Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></Icon>;
}

export function IdIcon(props: IconProps) {
  return <Icon {...props}><path d="M5 6.5h14v11H5v-11ZM8 10h3M8 13.5h5M15.5 10.5h.01M15.5 13.5h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></Icon>;
}

export function PlusIcon(props: IconProps) {
  return <Icon {...props}><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></Icon>;
}

export function MapPinIcon(props: IconProps) {
  return <Icon {...props}><path d="M12 21s6-5.3 6-11a6 6 0 1 0-12 0c0 5.7 6 11 6 11Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><path d="M12 12.2a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4Z" stroke="currentColor" strokeWidth="1.8" /></Icon>;
}

export function BriefcaseIcon(props: IconProps) {
  return <Icon {...props}><path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M4.5 9.5h15v9h-15v-9ZM4.5 11.5A2.5 2.5 0 0 1 7 9h10a2.5 2.5 0 0 1 2.5 2.5M10 13h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></Icon>;
}

export function ReceiptIcon(props: IconProps) {
  return <Icon {...props}><path d="M7 3.5h10v17l-2-1.2-2 1.2-2-1.2-2 1.2-2-1.2-2 1.2v-17Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><path d="M9 8h6M9 12h6M9 16h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></Icon>;
}

export function WalletIcon(props: IconProps) {
  return <Icon {...props}><path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18a2 2 0 0 1 2 2v10.5a2 2 0 0 1-2 2H6.5A2.5 2.5 0 0 1 4 17V7.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><path d="M16 12h4v4h-4a2 2 0 1 1 0-4ZM4.5 8.5H18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></Icon>;
}

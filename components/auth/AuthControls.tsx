"use client";

import Link from "next/link";
import { useState } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { ArrowRightIcon, EyeIcon } from "./icons";

type AuthFieldProps = {
  id: string;
  label: string;
  helperText?: string;
  error?: string;
  icon?: ReactNode;
  rightAction?: ReactNode;
} & InputHTMLAttributes<HTMLInputElement>;

export function AuthHeader({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h2 className="text-[32px] font-bold leading-tight tracking-normal text-admin-text sm:text-[36px]">{title}</h2>
      <p className="mt-3 text-[16px] leading-6 tracking-normal text-admin-muted">{description}</p>
    </div>
  );
}

export function AuthField({ id, label, helperText, error, icon, rightAction, className = "", ...props }: AuthFieldProps) {
  const messageId = id + "-message";
  const hasMessage = Boolean(error || helperText);
  const inputClassName = [
    "h-[54px] w-full rounded-[10px] border bg-admin-field text-[16px] font-medium text-admin-text outline-none transition placeholder:text-admin-muted/75 focus:border-admin-blue focus:ring-4 focus:ring-admin-blue/10",
    icon ? "pl-[52px]" : "pl-5",
    props.type === "password" ? "pr-[52px]" : "pr-5",
    error ? "border-admin-danger" : "border-admin-border",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  const messageClassName = ["text-[13px] font-medium leading-5", error ? "text-admin-danger" : "text-admin-muted"].join(" ");

  return (
    <div className="space-y-2.5">
      <div className="flex min-h-6 items-center justify-between gap-4">
        <label htmlFor={id} className="text-[15px] font-semibold leading-none text-admin-text sm:text-[16px]">
          {label}
        </label>
        {rightAction}
      </div>
      <div className="relative">
        {icon ? <div className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-admin-muted">{icon}</div> : null}
        <input id={id} aria-invalid={Boolean(error)} aria-describedby={hasMessage ? messageId : undefined} className={inputClassName} {...props} />
      </div>
      {hasMessage ? (
        <p id={messageId} className={messageClassName}>
          {error || helperText}
        </p>
      ) : null}
    </div>
  );
}

export function PasswordField({ id, label, error, placeholder, value, onChange, disabled }: Pick<AuthFieldProps, "id" | "label" | "error" | "placeholder" | "value" | "onChange" | "disabled">) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <AuthField id={id} label={label} type={visible ? "text" : "password"} placeholder={placeholder} value={value} onChange={onChange} error={error} disabled={disabled} />
      <button
        type="button"
        aria-label={visible ? "Hide password" : "Show password"}
        onClick={() => setVisible((current) => !current)}
        disabled={disabled}
        className="absolute bottom-[15px] right-5 text-admin-muted transition hover:text-admin-text focus:outline-none focus:ring-2 focus:ring-admin-blue/30 disabled:text-admin-muted"
      >
        <EyeIcon className="h-5 w-5" />
      </button>
    </div>
  );
}

export function PrimaryButton({ children, disabled, showArrow = true }: { children: ReactNode; disabled?: boolean; showArrow?: boolean }) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="admin-primary-shadow flex h-[56px] w-full items-center justify-center gap-2.5 rounded-[10px] bg-admin-blue px-6 text-[17px] font-bold leading-none text-white transition hover:bg-admin-blue-hover focus:outline-none focus:ring-4 focus:ring-admin-blue/20 disabled:bg-admin-disabled disabled:text-admin-muted disabled:shadow-none sm:text-[18px]"
    >
      {children}
      {showArrow ? <ArrowRightIcon className="h-5 w-5" /> : null}
    </button>
  );
}

export function TextButtonLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="text-[15px] font-semibold leading-none text-admin-blue transition hover:text-admin-blue-hover focus:outline-none focus:ring-2 focus:ring-admin-blue/20 sm:text-[16px]">
      {children}
    </Link>
  );
}

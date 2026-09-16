"use client";

import { Suspense, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { resetAdminPassword } from "@/lib/api/auth";
import { AuthHeader, PasswordField, PrimaryButton, TextButtonLink } from "@/components/auth/AuthControls";
import { SmallCheckIcon, SmallCircleIcon } from "@/components/auth/icons";
import { AuthShell } from "@/components/auth/AuthShell";

function Requirement({ met, children }: { met: boolean; children: ReactNode }) {
  const className = ["flex items-center gap-3 text-[15px] font-semibold leading-5", met ? "text-admin-success" : "text-admin-muted"].join(" ");

  return (
    <li className={className}>
      {met ? <SmallCheckIcon className="h-5 w-5" /> : <SmallCircleIcon className="h-5 w-5" />}
      {children}
    </li>
  );
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [formError, setFormError] = useState(token ? "" : "Reset token is missing.");
  const [loading, setLoading] = useState(false);

  const rules = useMemo(
    () => ({
      length: password.length >= 12,
      uppercase: /[A-Z]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    }),
    [password],
  );

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordError("");
    setConfirmError("");
    setFormError(token ? "" : "Reset token is missing.");

    if (!token) {
      toast.error("Reset token is missing.");
      return;
    }

    if (!rules.length || !rules.uppercase || !rules.special) {
      setPasswordError("Password does not meet the admin password policy.");
      toast.error("Password does not meet the admin password policy.");
      return;
    }

    if (password !== confirmPassword) {
      setConfirmError("Passwords do not match.");
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    const result = await resetAdminPassword(token, password);
    setLoading(false);

    if (!result.ok) {
      setFormError(result.message);
      toast.error(result.message);
      return;
    }

    toast.success("Password updated");
    router.push("/reset-password/success");
  }

  return (
    <AuthShell>
      <AuthHeader title="Reset Password" description="Create a secure new password for your admin account." />

      <div className="mt-8 rounded-[10px] bg-admin-soft px-6 py-5">
        <p className="text-[16px] font-bold text-admin-text">Password requirements</p>
        <ul className="mt-4 space-y-3">
          <Requirement met={rules.length}>At least 12 characters</Requirement>
          <Requirement met={rules.uppercase}>One uppercase letter</Requirement>
          <Requirement met={rules.special}>One special character</Requirement>
        </ul>
      </div>

      {formError ? <p role="alert" className="mt-5 text-[15px] font-semibold text-admin-danger">{formError}</p> : null}

      <form onSubmit={onSubmit} className="mt-7 space-y-7" noValidate>
        <PasswordField
          id="new-password"
          label="New Password"
          placeholder="Enter new password"
          value={password}
          onChange={(event) => setPassword(event.currentTarget.value)}
          error={passwordError}
        />

        <PasswordField
          id="confirm-password"
          label="Confirm Password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.currentTarget.value)}
          error={confirmError}
        />

        <PrimaryButton disabled={loading || !token}>{loading ? "Updating" : "Update Password"}</PrimaryButton>
      </form>

      <div className="mt-8 flex justify-center">
        <TextButtonLink href="/login">Back To Login</TextButtonLink>
      </div>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
}

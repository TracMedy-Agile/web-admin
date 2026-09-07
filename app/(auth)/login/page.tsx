"use client";

import { Suspense, useState } from "react";
import type { FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { loginAdmin } from "@/lib/api/auth";
import { storeAdminTokens } from "@/lib/services/auth/cookie-storage.client";
import { AuthField, AuthHeader, PasswordField, PrimaryButton, TextButtonLink } from "@/components/auth/AuthControls";
import { AlertIcon, MailIcon } from "@/components/auth/icons";
import { AuthShell } from "@/components/auth/AuthShell";

function isEmail(value: string): boolean {
  return /^\S+@\S+\.\S+$/.test(value);
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [formError, setFormError] = useState(searchParams.get("error") === "invalid" ? "Invalid credentials. Please check your email and password." : "");
  const [criticalError, setCriticalError] = useState(searchParams.get("error") === "suspended");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setEmailError("");
    setPasswordError("");

    if (!isEmail(email)) {
      setEmailError("Please enter a valid admin email.");
      toast.error("Please enter a valid admin email.");
      return;
    }

    if (!password) {
      setPasswordError("Please enter your password.");
      toast.error("Please enter your password.");
      return;
    }

    setLoading(true);
    const result = await loginAdmin(email, password);
    setLoading(false);

    if (!result.ok) {
      const suspended = /suspend|restrict|disabled|blocked/i.test(result.message);
      setCriticalError(suspended);
      setFormError(suspended ? "Account Suspended" : result.message);
      toast.error(suspended ? "Account suspended" : "Login failed", {
        description: suspended ? "Please contact your system administrator." : result.message,
      });
      return;
    }

    try {
      await storeAdminTokens({
        accessToken: result.data.accessToken,
        refreshToken: result.data.refreshToken,
        expiresIn: result.data.expiresIn,
      });
    } catch {
      setFormError("Unable to save admin session. Please try again.");
      toast.error("Unable to save admin session. Please try again.");
      return;
    }

    toast.success("Login successful");
    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <AuthShell>
      {formError && !criticalError ? (
        <div role="alert" aria-live="assertive" className="mb-7 flex min-h-[68px] items-start gap-4 rounded-[10px] border border-admin-danger bg-admin-danger-soft px-5 py-4 text-admin-danger">
          <AlertIcon className="mt-0.5 h-6 w-6 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-[16px] font-bold leading-5">Invalid credentials</p>
            <p className="mt-1 text-[14px] font-medium leading-5">{formError}</p>
          </div>
          <button type="button" aria-label="Dismiss error" onClick={() => setFormError("")} className="text-[18px] font-bold leading-none">
            x
          </button>
        </div>
      ) : null}

      <AuthHeader title="Welcome Back" description="Enter your credentials to access the admin portal." />

      {criticalError ? (
        <div role="alert" className="mt-8 rounded-[10px] border border-admin-danger bg-admin-danger-soft px-6 py-5 text-admin-danger">
          <p className="text-[13px] font-bold uppercase tracking-normal">Critical error</p>
          <p className="mt-3 text-[20px] font-bold text-admin-text">Account Suspended</p>
          <p className="mt-2 text-[15px] font-medium leading-6">
            Access to the Tracmedy platform has been temporarily restricted for this credential. Please contact your system administrator.
          </p>
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="mt-9 space-y-7" noValidate>
        <AuthField
          id="admin-email"
          label="Email Address"
          type="email"
          placeholder="admin@tracmedy.com"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.currentTarget.value)}
          error={emailError}
          icon={<MailIcon className="h-6 w-6" />}
          disabled={criticalError || loading}
        />

        <PasswordField
          id="admin-password"
          label="Password"
          placeholder="Enter password"
          value={password}
          onChange={(event) => setPassword(event.currentTarget.value)}
          error={passwordError}
          disabled={criticalError || loading}
        />

        <div className="flex justify-end">
          <TextButtonLink href="/forgot-password">Forgot password?</TextButtonLink>
        </div>

        <PrimaryButton disabled={criticalError || loading}>{loading ? "Logging in" : "Login"}</PrimaryButton>
      </form>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}

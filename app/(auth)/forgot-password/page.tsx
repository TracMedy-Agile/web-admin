"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { requestAdminPasswordReset } from "@/lib/api/auth";
import { AuthField, AuthHeader, PrimaryButton, TextButtonLink } from "@/components/auth/AuthControls";
import { MailIcon } from "@/components/auth/icons";
import { AuthShell } from "@/components/auth/AuthShell";

function isEmail(value: string): boolean {
  return /^\S+@\S+\.\S+$/.test(value);
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!isEmail(email)) {
      setError("Admin not found.");
      toast.error("Admin not found.");
      return;
    }

    setLoading(true);
    const result = await requestAdminPasswordReset(email);
    setLoading(false);

    if (!result.ok) {
      setError(result.message || "Admin not found.");
      toast.error(result.message || "Admin not found.");
      return;
    }

    toast.success("Reset link sent");
    router.push("/forgot-password/confirmation?email=" + encodeURIComponent(email));
  }

  return (
    <AuthShell>
      <AuthHeader title="Forgot Password" description="Enter your admin email and we will send a reset link." />

      <form onSubmit={onSubmit} className="mt-9 space-y-7" noValidate>
        <AuthField
          id="forgot-email"
          label="Email Address"
          type="email"
          placeholder="admin@tracmedy.com"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.currentTarget.value)}
          error={error}
          icon={<MailIcon className="h-6 w-6" />}
          disabled={loading}
        />

        <PrimaryButton disabled={loading}>{loading ? "Sending" : "Send Reset Link"}</PrimaryButton>
      </form>

      <div className="mt-8 flex justify-center">
        <TextButtonLink href="/login">Back To Login</TextButtonLink>
      </div>
    </AuthShell>
  );
}

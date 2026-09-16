"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { requestAdminPasswordReset } from "@/lib/api/auth";
import { AuthHeader, PrimaryButton, TextButtonLink } from "@/components/auth/AuthControls";
import { CheckIcon, InfoIcon } from "@/components/auth/icons";
import { AuthShell } from "@/components/auth/AuthShell";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const [loading, setLoading] = useState(false);

  async function resend() {
    if (!email) {
      return;
    }

    setLoading(true);
    const result = await requestAdminPasswordReset(email);
    setLoading(false);

    if (result.ok) {
      toast.success("Reset link sent again.");
      return;
    }

    toast.error(result.message);
  }

  return (
    <AuthShell>
      <div className="mx-auto mb-8 grid h-[76px] w-[76px] place-items-center rounded-full bg-admin-success-soft text-admin-success">
        <CheckIcon className="h-10 w-10" />
      </div>

      <div className="text-center">
        <AuthHeader title="Email sent" description="Check your email for a reset link." />
      </div>

      <div className="mt-8 flex gap-4 rounded-[10px] bg-admin-soft px-5 py-5 text-left text-admin-muted">
        <InfoIcon className="mt-0.5 h-6 w-6 shrink-0 text-admin-blue" />
        <p className="text-[15px] font-medium leading-6">The link will expire soon for your security. Use the newest email if you request another link.</p>
      </div>

      <form action="/login" className="mt-8">
        <PrimaryButton showArrow={false}>Return To Login</PrimaryButton>
      </form>

      <div className="mt-8 flex flex-col items-center gap-3">
        <button type="button" onClick={resend} disabled={loading || !email} className="text-[18px] font-semibold text-admin-blue transition hover:text-admin-blue-hover focus:outline-none focus:ring-2 focus:ring-admin-blue/20 disabled:text-admin-muted">
          {loading ? "Resending Email" : "Resend Email"}
        </button>
        <TextButtonLink href="/login">Back To Login</TextButtonLink>
      </div>
    </AuthShell>
  );
}

export default function ForgotPasswordConfirmationPage() {
  return (
    <Suspense fallback={null}>
      <ConfirmationContent />
    </Suspense>
  );
}

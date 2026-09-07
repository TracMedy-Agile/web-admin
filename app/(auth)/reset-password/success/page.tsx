import { AuthShell } from "@/components/auth/AuthShell";
import { AuthHeader, PrimaryButton } from "@/components/auth/AuthControls";
import { CheckIcon } from "@/components/auth/icons";

export default function ResetPasswordSuccessPage() {
  return (
    <AuthShell>
      <div className="mx-auto mb-8 grid h-[76px] w-[76px] place-items-center rounded-full bg-admin-success-soft text-admin-success">
        <CheckIcon className="h-10 w-10" />
      </div>

      <div className="text-center">
        <AuthHeader title="Password Updated" description="Your password has been updated successfully." />
      </div>

      <form action="/login" className="mt-9">
        <PrimaryButton showArrow={false}>Proceed To Login</PrimaryButton>
      </form>
    </AuthShell>
  );
}

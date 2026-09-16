import { redirect } from "next/navigation";
import { AdminFrame } from "@/components/admin/AdminFrame";
import { getAdminSessionToken, getAdminTopbarProfile } from "@/lib/server/admin-overview";

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const token = await getAdminSessionToken();

  if (!token) {
    redirect("/login");
  }

  const profile = await getAdminTopbarProfile(token);

  return (
    <AdminFrame adminName={profile?.fullName} adminRole={profile?.roleLabel} initials={profile?.initials}>
      {children}
    </AdminFrame>
  );
}

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ACCESS_COOKIE } from "@/lib/server/auth-response";

export default async function Home() {
  const cookieStore = await cookies();
  redirect(cookieStore.get(ACCESS_COOKIE)?.value ? "/dashboard" : "/login");
}

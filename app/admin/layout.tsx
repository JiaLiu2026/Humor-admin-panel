import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";

/**
 * Server-side gate for the entire /admin/* tree.
 *
 * Even though middleware already blocks anonymous users, this layout adds a
 * second, stricter check: only profiles where is_superadmin = true may
 * reach any admin page. Logged-in users without that flag are redirected
 * to /unauthorized.
 *
 * This layout is a Server Component, so the check runs server-side before
 * any admin page is rendered or its data is fetched. There is no way to
 * bypass it from the client.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, is_superadmin")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !profile?.is_superadmin) {
    redirect("/unauthorized");
  }

  return <>{children}</>;
}

import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { requireUser } from "@/lib/auth/session";
import { createServerSupabase } from "@/lib/supabase/server";

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  const supabase = await createServerSupabase();
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle();
  const fallbackName = user.email?.split("@")[0] || "Minha conta";

  return (
    <AppShell
      profile={{ displayName: profile?.display_name || fallbackName }}
      user={{ email: user.email }}
    >
      {children}
    </AppShell>
  );
}

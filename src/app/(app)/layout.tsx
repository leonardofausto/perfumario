import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { requireUser } from "@/lib/auth/session";
import { getOwnProfile } from "@/lib/profile/queries";

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  const profile = await getOwnProfile(user.id);
  const fallbackName = user.email?.split("@")[0] || "Minha conta";

  return (
    <AppShell
      profile={{
        avatarUrl: profile?.avatarUrl ?? null,
        displayName: profile?.displayName || fallbackName,
      }}
      user={{ email: user.email }}
    >
      {children}
    </AppShell>
  );
}

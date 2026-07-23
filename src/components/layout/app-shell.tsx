"use client";

import { Menu } from "lucide-react";
import type { ReactNode } from "react";
import { useCallback, useState } from "react";

import { BrandMark } from "@/components/brand/brand-mark";

import styles from "./app-shell.module.css";
import { AppSidebar } from "./app-sidebar";
import { MobileNavigation } from "./mobile-navigation";

type AppShellProps = {
  children: ReactNode;
  profile: { displayName: string };
  user: { email?: string };
};

export function AppShell({ children, profile, user }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMobile = useCallback(() => setMobileOpen(false), []);
  const email = user.email ?? "Conta privada";

  return (
    <div className={styles.appShell}>
      <aside className={styles.desktopSidebar}>
        <AppSidebar displayName={profile.displayName} email={email} />
      </aside>

      <header className={styles.mobileHeader}>
        <BrandMark compact />
        <button aria-label="Abrir menu" onClick={() => setMobileOpen(true)} type="button">
          <Menu aria-hidden="true" size={22} />
        </button>
      </header>

      <MobileNavigation
        displayName={profile.displayName}
        email={email}
        onClose={closeMobile}
        open={mobileOpen}
      />

      <main className={styles.mainContent}>{children}</main>
    </div>
  );
}

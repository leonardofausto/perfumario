"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { BrandMark } from "@/components/brand/brand-mark";
import { navigationItems } from "@/config/navigation";

import styles from "./app-shell.module.css";
import { UserMenu } from "./user-menu";

type AppSidebarProps = {
  displayName: string;
  email: string;
  onNavigate?: () => void;
};

export function AppSidebar({ displayName, email, onNavigate }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <div className={styles.sidebarInner}>
      <BrandMark inverse />
      <nav aria-label="Navegação principal" className={styles.navigation}>
        {navigationItems.map(({ href, icon: Icon, label }) => {
          const current = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              aria-current={current ? "page" : undefined}
              className={current ? styles.activeLink : undefined}
              href={href}
              key={href}
              onClick={onNavigate}
            >
              <Icon aria-hidden="true" size={20} strokeWidth={1.8} />
              {label}
            </Link>
          );
        })}
      </nav>
      <UserMenu displayName={displayName} email={email} />
    </div>
  );
}

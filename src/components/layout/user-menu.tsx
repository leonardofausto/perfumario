"use client";

import { ChevronDown, LogOut, UserRoundPen } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { logoutAction } from "@/app/(app)/actions";

import styles from "./app-shell.module.css";

type UserMenuProps = {
  displayName: string;
  email: string;
};

function initials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "P";
}

export function UserMenu({ displayName, email }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function closeOutside(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return (
    <div className={styles.userMenu} ref={rootRef}>
      {open ? (
        <div aria-label="Opções da conta" className={styles.userPopover} role="menu">
          <div className={styles.userIdentity}>
            <strong>{displayName}</strong>
            <small>{email}</small>
          </div>
          <Link href="/perfil" onClick={() => setOpen(false)} role="menuitem">
            <UserRoundPen aria-hidden="true" size={17} />
            Editar perfil
          </Link>
          <form action={logoutAction}>
            <button type="submit">
              <LogOut aria-hidden="true" size={17} />
              Sair
            </button>
          </form>
        </div>
      ) : null}

      <button
        aria-label="Minha conta"
        aria-expanded={open}
        aria-haspopup="menu"
        className={styles.accountButton}
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <span aria-hidden="true" className={styles.avatarFallback}>
          {initials(displayName || email)}
        </span>
        <span className={styles.accountCopy}>
          <strong>Minha conta</strong>
          <small>{displayName}</small>
        </span>
        <ChevronDown aria-hidden="true" size={17} />
      </button>
    </div>
  );
}

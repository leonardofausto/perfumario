"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";

import styles from "./app-shell.module.css";
import { AppSidebar } from "./app-sidebar";

type MobileNavigationProps = {
  displayName: string;
  email: string;
  onClose: () => void;
  open: boolean;
};

export function MobileNavigation({ displayName, email, onClose, open }: MobileNavigationProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";

    const dialog = dialogRef.current;
    const focusable = dialog?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    focusable?.[0]?.focus();

    function handleKeydown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab" || !focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeydown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeydown);
      previouslyFocused?.focus();
    };
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div className={styles.mobileLayer}>
      <button aria-label="Fechar menu" className={styles.scrim} onClick={onClose} type="button" />
      <div
        aria-label="Menu principal"
        aria-modal="true"
        className={styles.mobileDialog}
        ref={dialogRef}
        role="dialog"
      >
        <button aria-label="Fechar menu" className={styles.closeMenu} onClick={onClose} type="button">
          <X aria-hidden="true" size={22} />
        </button>
        <AppSidebar displayName={displayName} email={email} onNavigate={onClose} />
      </div>
    </div>
  );
}

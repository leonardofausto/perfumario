"use client";

import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { toggleFavoriteAction } from "@/features/perfumes/actions";

import styles from "./detail.module.css";

export function FavoriteButton({
  id,
  isFavorite,
}: {
  id: string;
  isFavorite: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className={styles.favoriteButton}
      disabled={pending}
      aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      onClick={() =>
        startTransition(async () => {
          const result = await toggleFavoriteAction(id, !isFavorite);
          if (result.status === "success") router.refresh();
        })
      }
    >
      <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
      {isFavorite ? "Favorito" : "Favoritar"}
    </button>
  );
}

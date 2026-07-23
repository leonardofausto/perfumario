import { Clock3, LayoutGrid, LibraryBig, Sparkles, type LucideIcon } from "lucide-react";

export type NavigationItem = {
  href: string;
  icon: LucideIcon;
  label: string;
};

export const navigationItems: NavigationItem[] = [
  { href: "/dashboard", icon: LayoutGrid, label: "Dashboard" },
  { href: "/colecao", icon: LibraryBig, label: "Minha Coleção" },
  { href: "/recomendador", icon: Sparkles, label: "Recomendador" },
  { href: "/historico", icon: Clock3, label: "Histórico" },
];

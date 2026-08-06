import {
  BookOpen,
  ChartColumn,
  LayoutGrid,
  LibraryBig,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export type NavigationItem = {
  href: string;
  icon: LucideIcon;
  label: string;
};

export const navigationItems: NavigationItem[] = [
  { href: "/dashboard", icon: LayoutGrid, label: "Visão geral" },
  { href: "/colecao", icon: LibraryBig, label: "Minha coleção" },
  { href: "/recomendador", icon: Sparkles, label: "Recomendador" },
  { href: "/diario", icon: BookOpen, label: "Diário de uso" },
  { href: "/analises", icon: ChartColumn, label: "Análises" },
];

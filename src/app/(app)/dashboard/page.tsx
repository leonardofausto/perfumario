import Link from "next/link";
import { Clock3, Heart, LibraryBig, Sparkles, ArrowRight } from "lucide-react";

import { StatCard } from "@/components/dashboard/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { getOwnPerfumeDashboard } from "@/features/perfumes/queries";
import styles from "@/components/ui/workspace.module.css";

export default async function DashboardPage() {
  const { recent, totalCount, favoriteCount } = await getOwnPerfumeDashboard();

  return (
    <div className={styles.page}>
      <PageHeader
        description="Acompanhe sua estante e prepare o caminho para recomendações cada vez mais pessoais."
        eyebrow="Visão geral"
        title="Dashboard"
      />
      <section aria-label="Resumo da estante" className={styles.statsGrid}>
        <StatCard icon={LibraryBig} label="Perfumes na coleção" value={totalCount} />
        <StatCard icon={Heart} label="Perfumes favoritos" value={favoriteCount} />
        <StatCard icon={Clock3} label="Recomendações salvas" value={0} />
      </section>

      {totalCount > 0 ? (
        <section
          style={{
            marginTop: "24px",
            padding: "28px",
            borderRadius: "16px",
            background: "#fffdf8",
            border: "1px solid var(--sand)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "20px",
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  fontFamily: "var(--font-display)",
                  fontSize: "1.4rem",
                  color: "var(--ink)",
                }}
              >
                Sua Estante Olfativa
              </h2>
              <p style={{ margin: "4px 0 0", color: "var(--muted)", fontSize: "0.88rem" }}>
                Você tem {totalCount} {totalCount === 1 ? "perfume cadastrado" : "perfumes cadastrados"} ({favoriteCount}{" "}
                {favoriteCount === 1 ? "favorito" : "favoritos"}).
              </p>
            </div>
            <Link
              href="/colecao"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 16px",
                borderRadius: "9px",
                background: "var(--green)",
                color: "white",
                fontSize: "0.82rem",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Ver Coleção <ArrowRight size={16} />
            </Link>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "14px",
            }}
          >
            {recent.map((p) => (
              <Link
                key={p.id}
                href={`/colecao/${p.id}`}
                aria-label={`Ver detalhes de ${p.name}`}
                style={{
                  padding: "14px",
                  borderRadius: "10px",
                  background: "#fdfbf6",
                  border: "1px solid #e8e2d9",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  textDecoration: "none",
                }}
              >
                {p.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    style={{ width: "40px", height: "40px", objectFit: "contain", borderRadius: "6px" }}
                  />
                ) : (
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "6px",
                      background: "#edf4ee",
                      display: "grid",
                      placeItems: "center",
                      color: "var(--green)",
                    }}
                  >
                    <LibraryBig size={20} />
                  </div>
                )}
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "0.68rem",
                      fontWeight: 750,
                      color: "#887d6f",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {p.brand}
                  </div>
                  <div
                    style={{
                      fontSize: "0.84rem",
                      fontWeight: 650,
                      color: "#111",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {p.name}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : (
        <EmptyState
          action={{ href: "/colecao", label: "Conhecer Minha Coleção" }}
          description="Quando seus perfumes estiverem cadastrados, o Perfumário poderá organizar escolhas por clima, ocasião e momento do dia."
          icon={Sparkles}
          title="Sua estante inteligente começa aqui"
        />
      )}
    </div>
  );
}


"use client";

import { useState } from "react";
import {
  Briefcase,
  Building,
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  Compass,
  Dumbbell,
  Fingerprint,
  Glasses,
  LocateFixed,
  MapPin,
  Moon,
  Sparkles,
  Sun,
  SunDim,
  Sunrise,
  Sunset,
  Trees,
  Trophy,
  Sliders,
} from "lucide-react";
import type { PerfumeSummary } from "@/features/perfumes/types";
import styles from "./recommender.module.css";

export function RecommenderView({ perfumes }: { perfumes: PerfumeSummary[] }) {

  // Context manual input state
  const [isManualOpen, setIsManualOpen] = useState(true);
  const [isAutoActive, setIsAutoActive] = useState(false);
  const [cidade, setCidade] = useState("São Paulo");
  const [clima, setClima] = useState("clima fresco");
  const [temperatura, setTemperatura] = useState("22");
  const [estacao, setEstacao] = useState("Outono");

  // Selection states for filters (all initially unselected per user instruction)
  const [ocasiao, setOcasiao] = useState<string | null>(null);
  const [horario, setHorario] = useState<string | null>(null);
  const [ambiente, setAmbiente] = useState<string | null>(null);
  const [intensidade, setIntensidade] = useState<string | null>(null);
  const [estilo, setEstilo] = useState<string | null>(null);
  const [presenca, setPresenca] = useState<string | null>(null);
  const [objetivo, setObjetivo] = useState<string | null>(null);

  // Top 3 revealed state
  const [isRevealed, setIsRevealed] = useState(false);

  const toggleSelect = (
    current: string | null,
    setter: (val: string | null) => void,
    val: string
  ) => {
    setter(current === val ? null : val);
  };

  const handleAutoContext = () => {
    setIsAutoActive(true);
    setCidade("São Paulo");
    setClima("Ensolarado");
    setTemperatura("24");
    setEstacao("Outono");
  };

  const handleRevealTop3 = () => {
    setIsRevealed(true);
  };

  // Get top 3 perfumes from user collection or fallback seeds
  const top3Perfumes = perfumes.slice(0, 3);

  return (
    <div className={styles.container}>
      {/* SEU MOMENTO - Context Banner (Screenshot 6) */}
      <div className={styles.contextCard}>
        <div className={styles.contextHeader}>
          <div className={styles.contextBadgeGroup}>
            <div className={styles.contextIconBadge}>
              <SunDim size={24} />
            </div>
            <div className={styles.contextInfo}>
              <span className={styles.contextEyebrow}>SEU MOMENTO</span>
              <div className={styles.contextStatus}>
                <MapPin size={18} className={styles.contextStatusIcon} />
                <span>
                  {isAutoActive
                    ? `Contexto ativado: ${cidade}, ${clima} (${temperatura}°C)`
                    : "Contexto ainda não ativado"}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.contextActionGroup}>
            <span className={styles.contextHintText}>
              Uma autorização preenche cidade e clima nas próximas visitas.
            </span>
            <button
              type="button"
              className={styles.autoContextButton}
              onClick={handleAutoContext}
            >
              <LocateFixed size={16} />
              <span>Ativar contexto automático</span>
            </button>
          </div>
        </div>

        <div className={styles.contextDivider} />

        <button
          type="button"
          className={styles.toggleManualButton}
          onClick={() => setIsManualOpen(!isManualOpen)}
        >
          {isManualOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          <span>Ajustar contexto manualmente</span>
        </button>

        {isManualOpen && (
          <div className={styles.manualGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="cidade">Cidade</label>
              <input
                id="cidade"
                type="text"
                className={styles.inputField}
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="clima">Clima</label>
              <input
                id="clima"
                type="text"
                className={styles.inputField}
                value={clima}
                onChange={(e) => setClima(e.target.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="temperatura">Temperatura</label>
              <input
                id="temperatura"
                type="text"
                className={styles.inputField}
                value={temperatura}
                onChange={(e) => setTemperatura(e.target.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="estacao">Estação</label>
              <select
                id="estacao"
                className={styles.selectField}
                value={estacao}
                onChange={(e) => setEstacao(e.target.value)}
              >
                <option value="Outono">Outono</option>
                <option value="Primavera">Primavera</option>
                <option value="Verão">Verão</option>
                <option value="Inverno">Inverno</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: Form Left & Ranking Right (Screenshot 7) */}
      <div className={styles.mainGrid}>
        {/* Left Column: Form Controls */}
        <div className={styles.leftCard}>
          <div className={styles.cardHeader}>
            <div className={styles.cardHeaderIcon}>
              <Sliders size={22} />
            </div>
            <div className={styles.cardHeaderTitleGroup}>
              <span className={styles.cardEyebrow}>AJUSTES DA ESCOLHA</span>
              <h2 className={styles.cardTitle}>Qual é o plano?</h2>
            </div>
          </div>

          {/* Ocasião */}
          <div className={styles.sectionBlock}>
            <span className={styles.sectionLabel}>Ocasião</span>
            <div className={styles.optionsGrid}>
              {[
                { label: "Trabalho", icon: Briefcase },
                { label: "Encontro", icon: Calendar },
                { label: "Festa", icon: Sparkles },
                { label: "Academia", icon: Dumbbell },
                { label: "Passeio", icon: Compass },
                { label: "Formal", icon: Glasses },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = ocasiao === item.label;
                return (
                  <button
                    key={item.label}
                    type="button"
                    className={`${styles.optionChip} ${
                      isSelected ? styles.optionChipActive : ""
                    }`}
                    onClick={() => toggleSelect(ocasiao, setOcasiao, item.label)}
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Horário de uso */}
          <div className={styles.sectionBlock}>
            <span className={styles.sectionLabel}>Horário de uso</span>
            <div className={styles.optionsGrid}>
              {[
                { label: "Manhã", icon: Sunrise },
                { label: "Tarde", icon: Sun },
                { label: "Fim de tarde", icon: Sunset },
                { label: "Noite", icon: Moon },
                { label: "Dia inteiro", icon: Clock },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = horario === item.label;
                return (
                  <button
                    key={item.label}
                    type="button"
                    className={`${styles.optionChip} ${
                      isSelected ? styles.optionChipActive : ""
                    }`}
                    onClick={() => toggleSelect(horario, setHorario, item.label)}
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ambiente */}
          <div className={styles.sectionBlock}>
            <span className={styles.sectionLabel}>Ambiente</span>
            <div className={styles.optionsGrid}>
              {[
                { label: "Ao ar livre", icon: Trees },
                { label: "Fechado", icon: Building },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = ambiente === item.label;
                return (
                  <button
                    key={item.label}
                    type="button"
                    className={`${styles.optionChip} ${
                      isSelected ? styles.optionChipActive : ""
                    }`}
                    onClick={() =>
                      toggleSelect(ambiente, setAmbiente, item.label)
                    }
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subheader: SUA PREFERÊNCIA */}
          <span className={styles.subHeaderLabel}>SUA PREFERÊNCIA</span>

          {/* Intensidade */}
          <div className={styles.sectionBlock}>
            <span className={styles.sectionLabel}>Intensidade</span>
            <div className={styles.optionsGrid}>
              {["Discreta", "Equilibrada", "Intensa"].map((val) => {
                const isSelected = intensidade === val;
                return (
                  <button
                    key={val}
                    type="button"
                    className={`${styles.optionChip} ${
                      isSelected ? styles.optionChipActive : ""
                    }`}
                    onClick={() =>
                      toggleSelect(intensidade, setIntensidade, val)
                    }
                  >
                    <span>{val}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Estilo */}
          <div className={styles.sectionBlock}>
            <span className={styles.sectionLabel}>Estilo</span>
            <div className={styles.optionsGrid}>
              {["Fresco", "Elegante", "Sensual", "Doce", "Casual"].map((val) => {
                const isSelected = estilo === val;
                return (
                  <button
                    key={val}
                    type="button"
                    className={`${styles.optionChip} ${
                      isSelected ? styles.optionChipActive : ""
                    }`}
                    onClick={() => toggleSelect(estilo, setEstilo, val)}
                  >
                    <span>{val}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Presença */}
          <div className={styles.sectionBlock}>
            <span className={styles.sectionLabel}>Presença</span>
            <div className={styles.optionsGrid}>
              {["Discreta", "Marcante"].map((val) => {
                const isSelected = presenca === val;
                return (
                  <button
                    key={val}
                    type="button"
                    className={`${styles.optionChip} ${
                      isSelected ? styles.optionChipActive : ""
                    }`}
                    onClick={() => toggleSelect(presenca, setPresenca, val)}
                  >
                    <span>{val}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Objetivo */}
          <div className={styles.sectionBlock}>
            <span className={styles.sectionLabel}>Objetivo</span>
            <div className={styles.optionsGrid}>
              {[
                { label: "Para o momento", icon: Sparkles },
                { label: "Assinatura", icon: Fingerprint },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = objetivo === item.label;
                return (
                  <button
                    key={item.label}
                    type="button"
                    className={`${styles.optionChip} ${
                      isSelected ? styles.optionChipActive : ""
                    }`}
                    onClick={() =>
                      toggleSelect(objetivo, setObjetivo, item.label)
                    }
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Revelar meu Top 3 Button */}
          <button
            type="button"
            className={styles.revealButton}
            onClick={handleRevealTop3}
          >
            <Sparkles size={18} />
            <span>Revelar meu Top 3</span>
          </button>
        </div>

        {/* Right Column: Ranking Top 3 */}
        <div className={styles.rightCard}>
          <div className={styles.cardHeader}>
            <div className={styles.cardHeaderIcon}>
              <Trophy size={22} />
            </div>
            <div className={styles.cardHeaderTitleGroup}>
              <span className={styles.cardEyebrow}>RANKING DO MOMENTO</span>
              <h2 className={styles.cardTitle}>Top 3 da sua coleção</h2>
            </div>
          </div>

          <div className={styles.rankingContainer}>
            {!isRevealed ? (
              <div className={styles.emptyRankingBox}>
                <div className={styles.emptyRankingBadge}>
                  <Sparkles size={24} />
                </div>
                <h3 className={styles.emptyRankingTitle}>
                  Ajuste o momento e revele o pódio
                </h3>
                <p className={styles.emptyRankingSub}>
                  O ranking considera o contexto, suas preferências e a rotação
                  da coleção.
                </p>
              </div>
            ) : top3Perfumes.length > 0 ? (
              <div className={styles.rankingList}>
                {top3Perfumes.map((perfume, index) => {
                  const rankBadges = [
                    styles.rankBadge1,
                    styles.rankBadge2,
                    styles.rankBadge3,
                  ];
                  const matchScores = ["98%", "94%", "89%"];

                  return (
                    <div key={perfume.id} className={styles.rankingItem}>
                      <div
                        className={`${styles.rankBadge} ${
                          rankBadges[index] || styles.rankBadge3
                        }`}
                      >
                        {index + 1}º
                      </div>
                      {perfume.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={perfume.imageUrl}
                          alt={perfume.name}
                          className={styles.rankingPerfumeImg}
                        />
                      ) : (
                        <div
                          className={styles.rankingPerfumeImg}
                          aria-hidden="true"
                        />
                      )}
                      <div className={styles.rankingPerfumeInfo}>
                        <span className={styles.rankingBrand}>
                          {perfume.brand}
                        </span>
                        <strong className={styles.rankingName}>
                          {perfume.name}
                        </strong>
                        <span className={styles.rankingMatchScore}>
                          <Sparkles size={13} /> Combinação: {matchScores[index]}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className={styles.emptyRankingBox}>
                <div className={styles.emptyRankingBadge}>
                  <Sparkles size={24} />
                </div>
                <h3 className={styles.emptyRankingTitle}>
                  Sua coleção ainda não tem perfumes.
                </h3>
                <p className={styles.emptyRankingSub}>
                  Adicione seu primeiro perfume para receber recomendações
                  personalizadas.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

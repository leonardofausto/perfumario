"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Briefcase,
  Building,
  Calendar,
  Candy,
  ChevronDown,
  ChevronUp,
  Clock,
  Cloud,
  Coffee,
  Dumbbell,
  Flame,
  Flower2,
  Gem,
  Glasses,
  Gauge,
  Heart,
  LocateFixed,
  LoaderCircle,
  MapPin,
  Moon,
  PartyPopper,
  Radio,
  RefreshCw,
  Sprout,
  Sparkles,
  Snowflake,
  Sun,
  SunDim,
  Sunrise,
  Thermometer,
  Trees,
  Trophy,
  Sliders,
  SlidersHorizontal,
  Umbrella,
  Wind,
  Waves,
  Shuffle,
} from "lucide-react";
import { scorePerfumes } from "@/features/recommender/scoring";
import type {
  RecommenderClimateContext,
  RecommenderPerfume,
  RecommenderScoreResult,
  RecommenderSeason,
  RecommenderSelection,
} from "@/features/recommender/types";
import styles from "./recommender.module.css";

type AutoContext = {
  cidade: string;
  clima: string;
  temperatura: string;
  estacao: string;
  sensacao: string;
  chuva: string;
  vento: string;
};

type ManualContext = Pick<
  AutoContext,
  "cidade" | "clima" | "temperatura" | "estacao"
>;

type ActiveContextMode = "automatic" | "manual";

type ChoiceOption = {
  label: string;
  value: string;
  icon: typeof Sliders;
};

type ChoiceGroup = {
  title: string;
  options: ChoiceOption[];
};

type StoredRecommenderSession = {
  activeContextMode: ActiveContextMode;
  automaticContext: AutoContext;
  manualContext: ManualContext;
  manualCidade: string;
  manualClima: string;
  manualTemperatura: string;
  manualEstacao: string;
  selectedPerformance: string[];
  selectedSensory: string[];
  selectedSeasons: string[];
  selectedOccasions: string[];
  selectedTimes: string[];
  selectedEnvironments: string[];
  isRevealed: boolean;
  rankingResults: RecommenderScoreResult[];
  rankingMessage: string | null;
  isRankingStale: boolean;
  lastAutoUpdatedAt: string | null;
};

const recommenderSessionKey = "perfumario:recommender-session:v1";

const choiceGroups = [
  {
    title: "Desempenho",
    options: [
      { label: "Fixação", value: "fixacao", icon: Gauge },
      { label: "Projeção", value: "projecao", icon: Radio },
      { label: "Rastro", value: "rastro", icon: Waves },
      { label: "Versatilidade", value: "versatilidade", icon: Shuffle },
      { label: "Presença", value: "presenca", icon: Sparkles },
    ],
  },
  {
    title: "Perfil sensorial",
    options: [
      { label: "Intensidade", value: "intensity", icon: Flame },
      { label: "Doçura", value: "sweetness", icon: Candy },
      { label: "Frescor", value: "freshness", icon: Wind },
      { label: "Elegância", value: "elegance", icon: Gem },
      { label: "Sensualidade", value: "sensuality", icon: Heart },
    ],
  },
  {
    title: "Estações",
    options: [
      { label: "Primavera", value: "primavera", icon: Flower2 },
      { label: "Verão", value: "verao", icon: Sun },
      { label: "Outono", value: "outono", icon: Trees },
      { label: "Inverno", value: "inverno", icon: Snowflake },
    ],
  },
  {
    title: "Ocasiões",
    options: [
      { label: "Academia", value: "ar_livre", icon: Dumbbell },
      { label: "Casual", value: "casual", icon: Coffee },
      { label: "Encontro", value: "encontro", icon: Calendar },
      { label: "Festa", value: "festa", icon: PartyPopper },
      { label: "Formal", value: "formal", icon: Glasses },
      { label: "Trabalho", value: "trabalho", icon: Briefcase },
    ],
  },
  {
    title: "Melhor horário",
    options: [
      { label: "Manhã", value: "manha", icon: Sunrise },
      { label: "Tarde", value: "tarde", icon: SunDim },
      { label: "Noite", value: "noite", icon: Moon },
      { label: "Dia inteiro", value: "madrugada", icon: Clock },
    ],
  },
  {
    title: "Ambiente",
    options: [
      { label: "Ar livre", value: "ar_livre", icon: Trees },
      { label: "Fechado", value: "fechado", icon: Building },
    ],
  },
] satisfies ChoiceGroup[];

const initialAutomaticContext: AutoContext = {
  cidade: "Cidade n\u00e3o definida",
  clima: "",
  temperatura: "",
  estacao: getSeasonForCurrentDate(),
  sensacao: "",
  chuva: "",
  vento: "",
};

const initialManualContext: ManualContext = {
  cidade: "",
  clima: "",
  temperatura: "",
  estacao: "Outono",
};

function readStoredRecommenderSession() {
  if (typeof window === "undefined") return null;

  try {
    const rawSession = window.sessionStorage.getItem(recommenderSessionKey);
    if (!rawSession) return null;

    return JSON.parse(rawSession) as StoredRecommenderSession;
  } catch {
    return null;
  }
}

function writeStoredRecommenderSession(session: StoredRecommenderSession) {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(recommenderSessionKey, JSON.stringify(session));
  } catch {
    // Storage can be unavailable in private or restricted browser contexts.
  }
}

function removeStoredRecommenderSession() {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.removeItem(recommenderSessionKey);
  } catch {
    // Storage can be unavailable in private or restricted browser contexts.
  }
}

function formatUpdatedAt(date: Date) {
  return `Atualizado \u00e0s ${date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

function getSeasonForCurrentDate(date = new Date()) {
  const month = date.getMonth();

  if (month >= 2 && month <= 4) {
    return "Outono";
  }

  if (month >= 5 && month <= 7) {
    return "Inverno";
  }

  if (month >= 8 && month <= 10) {
    return "Primavera";
  }

  return "Ver\u00e3o";
}

function getBrowserPosition() {
  return new Promise<GeolocationPosition>((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocaliza\u00e7\u00e3o indispon\u00edvel."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position),
      () => reject(new Error("N\u00e3o foi poss\u00edvel acessar sua localiza\u00e7\u00e3o.")),
      { enableHighAccuracy: false, maximumAge: 300000, timeout: 8000 }
    );
  });
}

function getWeatherDescription(code: number) {
  if (code === 0) return "C\u00e9u limpo";
  if ([1, 2, 3].includes(code)) return "Nublado";
  if ([45, 48].includes(code)) return "Neblina";
  if ([51, 53, 55, 56, 57].includes(code)) return "Garoa";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "Chuvoso";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "Neve";
  if ([95, 96, 99].includes(code)) return "Tempestade";

  return "N\u00e3o informado";
}

function formatTemperature(value: unknown) {
  return typeof value === "number" && Number.isFinite(value)
    ? String(Math.round(value))
    : "";
}

function formatWind(value: unknown) {
  return typeof value === "number" && Number.isFinite(value)
    ? `${Math.round(value)} km/h`
    : "";
}

function formatRain(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "";
  }

  return value > 0 ? `${value.toLocaleString("pt-BR")} mm` : "Sem chuva";
}

function parseNullableNumber(value: string) {
  const normalized = value.trim().replace(",", ".");
  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeSeason(value: string): RecommenderSeason | null {
  const normalized = value.trim().toLocaleLowerCase("pt-BR");

  if (normalized === "primavera") return "primavera";
  if (normalized === "verao" || normalized === "verão") return "verao";
  if (normalized === "outono") return "outono";
  if (normalized === "inverno") return "inverno";

  return null;
}

async function fetchAutomaticContext(): Promise<AutoContext> {
  const position = await getBrowserPosition();
  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;

  const [city, weather] = await Promise.all([
    identifyCity(latitude, longitude),
    fetchWeatherContext(latitude, longitude),
  ]);

  return {
    cidade: city,
    ...weather,
  };
}

async function identifyCity(latitude: number, longitude: number) {
  const geocodingUrl = new URL(
    "https://api.bigdatacloud.net/data/reverse-geocode-client"
  );
  geocodingUrl.searchParams.set("latitude", String(latitude));
  geocodingUrl.searchParams.set("longitude", String(longitude));
  geocodingUrl.searchParams.set("localityLanguage", "pt");

  let geocodingResponse: Response;
  try {
    geocodingResponse = await fetch(geocodingUrl);
  } catch {
    throw new Error("N\u00e3o foi poss\u00edvel identificar sua cidade neste momento.");
  }

  if (!geocodingResponse.ok) {
    throw new Error("N\u00e3o foi poss\u00edvel identificar sua cidade neste momento.");
  }

  const geocodingData = await geocodingResponse.json();
  const city =
    typeof geocodingData?.city === "string" ? geocodingData.city.trim() : "";

  if (!city) {
    throw new Error("N\u00e3o foi poss\u00edvel identificar sua cidade neste momento.");
  }

  return city;
}

async function fetchWeatherContext(
  latitude: number,
  longitude: number
): Promise<Omit<AutoContext, "cidade">> {
  const weatherUrl = new URL("https://api.open-meteo.com/v1/forecast");
  weatherUrl.searchParams.set("latitude", String(latitude));
  weatherUrl.searchParams.set("longitude", String(longitude));
  weatherUrl.searchParams.set(
    "current",
    "temperature_2m,apparent_temperature,weather_code,precipitation,wind_speed_10m"
  );
  weatherUrl.searchParams.set("timezone", "auto");

  let weatherResponse: Response;
  try {
    weatherResponse = await fetch(weatherUrl);
  } catch {
    throw new Error("N\u00e3o foi poss\u00edvel atualizar os dados clim\u00e1ticos.");
  }

  if (!weatherResponse.ok) {
    throw new Error("N\u00e3o foi poss\u00edvel atualizar os dados clim\u00e1ticos.");
  }

  const weatherData = await weatherResponse.json();
  const currentWeather = weatherData?.current;
  if (!currentWeather) {
    throw new Error("N\u00e3o foi poss\u00edvel atualizar os dados clim\u00e1ticos.");
  }

  return {
    clima: getWeatherDescription(currentWeather.weather_code),
    temperatura: formatTemperature(currentWeather.temperature_2m),
    estacao: getSeasonForCurrentDate(),
    sensacao: formatTemperature(currentWeather.apparent_temperature),
    chuva: formatRain(currentWeather.precipitation),
    vento: formatWind(currentWeather.wind_speed_10m),
  };
}

export function RecommenderView({ perfumes }: { perfumes: RecommenderPerfume[] }) {
  const hasRestoredSessionRef = useRef(false);

  // Context manual input state
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [hasManualPanelMounted, setHasManualPanelMounted] = useState(false);
  const [isAutoContextUpdating, setIsAutoContextUpdating] = useState(false);
  const [isManualContextApplying, setIsManualContextApplying] = useState(false);
  const [activeContextMode, setActiveContextMode] =
    useState<ActiveContextMode>("automatic");
  const [autoContextError, setAutoContextError] = useState<string | null>(null);
  const [manualContextError, setManualContextError] = useState<string | null>(
    null
  );
  const [lastAutoUpdatedAt, setLastAutoUpdatedAt] = useState<string | null>(null);
  const manualContextPanelId = "manual-context-panel";
  const [automaticContext, setAutomaticContext] = useState(initialAutomaticContext);
  const [manualContext, setManualContext] = useState(initialManualContext);
  const [manualCidade, setManualCidade] = useState(initialManualContext.cidade);
  const [manualClima, setManualClima] = useState(initialManualContext.clima);
  const [manualTemperatura, setManualTemperatura] = useState(
    initialManualContext.temperatura
  );
  const [manualEstacao, setManualEstacao] = useState(
    initialManualContext.estacao
  );

  // Selection states for filters (all initially unselected per user instruction)
  const [selectedPerformance, setSelectedPerformance] = useState<string[]>([]);
  const [selectedSensory, setSelectedSensory] = useState<string[]>([]);
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>([]);
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [selectedEnvironments, setSelectedEnvironments] = useState<string[]>([]);

  // Top 3 revealed state
  const [isRevealed, setIsRevealed] = useState(false);
  const [rankingResults, setRankingResults] = useState<RecommenderScoreResult[]>(
    []
  );
  const [rankingMessage, setRankingMessage] = useState<string | null>(null);
  const [isRankingStale, setIsRankingStale] = useState(false);
  const [isRankingProcessing, setIsRankingProcessing] = useState(false);

  useEffect(() => {
    const storedSession = readStoredRecommenderSession();

    if (!storedSession) {
      queueMicrotask(() => {
        hasRestoredSessionRef.current = true;
      });
      return;
    }

    queueMicrotask(() => {
      const currentPerfumesById = new Map(
        perfumes.map((perfume) => [perfume.id, perfume])
      );
      const rankingResultsWithFreshPerfumes = storedSession.rankingResults.map(
        (result) => ({
          ...result,
          perfume: currentPerfumesById.get(result.perfume.id) ?? result.perfume,
        })
      );

      hasRestoredSessionRef.current = true;
      setActiveContextMode(storedSession.activeContextMode);
      setAutomaticContext(storedSession.automaticContext);
      setManualContext(storedSession.manualContext);
      setManualCidade(storedSession.manualCidade);
      setManualClima(storedSession.manualClima);
      setManualTemperatura(storedSession.manualTemperatura);
      setManualEstacao(storedSession.manualEstacao);
      setSelectedPerformance(storedSession.selectedPerformance);
      setSelectedSensory(storedSession.selectedSensory);
      setSelectedSeasons(storedSession.selectedSeasons);
      setSelectedOccasions(storedSession.selectedOccasions);
      setSelectedTimes(storedSession.selectedTimes);
      setSelectedEnvironments(storedSession.selectedEnvironments);
      setIsRevealed(storedSession.isRevealed);
      setRankingResults(rankingResultsWithFreshPerfumes);
      setRankingMessage(storedSession.rankingMessage);
      setIsRankingStale(storedSession.isRankingStale);
      setLastAutoUpdatedAt(storedSession.lastAutoUpdatedAt);
    });
  }, [perfumes]);

  useEffect(() => {
    if (!hasRestoredSessionRef.current) {
      return;
    }

    writeStoredRecommenderSession({
      activeContextMode,
      automaticContext,
      manualContext,
      manualCidade,
      manualClima,
      manualTemperatura,
      manualEstacao,
      selectedPerformance,
      selectedSensory,
      selectedSeasons,
      selectedOccasions,
      selectedTimes,
      selectedEnvironments,
      isRevealed,
      rankingResults,
      rankingMessage,
      isRankingStale,
      lastAutoUpdatedAt,
    });
  }, [
    activeContextMode,
    automaticContext,
    manualContext,
    manualCidade,
    manualClima,
    manualTemperatura,
    manualEstacao,
    selectedPerformance,
    selectedSensory,
    selectedSeasons,
    selectedOccasions,
    selectedTimes,
    selectedEnvironments,
    isRevealed,
    rankingResults,
    rankingMessage,
    isRankingStale,
    lastAutoUpdatedAt,
  ]);

  const toggleMultiSelect = (
    setter: (updater: (current: string[]) => string[]) => void,
    val: string
  ) => {
    setter((current) =>
      current.includes(val)
        ? current.filter((item) => item !== val)
        : [...current, val]
    );
    if (isRevealed) {
      setIsRankingStale(true);
    }
  };

  const handleAutoContext = async () => {
    if (isAutoContextUpdating) {
      return;
    }

    setIsAutoContextUpdating(true);
    setAutoContextError(null);

    try {
      const nextContext = await fetchAutomaticContext();
      setAutomaticContext(nextContext);
      setActiveContextMode("automatic");
      setLastAutoUpdatedAt(formatUpdatedAt(new Date()));
      if (isRevealed) {
        setIsRankingStale(true);
      }
    } catch (error) {
      setAutoContextError(
        error instanceof Error
          ? error.message
          : "N\u00e3o foi poss\u00edvel atualizar o contexto autom\u00e1tico."
      );
    } finally {
      setIsAutoContextUpdating(false);
    }
  };

  const handleUseManualContext = async () => {
    if (isManualContextApplying) {
      return;
    }

    setManualContextError(null);

    if (
      !manualCidade.trim() ||
      !manualTemperatura.trim() ||
      !manualClima.trim() ||
      !manualEstacao.trim()
    ) {
      setManualContextError("Preencha cidade, temperatura, clima e esta\u00e7\u00e3o.");
      return;
    }

    setIsManualContextApplying(true);

    try {
      setManualContext({
        cidade: manualCidade.trim(),
        temperatura: manualTemperatura.trim(),
        clima: manualClima.trim(),
        estacao: manualEstacao,
      });
      setActiveContextMode("manual");
      if (isRevealed) {
        setIsRankingStale(true);
      }
    } finally {
      setIsManualContextApplying(false);
    }
  };

  const handleRevealTop3 = async () => {
    if (isRankingProcessing) {
      return;
    }

    setIsRankingProcessing(true);
    setRankingMessage(null);

    try {
      await Promise.resolve();

      if (perfumes.length === 0) {
        setRankingResults([]);
        setRankingMessage(null);
        setIsRankingStale(false);
        setIsRevealed(true);
        return;
      }

      if (activeContextMode === "automatic" && !lastAutoUpdatedAt) {
        setRankingResults([]);
        setRankingMessage(
          "Ative ou atualize o contexto autom\u00e1tico, ou use o contexto manual."
        );
        setIsRankingStale(false);
        setIsRevealed(true);
        return;
      }

      const climate: RecommenderClimateContext =
        activeContextMode === "manual"
          ? {
              cidade: manualContext.cidade,
              clima: manualContext.clima || null,
              temperaturaCelsius: parseNullableNumber(manualContext.temperatura),
              estacao: normalizeSeason(manualContext.estacao),
            }
          : {
              cidade: automaticContext.cidade,
              clima: automaticContext.clima || null,
              temperaturaCelsius: parseNullableNumber(
                automaticContext.temperatura
              ),
              estacao: normalizeSeason(automaticContext.estacao),
              sensacaoCelsius: parseNullableNumber(automaticContext.sensacao),
              chuva: automaticContext.chuva || null,
              ventoKmh: parseNullableNumber(
                automaticContext.vento.replace(" km/h", "")
              ),
            };
      const selection: RecommenderSelection = {
        performance: selectedPerformance,
        sensory: selectedSensory,
        seasons: selectedSeasons,
        occasions: selectedOccasions,
        times: selectedTimes,
        environments: selectedEnvironments,
      };
      const results = scorePerfumes({
        perfumes,
        contextMode: activeContextMode,
        climate,
        selection,
      }).slice(0, 3);

      setRankingResults(results);
      setRankingMessage(null);
      setIsRankingStale(false);
      setIsRevealed(true);
    } finally {
      setIsRankingProcessing(false);
    }
  };

  const refreshAutomaticContextIfAlreadyGranted = async () => {
    if (typeof navigator === "undefined" || !("permissions" in navigator)) {
      return;
    }

    try {
      const permission = await navigator.permissions.query({
        name: "geolocation" as PermissionName,
      });

      if (permission.state !== "granted") {
        return;
      }

      setIsAutoContextUpdating(true);
      setAutoContextError(null);

      try {
        const nextContext = await fetchAutomaticContext();
        setAutomaticContext(nextContext);
        setLastAutoUpdatedAt(formatUpdatedAt(new Date()));
      } catch (error) {
        setAutoContextError(
          error instanceof Error
            ? error.message
            : "N\u00e3o foi poss\u00edvel atualizar o contexto autom\u00e1tico."
        );
      } finally {
        setIsAutoContextUpdating(false);
      }
    } catch {
      // If permission state cannot be queried, avoid triggering a new prompt.
    }
  };

  const handleClearRecommendation = () => {
    const shouldRefreshAutomaticContext = !lastAutoUpdatedAt;

    setSelectedPerformance([]);
    setSelectedSensory([]);
    setSelectedSeasons([]);
    setSelectedOccasions([]);
    setSelectedTimes([]);
    setSelectedEnvironments([]);
    setRankingResults([]);
    setRankingMessage(null);
    setIsRankingStale(false);
    setIsRevealed(false);
    setManualContext(initialManualContext);
    setManualCidade(initialManualContext.cidade);
    setManualClima(initialManualContext.clima);
    setManualTemperatura(initialManualContext.temperatura);
    setManualEstacao(initialManualContext.estacao);
    setManualContextError(null);
    setAutoContextError(null);
    setActiveContextMode("automatic");
    setIsManualOpen(false);
    removeStoredRecommenderSession();

    if (shouldRefreshAutomaticContext) {
      void refreshAutomaticContextIfAlreadyGranted();
    }
  };

  const handleToggleManual = () => {
    if (!isManualOpen) {
      setHasManualPanelMounted(true);
    }

    setIsManualOpen((current) => !current);
  };

  const top3Perfumes = rankingResults.map((result) => result.perfume);
  const isManualContextActive = activeContextMode === "manual";
  const autoContextButtonLabel = isAutoContextUpdating
    ? "Atualizando..."
    : lastAutoUpdatedAt
      ? "Atualizar contexto"
      : "Ativar contexto autom\u00e1tico";
  const manualContextButtonLabel = isManualContextApplying
    ? "Aplicando..."
    : isManualContextActive
      ? "Contexto manual ativo"
      : "Usar contexto manual";
  const visibleContext =
    activeContextMode === "manual"
      ? {
          cidade: manualContext.cidade,
          temperatura: manualContext.temperatura,
          clima: manualContext.clima,
          estacao: manualContext.estacao,
          sensacao: "",
          chuva: "",
          vento: "",
        }
      : automaticContext;
  const contextModeLabel =
    activeContextMode === "manual"
      ? "Contexto manual"
      : lastAutoUpdatedAt
        ? "Contexto autom\u00e1tico"
        : null;
  const weatherIndicators = [
    {
      title: "Temperatura",
      value: visibleContext.temperatura
        ? `${visibleContext.temperatura}\u00b0C`
        : "\u2014",
      icon: Thermometer,
    },
    {
      title: "Sensa\u00e7\u00e3o",
      value: visibleContext.sensacao ? `${visibleContext.sensacao}\u00b0C` : "\u2014",
      icon: Gauge,
    },
    { title: "Clima", value: visibleContext.clima || "\u2014", icon: Cloud },
    { title: "Esta\u00e7\u00e3o", value: visibleContext.estacao || "\u2014", icon: Sprout },
    { title: "Chuva", value: visibleContext.chuva || "\u2014", icon: Umbrella },
    { title: "Vento", value: visibleContext.vento || "\u2014", icon: Wind },
  ];
  const choiceSelections = [
    selectedPerformance,
    selectedSensory,
    selectedSeasons,
    selectedOccasions,
    selectedTimes,
    selectedEnvironments,
  ];
  const choiceSetters = [
    setSelectedPerformance,
    setSelectedSensory,
    setSelectedSeasons,
    setSelectedOccasions,
    setSelectedTimes,
    setSelectedEnvironments,
  ];

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
              <div className={styles.contextCity}>
                <MapPin size={18} className={styles.contextStatusIcon} />
                <span>{visibleContext.cidade}</span>
              </div>
              {contextModeLabel ? (
                <div
                  className={styles.contextSummaryMeta}
                  data-testid="context-summary-meta"
                >
                  <span className={styles.contextModeBadge}>
                    {contextModeLabel}
                  </span>
                  {activeContextMode === "automatic" && lastAutoUpdatedAt ? (
                    <>
                      <span
                        className={styles.contextMetaSeparator}
                        aria-hidden="true"
                      >
                        &middot;
                      </span>
                      <span className={styles.contextUpdatedAt}>
                        {lastAutoUpdatedAt}
                      </span>
                    </>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>

          <div className={styles.contextActionGroup}>
            <span className={styles.contextHintText}>
              Uma autorização preenche cidade e clima nas próximas visitas.
            </span>
            <button
              type="button"
              className={styles.autoContextButton}
              disabled={isAutoContextUpdating}
              onClick={handleAutoContext}
            >
              {isAutoContextUpdating ? (
                <LoaderCircle size={16} className={styles.spinnerIcon} />
              ) : lastAutoUpdatedAt ? (
                <RefreshCw size={16} />
              ) : (
                <LocateFixed size={16} />
              )}
              <span>{autoContextButtonLabel}</span>
            </button>
          </div>
        </div>
        {autoContextError ? (
          <p className={styles.contextError} role="status">
            {autoContextError}
          </p>
        ) : null}

        <div
          className={styles.weatherScroller}
          aria-label="Informa\u00e7\u00f5es clim\u00e1ticas"
        >
          <div className={styles.weatherGrid}>
            {weatherIndicators.map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.title} className={styles.weatherBlock}>
                  <div className={styles.weatherBlockHeader}>
                    <Icon size={15} />
                    <span>{item.title}</span>
                  </div>
                  <strong className={styles.weatherBlockValue}>
                    {item.value}
                  </strong>
                </div>
              );
            })}
          </div>
        </div>

        <div className={styles.contextDivider} />

        <div className={styles.manualHeader}>
          <button
            type="button"
            className={styles.toggleManualButton}
            aria-controls={manualContextPanelId}
            aria-expanded={isManualOpen}
            onClick={handleToggleManual}
          >
            {isManualOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            <span>Ajustar contexto manualmente</span>
          </button>

          {isManualOpen && hasManualPanelMounted ? (
            <button
              type="button"
              className={styles.manualContextButton}
              disabled={!isManualOpen || isManualContextApplying}
              onClick={handleUseManualContext}
            >
              {isManualContextApplying ? (
                <LoaderCircle size={16} className={styles.spinnerIcon} />
              ) : (
                <SlidersHorizontal size={16} />
              )}
              <span>{manualContextButtonLabel}</span>
            </button>
          ) : null}
        </div>

        <div
          id={manualContextPanelId}
          aria-hidden={!isManualOpen}
          className={`${styles.manualPanel} ${
            isManualOpen ? styles.manualPanelOpen : ""
          }`}
        >
          {hasManualPanelMounted && (
            <div className={styles.manualPanelInner}>
              <div className={styles.manualGrid}>
                <div className={styles.formGroup}>
                  <label htmlFor="cidade">Cidade</label>
                  <input
                    id="cidade"
                    type="text"
                    className={styles.inputField}
                    disabled={!isManualOpen}
                    value={manualCidade}
                    onChange={(e) => setManualCidade(e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="temperatura">Temperatura</label>
                  <input
                    id="temperatura"
                    type="text"
                    className={styles.inputField}
                    disabled={!isManualOpen}
                    value={manualTemperatura}
                    onChange={(e) => setManualTemperatura(e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="clima">Clima</label>
                  <input
                    id="clima"
                    type="text"
                    className={styles.inputField}
                    disabled={!isManualOpen}
                    value={manualClima}
                    onChange={(e) => setManualClima(e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="estacao">{"Esta\u00e7\u00e3o"}</label>
                  <select
                    id="estacao"
                    className={styles.selectField}
                    disabled={!isManualOpen}
                    value={manualEstacao}
                    onChange={(e) => setManualEstacao(e.target.value)}
                  >
                    <option value="Outono">Outono</option>
                    <option value="Primavera">Primavera</option>
                    <option value="Ver\u00e3o">{"Ver\u00e3o"}</option>
                    <option value="Inverno">Inverno</option>
                  </select>
                </div>
              </div>
              {manualContextError ? (
                <p className={styles.contextError} role="status">
                  {manualContextError}
                </p>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Form Left & Ranking Right (Screenshot 7) */}
      <div className={styles.mainGrid}>
        {/* Left Column: Form Controls */}
        <section
          className={styles.leftCard}
          aria-label="Ajustes da escolha"
          role="region"
        >
          <div className={styles.cardHeader}>
            <div className={styles.cardHeaderIcon}>
              <Sliders size={22} />
            </div>
            <div className={styles.cardHeaderTitleGroup}>
              <span className={styles.cardEyebrow}>AJUSTES DA ESCOLHA</span>
              <h2 id="choice-panel-title" className={styles.cardTitle}>Qual é o plano?</h2>
            </div>
            {isRankingStale ? (
              <div className={styles.staleRankingNotice} role="status">
                <strong>Top 3 desatualizado</strong>
                <span>Clique em Revelar (Novamente)</span>
              </div>
            ) : null}
          </div>

          <div className={styles.choiceGroupsGrid}>
            {choiceGroups.map((group, groupIndex) => (
              <section
                key={group.title}
                className={styles.choiceGroup}
                role="group"
                aria-label={group.title}
              >
                <div className={styles.choiceGroupHeader}>
                  <span className={styles.sectionLabel}>{group.title}</span>
                  <span className={styles.choiceCounter}>
                    {choiceSelections[groupIndex].length || "0"}
                  </span>
                </div>
                <div className={styles.choiceOptionsGrid}>
                  {group.options.map((item) => {
                    const Icon = item.icon;
                    const isSelected = choiceSelections[groupIndex].includes(
                      item.value
                    );

                    return (
                      <button
                        key={`${group.title}-${item.value}`}
                        type="button"
                        className={`${styles.optionChip} ${
                          isSelected ? styles.optionChipActive : ""
                        }`}
                        aria-pressed={isSelected}
                        onClick={() =>
                          toggleMultiSelect(choiceSetters[groupIndex], item.value)
                        }
                      >
                        <Icon size={16} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>

          <div className={styles.recommendationActions}>
            <button
              type="button"
              className={styles.revealButton}
              disabled={isRankingProcessing}
              onClick={handleRevealTop3}
            >
              {isRankingProcessing ? (
                <LoaderCircle size={18} className={styles.spinnerIcon} />
              ) : (
                <Sparkles size={18} />
              )}
              <span>
                {isRankingProcessing ? "Calculando..." : "Revelar meu Top 3"}
              </span>
            </button>
          </div>
        </section>

        {/* Right Column: Ranking Top 3 */}
        <div className={styles.rightCard}>
          <div className={styles.cardHeader}>
            <div className={styles.cardHeaderIcon}>
              <Sparkles size={22} />
            </div>
            <div className={styles.cardHeaderTitleGroup}>
              <span className={styles.cardEyebrow}>RANKING DO MOMENTO</span>
              <h2 className={styles.cardTitle}>Top 3 da sua coleção</h2>
            </div>
          </div>

          <div className={styles.rankingContainer}>
            {isRankingProcessing ? (
              <div className={styles.emptyRankingBox} role="status">
                <div className={styles.emptyRankingBadge}>
                  <LoaderCircle size={24} className={styles.spinnerIcon} />
                </div>
                <h3 className={styles.emptyRankingTitle}>Calculando Top 3</h3>
                <p className={styles.emptyRankingSub}>
                  Cruzando o contexto ativo com os dados cadastrados da sua
                  estante.
                </p>
              </div>
            ) : !isRevealed ? (
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
            ) : rankingMessage ? (
              <div className={styles.emptyRankingBox}>
                <div className={styles.emptyRankingBadge}>
                  <Sparkles size={24} />
                </div>
                <h3 className={styles.emptyRankingTitle}>
                  Contexto pendente
                </h3>
                <p className={styles.emptyRankingSub}>{rankingMessage}</p>
              </div>
            ) : top3Perfumes.length > 0 ? (
              <div className={styles.rankingList}>
                {top3Perfumes.map((perfume, index) => {
                  const rankBadges = [
                    styles.rankBadge1,
                    styles.rankBadge2,
                    styles.rankBadge3,
                  ];
                  const matchScore = rankingResults[index]?.score ?? 0;
                  const explanation = rankingResults[index];
                  const isTopChoice = index === 0;

                  return (
                    <article
                      key={perfume.id}
                      className={`${styles.rankingItem} ${
                        isTopChoice
                          ? styles.rankingItemFeatured
                          : styles.rankingItemCompact
                      }`}
                    >
                      {isTopChoice ? (
                        <span className={styles.topChoiceBadge}>
                          <Trophy
                            size={30}
                            aria-hidden="true"
                            className={styles.topChoiceIcon}
                          />
                          MELHOR ESCOLHA PARA AGORA
                        </span>
                      ) : null}
                      <div className={styles.rankingCardTop}>
                        {!isTopChoice ? (
                          <div
                            className={`${styles.rankBadge} ${
                              rankBadges[index] || styles.rankBadge3
                            }`}
                          >
                            {index + 1}º
                          </div>
                        ) : null}
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
                            aria-label={`Imagem não disponível para ${perfume.name}`}
                            role="img"
                          >
                            {perfume.name.slice(0, 1)}
                          </div>
                        )}
                        <div className={styles.rankingPerfumeInfo}>
                          <span className={styles.rankingBrand}>
                            {perfume.brand}
                          </span>
                          <strong className={styles.rankingName}>
                            {perfume.name}
                          </strong>
                          <span className={styles.rankingMatchScore}>
                            Compatibilidade: {matchScore}%
                          </span>
                        </div>
                      </div>

                      {isTopChoice && explanation?.reasons.length ? (
                        <ul className={styles.rankingReasons}>
                          {explanation.reasons.map((reason) => (
                            <li key={reason}>
                              <span aria-hidden="true">{"\u2713"}</span>
                              {reason}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                      {isTopChoice && explanation?.attention ? (
                        <span className={styles.rankingAttention}>
                          <span aria-hidden="true">{"\u2713"}</span>
                          {explanation.attention}
                        </span>
                      ) : null}

                      <div className={styles.rankingCardFooter}>
                        <Link
                          href={`/colecao/${perfume.id}?from=recomendador`}
                          className={styles.rankingDetailsLink}
                        >
                          Abrir detalhes
                        </Link>
                      </div>
                    </article>
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
          {isRevealed && !rankingMessage && top3Perfumes.length > 0 ? (
            <div className={styles.recommendationActions}>
              <button
                type="button"
                className={styles.clearRecommendationButton}
                onClick={handleClearRecommendation}
              >
                {"Limpar recomenda\u00e7\u00e3o"}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

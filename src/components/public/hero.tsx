import { ArrowRight, BookOpen, Check, CloudSun, History, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import styles from "./public.module.css";

const benefits = [
  "Coleção sempre à mão",
  "Escolha guiada pelo contexto",
  "Histórico que aprende com você",
  "Decisões mais simples no dia a dia",
];

const steps = [
  {
    icon: BookOpen,
    title: "Cadastre a coleção",
    copy: "Reúna os perfumes que realmente fazem parte da sua rotina.",
  },
  {
    icon: CloudSun,
    title: "Informe o momento",
    copy: "Combine clima, horário e ocasião antes de escolher.",
  },
  {
    icon: Sparkles,
    title: "Receba uma direção",
    copy: "Use a recomendação como ponto de partida para decidir.",
  },
];

export function Hero() {
  return (
    <main className={styles.main}>
      <section className={styles.intro}>
        <p className={styles.eyebrow}>Seu ritual, organizado</p>
        <h1>Escolha o perfume certo para o seu dia.</h1>
        <p className={styles.lead}>
          Organize sua coleção e escolha melhor por clima, horário e ocasião.
        </p>
      </section>

      <section className={styles.heroGrid} aria-label="Como o Perfumário ajuda">
        <div className={styles.benefitColumn}>
          <ul className={styles.benefits}>
            {benefits.map((benefit) => (
              <li key={benefit}>
                <Check aria-hidden="true" size={16} />
                {benefit}
              </li>
            ))}
          </ul>
          <div className={styles.accessCard}>
            <span className={styles.accessIcon} aria-hidden="true">
              <History size={20} />
            </span>
            <div>
              <strong>Sua estante espera por você.</strong>
              <p>Acesso privado para manter coleção, perfil e histórico no seu espaço.</p>
            </div>
            <Link href="/login">
              Entrar na minha estante
              <ArrowRight aria-hidden="true" size={17} />
            </Link>
          </div>
        </div>

        <figure className={styles.heroImage}>
          <Image
            alt="Frascos de perfume sobre uma estante de madeira"
            fill
            priority
            sizes="(max-width: 767px) 100vw, 62vw"
            src="/images/login-perfumes.png"
          />
          <figcaption>
            <span>Curadoria pessoal</span>
            <strong>Perfumes, memórias e momentos.</strong>
          </figcaption>
        </figure>
      </section>

      <section className={styles.steps} aria-label="Etapas do Perfumário">
        {steps.map(({ copy, icon: Icon, title }, index) => (
          <article key={title}>
            <span className={styles.stepNumber}>{String(index + 1).padStart(2, "0")}</span>
            <Icon aria-hidden="true" size={21} />
            <div>
              <h2>{title}</h2>
              <p>{copy}</p>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

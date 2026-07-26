import type { NoteLayer } from "@/features/perfumes/types";

import styles from "./detail.module.css";

const layers: Array<{ key: NoteLayer; title: string }> = [
  { key: "top", title: "Notas de saída" },
  { key: "heart", title: "Notas de coração" },
  { key: "base", title: "Notas de fundo" },
];

export function OlfactoryPyramid({
  notes,
}: {
  notes: Record<NoteLayer, string[]>;
}) {
  return (
    <div className={styles.pyramid} aria-label="Pirâmide olfativa">
      {layers.map(({ key, title }) => (
        <section key={key} className={`${styles.pyramidLayer} ${styles[key]}`}>
          <h3>{title}</h3>
          <ul>
            {notes[key].map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

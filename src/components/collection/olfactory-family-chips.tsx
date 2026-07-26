import styles from "./detail.module.css";

const familyTones = [
  "var(--family-forest)",
  "var(--family-amber)",
  "var(--family-plum)",
  "var(--family-ocean)",
  "var(--family-rose)",
];

export function OlfactoryFamilyChips({ families }: { families: string[] }) {
  return (
    <ul className={styles.familyList} aria-label="Famílias olfativas">
      {families.map((family, index) => (
        <li
          key={family}
          className={styles.familyChip}
          style={{ backgroundColor: familyTones[index % familyTones.length] }}
        >
          {family}
        </li>
      ))}
    </ul>
  );
}

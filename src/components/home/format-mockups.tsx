import { BeitragsRahmen, type Rahmenart } from "@/components/home/beitrag-rahmen";

/**
 * Formatbeispiele als Attrappen.
 *
 * Ein Unternehmen, das eine Kooperation erwaegt, will vor allem eines wissen:
 * Wie sieht das nachher aus? Diese Frage beantwortet kein Fliesstext, sondern
 * eine Ansicht.
 *
 * Der Telefonbildschirm selbst steht in beitrag-rahmen.tsx — dieselbe
 * Attrappe traegt auch die Leistungsschau auf der Startseite. Hier bleibt nur
 * die Aussage: welche drei Formate es gibt und wofuer jedes taugt.
 *
 * Bewusst ohne Motivsymbol: In diesem Abschnitt geht es um das Format, nicht
 * um das Thema. Ein Symbol in der Flaeche wuerde die Frage beantworten, die
 * hier gar nicht gestellt ist.
 */

type Format = {
  name: "Feed-Post" | "Reel" | "Story";
  art: Rahmenart;
  text: string;
  farbe: string;
};

const formate: Format[] = [
  {
    name: "Feed-Post",
    art: "post",
    text: "Ein Bild oder eine Karussell-Serie mit Bildunterschrift. Bleibt dauerhaft im Profil sichtbar.",
    farbe: "linear-gradient(150deg, #3a94e8 0%, #0b4f8a 100%)",
  },
  {
    name: "Reel",
    art: "reel",
    text: "Kurzes Video, 15 bis 45 Sekunden. Das Format mit der größten Reichweite außerhalb der Follower.",
    farbe: "linear-gradient(150deg, #80bdff 0%, #2279c9 55%, #082f52 100%)",
  },
  {
    name: "Story",
    art: "story",
    text: "24 Stunden sichtbar, mit Link oder Umfrage. Gut für kurzfristige Aktionen und Erinnerungen.",
    farbe: "linear-gradient(150deg, #0b4f8a 0%, #1e71bf 48%, #80bdff 100%)",
  },
];

export function FormatMockups() {
  return (
    <ul className="grid gap-6 sm:grid-cols-3">
      {formate.map((format) => (
        <li key={format.name}>
          <figure className="flex h-full flex-col rounded-card border border-line bg-page p-4 shadow-card transition-[border-color,box-shadow,transform] duration-300 ease-sanft hover:-translate-y-1 hover:border-primary/70 hover:shadow-card-hover">
            <BeitragsRahmen art={format.art} farbe={format.farbe} />

            <figcaption className="mt-4">
              <h3 className="display text-[1.0625rem] text-ink">{format.name}</h3>
              <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-muted">{format.text}</p>
            </figcaption>
          </figure>
        </li>
      ))}
    </ul>
  );
}

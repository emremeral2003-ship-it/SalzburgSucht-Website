# Salzburgsucht — Produktkontext

## Plattform
Web. Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS v4.
Daten in Supabase (Postgres, Region Frankfurt), Mailversand über Resend.
Hosting plattformneutral, geplant auf Netlify.

## Positionierung
Salzburgsucht ist eine **lokale Community- und Medienplattform für Salzburg**
mit eigener Social-Media-Reichweite — und wird für Unternehmen als
Social-Media- und Content-Agentur mit eigener Community wirksam.

**Es ist ausdrücklich keine Jobbörse.** Wer die Startseite zum ersten Mal
sieht, soll eine lokale Community erkennen, kein Stellenportal. Die visuelle
Gewichtung liegt bei etwa 80–90 % auf Community und Unternehmensleistungen und
bei 10–20 % auf Jobs. Diese Gewichtung ist eine stehende Vorgabe des
Auftraggebers vom 18.08.2026 und keine Gestaltungsfrage.

Leitsatz: *Salzburg entdecken. Menschen erreichen. Unternehmen sichtbar machen.*

## Nutzer
Zwei Gruppen, die sich beide sofort wiederfinden müssen:

1. **Privatpersonen aus Stadt und Land Salzburg** — wollen Empfehlungen,
   Events, Aktionen und gelegentlich einen Job. Kommen überwiegend aus
   Instagram und TikTok, also mobil.
2. **Unternehmen aus Salzburg und Umgebung** — wollen Reichweite für ihr
   Lokal, Produkt, Event, ihre Neueröffnung oder offene Stellen.

## Zweck
Die Website ist ein **Messinstrument für eine Testphase**, kein fertiges
Produkt. Sie soll drei Fragen mit echten Zahlen beantworten:

1. Wie viele Menschen aus Instagram und TikTok besuchen die Website und melden
   sich an?
2. Wie viele Unternehmen fragen Kooperationen an — und mit welchem Budget?
3. Wie stark interessieren sich Besucher für einzelne Stellen?

Ein größeres Jobportal ist frühestens 2027 geplant und wird auf Basis dieser
Zahlen entschieden. Die Datenstruktur ist darauf vorbereitet, das Produkt ist
es bewusst nicht.

## Belegte Fakten
- **17.900+ Instagram-Follower** (Stand August 2026) — die einzige gesicherte
  Reichweitenzahl.
- 24 Betriebe und Institutionen als bisherige Zusammenarbeiten, namentlich
  bekannt, ohne Logofreigabe.

## Was nicht erfunden wird
Keine weiteren Reichweitenzahlen, keine Testimonials, keine Preise, keine
Firmendaten im Impressum, keine echten Unternehmen mit erfundenen Stellen.
Fehlende Inhalte stehen als sichtbar markierte Platzhalter.

## Markenvorgaben
- Primärfarbe `#80BDFF`, Weiß, sehr helles Blau als Fläche, `#286AA6` als
  dunkler Kontrast, `#15202B` für Text.
- **Farbregel, die alles bestimmt:** `#80BDFF` erreicht auf Weiß nur rund 2:1
  und ist als Textfarbe unbrauchbar. Es trägt Flächen und Akzente. Text, Links
  und primäre Schaltflächen tragen `#286AA6` (5,7:1).
- Bestehendes Logo: Wortmarke „SALZBURG / SUCHT" mit Lupe, in der der Umriss
  des Landes Salzburg steht. Liegt nur als Screenshot vor, im Code als
  markierter Nachbau.
- Stil: modern, clean, großzügige Abstände, große Headlines, hochwertige
  Karten, dezente Schatten, zurückhaltende Bewegung. Ausdrücklich **nicht**
  wie eine Behördenseite und **nicht** wie ein Jobportal.

## Betriebskontext
Der überwiegende Teil des Traffics kommt über Instagram- und TikTok-Links,
also **mobil und über Mobilfunk**. Mobile First ist deshalb keine
Bequemlichkeit, sondern die Hauptansicht. Ladezeit ist ein
Conversion-Faktor, kein Nice-to-have.

## Produktprinzipien
- **Nicht überentwickeln.** Was niemand nutzt, wird nicht gebaut.
- **Messbar vor umfangreich.** Jede wichtige Interaktion ist ein benanntes
  Ereignis; Formularstart und Absenden werden getrennt gezählt.
- **Keine Messung ohne Einwilligung.** Kein Dark Pattern, kein
  vorausgewähltes Ja, kein vorgeladenes Script.
- **Ehrlich statt hübsch.** Wenn eine Anmeldung nicht gespeichert werden
  kann, sagt die Seite das — statt einen Erfolg vorzutäuschen.

## Barrierefreiheit
WCAG 2.1 AA als Mindestmaß: 4,5:1 für Fließtext, 3:1 für die Ränder von
Bedienelementen (1.4.11), sichtbarer Fokus, vollständige Tastaturbedienung,
Fehlermeldungen am verursachenden Feld und über `aria-describedby` verknüpft,
Touch-Ziele mindestens 44 px.

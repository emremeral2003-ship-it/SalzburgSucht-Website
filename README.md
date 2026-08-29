# Salzburgsucht — Website MVP

Lokale Community- und Medienplattform für Salzburg. Die Website bündelt
Empfehlungen, Kooperationen für Unternehmen und einen kleinen Job-Bereich.

Sie ist ausdrücklich ein **Testprojekt**: Sie soll Daten liefern, bevor 2027
über ein größeres Jobportal entschieden wird. Deshalb ist Tracking von Anfang
an eingebaut und die Funktionalität bewusst schlank gehalten.

**Positionierung:** Salzburgsucht ist keine Jobbörse. Die visuelle Gewichtung
liegt bei Community und Unternehmensleistungen; Jobs sind ein Abschnitt unter
vielen. Wer das ändert, ändert das Produkt.

---

## Installation

Voraussetzung: Node.js 20 oder neuer.

```bash
npm install
```

## Entwicklung starten

```bash
npm run dev
```

Läuft auf http://localhost:3400 (siehe `.claude/launch.json`).

Die Website funktioniert **ohne jede Konfiguration** — die Inhalte stehen als
Dateien im Repository (`src/data/`).

**Das Kooperationsformular braucht einen Mailversand, keine Datenbank.**
Anfragen werden per E-Mail zugestellt — entweder über das eigene Postfach der
Domain (SMTP, empfohlen) oder über Resend. Es genügt einer der beiden Wege;
liegt `SMTP_HOST` vor, gewinnt SMTP. Supabase ist optional und speichert
Eingänge nur zusätzlich, falls konfiguriert. Erfolg meldet das Formular,
sobald einer der Wege getragen hat — kommt keiner durch, meldet es ehrlich
einen Fehler statt einen Erfolg vorzutäuschen.

Weitere Befehle:

```bash
npm run build
```

```bash
npm run lint
```

---

## Environment Variables

Vorlage kopieren und ausfüllen:

```bash
cp .env.example .env.local
```

| Variable | Pflicht | Wofür |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | für Livegang | Canonical-URLs, OpenGraph, Sitemap |
| `NEXT_PUBLIC_INSTAGRAM_URL` | nein | überschreibt das Standardprofil |
| `NEXT_PUBLIC_TIKTOK_URL` | nein | überschreibt das Standardprofil |
| `NEXT_PUBLIC_SUPABASE_URL` | optional | Projekt-URL — nur, wenn Anfragen zusätzlich gespeichert werden sollen |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | optional | öffentlicher Schlüssel, durch RLS abgesichert |
| `SUPABASE_SERVICE_ROLE_KEY` | nein | umgeht RLS, ausschließlich serverseitig |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | **für Formulare** | eigenes Postfach bei World4You — der empfohlene Weg |
| `RESEND_API_KEY` | Alternative | nur nötig, wenn kein SMTP-Zugang vorliegt; Domain muss bei Resend verifiziert sein |
| `MAIL_FROM` | **für Formulare** | Absender; bei SMTP dieselbe Adresse wie `SMTP_USER` |
| `MAIL_TO` | **für Formulare** | Empfänger der Anfragen |
| `NEXT_PUBLIC_GA_ID` | für Messung | Google Analytics 4, lädt erst nach Einwilligung |

`.env.local` gehört **nicht** ins Repository. Der Service-Role-Key darf niemals
in eine Client-Komponente gelangen.

---

## Datenbank einrichten (Supabase)

1. Projekt auf [supabase.com](https://supabase.com) anlegen, **Region Frankfurt**.
2. Im SQL-Editor den Inhalt von `supabase/migrations/0001_init.sql` ausführen.
3. Unter *Project Settings → API* die URL und die beiden Schlüssel in
   `.env.local` eintragen.

Die Migration legt vier Tabellen an: `community_signups`,
`cooperation_requests`, `jobs`, `partners`.

**Row Level Security ist der wichtigste Teil der Migration.** Anonyme Besucher
dürfen ausschließlich *einfügen*, niemals lesen. Ohne diese Regel wären
Kooperationsanfragen samt Budget mit dem öffentlich ausgelieferten
anon-Schlüssel für jeden abrufbar. Nach dem Einspielen einmal prüfen:

```sql
select * from public.cooperation_requests;
```

Mit dem anon-Schlüssel muss das **null Zeilen** liefern.

---

## Analytics einrichten

Der Code ruft überall nur `trackEvent(...)` auf. Welcher Dienst tatsächlich
zählt, entscheidet sich allein in `src/lib/analytics/index.ts` — dort werden
Google Analytics, Google Tag Manager, Plausible, Matomo und Umami bereits
erkannt.

Für Google Analytics 4 genügt `NEXT_PUBLIC_GA_ID`. Für einen anderen Dienst
das Script in `src/components/analytics-provider.tsx` austauschen; am
restlichen Code ändert sich nichts.

**Nichts davon lädt vor der Einwilligung.** Ohne ein aktives Ja im
Einwilligungsfenster wird kein Script geladen und kein Ereignis gesendet.

### Gemessene Ereignisse

Alle Namen stehen an genau einer Stelle: `src/lib/analytics/events.ts`.

**Handlungsaufrufe**
`cta_cooperation_click` · `cta_community_click`

**Community-Anmeldung**
`community_form_view` · `community_form_start` · `community_interest_select` ·
`community_form_submit`

`community_interest_select` ist die inhaltlich wertvollste Zahl der Testphase:
Sie sagt, worüber Salzburgsucht künftig berichten soll — und ob „Jobs"
überhaupt jemand ankreuzt.

**Kooperationsanfrage**
`cooperation_form_view` · `cooperation_form_start` ·
`cooperation_step_complete` · `cooperation_budget_select` ·
`cooperation_form_submit`

Das Formular hat fünf Schritte. `cooperation_step_complete` trägt die
Schrittnummer und zeigt damit, an welchem Schritt Unternehmen abbrechen.

**Jobs**
`job_card_view` · `job_sidebar_view` · `job_card_click` · `job_detail_open` ·
`job_detail_close` · `job_view` · `job_click` · `job_apply_click`

**Inhalt und Navigation**
`service_click` · `social_card_click` ·
`instagram_click` · `tiktok_click` · `partner_click` · `navigation_click` ·
`page_view`

Jedes Ereignis trägt zusätzlich die Herkunft der Sitzung (`utm_source`,
`utm_medium`, `utm_campaign`, `traffic_source`), die Seite und — wo sinnvoll —
`job_id`, `job_title`, `company` und `cta_location`.

### UTM-Parameter

Kampagnenlinks funktionieren so:

```
https://salzburgsucht.at/jobs?utm_source=instagram&utm_medium=social&utm_campaign=story_jobs
```

Die Werte werden beim ersten Aufruf in der Sitzung festgehalten und an jedes
spätere Ereignis **und an abgeschickte Formulare** angehängt. Erst dadurch ist
die Kette *Instagram → Website → Job → Bewerbung* auswertbar.

---

## Deployment

Netlify oder eine andere Plattform mit Next.js-Unterstützung. Es werden keine
plattformspezifischen APIs verwendet — ein Wechsel ist ohne Codeänderung
möglich.

1. Repository verbinden, Build-Befehl `npm run build`.
2. Alle Environment Variables im Dashboard hinterlegen.
3. `NEXT_PUBLIC_SITE_URL` auf die echte Domain setzen.

### Vor dem Livegang zwingend

Stand 29.08.2026 — bis auf den letzten Punkt erledigt.

- [x] Impressum vollständig (Medieninhaber Eren Akyazi, Gewerbe, Blattlinie
      nach § 25 MedienG). Vom Betreiber freigegeben.
- [x] Datenschutzerklärung geprüft und freigegeben. Es ist kein Analysedienst
      eingebunden; die Erklärung sagt genau das. Wer `NEXT_PUBLIC_GA_ID`
      setzt, muss sie ergänzen.
- [x] Kartendarstellung geprüft (29.08.2026): berechtigtes Interesse, keine
      Einwilligung nötig.
- [x] AGB freigegeben — 14 Tage netto, Storno 14 Tage vor Drehbeginn,
      Gerichtsstand Salzburg. Änderungen daran sind Vertragsänderungen.
- [x] Echte Logodatei liegt unter `public/brand/salzburgsucht.png`.
- [x] Beispiel-Jobs deaktiviert; zwei echte Inserate mit Firmenlogos stehen
      online. Die Texte sind Entwürfe und gehören von icmedia und BranIT
      gegengelesen.
- [x] Mailversand eingerichtet und getestet (SMTP über das eigene Postfach,
      `node scripts/pruefe-mailversand.mjs`).
- [ ] Nach der DNS-Umstellung das Kooperationsformular auf der echten Domain
      abschicken und im Postfach nachsehen. Es ist der einzige Weg, auf dem
      Anfragen ankommen — ein Fehler dort fällt sonst niemandem auf.

Der Weg auf Vercel steht ausführlich in `DEPLOY.md`.

---

## Inhalte pflegen

### Jobs hinzufügen

Solange keine Datenbank hinterlegt ist: `src/data/jobs.ts`. Diese Einträge
tragen `demo: true` und werden auf der Seite sichtbar als Beispiel
gekennzeichnet.

Mit Datenbank: Zeile in die Tabelle `jobs` einfügen. `src/lib/db/jobs.ts` liest
automatisch von dort, sobald die Verbindung steht. `featured: true` bringt eine
Stelle auf die Startseite (maximal drei).

`application_type` ist `url` oder `email`; das jeweils passende Feld
(`application_url` bzw. `application_email`) muss gefüllt sein — die Datenbank
erzwingt das, damit kein Inserat ohne Bewerbungsweg online geht.

### Social-Media-Links ändern

`NEXT_PUBLIC_INSTAGRAM_URL` und `NEXT_PUBLIC_TIKTOK_URL` in `.env.local`.
Ohne diese Werte greifen die Standardprofile in `src/lib/site.ts`.

### Partner hinzufügen

**Alles über einen Partner steht in `src/data/partners.ts`** — Name, Branche
und Standort in derselben Zeile. Das war einmal auf zwei Dateien verteilt, und
das Ergebnis war vorhersehbar: Die Namensreihe zeigte 24 Betriebe, die Karte
14, und niemand konnte auf einen Blick sagen, welche zehn fehlten. Jetzt ist
`standort: null` eine sichtbare Lücke in der Zeile, in der auch der Name
steht. Karte, Ortsliste, Suche und alle Zähler leiten sich daraus ab — es gibt
keine zweite Stelle, an der ein neuer Partner nachgetragen werden müsste.

Logos erst nach schriftlicher Freigabe: Datei nach `public/partner/` legen und
den Dateinamen bei `logo` eintragen. Fremde Logos aus dem Netz zu verwenden
ist eine Markenrechtsverletzung.

**Standorte werden nie geschätzt.** 19 der 24 Betriebe haben einen belegten
Standort, fünf haben `standort: null`.

Die Namenssuche in OpenStreetMap (`node scripts/partner-suche.mjs`) hat davon
keinen einzigen gefunden — dort stehen sie schlicht nicht. Gefunden wurden
fünf über die eigene Seite des Betriebs beziehungsweise über das
Branchenverzeichnis des Tourismusverbands, und zwar deshalb, weil sie dort
anders heißen als in unserer Liste: „Yazzon" ist **YAZZOON** am
Ursulinenplatz, „Mi & More" die **Mian&More Ramen Bar** in der Getreidegasse,
„Naya" die **NAYA kitchen & bar** in der Hofstallgasse, „Wagendoktor" der
**Wagendoktor e.U.** in Oberalm bei Hallein. Erst die **Adresse** wurde dann
geokodiert, nie der Name — eine Namenssuche liefert „etwas, das ähnlich
heißt", eine Adresssuche liefert die Adresse.

Bei der Raiffeisenbank war es umgekehrt: sechs Bankstellen im Suchraum, von
Seekirchen bis Hallein, und die Partnerliste sagt nicht, welche gemeint ist.
Der Marker sitzt deshalb auf der **Zentrale in der Schwarzstraße**, und der
Zusatz im Detailfenster sagt genau das. Das ist keine geratene Koordinate,
sondern der nachprüfbare Hauptsitz — und er behauptet nicht, die Bankstelle
der Zusammenarbeit zu sein.

Die verbleibenden fünf (Branit, ICmedia, Chef Döner, Producito, Café Eis
Möwen) sind mit Website, Firmenbuch und Kartendiensten nicht auffindbar. Bei
„Chef Döner" gibt es einen Betrieb dieses Namens in Österreich — in
Klagenfurt. Das ist nicht derselbe. Sie stehen in der Ortsliste neben der
Karte, abgesetzt und mit dem Vermerk „ohne hinterlegten Standort": Wer sie
sucht, soll lesen, dass es sie gibt und nur die Adresse fehlt.

Eine geratene Koordinate sieht auf einer Karte genauso aus wie eine richtige.
Wer davorsteht und niemanden vorfindet, glaubt der Seite danach auch sonst
nichts mehr. Wie man einen nachträgt, steht im Kopf von `partners.ts`.

### Die Salzburg-Karte

**Auf der Startseite gibt es genau EINE Karte, und auf ihr liegen ZWEI
Ebenen:** die Verstecke (korallrot) und die Partnerbetriebe (markenblau).
Verstecke und Partner stehen auf derselben Geografie, im selben Ausschnitt,
unter demselben Zoom. Zwei Karten hätten dieselben Daten gezeigt und trotzdem
etwas anderes behauptet: dass das zwei Themen sind. Es ist eines.

Der Abschnitt sitzt an dritter Stelle der Startseite (`#entdecken`) und ist
die einzige dunkle Fläche der oberen Seitenhälfte.

| Datei | Rolle |
| --- | --- |
| `src/components/karte/netz-abschnitt.tsx` | hält den Zustand: Filter, Auswahl, Suche, Stil, Flugziel |
| `src/components/karte/salzburg-karte-gl.tsx` | die Karte: MapLibre, Marker, Gruppen, Merkfenster |
| `src/components/karte/orte-liste.tsx` | die Ortsliste daneben |
| `src/lib/karte-liste.ts` | Suchen und Sortieren — die einzige echte Logik, prüfbar ohne Browser |
| `src/lib/karte-gl.ts` | Ausschnitt, Zoomgrenzen, Markerfarben, Anbieter |
| `src/data/karte/karten-punkte.ts` | führt beide Bestände zu einer Liste zusammen |
| `src/data/karte/stil-*.json` | die beiden Kartenstile |

#### Die Ortsliste ist die Legende

Rechts in derselben Hülle steht eine Liste **aller** 61 Einträge — 37
Verstecke, 24 Partner. Sie ist keine zweite Darstellung, sondern die
Navigation: Was man auf einer Karte nicht findet, weil man nicht weiß, wo man
suchen soll, findet man in einer Liste in zwei Sekunden. Deshalb steht unten
in der Karte nur noch die Farberklärung mit den Zahlen und keine große
Legende mehr.

Karte und Liste sind **ein** Bauteil und teilen sich jeden Zustand:

- Der Filter `[Verstecke] [Partner] [Beide]` gilt für beide.
- Ein Klick in der Liste wählt aus **und** fliegt hin (`flyTo`, 800 ms, nie
  hinauszoomend und mindestens über die Gruppierungsgrenze hinein — sonst
  landet man auf einem Ort, an dem statt des Markers eine Gruppe steht).
- Ein Klick auf einen Marker wählt nur aus und scrollt die Zeile ins Bild.
  Er fliegt bewusst **nicht**: Man sieht den Marker ja schon, und eine Karte,
  die bei jedem Klick losfliegt, verliert man aus den Augen.
- Der Zeiger auf einer Zeile lässt den Marker aufleuchten, der Zeiger auf
  einem Marker die Zeile. Der Marker bewegt sich dabei nie — er bekommt einen
  Schein **darunter**, sonst rutschte er unter dem Zeiger weg.
- Das Suchfeld greift auf Name, Straße, Stadtteil, Branche und Versteck-Nummer,
  und es kommt ohne Umlaute aus: „Backerei" findet die „Salz & Zucker
  Bäckerei". Auf einer Seite, deren Namen zur Hälfte Umlaute enthalten, ist
  das kein Randfall.

Aufteilung auf dem Schreibtisch **73 % Karte, 27 % Liste** — die Liste ist auf
24 rem gedeckelt, damit sie bei sehr breiten Fenstern nicht mitwächst. Die
**Karte bestimmt die Höhe**, nie die Liste: Als gewöhnlicher Flexpartner
zöge die Liste den Kasten auf ihre eigene Länge, und bei 61 Einträgen sind das
drei Meter. Sie liegt deshalb absolut in ihrer Spalte und rollt darin.

Unter 1024 px liegt sie im Schub: Ein Knopf „Orte anzeigen (61)" unten links
schiebt sie über die Karte, ein Klick auf einen Eintrag schließt sie wieder
und die Karte fliegt hin. Nebeneinander wären es auf dem Telefon zwei zu
schmale Spalten — die Karte unbrauchbar, die Liste unlesbar.

#### Was der Zeiger auf einem Marker oder einer Gruppe zeigt

Ein Kreis mit einer 4 darin ist eine Frage ohne Antwort: Man sieht, dass dort
vier Orte liegen, und müsste zweimal hineinzoomen, um zu erfahren, welche.
Deshalb hat die Karte ein **Merkfenster**, und es füllt für Marker und
Gruppen dieselbe Form — Überschrift, darunter Zeilen:

| | Überschrift | Zeilen |
| --- | --- | --- |
| einzelner Marker | der Name | Branche und Straße bzw. „Versteck #12" |
| Gruppe | „4 Partner" | die Namen darin, bis 5, dann „+n weitere" |

Die Namen einer Gruppe holt `getClusterLeaves`. Das ist eine Abfrage mit
Versprechen — bis sie beantwortet ist, kann der Zeiger längst woanders sein,
deshalb merkt sich der Lauf, welche Gruppe er gefragt hat, und verwirft jede
Antwort, die zur falschen gehört. Bewegt sich der Zeiger innerhalb derselben
Gruppe, wird das Fenster nur nachgeführt statt neu abgefragt.

Das Fenster nimmt **keine** Zeigerereignisse an. Täte es das, läge es zwischen
Zeiger und Marker: Der Marker verlöre die Berührung, das Fenster verschwände,
der Marker bekäme sie zurück — und das Ganze flackerte im Bildtakt.

#### Warum Vektorkacheln — und was sie kosten

Hier lag eine selbstgebaute Karte: aus OpenStreetMap geholte Umrisse,
vereinfacht, als acht SVG-Pfade im Projekt. Sie war scharf und kam ohne eine
einzige fremde Anfrage aus. Aber sie hatte eine Grenze, die sich nicht
verschieben ließ: **keine Straßennamen**, nur 30 von Hand gesetzte Ortsnamen,
und beim Hineinzoomen kam nichts dazu, weil es nur einen Detailgrad gab. Eine
Stadtkarte, auf der man keine Straße lesen kann, ist ein Bild von einer Stadt.

Vektorkacheln lösen genau das: Die Beschriftung kommt aus den Daten, wächst
beim Zoomen mit und wird im Browser gezeichnet — also scharf auf jedem
Bildschirm und in jeder Vergrößerung.

**Der Preis ist real und steht im Datenschutztext:** Der Browser des Besuchers
fragt damit einen fremden Server an ([OpenFreeMap](https://openfreemap.org),
kein Schlüssel, kein Kontingent, nach eigener Angabe ohne Protokollierung).
Das ist die einzige Stelle der ganzen Seite, an der das passiert — und sie
lädt erst, wenn jemand bis zu ihr scrollt.

#### Die zwei Stile

```bash
node scripts/karten-stile.mjs
```

Holt die Vorlage, färbt sie um und schreibt `stil-dunkel.json` und
`stil-farbig.json`. Die Stile liegen im Projekt und werden **nicht** zur
Laufzeit verlinkt: Sonst hinge das Aussehen der Karte an einer fremden Datei,
die sich jederzeit ändern kann.

**Beide stammen aus derselben Vorlage** (`bright`, 119 Ebenen). Der fertige
`dark`-Stil des Anbieters hat nur 47 und lässt genau das weg, was man auf
einer Stadtkarte lesen will. Ein Dunkelmodus, der weniger zeigt, ist kein Stil,
sondern ein Verlust — deshalb ist der dunkle hier dieselbe Karte in
Nachtfarben.

Umgefärbt wird nach Ebenengruppen, nicht algorithmisch invertiert (das ergibt
braune Wälder und rosa Wasser). **Die Beschriftungsregeln stehen ganz oben**:
Regeln greifen von oben nach unten, und ein allgemeines Muster wie `/^waterway/`
würde sonst auch `waterway_line_label` treffen und ihm eine Linienfarbe geben,
die eine Schrift nicht kennt.

#### Prüfen

```bash
node scripts/pruefe-karte.mjs
```

Validiert beide Stile mit dem offiziellen Validator, vergleicht ihren
Detailgrad, prüft Straßen- und Ortsnamen samt Texthöfen und ruft
Kachelserver, Schriften und Sinnbilder ab.

```bash
node --experimental-strip-types --import ./scripts/alias.mjs scripts/pruefe-orte.mts
```

Hakt **alle 24 Partner namentlich ab** — steht jeder in der Ortsliste, hat
jeder einen Marker? — und ebenso alle 37 Verstecke, prüft, dass kein
verorteter Eintrag beim Weg in die Kartenquelle verlorengeht, dass keine
Kennung doppelt vorkommt, dass die Suche elf Beispielbegriffe findet und dass
alle Zähler mit der Quelle übereinstimmen.

**Der Anlass ist ein Fehler, der zweimal passiert ist:** Die Partnerreihe
zeigte 24 Betriebe, die Karte 14, und niemand hat es gemerkt, weil beide
Zahlen für sich richtig aussahen. Solche Fehler fallen einem nicht durch
Hinsehen auf — sie fallen einem durch Zählen auf.

**Das ist nötig, weil sich die Karte im Browser schlecht prüfen lässt:**
MapLibre hängt seine gesamte Arbeit — Stil laden, Kacheln anfordern, zeichnen
— an `requestAnimationFrame`. In Umgebungen ohne Bildwiederholung
(eingebettete Vorschaufenster, Kopflos-Browser ohne GPU) passiert deshalb gar
nichts, und zwar fehlerfrei: keine Meldung, keine Anfrage, nur eine leere
Fläche. Wer dort eine leere Karte sieht, sucht den Fehler sonst im eigenen
Code.

#### Marker und Gruppen

Zwei GeoJSON-Quellen, eine je Ebene, beide mit MapLibres eigener Gruppierung.
Getrennt und nicht zusammen: Eine Gruppe aus zwei Verstecken und einem
Partnerbetrieb müsste sich für eine Farbe entscheiden und wäre in jedem Fall
gelogen. So gibt es rote und blaue Gruppen nebeneinander, und beide sagen die
Wahrheit.

Ein Klick auf eine Gruppe fliegt auf die Zoomstufe, ab der sie auseinander
fällt — MapLibre nennt sie selbst (`getClusterExpansionZoom`). „Zwei Stufen
hinein" wäre bei zwei Punkten auf demselben Platz zu wenig und bei zweien am
Stadtrand zu viel.

**Die Kennungen tragen ihre Art vorweg** (`versteck-mirabellplatz`,
`partner-wifi`). *Arbeiterkammer* und *JumpDome* stehen in **beiden**
Beständen — dort wurde etwas versteckt, und mit beiden wurde außerdem
zusammengearbeitet. Ohne Präfix hätten sie dieselbe Kennung.

#### Bedienung

Mausrad zoomt **ohne Zusatztaste**. Das ist eine bewusste Abweichung von der
üblichen Vorsicht bei eingebetteten Karten und vertretbar, weil die Karte
nicht die ganze Seite füllt: Wer daneben scrollt, scrollt die Seite. Drehen
und Kippen sind abgeschaltet — eine gedrehte Stadtkarte hilft niemandem beim
Zurechtfinden und macht jede Beschriftung schwerer lesbar.

`maxBounds` hält den Ausschnitt in der Region. Ohne das landet man mit zwei
Wischbewegungen in der Nordsee und findet nicht zurück.

Der gewählte Stil merkt sich der Browser (`localStorage`). Gelesen wird er
erst nach dem ersten Bild — der Server kennt keinen Speicher, und ein
abweichender Anfangszustand wäre ein Unterschied zwischen dem, was der Server
schickt, und dem, was React erwartet.

#### Koordinaten werden nie geschätzt

Eine geratene Koordinate sieht auf einer Karte genauso aus wie eine richtige —
deshalb hat jeder Ort ein Feld `genauigkeit`, und das Detailfenster nennt es:

| Stufe     | Bedeutung                            | Im Detailfenster        |
| --------- | ------------------------------------ | ----------------------- |
| `punkt`   | Gebäude oder Betrieb, aus OSM belegt | kein Vermerk            |
| `strasse` | richtige Straße, keine Hausnummer    | „die richtige Straße …" |
| `viertel` | Mitte eines Stadtteils               | „Mitte des Stadtteils"  |
| `ort`     | Mitte einer Gemeinde                 | „Mitte der Gemeinde"    |
| `offen`   | nicht belegt                         | **kein Marker**         |

Die Legende nennt die Betriebe ohne Standort trotzdem: „10 ohne hinterlegten
Standort". Sie wegzulassen wäre bequem und unehrlich.

#### Die alte Karte lebt weiter

Auf `/partner` steht die selbstgebaute SVG-Karte mit Liste daneben
(`salzburg-karte.tsx`, `karten-abschnitt.tsx`, `salzburg-geometrie.json`).
Sie ist ein Nachschlagewerk, lädt nichts aus dem Netz und war nicht Teil
dieses Umbaus. **Zwei Kartenimplementierungen sind auf Dauer eine zu viel** —
wenn die große Karte sich bewährt, gehört die Detailseite darauf umgestellt
und der ganze Geometrie-Zweig samt `scripts/karten-geometrie.mjs` entfernt.

### Farben ändern

Zwei Wege:

**Ausprobieren:** Im Entwicklungsmodus unten rechts das *Tweaks-Panel*
öffnen — siehe unten, es kann deutlich mehr als Farben.

**Festschreiben:** `src/app/globals.css`, Block `@theme`.

**Eine Regel gilt dabei immer:** `#80bdff` erreicht auf Weiß nur rund 2:1
Kontrast und ist als Textfarbe unbrauchbar. Es trägt Flächen, Akzente und die
Marke. Text, Links und primäre Schaltflächen tragen `#1e71bf` (5:1), auf
kleinem Text `#0b4f8a` (8,4:1). Auf dunklem Grund kehrt sich das um: Dort
trägt `#80bdff` den Text (6,9:1) und Schaltflächen tragen dunkle Schrift auf
`#80bdff`. Das Tweaks-Panel meldet jede Verletzung dieser Regel sofort.

### Das Tweaks-Panel

Im Entwicklungsmodus unten rechts. **89 Regler in elf Gruppen**, alle live,
alle im Browser gespeichert. Es ist das Werkzeug, mit dem die Seite
eingestellt wird — kein Debug-Fenster.

| Gruppe               | Was darin steckt                                                  |
| -------------------- | ----------------------------------------------------------------- |
| Hero-Licht           | Kern, Mitte, Außenverlauf je Größe/Stärke/Farbe, Nachlauf, Enthüllung |
| Hintergrund & Signal | Punktraster, Liniennetz, Spuren, Beacon, Radarwellen, Aufblitzen   |
| Farben               | die ganze Palette                                                  |
| Typografie           | Grundgröße, Überschriften, Zeilen, Laufweite, Labels               |
| Abstände & Layout    | Inhaltsbreite, Abschnittsabstand, Eckenradius                      |
| Tiefe & Schatten     | Schattenstärke, Weichheit, Milchglas                               |
| Animation            | Tempo, fünf Einzeldauern, Versatz, Beschleunigungskurve            |
| Salzburg-Karte       | Höhe und Markerfarben. Die Kartenfarben stehen in den Stildateien   |
| Karten (hell)        | Die Detailkarte auf /partner: Helligkeit, Marker, Strichstärken     |
| Bauteile             | Knöpfe, Eingabefelder, Pillen                                      |

Drei Reiter: **Werte** (Gruppen mit Suche), **Vorlagen** (ganze Stände unter
einem Namen sichern und zurückholen — gedacht zum Vergleichen zweier
Fassungen), **Austausch** (JSON heraus und herein, dazu ein fertiger
`@theme`-Block für `globals.css`).

Die Lesbarkeitsprüfung nach WCAG AA läuft dabei durchgehend mit und meldet
jede Farbkombination, die unter den Sollwert fällt.

**Zwei Bauarten von Reglern**, und der Unterschied ist wichtig:

- **Werte** ersetzen eine Größe direkt (`--licht-kern: 9rem`).
- **Faktoren** multiplizieren eine bestehende Zahl (`--tempo: 1`,
  `--schatten-kraft: 1`, `--signal-kraft: 1`). Sie ändern ein ganzes System
  auf einmal. Ein Regler je Schatten wäre genauer und in der Praxis
  unbrauchbar — die vier Schatten der Seite tragen zusammen die
  Tiefenstaffelung und zerfallen, sobald man sie einzeln verstellt.

**Geschrieben wird nur, was vom Standard abweicht.** Steht ein Wert auf seinem
Standard, entfernt das Panel ihn wieder von `:root`. Sonst schlüge ein
Inline-Stil jede Medienabfrage im Stylesheet — etwa die größere Inhaltsbreite
ab 1536 px — und die Entwicklungsansicht zeigte etwas anderes als die
ausgelieferte Seite.

**Jeder Regler muss etwas bewegen.** Ein Regler ohne Wirkung ist schlimmer als
keiner: Man dreht daran, sieht nichts und weiß danach nicht, ob das Werkzeug
kaputt ist oder der eigene Blick. Dafür gibt es eine Prüfung:

```bash
node scripts/pruefe-stellschrauben.mjs
```

Sie prüft für jeden Eintrag in `src/components/tweaks/tokens.ts`, ob die
Variable irgendwo verwendet wird — als `var()`, als Tailwind-Utility
(`bg-dark` aus `--color-dark`) oder aus JavaScript gelesen —, und ob ihr
Standardwert mit dem `@theme`-Block übereinstimmt. Endet mit Code 1, wenn
etwas nicht stimmt. **Wer einen Regler ergänzt, ergänzt zuerst die Variable in
`globals.css` und benutzt sie dort.**

### Schriften

Zwei Familien, beide selbst ausgeliefert:

- **Space Grotesk** — nur Überschriften, über die Klasse `.display`
- **Archivo** — Fließtext und alles andere

Größen sind fluide (`clamp`) statt sprunghaft: `.display-xl` für die
Startseiten-Überschrift, `.display-l` für Seitentitel und dunkle Abschnitte,
`.display-m` für Abschnittsüberschriften. Dadurch bleibt die Typografie auf
einem 360-px-Telefon groß, ohne zu brechen.

### Bewegung

Fünf Dauern für die ganze Seite, als Token in `globals.css`. Der Sinn ist
Wiedererkennung: Bringt jede Komponente ihre eigene Zeit mit, wirkt die Seite
wie von fünf Leuten gebaut.

| Token             | Wert  | Wofür                                          |
| ----------------- | ----- | ---------------------------------------------- |
| `--dauer-antippen`| 180ms | Farbe, Rahmen, Zustände an Bedienelementen      |
| `--dauer-zeigen`  | 280ms | Hover an Karten und Knöpfen, Pfeilbewegung      |
| `--dauer-heben`   | 420ms | Karten, Vorschauwechsel, größere Wege           |
| `--dauer-auftritt`| 660ms | Einblendungen beim Scrollen                     |
| `--dauer-signal`  | 900ms | Hintergrundvorgänge des Salzburg-Signals        |
| `--versatz`       | 90ms  | Abstand zwischen benachbarten Einblendungen     |

Der Versatz von 90 ms steckt als `verzug={index * 90}` in jeder gestaffelten
Reihe. Andere Werte bitte nicht einstreuen.

`--dauer-signal` ist absichtlich die längste: Der Hintergrund darf nie so
schnell reagieren wie ein Bedienelement, sonst zieht er den Blick. Was das
Signalsystem sonst noch tut, leitet sich davon ab (`calc(… * 1.4)` für den
ausgesendeten Ring, `* 1.5` für das Echo hinter der Leistungsvorschau).

### Salzburg Signal

Die eigene visuelle Sprache der Marke, gebaut in
`src/components/ui/signal.tsx`. Sie kommt aus dem Namen — suchen, finden,
senden — und besteht aus vier Bausteinen, die sich über die Startseite
verteilen:

| Baustein       | Komponente     | Was es ist                                   |
| -------------- | -------------- | -------------------------------------------- |
| Kontur         | `SignalFeld`   | Höhenlinien und Stadtraster, sehr fein        |
| Radar          | `SignalFeld`   | konzentrische Ringe, das Motiv aus dem Logo   |
| Spur           | `SignalSpur`   | Linie, die sich beim Scrollen selbst zeichnet |
| Beacon / Welle | `SignalPunkt`, `SignalWelle` | Punkt, der einmal sendet       |

Drei Regeln, die wichtiger sind als der Code:

1. **Nicht jeder Abschnitt bekommt etwas.** Der Ablauf-Abschnitt ist bewusst
   leer. Ohne eine Stelle, an der nichts passiert, ist die nächste Stelle, an
   der etwas passiert, keine mehr. Die vollständige Verteilung steht als
   Tabelle im Kopf von `src/app/page.tsx`.
2. **Deckkraft zwischen 0,02 und 0,06** auf hellen Flächen. Wer den
   Hintergrund bewusst wahrnimmt, sieht nicht mehr den Inhalt.
3. **Der Beacon sitzt auf seiner Linie, nicht daneben.** Wo ein Punkt und
   eine Spur zusammengehören, sind Pfadkoordinate und Position dieselbe Zahl —
   siehe die Kommentare an den `SignalSpur`-Aufrufen. Ein Punkt, der neben
   seiner Linie schwebt, ist Dekoration.

Die Spuren zeichnen sich ohne Animationsbibliothek: Der Pfad trägt
`pathLength={1}`, das Stylesheet rechnet `stroke-dashoffset: calc(1 -
var(--sig-fortschritt))`, und die eine Zahl dazwischen kommt aus dem
gemeinsamen Scroll-Takt in `src/lib/parallax.ts` — ein `requestAnimationFrame`
für die ganze Seite.

### Der Salzburgsucht-Puls

Ein Ring, der einmal nach außen läuft und verschwindet (`.puls`). Er kommt auf
der Startseite **genau zweimal** vor: an der Reichweiten-Marke im Hero und an
derselben Marke im Abschluss. Immer an einem runden Element, nie zweimal
nebeneinander.

Das ist keine Stilfrage, sondern der Unterschied zwischen Detail und Muster:
Ein Motiv, das überall auftaucht, wird zur Tapete. Wer eine dritte Stelle
dafür findet, sollte stattdessen eine der zwei aufgeben.

Die zwei Ringe, die beim Erscheinen einmal über die Salzburg-Karte laufen,
sind etwas anderes: Sie gehören der Karte, laufen genau einmal und kommen
nicht wieder. Der Puls an den Versteck-Markern läuft dauerhaft, ist aber so
schwach und so versetzt, dass er nie im Gleichtakt schlägt — eine Karte, auf
der dreißig Punkte gleichzeitig blinken, ist eine Alarmanlage.

Alles Bewegte prüft zusätzlich `prefers-reduced-motion`, und zwar in
JavaScript, nicht nur in CSS: Zähler, Zeitstrahl, Kartenflüge, Kippen der
Medienkarten und das Mauslicht schalten sich dort vollständig ab statt nur
langsamer zu werden.

---

## Projektstruktur

```
src/
  app/              Routen, Layout, Server Actions, robots.ts, sitemap.ts
  components/
    consent/        Einwilligungsfenster
    forms/          Community-Formular, mehrstufiges Kooperationsformular
    home/           Abschnitte der Startseite: Content-Reihe, Leistungsschau,
                    Zeitstrahl, Partnerband, Beitragsattrappen
    jobs/           Job-Deck im Hero, Karte, Drawer, Bewerbungsknopf
    layout/         Header, Footer, Social-Links
    tweaks/         Design-Werkzeug, nur in Entwicklung
    ui/             Button, Formularfelder, Container, Bewegung, Rückmeldungen,
                    Salzburg Signal (signal.tsx), Hintergrundformen (ambient.tsx)
  data/             Seed-Daten: Jobs, Partner, Leistungen, Suchbegriffe
  lib/
    analytics/      trackEvent, Ereigniskatalog, Einwilligung, UTM
    db/             Repository-Schicht — der einzige Ort mit Supabase-Aufrufen
  types/            gemeinsame Datentypen
supabase/migrations/
```

### Wo was liegt, wenn du etwas ändern willst

| Was                                   | Datei                                        |
| ------------------------------------- | -------------------------------------------- |

| Beiträge unter „Gerade in Salzburg"   | `src/data/discovery.ts` → `contentKarten`     |
| Leistungen, Vorschauformat, Farbe     | `src/data/services.ts`                        |
| Branche eines Partners                | `src/data/partners.ts`                        |
| Schritte des Kooperationsformulars    | `src/components/forms/cooperation-form.tsx` → `SCHRITTE` |
| Navigation                            | `src/lib/site.ts` → `navigation`              |
| Verteilung des Salzburg-Signals       | `src/app/page.tsx` (Tabelle im Dateikopf)     |
| Zeichnungen des Signals               | `src/components/ui/signal.tsx`                |
| Die Salzburg-Karte der Startseite     | `src/components/karte/netz-abschnitt.tsx`     |
| Ausschnitt, Zoom, Markerfarben        | `src/lib/karte-gl.ts`                         |
| Partner samt Standort                 | `src/data/partners.ts`                        |
| Beide Ebenen zusammengeführt          | `src/data/karte/karten-punkte.ts`             |
| Verstecke auf der Karte               | `src/data/karte/verstecke.ts`                 |
| Ortsliste neben der Karte             | `src/components/karte/orte-liste.tsx`         |
| Suche und Sortierung der Ortsliste    | `src/lib/karte-liste.ts`                      |
| Ortsnamen auf der Karte               | `src/data/karte/beschriftung.ts`              |
| Startausschnitt, Zoomgrenzen          | `src/lib/karte.ts`                            |
| Regler des Tweaks-Panels              | `src/components/tweaks/tokens.ts`             |

### Sechs Stellen, an denen Vorsicht angebracht ist

**Das Kooperationsformular hält alle Schritte im DOM.** Inaktive Schritte
werden nur ausgeblendet (`display: none`), nicht ausgehängt. Würde ein Schritt
beim Weiterklicken abgebaut, wären seine Werte beim Absenden weg — die Server
Action bekommt ein `FormData` aus genau dem, was im Formular steht. Wer das
auf bedingtes Rendern umstellt, bricht das Formular lautlos.

**Beobachter, die nie auslösen, sind ein realer Fall.** Es gibt Umgebungen —
eingebettete Vorschaufenster zum Beispiel —, in denen ein
`IntersectionObserver` existiert, aber nie meldet. Was daran hängt, steht
dort für immer still. Scroll-Reveal (`src/components/ui/motion.tsx`) und der
Zeitstrahl (`src/components/home/ablauf-zeitstrahl.tsx`) haben deshalb eine
Rettungsleine nach 2,5 Sekunden.

Das verzögerte Laden der Karte (`karte-spaeter.tsx`) hat bewusst **keine**:
Dort wäre die Rettungsleine ein Timer, der die 190-kB-Geometrie auf jedem
Seitenaufruf nachlädt, auch wenn niemand je so weit scrollt.

**`display`-Klassen von außen an `Button`/`ButtonLink` funktionieren nicht.**
Die Grundklasse dieser Komponenten enthält `inline-flex`. Ein `hidden` über
`className` landet damit zusammen mit `inline-flex` im Markup, und welches
gewinnt, entscheidet die Reihenfolge im erzeugten Stylesheet — nicht die im
Attribut. Genau daran hing der Knopf „Kooperation anfragen" sichtbar in der
mobilen Kopfzeile und schob sie über den Bildrand. Wer einen Knopf
breitenabhängig ein- oder ausblenden will, legt einen Wrapper darum
(`<div className="hidden sm:block">`). Dasselbe gilt sinngemäß für
Farbklassen — deshalb hat `ButtonLink` eigene Varianten für dunkle Flächen
statt überschriebener Klassen.

**Hintergrundzeichnungen brauchen `preserveAspectRatio="slice"`, keine
`none`.** Die Konturen und Partnerspuren enthalten Knotenkreise, und `none`
zerrt jeden Kreis zur Ellipse — ausgerechnet beim Radarmotiv der Marke.
`slice` füllt die Fläche genauso vollständig und beschneidet dafür den
Überstand. Beschnitten sieht man nicht, verzerrt schon. Nur `SignalSpur` darf
`none` behalten: Dort gibt es ausschließlich Linien, und die sollen sich über
die Abschnittsbreite strecken.

**Die Karte projiziert an zwei Stellen — und beide müssen gleich rechnen.**
Die Formel steht in `src/lib/karte.ts` und noch einmal in
`scripts/karten-geometrie.mjs`, das die Pfade erzeugt hat. Ändert man sie nur
an einer Stelle, wandern die Marker von den Straßen weg, und zwar so wenig,
dass es zuerst wie ein Zufall aussieht. Zur Kontrolle: Die Staatsbrücke muss
auf der Salzach liegen und der Hauptbahnhof auf der Bahnlinie.

**Beim Ziehen und Zoomen der Karte wird kein React-Zustand angefasst.** Der
Ausschnitt liegt in einem `useRef` und wird direkt aufs DOM geschrieben; läge
er in `useState`, würde bei jeder Mausbewegung die gesamte Karte samt aller
Marker neu gerendert. Damit Marker und Ortsnamen dabei nicht mitwachsen,
bekommt die Bühne die Zoomstufe als CSS-Variable (`--px`), und jedes Element
rechnet in CSS selbst zurück — ein Schreibvorgang je Bild statt siebzig.

Kein Supabase-Aufruf steht in einer Komponente. Der Wechsel von Seed-Daten auf
die Datenbank — und später auf ein CMS — ist eine Änderung an `src/lib/db/`.

---

## Bewusst nicht gebaut

Nutzerkonten, Bewerbungsverwaltung, Firmenprofile, Zahlungsabwicklung,
Admin-Dashboard, Datei-Upload, mehrsprachige Inhalte.

Das sind Bausteine des Jobportals ab 2027. Die Datenstruktur ist so gewählt,
dass sie später darauf aufsetzen kann — gebaut wird sie erst, wenn die Zahlen
aus dieser Phase es rechtfertigen.

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { pruefungen } from "@/components/tweaks/kontrast";
import {
  alsCss,
  gruppen,
  standardWerte,
  tokens,
  type GruppenId,
  type Token,
  type Werte,
} from "@/components/tweaks/tokens";

const SPEICHER = "salzburgsucht:tweaks";
const VORLAGEN = "salzburgsucht:tweaks:vorlagen";

/**
 * Tweaks-Panel — das interne Steuerpult der Seite.
 *
 * Nur in der Entwicklung eingehaengt (siehe tweaks-mount.tsx). Es setzt die
 * CSS-Variablen des Designsystems direkt auf `:root`; alles, was Tailwind aus
 * dem @theme-Block erzeugt, greift auf dieselben Variablen zu. Deshalb wirkt
 * jede Aenderung sofort auf der ganzen Seite, ohne Neubau und ohne Neuladen.
 *
 * ----------------------------------------------------------------------------
 * WARUM DAS PANEL SEINE EIGENEN FARBEN MITBRINGT
 * ----------------------------------------------------------------------------
 * Die Oberflaeche hier verwendet bewusst KEINE der verstellbaren Tokens.
 * Wuerde sie es, veraenderte sich das Werkzeug beim Drehen mit — und man
 * koennte nicht mehr beurteilen, was man gerade sieht. Ein Messgeraet, das
 * sich mit dem Messwert verbiegt, misst nichts.
 *
 * ----------------------------------------------------------------------------
 * DREI ANSICHTEN STATT EINER LANGEN LISTE
 * ----------------------------------------------------------------------------
 * Bei ueber achtzig Reglern ist eine einzige Liste unbenutzbar. Deshalb:
 *
 *   Werte     aufklappbare Gruppen mit Suche. Nur EINE Gruppe ist offen —
 *             das ersetzt das Scrollen durch Zielen.
 *   Vorlagen  ganze Zustaende speichern und zurueckholen. Der eigentliche
 *             Zweck des Panels: zwei Fassungen nebeneinander beurteilen,
 *             statt sich zu erinnern, wo der Regler vorhin stand.
 *   Austausch JSON heraus und wieder herein, dazu fertiges CSS fuer den
 *             Uebertrag ins Stylesheet.
 */

/* -------------------------------------------------------------------------
   Speicher
------------------------------------------------------------------------- */

/**
 * Gespeicherten Stand lesen.
 *
 * Laeuft als Startwert von useState und nicht in einem Effekt: Das Panel wird
 * ausschliesslich im Browser eingehaengt, deshalb ist der Zugriff hier sicher
 * — und die Seite blitzt nicht kurz mit den Standardwerten auf, bevor die
 * eigenen greifen.
 */
function standLesen(): Werte {
  const basis = standardWerte();
  try {
    const roh = window.localStorage.getItem(SPEICHER);
    if (!roh) return basis;
    const gespeichert = JSON.parse(roh);

    // Alter Stand aus der ersten Fassung des Panels: { farben, masse, schrift }.
    // Die Schluessel sind dieselben geblieben, also laesst er sich uebernehmen
    // statt wegzuwerfen — sonst verliert jemand beim Aktualisieren seine
    // halbfertige Einstellung, und das ohne jede Meldung.
    if (gespeichert && typeof gespeichert === "object" && "farben" in gespeichert) {
      return {
        ...basis,
        ...(gespeichert.farben ?? {}),
        ...(gespeichert.masse ?? {}),
        ...(typeof gespeichert.schrift === "number" ? { schrift: gespeichert.schrift } : {}),
      };
    }

    return { ...basis, ...gespeichert };
  } catch {
    // Beschaedigter Eintrag: Standard verwenden statt abstuerzen.
    return basis;
  }
}

function vorlagenLesen(): Record<string, Werte> {
  try {
    return JSON.parse(window.localStorage.getItem(VORLAGEN) ?? "{}");
  } catch {
    return {};
  }
}

/* -------------------------------------------------------------------------
   Panel
------------------------------------------------------------------------- */

type Ansicht = "werte" | "vorlagen" | "austausch";

export function TweaksPanel() {
  const [offen, setOffen] = useState(false);
  const [ansicht, setAnsicht] = useState<Ansicht>("werte");
  const [werte, setWerte] = useState<Werte>(standLesen);
  // Wie der Wertestand als Startwert gelesen, nicht in einem Effekt: Das
  // Panel wird ausschliesslich im Browser eingehaengt, der Zugriff ist hier
  // also sicher.
  const [vorlagen, setVorlagen] = useState<Record<string, Werte>>(vorlagenLesen);
  const [suche, setSuche] = useState("");
  const [offeneGruppe, setOffeneGruppe] = useState<GruppenId | null>("licht");
  const [meldung, setMeldung] = useState<string | null>(null);
  const knopfRef = useRef<HTMLButtonElement>(null);

  /* --- Werte auf das Dokument schreiben -------------------------------- */

  useEffect(() => {
    const wurzel = document.documentElement;

    for (const token of tokens) {
      const wert = werte[token.key];
      // Nur Abweichungen werden geschrieben. Steht ein Wert auf seinem
      // Standard, kommt er weg — damit gilt wieder das Stylesheet samt seiner
      // Medienabfragen, die ein Inline-Stil sonst alle aushebeln wuerde.
      const unveraendert = wert === undefined || wert === token.standard;

      if (token.art === "zahl" && token.amDokument) {
        wurzel.style.fontSize = unveraendert ? "" : `${wert}px`;
        continue;
      }
      if (unveraendert) wurzel.style.removeProperty(token.css);
      else wurzel.style.setProperty(token.css, alsCss(token, wert));
    }

    try {
      // Gespeichert wird ebenfalls nur die Abweichung. Das haelt den Eintrag
      // klein und sorgt dafuer, dass eine spaetere Aenderung eines Standards
      // im Stylesheet auch bei jemandem ankommt, der das Panel benutzt hat.
      const abweichend = Object.fromEntries(
        tokens
          .filter((t) => werte[t.key] !== undefined && werte[t.key] !== t.standard)
          .map((t) => [t.key, werte[t.key]]),
      );
      window.localStorage.setItem(SPEICHER, JSON.stringify(abweichend));
    } catch {
      // Speicher gesperrt — die Sitzung funktioniert trotzdem.
    }
  }, [werte]);

  useEffect(() => {
    if (!offen) return;
    const schliessen = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOffen(false);
        knopfRef.current?.focus();
      }
    };
    window.addEventListener("keydown", schliessen);
    return () => window.removeEventListener("keydown", schliessen);
  }, [offen]);

  const sagen = useCallback((text: string) => {
    setMeldung(text);
    window.setTimeout(() => setMeldung(null), 2400);
  }, []);

  const setzen = useCallback((key: string, wert: string | number) => {
    setWerte((w) => ({ ...w, [key]: wert }));
  }, []);

  /* --- Zuruecksetzen ---------------------------------------------------- */

  const alleZuruecksetzen = useCallback(() => {
    const wurzel = document.documentElement;
    for (const token of tokens) wurzel.style.removeProperty(token.css);
    wurzel.style.removeProperty("font-size");
    window.localStorage.removeItem(SPEICHER);
    setWerte(standardWerte());
    sagen("Alles auf Standard");
  }, [sagen]);

  const gruppeZuruecksetzen = useCallback((id: GruppenId) => {
    setWerte((w) => {
      const neu = { ...w };
      for (const token of tokens) {
        if (token.gruppe === id) neu[token.key] = token.standard;
      }
      return neu;
    });
  }, []);

  /* --- Vorlagen --------------------------------------------------------- */

  const vorlagenSchreiben = useCallback((neu: Record<string, Werte>) => {
    setVorlagen(neu);
    try {
      window.localStorage.setItem(VORLAGEN, JSON.stringify(neu));
    } catch {
      /* Speicher gesperrt. */
    }
  }, []);

  const vorlageSichern = useCallback(() => {
    const name = window.prompt("Name der Vorlage:")?.trim();
    if (!name) return;
    vorlagenSchreiben({ ...vorlagen, [name]: { ...werte } });
    sagen(`„${name}“ gesichert`);
  }, [vorlagen, werte, vorlagenSchreiben, sagen]);

  /* --- Austausch -------------------------------------------------------- */

  const geaendert = useMemo(
    () => tokens.filter((t) => werte[t.key] !== t.standard),
    [werte],
  );

  const alsJson = useCallback(
    () =>
      JSON.stringify(
        Object.fromEntries(geaendert.map((t) => [t.key, werte[t.key]])),
        null,
        2,
      ),
    [geaendert, werte],
  );

  const alsStylesheet = useCallback(() => {
    if (geaendert.length === 0) return "/* Nichts verstellt — nichts zu übertragen. */";
    const zeilen = geaendert
      .filter((t) => !(t.art === "zahl" && t.amDokument))
      .map((t) => `  ${t.css}: ${alsCss(t, werte[t.key])};`);
    const schrift = geaendert.find((t) => t.art === "zahl" && t.amDokument);
    return (
      `/* Aus dem Tweaks-Panel übernommen — in globals.css in den @theme-Block */\n` +
      `@theme {\n${zeilen.join("\n")}\n}\n` +
      (schrift ? `\n/* Grundschriftgröße: ${werte[schrift.key]}px (html { font-size }) */\n` : "")
    );
  }, [geaendert, werte]);

  const kopieren = useCallback(
    async (text: string, was: string) => {
      try {
        await navigator.clipboard.writeText(text);
        sagen(`${was} in der Zwischenablage`);
      } catch {
        window.prompt("Kopieren nicht möglich — hier zum Markieren:", text);
      }
    },
    [sagen],
  );

  const einlesen = useCallback(() => {
    const roh = window.prompt("JSON einfügen:");
    if (!roh) return;
    try {
      const gelesen = JSON.parse(roh);
      if (typeof gelesen !== "object" || gelesen === null) throw new Error("kein Objekt");
      // Nur bekannte Schluessel uebernehmen. Fremde Eintraege landen sonst im
      // Speicher, tun nichts und tauchen bei jedem Export wieder auf.
      const gefiltert = Object.fromEntries(
        Object.entries(gelesen).filter(([k]) => tokens.some((t) => t.key === k)),
      ) as Werte;
      setWerte({ ...standardWerte(), ...gefiltert });
      sagen(`${Object.keys(gefiltert).length} Werte übernommen`);
    } catch {
      sagen("Das war kein gültiges JSON");
    }
  }, [sagen]);

  /* --- Suche ------------------------------------------------------------ */

  const treffer = useMemo(() => {
    const begriff = suche.trim().toLowerCase();
    if (!begriff) return null;
    return tokens.filter(
      (t) =>
        t.label.toLowerCase().includes(begriff) ||
        t.css.toLowerCase().includes(begriff) ||
        (t.hinweis ?? "").toLowerCase().includes(begriff),
    );
  }, [suche]);

  /* --- Lesbarkeit ------------------------------------------------------- */

  const farbWerte = useMemo(
    () =>
      Object.fromEntries(
        tokens.filter((t) => t.art === "farbe").map((t) => [t.key, String(werte[t.key])]),
      ),
    [werte],
  );
  const checks = pruefungen(farbWerte);
  const fehler = checks.filter((c) => !c.bestanden);

  /* --- Darstellung ------------------------------------------------------ */

  const zaehlenIn = (id: GruppenId) =>
    tokens.filter((t) => t.gruppe === id && werte[t.key] !== t.standard).length;

  return (
    <>
      <button
        ref={knopfRef}
        type="button"
        onClick={() => setOffen((o) => !o)}
        aria-expanded={offen}
        style={knopfStil(offen)}
      >
        <span style={{ fontSize: 15 }}>◐</span>
        Tweaks
        {geaendert.length > 0 ? <span style={zahlStil}>{geaendert.length}</span> : null}
        {fehler.length > 0 ? <span style={warnStil}>{fehler.length}</span> : null}
      </button>

      {offen ? (
        <aside aria-label="Design-Einstellungen" style={panelStil}>
          <header style={kopfStil}>
            <div>
              <strong style={{ fontSize: 14 }}>Design-Einstellungen</strong>
              <p style={{ margin: "2px 0 0", fontSize: 11, color: "#8a94a6" }}>
                {geaendert.length === 0
                  ? "Alles auf Standard"
                  : `${geaendert.length} von ${tokens.length} verstellt`}
              </p>
            </div>
            <button type="button" onClick={() => setOffen(false)} style={schliessenStil}>
              ✕
            </button>
          </header>

          <nav style={reiterLeisteStil}>
            {(
              [
                ["werte", "Werte"],
                ["vorlagen", "Vorlagen"],
                ["austausch", "Austausch"],
              ] as Array<[Ansicht, string]>
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setAnsicht(id)}
                style={reiterStil(ansicht === id)}
              >
                {label}
              </button>
            ))}
          </nav>

          <div style={inhaltStil}>
            {ansicht === "werte" ? (
              <>
                <input
                  type="search"
                  value={suche}
                  onChange={(e) => setSuche(e.target.value)}
                  placeholder="Suchen — z. B. Licht, Marker, Schatten"
                  spellCheck={false}
                  style={sucheStil}
                />

                {treffer ? (
                  treffer.length === 0 ? (
                    <p style={leerStil}>Nichts gefunden.</p>
                  ) : (
                    <div style={{ marginTop: 12 }}>
                      <p style={{ margin: "0 0 8px", fontSize: 11, color: "#8a94a6" }}>
                        {treffer.length} Treffer
                      </p>
                      {treffer.map((token) => (
                        <Regler
                          key={token.key}
                          token={token}
                          wert={werte[token.key]}
                          setzen={setzen}
                        />
                      ))}
                    </div>
                  )
                ) : (
                  <div style={{ marginTop: 12 }}>
                    {gruppen.map((gruppe) => {
                      const auf = offeneGruppe === gruppe.id;
                      const anzahl = zaehlenIn(gruppe.id);
                      return (
                        <section key={gruppe.id} style={gruppenStil}>
                          <button
                            type="button"
                            onClick={() => setOffeneGruppe(auf ? null : gruppe.id)}
                            aria-expanded={auf}
                            style={gruppenKopfStil}
                          >
                            <span style={{ color: "#8a94a6", fontSize: 10 }}>{auf ? "▾" : "▸"}</span>
                            <span style={{ flex: 1, textAlign: "left" }}>{gruppe.label}</span>
                            {anzahl > 0 ? <span style={zahlStil}>{anzahl}</span> : null}
                          </button>

                          {auf ? (
                            <div style={{ padding: "4px 2px 10px" }}>
                              <p style={gruppenTextStil}>{gruppe.text}</p>
                              {tokens
                                .filter((t) => t.gruppe === gruppe.id)
                                .map((token) => (
                                  <Regler
                                    key={token.key}
                                    token={token}
                                    wert={werte[token.key]}
                                    setzen={setzen}
                                  />
                                ))}
                              {anzahl > 0 ? (
                                <button
                                  type="button"
                                  onClick={() => gruppeZuruecksetzen(gruppe.id)}
                                  style={kleinStil}
                                >
                                  Diese Gruppe zurücksetzen
                                </button>
                              ) : null}
                            </div>
                          ) : null}
                        </section>
                      );
                    })}

                    {/* Die Kontrastpruefung ist der Grund, warum das Panel
                        rechnet statt nur Farben zu setzen: #80bdff erreicht auf
                        Weiss nur 2:1. Wer an den Farben dreht, soll sofort
                        sehen, wenn eine Kombination unlesbar wird — und nicht
                        erst, wenn sich jemand beschwert. */}
                    <section style={gruppenStil}>
                      <div style={{ ...gruppenKopfStil, cursor: "default" }}>
                        <span style={{ color: fehler.length ? "#ff6b6b" : "#39c07d", fontSize: 10 }}>
                          ●
                        </span>
                        <span style={{ flex: 1, textAlign: "left" }}>
                          Lesbarkeit
                          {fehler.length
                            ? ` · ${fehler.length} Problem${fehler.length > 1 ? "e" : ""}`
                            : " · in Ordnung"}
                        </span>
                      </div>
                      <div style={{ padding: "0 2px 10px" }}>
                        <p style={gruppenTextStil}>
                          Geprüft nach WCAG AA. Unter dem Sollwert wird Text für
                          viele Menschen schwer bis gar nicht lesbar.
                        </p>
                        {checks.map((c) => (
                          <div key={c.label} style={pruefZeileStil}>
                            <span style={{ flex: 1, fontSize: 11.5 }}>{c.label}</span>
                            <span
                              style={{
                                fontVariantNumeric: "tabular-nums",
                                fontSize: 11.5,
                                fontWeight: 600,
                                color: c.bestanden ? "#39c07d" : "#ff6b6b",
                              }}
                            >
                              {c.wert.toFixed(2)}:1
                            </span>
                            <span
                              style={{ width: 40, textAlign: "right", fontSize: 10.5, color: "#8a94a6" }}
                            >
                              ≥ {c.soll}
                            </span>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>
                )}
              </>
            ) : null}

            {ansicht === "vorlagen" ? (
              <div style={{ paddingTop: 4 }}>
                <p style={gruppenTextStil}>
                  Ein ganzer Stand, gespeichert unter einem Namen. Gedacht zum
                  Vergleichen: zwei Fassungen nebeneinander beurteilen, statt
                  sich zu merken, wo der Regler vorhin stand.
                </p>

                <button type="button" onClick={vorlageSichern} style={primaerStil}>
                  Aktuellen Stand sichern
                </button>

                {Object.keys(vorlagen).length === 0 ? (
                  <p style={leerStil}>Noch keine Vorlage gesichert.</p>
                ) : (
                  <ul style={{ listStyle: "none", margin: "14px 0 0", padding: 0 }}>
                    {Object.entries(vorlagen).map(([name, stand]) => {
                      const anzahl = tokens.filter((t) => stand[t.key] !== t.standard).length;
                      return (
                        <li key={name} style={vorlagenZeileStil}>
                          <span style={{ flex: 1, minWidth: 0 }}>
                            <span style={{ display: "block", fontSize: 12.5 }}>{name}</span>
                            <span style={{ fontSize: 10.5, color: "#8a94a6" }}>
                              {anzahl} verstellt
                            </span>
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setWerte({ ...standardWerte(), ...stand });
                              sagen(`„${name}“ geladen`);
                            }}
                            style={kleinKnopfStil}
                          >
                            Laden
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              vorlagenSchreiben(
                                Object.fromEntries(
                                  Object.entries(vorlagen).filter(([n]) => n !== name),
                                ),
                              )
                            }
                            aria-label={`Vorlage ${name} löschen`}
                            style={{ ...kleinKnopfStil, color: "#ff8f8f" }}
                          >
                            ✕
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            ) : null}

            {ansicht === "austausch" ? (
              <div style={{ paddingTop: 4 }}>
                <p style={gruppenTextStil}>
                  Übertragen wird immer nur, was vom Standard abweicht —{" "}
                  {geaendert.length === 0 ? "derzeit nichts" : `derzeit ${geaendert.length} Werte`}.
                </p>

                <button
                  type="button"
                  onClick={() => kopieren(alsJson(), "JSON")}
                  style={primaerStil}
                >
                  JSON kopieren
                </button>
                <button type="button" onClick={einlesen} style={{ ...sekundaerStil, width: "100%", marginTop: 8 }}>
                  JSON einlesen
                </button>
                <button
                  type="button"
                  onClick={() => kopieren(alsStylesheet(), "CSS")}
                  style={{ ...sekundaerStil, width: "100%", marginTop: 8 }}
                >
                  CSS für globals.css kopieren
                </button>

                <pre style={vorschauStil}>{alsJson()}</pre>
              </div>
            ) : null}
          </div>

          <footer style={fussStil}>
            <span style={{ flex: 1, fontSize: 11, color: meldung ? "#8fd3ff" : "#8a94a6" }}>
              {meldung ?? "Wirkt sofort · bleibt im Browser"}
            </span>
            <button
              type="button"
              onClick={alleZuruecksetzen}
              disabled={geaendert.length === 0}
              style={{ ...sekundaerStil, opacity: geaendert.length === 0 ? 0.45 : 1 }}
            >
              Zurücksetzen
            </button>
          </footer>
        </aside>
      ) : null}
    </>
  );
}

/* -------------------------------------------------------------------------
   Ein einzelner Regler
------------------------------------------------------------------------- */

function Regler({
  token,
  wert,
  setzen,
}: {
  token: Token;
  wert: string | number;
  setzen: (key: string, wert: string | number) => void;
}) {
  const veraendert = wert !== token.standard;

  if (token.art === "farbe") {
    return (
      <div style={{ marginBottom: 11 }}>
        <label style={zeileStil}>
          <input
            type="color"
            value={String(wert)}
            onChange={(e) => setzen(token.key, e.target.value)}
            style={farbfeldStil}
          />
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: "block", fontSize: 12.5 }}>
              {token.label}
              {veraendert ? <span style={punktStil} /> : null}
            </span>
            {token.hinweis ? <span style={hinweisStil}>{token.hinweis}</span> : null}
          </span>
          <input
            type="text"
            value={String(wert)}
            onChange={(e) => setzen(token.key, e.target.value)}
            spellCheck={false}
            style={hexStil}
          />
        </label>
      </div>
    );
  }

  if (token.art === "auswahl") {
    return (
      <div style={{ marginBottom: 13 }}>
        <span style={{ display: "block", fontSize: 12.5 }}>
          {token.label}
          {veraendert ? <span style={punktStil} /> : null}
        </span>
        {token.hinweis ? <span style={hinweisStil}>{token.hinweis}</span> : null}
        <select
          value={String(wert)}
          onChange={(e) => setzen(token.key, e.target.value)}
          style={auswahlStil}
        >
          {token.optionen.map((o) => (
            <option key={o.wert} value={o.wert}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 13 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
        <span style={{ fontSize: 12.5 }}>
          {token.label}
          {veraendert ? <span style={punktStil} /> : null}
        </span>
        {/* Zahlenfeld statt reiner Anzeige: Beim Feineinstellen will man
            18 eintippen und nicht dreissigmal am Regler zupfen. */}
        <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
          <input
            type="number"
            value={Number(wert)}
            min={token.min}
            max={token.max}
            step={token.schritt}
            onChange={(e) => {
              const zahl = Number(e.target.value);
              if (Number.isFinite(zahl)) setzen(token.key, zahl);
            }}
            aria-label={token.label}
            style={zahlFeldStil}
          />
          <span style={{ fontSize: 10.5, color: "#8a94a6", width: 16 }}>{token.einheit}</span>
        </span>
      </div>
      {token.hinweis ? <span style={hinweisStil}>{token.hinweis}</span> : null}
      <input
        type="range"
        min={token.min}
        max={token.max}
        step={token.schritt}
        value={Number(wert)}
        onChange={(e) => setzen(token.key, Number(e.target.value))}
        aria-label={`${token.label} — Schieberegler`}
        style={{ width: "100%", marginTop: 5, accentColor: "#5aa9ff" }}
      />
    </div>
  );
}

/* --- Eigenes Styling, bewusst unabhängig vom Designsystem der Seite ------ */

const knopfStil = (offen: boolean): React.CSSProperties => ({
  position: "fixed",
  right: 16,
  bottom: 16,
  zIndex: 2147483000,
  display: "inline-flex",
  alignItems: "center",
  gap: 7,
  padding: "9px 14px",
  borderRadius: 999,
  border: "1px solid #2c3446",
  background: offen ? "#232b3b" : "#161b26",
  color: "#e8ecf4",
  font: "600 12.5px/1 ui-sans-serif, system-ui, sans-serif",
  cursor: "pointer",
  boxShadow: "0 8px 26px -10px rgba(0,0,0,.6)",
});

const zahlStil: React.CSSProperties = {
  display: "inline-grid",
  placeItems: "center",
  minWidth: 17,
  height: 17,
  padding: "0 4px",
  borderRadius: 999,
  background: "#2f6fb5",
  color: "#eaf3ff",
  fontSize: 10.5,
  fontWeight: 700,
};

const warnStil: React.CSSProperties = { ...zahlStil, background: "#ff6b6b", color: "#141414" };

const panelStil: React.CSSProperties = {
  position: "fixed",
  right: 16,
  bottom: 66,
  zIndex: 2147483000,
  display: "flex",
  flexDirection: "column",
  width: 372,
  maxWidth: "calc(100vw - 32px)",
  maxHeight: "min(84vh, 860px)",
  borderRadius: 14,
  border: "1px solid #2c3446",
  background: "#12161f",
  color: "#e8ecf4",
  fontFamily: "ui-sans-serif, system-ui, sans-serif",
  boxShadow: "0 24px 60px -20px rgba(0,0,0,.75)",
  overflow: "hidden",
};

const kopfStil: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 10,
  padding: "13px 14px",
  borderBottom: "1px solid #232b3b",
};

const reiterLeisteStil: React.CSSProperties = {
  display: "flex",
  gap: 2,
  padding: "8px 10px 0",
  borderBottom: "1px solid #232b3b",
};

const reiterStil = (an: boolean): React.CSSProperties => ({
  flex: 1,
  padding: "7px 8px",
  border: 0,
  borderBottom: `2px solid ${an ? "#5aa9ff" : "transparent"}`,
  background: "transparent",
  color: an ? "#e8ecf4" : "#8a94a6",
  font: "600 12px/1 ui-sans-serif, system-ui, sans-serif",
  cursor: "pointer",
});

const schliessenStil: React.CSSProperties = {
  border: 0,
  background: "transparent",
  color: "#8a94a6",
  cursor: "pointer",
  fontSize: 14,
  lineHeight: 1,
  padding: 4,
};

const inhaltStil: React.CSSProperties = {
  overflowY: "auto",
  padding: "12px 14px 14px",
};

const sucheStil: React.CSSProperties = {
  width: "100%",
  padding: "7px 9px",
  border: "1px solid #2c3446",
  borderRadius: 8,
  background: "#0c1017",
  color: "#e8ecf4",
  font: "400 12px/1.3 ui-sans-serif, system-ui, sans-serif",
};

const gruppenStil: React.CSSProperties = {
  borderTop: "1px solid #1c222e",
};

const gruppenKopfStil: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  width: "100%",
  padding: "10px 2px",
  border: 0,
  background: "transparent",
  color: "#e8ecf4",
  font: "600 12px/1 ui-sans-serif, system-ui, sans-serif",
  cursor: "pointer",
};

const gruppenTextStil: React.CSSProperties = {
  margin: "0 0 12px",
  fontSize: 11,
  lineHeight: 1.5,
  color: "#8a94a6",
};

const zeileStil: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 9,
  cursor: "pointer",
};

const farbfeldStil: React.CSSProperties = {
  width: 28,
  height: 28,
  padding: 0,
  border: "1px solid #2c3446",
  borderRadius: 7,
  background: "transparent",
  cursor: "pointer",
  flexShrink: 0,
};

const hexStil: React.CSSProperties = {
  width: 70,
  padding: "4px 6px",
  border: "1px solid #2c3446",
  borderRadius: 6,
  background: "#0c1017",
  color: "#e8ecf4",
  font: "500 11px/1.2 ui-monospace, SFMono-Regular, monospace",
};

const zahlFeldStil: React.CSSProperties = {
  width: 56,
  padding: "3px 5px",
  border: "1px solid #2c3446",
  borderRadius: 6,
  background: "#0c1017",
  color: "#e8ecf4",
  font: "500 11px/1.2 ui-monospace, SFMono-Regular, monospace",
  textAlign: "right",
};

const auswahlStil: React.CSSProperties = {
  width: "100%",
  marginTop: 5,
  padding: "6px 7px",
  border: "1px solid #2c3446",
  borderRadius: 6,
  background: "#0c1017",
  color: "#e8ecf4",
  font: "500 11.5px/1.2 ui-sans-serif, system-ui, sans-serif",
};

const hinweisStil: React.CSSProperties = {
  display: "block",
  marginTop: 1,
  fontSize: 10.5,
  lineHeight: 1.45,
  color: "#8a94a6",
};

/** Zeigt an, dass dieser Wert nicht mehr auf Standard steht. */
const punktStil: React.CSSProperties = {
  display: "inline-block",
  width: 5,
  height: 5,
  marginLeft: 6,
  marginBottom: 1,
  borderRadius: 999,
  background: "#5aa9ff",
  verticalAlign: "middle",
};

const pruefZeileStil: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "4px 0",
  borderBottom: "1px solid #1c222e",
};

const vorlagenZeileStil: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "7px 0",
  borderTop: "1px solid #1c222e",
};

const vorschauStil: React.CSSProperties = {
  margin: "14px 0 0",
  padding: 10,
  maxHeight: 220,
  overflow: "auto",
  borderRadius: 8,
  background: "#0c1017",
  border: "1px solid #1c222e",
  color: "#9fb4cc",
  font: "400 10.5px/1.5 ui-monospace, SFMono-Regular, monospace",
  whiteSpace: "pre-wrap",
};

const leerStil: React.CSSProperties = {
  margin: "14px 0 0",
  fontSize: 11.5,
  color: "#8a94a6",
};

const fussStil: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "10px 14px",
  borderTop: "1px solid #232b3b",
  background: "#0e121a",
};

const primaerStil: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  borderRadius: 8,
  border: 0,
  background: "#5aa9ff",
  color: "#08121f",
  font: "600 12.5px/1 ui-sans-serif, system-ui, sans-serif",
  cursor: "pointer",
};

const sekundaerStil: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid #2c3446",
  background: "transparent",
  color: "#c3cbd9",
  font: "600 12px/1 ui-sans-serif, system-ui, sans-serif",
  cursor: "pointer",
};

const kleinKnopfStil: React.CSSProperties = {
  padding: "5px 9px",
  borderRadius: 6,
  border: "1px solid #2c3446",
  background: "transparent",
  color: "#c3cbd9",
  font: "600 11px/1 ui-sans-serif, system-ui, sans-serif",
  cursor: "pointer",
};

const kleinStil: React.CSSProperties = {
  ...kleinKnopfStil,
  marginTop: 4,
  color: "#8a94a6",
};

# Deployment

Stand 29.08.2026. Repository: `emremeral2003-ship-it/SalzburgSucht-Website`,
Zweig `main`. Ziel: Vercel, Domain und Postfach bleiben bei World4You.

## Was diese Seite braucht — und was nicht

- **Keine Datenbank.** Es gibt nichts zu speichern. Die Kooperationsanfrage
  geht per E-Mail an `office@salzburgsucht.at`, sonst nimmt die Seite keine
  Daten entgegen. Das Ratenlimit des Formulars läuft im Arbeitsspeicher.
- **Aber einen Node.js-Server.** Es ist eine Next.js-16-Anwendung mit
  Serverteilen: der Formular-Endpunkt, die Bildoptimierung (`/_next/image`),
  Sitemap und robots.txt. Ein reiner Datei-Webspace kann das nicht ausführen.
- **Kein Analysedienst.** `NEXT_PUBLIC_GA_ID` bleibt leer; die
  Datenschutzerklärung sagt genau das aus. Wer das ändert, muss sie ergänzen.

---

## 1. Vercel-Projekt anlegen

1. Auf vercel.com mit dem GitHub-Konto anmelden, dem
   `emremeral2003-ship-it/SalzburgSucht-Website` gehört.
2. „Add New… → Project", das Repository auswählen. Framework (Next.js),
   Build-Befehl und Ausgabeverzeichnis erkennt Vercel selbst — nichts ändern.
3. **Vor dem ersten Deploy** die Umgebungsvariablen setzen (Schritt 2).
   Sonst läuft der Build zwar durch, aber das Formular nimmt nichts an.

## 2. Umgebungsvariablen

Unter Settings → Environment Variables, jeweils für **Production** und
**Preview**. Vorlage: `.env.example`. Lokal: `.env.local` (wird nicht
mitgeliefert).

| Variable | Pflicht | Wert |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | ja | `https://salzburgsucht.at` — **ohne Schrägstrich am Ende** |
| `SMTP_HOST` | ja | `smtp.world4you.com` |
| `SMTP_PORT` | ja | `587` |
| `SMTP_USER` | ja | `office@salzburgsucht.at` |
| `SMTP_PASS` | ja | Passwort des Postfachs — **der einzige geheime Wert** |
| `MAIL_FROM` | ja | `Salzburgsucht <office@salzburgsucht.at>` — muss dieselbe Adresse sein wie `SMTP_USER` |
| `MAIL_TO` | ja | `office@salzburgsucht.at` |
| `NEXT_PUBLIC_INSTAGRAM_URL` | nein | überschreibt das Standardprofil |
| `NEXT_PUBLIC_TIKTOK_URL` | nein | überschreibt das Standardprofil |
| `RESEND_API_KEY` | nein | nur falls kein SMTP-Zugang; liegt `SMTP_HOST` vor, gewinnt SMTP |
| `NEXT_PUBLIC_SUPABASE_*` | nein | derzeit ungenutzt, siehe oben |
| `NEXT_PUBLIC_GA_ID` | nein | leer lassen, solange keine Messung gewollt ist |

**`NEXT_PUBLIC_SITE_URL` nicht vergessen.** Aus ihr entstehen die
Canonical-URLs, die Sitemap und die Adresse des Vorschaubilds beim Teilen.
Bleibt sie auf `localhost`, zeigen alle drei ins Leere — sichtbar wird das
erst, wenn jemand einen Link teilt.

## 3. DNS bei World4You

⚠️ **Die MX-Einträge und alles, was zum Postfach gehört, bleiben unangetastet.**
Wandern sie mit, steht die E-Mail still — und mit ihr das Kontaktformular,
das genau über dieses Postfach läuft.

Zu ändern sind nur die Einträge, die auf den Webserver zeigen:

1. In Vercel unter Settings → Domains `salzburgsucht.at` und
   `www.salzburgsucht.at` hinzufügen. Vercel nennt dort die Zielwerte.
2. Bei World4You im DNS-Bereich den `A`-Eintrag der nackten Domain und den
   `CNAME` für `www` auf diese Werte setzen.
3. Unverändert lassen: `MX`, `mail`, `autodiscover`, `autoconfig`, SPF, DKIM,
   DMARC.
4. `www` in Vercel als Weiterleitung auf die nackte Domain einstellen, damit
   die Seite nicht unter zwei Adressen erreichbar ist.

Die Umstellung braucht je nach TTL bis zu ein paar Stunden. Das Zertifikat
stellt Vercel danach selbst aus.

## 4. Nach dem Deploy prüfen

- [ ] Startseite lädt, Karte zeichnet, Bilder erscheinen
- [ ] **Kooperationsformular abschicken** und nachsehen, ob die Mail im
      Postfach liegt — auch im Spam-Ordner. Das ist der einzige Weg, auf dem
      Anfragen ankommen; ein Fehler hier fällt sonst niemandem auf.
- [ ] `https://salzburgsucht.at/sitemap.xml` zeigt die echte Domain, nicht
      `localhost`
- [ ] Einen Link in WhatsApp einfügen: Vorschaubild und Titel müssen erscheinen
- [ ] Impressum und Datenschutz sind erreichbar
- [ ] `http` leitet auf `https` um

Lokal lässt sich der Mailversand jederzeit gegenprüfen:

```bash
node scripts/pruefe-mailversand.mjs --senden
```

## 5. Inhaltlich noch offen

Kein Blocker, aber vor dem Bekanntmachen erledigen:

- Ausschreibungstexte der beiden Stellen von icmedia und BranIT gegenlesen
  lassen — die Fassungen in `src/data/jobs.ts` sind Entwürfe.
- Naya-Aktion am 2. Oktober: danach die Karte in `src/data/discovery.ts`
  anpassen oder ersetzen, sonst kündigt sie ein vergangenes Event an.
- Gewerbewortlaut im Impressum mit dem Gewerbeschein abgleichen — er muss
  wörtlich übereinstimmen.
- Partnernamen in `src/data/partners.ts` gegenlesen; sie stammen aus dem
  CRM-Export und tragen dessen Schreibweisen.

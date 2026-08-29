/**
 * Der vollstaendige Katalog gemessener Ereignisse.
 *
 * Warum eine einzige Datei: Ein Tippfehler in einem Ereignisnamen faellt
 * nirgends auf. Er erzeugt lautlos ein zweites Ereignis, und die Auswertung
 * zaehlt dann zwei halbe Zahlen statt einer richtigen. Hier steht jeder Name
 * genau einmal, und der Typ erzwingt seine Verwendung.
 *
 * Links steht der Schluessel fuer den Code, rechts der Name, der beim
 * Analytics-Dienst ankommt. Die rechte Seite folgt der Vorgabe des
 * Auftraggebers und wird nicht "aufgeraeumt" — an ihr haengen spaeter
 * Berichte und Zielvorhaben.
 */
export const ANALYTICS_EVENTS = {
  pageView: "page_view",

  /* --- Die beiden Haupt-Handlungsaufrufe --------------------------------- */
  companyCtaClick: "cta_cooperation_click",
  communityCtaClick: "cta_community_click",

  /* --- Community-Anmeldung ------------------------------------------------
     Sehen, Beginnen und Absenden getrennt zu zaehlen ist der einzige Weg, um
     spaeter zu erkennen, ob ein Formular ignoriert oder abgebrochen wird.
     Das sind zwei voellig verschiedene Probleme mit zwei verschiedenen
     Loesungen. */
  communityFormView: "community_form_view",
  communityFormStart: "community_form_start",
  communityInterestSelect: "community_interest_select",
  communitySignup: "community_form_submit",

  /* --- Kooperationsanfrage ---------------------------------------------- */
  cooperationFormView: "cooperation_form_view",
  cooperationFormStart: "cooperation_form_start",
  cooperationStepComplete: "cooperation_step_complete",
  cooperationBudgetSelect: "cooperation_budget_select",
  cooperationSubmit: "cooperation_form_submit",

  /* --- Jobs ---------------------------------------------------------------
     Jobs sind ein Nebenfeature — gerade deshalb muss die Kette lueckenlos
     messbar sein: Wird das Fenster ueberhaupt gesehen, wird ein Job
     geoeffnet, und fuehrt das zu einer Bewerbung? Ohne `job_card_view` waere
     spaeter nicht unterscheidbar, ob niemand klickt, weil Jobs niemanden
     interessieren — oder weil sie niemand zu Gesicht bekommt. */
  jobCardView: "job_card_view",
  jobSidebarView: "job_sidebar_view",
  jobCardClick: "job_card_click",
  jobDetailOpen: "job_detail_open",
  jobDetailClose: "job_detail_close",
  jobView: "job_view",
  jobClick: "job_click",
  jobApplyClick: "job_apply_click",

  /* --- Inhalt und Navigation -------------------------------------------- */
  serviceClick: "service_click",
  socialCardClick: "social_card_click",
  instagramClick: "instagram_click",
  tiktokClick: "tiktok_click",
  partnerClick: "partner_click",
  navigationClick: "navigation_click",
} as const;

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

/**
 * Zusatzdaten eines Ereignisses.
 *
 * `cta_location` ist der Grund, warum dieselbe Schaltflaeche an fuenf Stellen
 * stehen darf und trotzdem auswertbar bleibt: Erst damit ist beantwortbar,
 * welcher Einstieg tatsaechlich funktioniert.
 */
export type EventProperties = {
  job_id?: string;
  job_title?: string;
  company?: string;
  page?: string;
  cta_location?: string;
  traffic_source?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  [key: string]: string | number | boolean | undefined;
};

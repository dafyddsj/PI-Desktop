import type { ChangelogEntry } from "./changelog.js";

export const frEntries: ChangelogEntry[] = [
  {
    "version": "0.1.0",
    "highlights": [
      "Première version d'EXplore Agent, basée sur PI-Desktop.",
      "Les réglages de l'agent, les connexions, les prompts et les instructions sont stockés dans ~/.explore/agent et dans le dossier .explore de chaque projet, séparément de toute installation de pi CLI.",
      "Les données de l'app (sessions, journaux, clés des fournisseurs) sont stockées dans ~/.explore/app.",
    ],
  },
];

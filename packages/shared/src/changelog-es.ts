import type { ChangelogEntry } from "./changelog.js";

export const esEntries: ChangelogEntry[] = [
  {
    "version": "0.1.0",
    "highlights": [
      "Primera versión de EXplore Agent, basada en PI-Desktop.",
      "La configuración del agente, los inicios de sesión, los prompts y las instrucciones se guardan en ~/.explore/agent y en la carpeta .explore de cada proyecto, separados de cualquier instalación de pi CLI.",
      "Los datos de la app (sesiones, registros, claves de proveedores) se guardan en ~/.explore/app.",
    ],
  },
];

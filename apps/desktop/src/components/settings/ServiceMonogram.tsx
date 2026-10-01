/**
 * The tile that leads an AI service (D625): the vendor's mark when one ships,
 * otherwise the first letter of its name.
 *
 * Marks are single-colour and drawn as a mask over `currentColor`, so every
 * service keeps the same quiet raised tone in both themes and a row is still
 * told apart by its name. A name without a letter or digit and no mark gets
 * the generic server glyph instead.
 */
import { IconServer } from "../icons";
import { monogramLetter } from "./service-row-status";

const LOGO_URLS: Record<string, string> = Object.fromEntries(
  Object.entries(
    import.meta.glob<string>("../../assets/service-logos/*.svg", {
      eager: true,
      query: "?url",
      import: "default",
    }),
  ).map(([path, url]) => [path.slice(path.lastIndexOf("/") + 1, -".svg".length), url]),
);

export function ServiceMonogram({ name, logo }: { name: string; logo?: string }) {
  const url = logo ? LOGO_URLS[logo] : undefined;
  if (url) {
    return (
      <span className="service-monogram has-logo" aria-hidden>
        <span className="service-logo" style={{ maskImage: `url("${url}")` }} />
      </span>
    );
  }
  const letter = monogramLetter(name);
  return (
    <span className="service-monogram" aria-hidden>
      {letter || <IconServer size={14} />}
    </span>
  );
}

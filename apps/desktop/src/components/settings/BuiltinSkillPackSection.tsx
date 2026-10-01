import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { SkillPackState } from "@pi-desktop/shared";
import { api } from "../../lib/api";
import { skillPackVersionLabel } from "../../lib/skill-pack-version";
import { useSkillPackState } from "../../hooks/use-skill-pack-state";
import { useAppStore } from "../../stores/app-store";
import {
  CapabilityButton,
  CapabilityEmpty,
  CapabilityGroupHeader,
  CapabilityRow,
  CapabilityToggle,
  matchesCapabilitySearch,
} from "./AgentCapabilityLayout";
import { IconBookOpen, IconDownload } from "../icons";

function formatDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleDateString();
}

/**
 * The built-in EXplore skill pack on the skills page: what version sessions
 * use, whether a newer one is offered, and the beta channel switch. Updates are
 * only ever installed from here.
 */
export function BuiltinSkillPackSection({ search }: { search: string }) {
  const { t } = useTranslation();
  const showToast = useAppStore((state) => state.showToast);
  // Every action ends with main pushing the new state, so the live view is the
  // only copy this section keeps.
  const state = useSkillPackState();
  const [pending, setPending] = useState(false);

  if (!state) return null;

  const run = async (action: () => Promise<SkillPackState>) => {
    if (pending) return;
    setPending(true);
    try {
      await action();
    } catch (error) {
      showToast(error instanceof Error ? error.message : String(error), { variant: "error" });
    } finally {
      setPending(false);
    }
  };

  const busy = pending || state.status === "checking" || state.status === "installing";
  const skills = state.skills.filter((skill) =>
    matchesCapabilitySearch(search, skill.name, skill.id, skill.description),
  );
  if (search.trim() && skills.length === 0) return null;

  const statusText =
    state.status === "checking"
      ? t("settings.skillPack.checking")
      : state.status === "installing"
        ? t("settings.skillPack.installing")
        : state.error === "no-release"
          ? t("settings.skillPack.errorNoRelease")
          : state.error === "unreachable"
            ? t("settings.skillPack.errorUnreachable")
            : state.error === "invalid"
              ? t("settings.skillPack.errorInvalid")
              : state.available
                ? t("settings.skillPack.available", {
                    version: skillPackVersionLabel(state.available),
                  })
                : state.lastCheckedAt
                  ? t("settings.skillPack.upToDate")
                  : null;

  return (
    <>
      <CapabilityGroupHeader
        label={t("settings.skillPack.group")}
        path={state.repoUrl.replace(/^https:\/\/github\.com\//, "")}
        count={skills.length}
        action={
          <CapabilityButton busy={busy} onClick={() => void run(api.skillPackCheck)}>
            {t("settings.skillPack.check")}
          </CapabilityButton>
        }
      />
      <div className="skill-pack-status" aria-live="polite">
        <div className="skill-pack-status-line">
          <strong>{t("settings.skillPack.name")}</strong>
          {state.active ? (
            <span>
              {skillPackVersionLabel(state.active)} · {formatDate(state.active.committedAt)} ·{" "}
              {state.active.origin === "bundled"
                ? t("settings.skillPack.sourceBundled")
                : t("settings.skillPack.sourceDownloaded")}
            </span>
          ) : null}
          <span className="agent-capability-badge is-level">
            {state.channel === "beta"
              ? t("settings.skillPack.channelBeta")
              : t("settings.skillPack.channelStable")}
          </span>
        </div>
        {statusText ? <div className="skill-pack-status-message">{statusText}</div> : null}
        <div className="skill-pack-status-actions">
          {state.available ? (
            <CapabilityButton
              variant="primary"
              busy={busy}
              onClick={() => void run(api.skillPackInstall)}
            >
              <IconDownload size={14} />
              {t("settings.skillPack.install")}
            </CapabilityButton>
          ) : null}
          {state.active?.origin === "downloaded" ? (
            <CapabilityButton busy={busy} onClick={() => void run(api.skillPackRevert)}>
              {t("settings.skillPack.revert")}
            </CapabilityButton>
          ) : null}
          <div className="skill-pack-beta">
            <CapabilityToggle
              checked={state.devBuild || state.betaOptIn}
              disabled={state.devBuild}
              busy={pending}
              label={t("settings.skillPack.beta")}
              onChange={() => void run(() => api.skillPackSetBeta(!state.betaOptIn))}
            />
            <span>
              {t("settings.skillPack.beta")}
              <small>
                {state.devBuild
                  ? t("settings.skillPack.betaDevHint")
                  : t("settings.skillPack.betaHint")}
              </small>
            </span>
          </div>
        </div>
      </div>
      {skills.length === 0 ? (
        <CapabilityEmpty message={t("settings.skillPack.empty")} icon={<IconBookOpen size={18} />} />
      ) : (
        skills.map((skill) => (
          <CapabilityRow
            key={skill.id}
            glyph={<IconBookOpen size={16} />}
            name={skill.name}
            command={skill.id}
            badges={<span className="agent-capability-badge">{t("settings.skillPack.badge")}</span>}
            description={skill.description || t("settings.noCapabilityDescription")}
            actions={null}
          />
        ))
      )}
    </>
  );
}

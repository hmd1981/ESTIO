"use client";

import type { ReactNode } from "react";
import {
  ENTERPRISE_PROOF_KEYS,
  type EnterpriseProofSectionKey,
} from "@/lib/enterprise-cms-keys";

type Draft = Record<string, unknown>;

type CmsVisualDraft = {
  imageUrl?: string;
  imageAlt?: string;
  imageMediaAssetId?: string;
  assetRole?: string;
  assetPurpose?: string;
  assetPriority?: string;
};

export type EnterpriseStructuredMediaTarget =
  | { kind: "proofEngineItem"; index: number }
  | { kind: "caseStudyItem"; index: number }
  | { kind: "practiceBlock"; index: number };

const EVIDENCE = [
  "case",
  "internal",
  "simulation",
  "reference_architecture",
] as const;
const VERIFICATION = [
  "internal",
  "observed",
  "repeatable",
  "contractual",
] as const;
const DIAGRAM_TYPES = ["architecture", "flow", "integration"] as const;
const INTENTS = ["ENTERPRISE_AI", "AUTOMATION", "PLATFORM_BUILD"] as const;
const ASSET_ROLES = [
  "hero",
  "diagram",
  "case",
  "roi",
  "ui",
  "decorative",
] as const;
const ASSET_PURPOSE = ["conversion", "trust", "explanation"] as const;
const ASSET_PRIORITY = ["critical", "supporting", "optional"] as const;

const ENTERPRISE_JSON_PLACEHOLDER = `{
  "enterpriseCaseStudies": {
    "title": "How this works in practice",
    "lead": "This is not about adding tools. It is about changing how the organisation operates after implementation.",
    "items": [
      {
        "title": "Private AI systems",
        "body": "Internal AI systems built around your organisation's approved knowledge, workflows, and controls - designed for practical use rather than public experimentation.",
        "imageUrl": "/enterprise/private-ai-dashboard.svg",
        "imageAlt": "Private AI dashboard"
      },
      {
        "title": "Workflow automation",
        "body": "Structured automation across approvals, handoffs, and recurring processes so teams move faster with fewer manual steps and less friction.",
        "imageUrl": "/enterprise/workflow-approval-flow.svg",
        "imageAlt": "Workflow approval flow"
      },
      {
        "title": "Internal dashboards & tools",
        "body": "Custom internal systems that bring together data, teams, and operational visibility into one controlled environment.",
        "imageUrl": "/enterprise/operations-control-panel.svg",
        "imageAlt": "Operations control panel"
      }
    ]
  },
  "enterpriseDiagrams": {
    "title": "What changes after implementation",
    "lead": "The goal is not just to introduce AI. The goal is to build a working layer of control, coordination, and execution across the organisation.",
    "items": [
      {
        "title": "Less manual coordination",
        "body": "Teams spend less time moving information between tools, following up manually, or patching disconnected workflows."
      },
      {
        "title": "Faster execution",
        "body": "Processes become easier to run, easier to repeat, and easier to monitor across departments or functions."
      },
      {
        "title": "Clearer control",
        "body": "Internal systems, data handling, and AI usage sit inside a more structured operating model with defined logic and ownership."
      }
    ]
  },
  "enterpriseRoi": {
    "title": "Where enterprise value comes from",
    "lead": "Enterprise impact is usually created through operating clarity, speed, and reduced friction - not through AI theatre.",
    "items": [
      {
        "metric": "Execution speed",
        "value": "Higher",
        "body": "Teams move from fragmented tool usage to more consistent workflows with fewer manual delays."
      },
      {
        "metric": "Operational friction",
        "value": "Lower",
        "body": "Repeated coordination, duplicated effort, and disconnected steps are reduced through automation and system design."
      },
      {
        "metric": "Internal capability",
        "value": "Stronger",
        "body": "The organisation gains reusable systems, better visibility, and a more governable base for future scale."
      }
    ]
  },
  "enterpriseDealEntry": {
    "title": "Start an enterprise conversation",
    "body": "If you are exploring private AI, workflow automation, or internal systems, we can define where the real opportunity sits and what implementation should look like.",
    "primaryCta": {
      "label": "Start a conversation",
      "href": "/contact"
    },
    "secondaryCta": {
      "label": "View enterprise scope",
      "href": "/enterprise"
    }
  }
}`;

function Hint({ children }: { children: ReactNode }) {
  return (
    <p className="mt-1 rounded-md border border-dashed border-[var(--admin-border)] bg-[var(--admin-surface-muted)] px-2 py-1.5 text-[10px] leading-snug text-[var(--admin-muted)]">
      {children}
    </p>
  );
}

function getObj(d: Draft, key: string): Record<string, unknown> {
  const v = d[key];
  if (v && typeof v === "object" && !Array.isArray(v)) return v as Record<string, unknown>;
  return {};
}

function setObj(
  setDraft: React.Dispatch<React.SetStateAction<Draft>>,
  key: string,
  next: Record<string, unknown>,
) {
  setDraft((d) => ({ ...d, [key]: next }));
}

function visualRow(
  v: CmsVisualDraft | undefined,
  onChange: (next: CmsVisualDraft) => void,
  onPick: () => void,
) {
  const vv = v ?? {};
  return (
    <div className="mt-2 space-y-2 rounded-md border border-[var(--admin-border)] bg-[var(--admin-surface)] p-2">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded border border-[var(--admin-border)] bg-[var(--admin-row-header)] px-2 py-1 text-[10px] font-medium"
          onClick={onPick}
        >
          Pick from library
        </button>
      </div>
      <input
        className="w-full rounded border border-[var(--admin-border)] px-2 py-1 text-xs"
        placeholder="Image URL"
        value={vv.imageUrl ?? ""}
        onChange={(e) => onChange({ ...vv, imageUrl: e.target.value })}
      />
      <input
        className="w-full rounded border border-[var(--admin-border)] px-2 py-1 text-xs"
        placeholder="Alt (this page language)"
        value={vv.imageAlt ?? ""}
        onChange={(e) => onChange({ ...vv, imageAlt: e.target.value })}
      />
      <p className="text-[9px] font-mono text-[var(--admin-muted)]">
        mediaAssetId: {vv.imageMediaAssetId || "—"}
      </p>
      <div className="grid gap-2 sm:grid-cols-3">
        <label className="block text-[10px] text-[var(--admin-muted)]">
          assetRole
          <select
            className="mt-0.5 w-full rounded border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-1 py-1 text-xs"
            value={vv.assetRole ?? ""}
            onChange={(e) =>
              onChange({ ...vv, assetRole: e.target.value || undefined })
            }
          >
            <option value="">—</option>
            {ASSET_ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-[10px] text-[var(--admin-muted)]">
          assetPurpose
          <select
            className="mt-0.5 w-full rounded border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-1 py-1 text-xs"
            value={vv.assetPurpose ?? ""}
            onChange={(e) =>
              onChange({ ...vv, assetPurpose: e.target.value || undefined })
            }
          >
            <option value="">—</option>
            {ASSET_PURPOSE.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-[10px] text-[var(--admin-muted)]">
          assetPriority
          <select
            className="mt-0.5 w-full rounded border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-1 py-1 text-xs"
            value={vv.assetPriority ?? ""}
            onChange={(e) =>
              onChange({ ...vv, assetPriority: e.target.value || undefined })
            }
          >
            <option value="">—</option>
            {ASSET_PRIORITY.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}

/** Merge media picker result into enterprise draft (immutable). */
export function applyEnterpriseStructuredMedia(
  draft: Draft,
  target: EnterpriseStructuredMediaTarget,
  visual: CmsVisualDraft,
): Draft {
  const next = { ...draft };
  if (target.kind === "proofEngineItem") {
    const pe = { ...getObj(next, "enterpriseProofEngine") };
    const items = [...((pe.items as unknown[]) ?? [])];
    const row = { ...(typeof items[target.index] === "object" && items[target.index] ? (items[target.index] as object) : {}) };
    items[target.index] = {
      ...row,
      visual: { ...(row as { visual?: CmsVisualDraft }).visual, ...visual },
    };
    pe.items = items;
    next.enterpriseProofEngine = pe;
  }
  if (target.kind === "caseStudyItem") {
    const cs = { ...getObj(next, "enterpriseCaseStudies") };
    const items = [...((cs.items as unknown[]) ?? [])];
    const row = { ...(typeof items[target.index] === "object" && items[target.index] ? (items[target.index] as object) : {}) };
    const mergedVisual = {
      ...(row as { visual?: CmsVisualDraft }).visual,
      ...visual,
    };
    items[target.index] = {
      ...row,
      imageUrl: mergedVisual.imageUrl,
      imageAlt: mergedVisual.imageAlt,
      imageMediaAssetId: mergedVisual.imageMediaAssetId,
      visual: mergedVisual,
    };
    cs.items = items;
    next.enterpriseCaseStudies = cs;
  }
  if (target.kind === "practiceBlock") {
    const pr = { ...getObj(next, "enterprisePractice") };
    const blocks = [...((pr.blocks as unknown[]) ?? [])];
    const row = { ...(typeof blocks[target.index] === "object" && blocks[target.index] ? (blocks[target.index] as object) : {}) };
    blocks[target.index] = { ...row, ...visual };
    pr.blocks = blocks;
    next.enterprisePractice = pr;
  }
  return next;
}

export function pickEnterpriseDraftFromSections(
  sections: Record<string, unknown>,
): Draft {
  const out: Draft = {};
  for (const k of ENTERPRISE_PROOF_KEYS) {
    if (sections[k] !== undefined) {
      try {
        out[k] = structuredClone(sections[k] as object);
      } catch {
        out[k] = sections[k];
      }
    }
  }
  return out;
}

type Props = {
  draft: Draft;
  setDraft: React.Dispatch<React.SetStateAction<Draft>>;
  requestMedia: (target: EnterpriseStructuredMediaTarget) => void;
  rawJson: string;
  setRawJson: (s: string) => void;
  rawJsonError: string | null;
  setRawJsonError: (s: string | null) => void;
};

export function EnterpriseMarketingSectionsEditor({
  draft,
  setDraft,
  requestMedia,
  rawJson,
  setRawJson,
  rawJsonError,
  setRawJsonError,
}: Props) {
  const ds = getObj(draft, "enterpriseDecisionSummary");
  const pe = getObj(draft, "enterpriseProofEngine");
  const peItems = Array.isArray(pe.items)
    ? (pe.items as Record<string, unknown>[])
    : [];

  const fit = getObj(draft, "enterpriseFit");
  const fitList = Array.isArray(fit.fit)
    ? (fit.fit as string[]).map((x) => (typeof x === "string" ? x : String(x)))
    : [];
  const nonFitList = Array.isArray(fit.nonFit)
    ? (fit.nonFit as string[]).map((x) => (typeof x === "string" ? x : String(x)))
    : [];

  const cs = getObj(draft, "enterpriseCaseStudies");
  const csItems = Array.isArray(cs.items)
    ? (cs.items as Record<string, unknown>[])
    : [];

  const roi = getObj(draft, "enterpriseRoi");
  const invRaw = roi.investmentProfile;
  const inv =
    invRaw && typeof invRaw === "object" && !Array.isArray(invRaw)
      ? (invRaw as Record<string, unknown>)
      : {};
  const roiVars = Array.isArray(inv.variables)
    ? (inv.variables as string[])
    : [];

  const de = getObj(draft, "enterpriseDealEntry");
  const deItems = Array.isArray(de.items)
    ? (de.items as Record<string, unknown>[])
    : [];

  const dg = getObj(draft, "enterpriseDiagrams");
  const dgItems = Array.isArray(dg.items)
    ? (dg.items as Record<string, unknown>[])
    : [];

  const pr = getObj(draft, "enterprisePractice");
  const prBlocks = Array.isArray(pr.blocks)
    ? (pr.blocks as Record<string, unknown>[])
    : [];

  const legacy = getObj(draft, "enterpriseProof");
  const legacyItems = Array.isArray(legacy.items)
    ? (legacy.items as Record<string, unknown>[])
    : [];

  return (
    <div className="mt-6 space-y-6 border-t border-[var(--admin-border)] pt-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
          Decision summary (sticky bar)
        </p>
        <Hint>
          Three short lines: who this is for, what the client must commit, what they get. Shown before deal entry on the public page.
        </Hint>
        <div className="mt-2 space-y-2">
          <textarea
            className="min-h-[56px] w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-2 py-1.5 text-xs"
            placeholder="This is for teams that…"
            value={String(ds.forTeams ?? "")}
            onChange={(e) =>
              setObj(setDraft, "enterpriseDecisionSummary", {
                ...ds,
                forTeams: e.target.value,
              })
            }
          />
          <textarea
            className="min-h-[56px] w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-2 py-1.5 text-xs"
            placeholder="Requires…"
            value={String(ds.requires ?? "")}
            onChange={(e) =>
              setObj(setDraft, "enterpriseDecisionSummary", {
                ...ds,
                requires: e.target.value,
              })
            }
          />
          <textarea
            className="min-h-[56px] w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-2 py-1.5 text-xs"
            placeholder="Delivers…"
            value={String(ds.delivers ?? "")}
            onChange={(e) =>
              setObj(setDraft, "enterpriseDecisionSummary", {
                ...ds,
                delivers: e.target.value,
              })
            }
          />
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
          Proof engine
        </p>
        <Hint>
          Use verifiable, bounded claims. Each row needs claim + metric. Evidence type and verification level appear on the public page — avoid vague benefits.
        </Hint>
        <input
          className="mt-2 w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-2 py-1.5 text-sm"
          placeholder="Section title"
          value={String(pe.title ?? "")}
          onChange={(e) =>
            setObj(setDraft, "enterpriseProofEngine", { ...pe, title: e.target.value })
          }
        />
        <div className="mt-2 space-y-3">
          {peItems.map((row, i) => {
            const ver = (row.verification as Record<string, unknown>) ?? {};
            const vis = (row.visual as CmsVisualDraft) ?? {};
            return (
              <div
                key={i}
                className="rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] p-3"
              >
                <div className="flex justify-between gap-2">
                  <span className="text-[10px] font-mono text-[var(--admin-muted)]">
                    Row {i + 1}
                  </span>
                  <button
                    type="button"
                    className="text-[10px] text-red-600 hover:underline"
                    onClick={() => {
                      const next = peItems.filter((_, j) => j !== i);
                      setObj(setDraft, "enterpriseProofEngine", {
                        ...pe,
                        items: next,
                      });
                    }}
                  >
                    Remove
                  </button>
                </div>
                <input
                  className="mt-2 w-full rounded border border-[var(--admin-border)] px-2 py-1 text-xs"
                  placeholder="Claim (bounded)"
                  value={String(row.claim ?? "")}
                  onChange={(e) => {
                    const next = [...peItems];
                    next[i] = { ...row, claim: e.target.value };
                    setObj(setDraft, "enterpriseProofEngine", { ...pe, items: next });
                  }}
                />
                <textarea
                  className="mt-1 min-h-[48px] w-full rounded border border-[var(--admin-border)] px-2 py-1 text-xs"
                  placeholder="Metric / how it is measured"
                  value={String(row.metric ?? "")}
                  onChange={(e) => {
                    const next = [...peItems];
                    next[i] = { ...row, metric: e.target.value };
                    setObj(setDraft, "enterpriseProofEngine", { ...pe, items: next });
                  }}
                />
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <label className="text-[10px] text-[var(--admin-muted)]">
                    Evidence type
                    <select
                      className="mt-0.5 w-full rounded border border-[var(--admin-border)] bg-[var(--admin-surface)] px-1 py-1 text-xs"
                      value={String(row.evidenceType ?? "reference_architecture")}
                      onChange={(e) => {
                        const next = [...peItems];
                        next[i] = { ...row, evidenceType: e.target.value };
                        setObj(setDraft, "enterpriseProofEngine", {
                          ...pe,
                          items: next,
                        });
                      }}
                    >
                      {EVIDENCE.map((x) => (
                        <option key={x} value={x}>
                          {x}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-[10px] text-[var(--admin-muted)]">
                    Verification level
                    <select
                      className="mt-0.5 w-full rounded border border-[var(--admin-border)] bg-[var(--admin-surface)] px-1 py-1 text-xs"
                      value={String(ver.level ?? "internal")}
                      onChange={(e) => {
                        const next = [...peItems];
                        next[i] = {
                          ...row,
                          verification: { ...ver, level: e.target.value },
                        };
                        setObj(setDraft, "enterpriseProofEngine", {
                          ...pe,
                          items: next,
                        });
                      }}
                    >
                      {VERIFICATION.map((x) => (
                        <option key={x} value={x}>
                          {x}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <input
                  className="mt-2 w-full rounded border border-[var(--admin-border)] px-2 py-1 text-xs"
                  placeholder="Verification note (optional)"
                  value={String(ver.note ?? "")}
                  onChange={(e) => {
                    const next = [...peItems];
                    next[i] = {
                      ...row,
                      verification: { ...ver, note: e.target.value },
                    };
                    setObj(setDraft, "enterpriseProofEngine", { ...pe, items: next });
                  }}
                />
                {visualRow(vis, (nv) => {
                  const next = [...peItems];
                  next[i] = { ...row, visual: nv };
                  setObj(setDraft, "enterpriseProofEngine", { ...pe, items: next });
                }, () => requestMedia({ kind: "proofEngineItem", index: i }))}
              </div>
            );
          })}
          <button
            type="button"
            className="rounded-md border border-[var(--admin-border)] bg-[var(--admin-row-header)] px-3 py-1.5 text-xs"
            onClick={() =>
              setObj(setDraft, "enterpriseProofEngine", {
                ...pe,
                items: [
                  ...peItems,
                  {
                    claim: "",
                    metric: "",
                    evidenceType: "reference_architecture",
                    verification: { level: "internal", note: "" },
                    visual: {},
                  },
                ],
              })
            }
          >
            Add proof row
          </button>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
          Fit / non-fit
        </p>
        <Hint>Helps visitors self-qualify. Use operational bullets, not slogans.</Hint>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <input
            className="rounded border border-[var(--admin-border)] px-2 py-1 text-xs"
            placeholder="Section title"
            value={String(fit.title ?? "")}
            onChange={(e) =>
              setObj(setDraft, "enterpriseFit", { ...fit, title: e.target.value })
            }
          />
          <input
            className="rounded border border-[var(--admin-border)] px-2 py-1 text-xs"
            placeholder="Fit column title"
            value={String(fit.fitTitle ?? "")}
            onChange={(e) =>
              setObj(setDraft, "enterpriseFit", { ...fit, fitTitle: e.target.value })
            }
          />
        </div>
        <textarea
          className="mt-2 min-h-[48px] w-full rounded border border-[var(--admin-border)] px-2 py-1 text-xs"
          placeholder="Lead paragraph"
          value={String(fit.lead ?? "")}
          onChange={(e) =>
            setObj(setDraft, "enterpriseFit", { ...fit, lead: e.target.value })
          }
        />
        <input
          className="mt-2 w-full rounded border border-[var(--admin-border)] px-2 py-1 text-xs"
          placeholder="Non-fit column title"
          value={String(fit.nonFitTitle ?? "")}
          onChange={(e) =>
            setObj(setDraft, "enterpriseFit", { ...fit, nonFitTitle: e.target.value })
          }
        />
        <p className="mt-2 text-[10px] text-[var(--admin-muted)]">Fit bullets</p>
        {fitList.map((line, i) => (
          <div key={i} className="mt-1 flex gap-1">
            <input
              className="flex-1 rounded border border-[var(--admin-border)] px-2 py-1 text-xs"
              value={line}
              onChange={(e) => {
                const next = [...fitList];
                next[i] = e.target.value;
                setObj(setDraft, "enterpriseFit", { ...fit, fit: next });
              }}
            />
            <button
              type="button"
              className="text-[10px] text-[var(--admin-muted)]"
              onClick={() => {
                const next = fitList.filter((_, j) => j !== i);
                setObj(setDraft, "enterpriseFit", { ...fit, fit: next });
              }}
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          className="mt-1 text-[10px] text-[var(--admin-accent)]"
          onClick={() =>
            setObj(setDraft, "enterpriseFit", { ...fit, fit: [...fitList, ""] })
          }
        >
          + Fit bullet
        </button>
        <p className="mt-3 text-[10px] text-[var(--admin-muted)]">Non-fit bullets</p>
        {nonFitList.map((line, i) => (
          <div key={i} className="mt-1 flex gap-1">
            <input
              className="flex-1 rounded border border-[var(--admin-border)] px-2 py-1 text-xs"
              value={line}
              onChange={(e) => {
                const next = [...nonFitList];
                next[i] = e.target.value;
                setObj(setDraft, "enterpriseFit", { ...fit, nonFit: next });
              }}
            />
            <button
              type="button"
              className="text-[10px] text-[var(--admin-muted)]"
              onClick={() => {
                const next = nonFitList.filter((_, j) => j !== i);
                setObj(setDraft, "enterpriseFit", { ...fit, nonFit: next });
              }}
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          className="mt-1 text-[10px] text-[var(--admin-accent)]"
          onClick={() =>
            setObj(setDraft, "enterpriseFit", {
              ...fit,
              nonFit: [...nonFitList, ""],
            })
          }
        >
          + Non-fit bullet
        </button>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
          Case studies
        </p>
        <Hint>
          Describe system built and outcomes, not marketing story. For the simpler JSON model, you can also use title + body + imageUrl per card. Sample public visuals: /enterprise/private-ai-dashboard.svg, /enterprise/workflow-approval-flow.svg, /enterprise/operations-control-panel.svg.
        </Hint>
        <input
          className="mt-2 w-full rounded border border-[var(--admin-border)] px-2 py-1 text-xs"
          placeholder="Section title"
          value={String(cs.title ?? "")}
          onChange={(e) =>
            setObj(setDraft, "enterpriseCaseStudies", { ...cs, title: e.target.value })
          }
        />
        <textarea
          className="mt-1 min-h-[40px] w-full rounded border border-[var(--admin-border)] px-2 py-1 text-xs"
          placeholder="Section lead"
          value={String(cs.lead ?? "")}
          onChange={(e) =>
            setObj(setDraft, "enterpriseCaseStudies", { ...cs, lead: e.target.value })
          }
        />
        <div className="mt-2 space-y-3">
          {csItems.map((row, i) => {
            const rowVisual = (row.visual as CmsVisualDraft) ?? {};
            const vis: CmsVisualDraft = {
              imageUrl:
                typeof row.imageUrl === "string" ? row.imageUrl : rowVisual.imageUrl,
              imageAlt:
                typeof row.imageAlt === "string" ? row.imageAlt : rowVisual.imageAlt,
              imageMediaAssetId:
                typeof row.imageMediaAssetId === "string"
                  ? row.imageMediaAssetId
                  : rowVisual.imageMediaAssetId,
              assetRole: rowVisual.assetRole,
              assetPurpose: rowVisual.assetPurpose,
              assetPriority: rowVisual.assetPriority,
            };
            const metrics = Array.isArray(row.metrics)
              ? (row.metrics as string[]).map((m) =>
                  typeof m === "string" ? m : String(m),
                )
              : [];
            return (
              <div
                key={i}
                className="rounded-md border border-[var(--admin-border)] p-3"
              >
                <div className="flex justify-between">
                  <span className="text-[10px] font-mono">Case {i + 1}</span>
                  <button
                    type="button"
                    className="text-[10px] text-red-600"
                    onClick={() => {
                      const next = csItems.filter((_, j) => j !== i);
                      setObj(setDraft, "enterpriseCaseStudies", {
                        ...cs,
                        items: next,
                      });
                    }}
                  >
                    Remove
                  </button>
                </div>
                <input
                  className="mt-2 w-full rounded border px-2 py-1 text-xs"
                  placeholder="Kicker"
                  value={String(row.kicker ?? "")}
                  onChange={(e) => {
                    const next = [...csItems];
                    next[i] = { ...row, kicker: e.target.value };
                    setObj(setDraft, "enterpriseCaseStudies", {
                      ...cs,
                      items: next,
                    });
                  }}
                />
                <input
                  className="mt-1 w-full rounded border px-2 py-1 text-xs"
                  placeholder="Title"
                  value={String(row.title ?? "")}
                  onChange={(e) => {
                    const next = [...csItems];
                    next[i] = { ...row, title: e.target.value };
                    setObj(setDraft, "enterpriseCaseStudies", {
                      ...cs,
                      items: next,
                    });
                  }}
                />
                <textarea
                  className="mt-1 min-h-[40px] w-full rounded border px-2 py-1 text-xs"
                  placeholder="Problem (or situation)"
                  value={String(row.problem ?? row.situation ?? "")}
                  onChange={(e) => {
                    const next = [...csItems];
                    next[i] = { ...row, problem: e.target.value, situation: e.target.value };
                    setObj(setDraft, "enterpriseCaseStudies", {
                      ...cs,
                      items: next,
                    });
                  }}
                />
                <textarea
                  className="mt-1 min-h-[40px] w-full rounded border px-2 py-1 text-xs"
                  placeholder="System built (or systems)"
                  value={String(row.systemBuilt ?? row.systems ?? "")}
                  onChange={(e) => {
                    const next = [...csItems];
                    next[i] = {
                      ...row,
                      systemBuilt: e.target.value,
                      systems: e.target.value,
                    };
                    setObj(setDraft, "enterpriseCaseStudies", {
                      ...cs,
                      items: next,
                    });
                  }}
                />
                <textarea
                  className="mt-1 min-h-[40px] w-full rounded border px-2 py-1 text-xs"
                  placeholder="Outcome (or proof)"
                  value={String(row.outcome ?? row.proof ?? "")}
                  onChange={(e) => {
                    const next = [...csItems];
                    next[i] = { ...row, outcome: e.target.value, proof: e.target.value };
                    setObj(setDraft, "enterpriseCaseStudies", {
                      ...cs,
                      items: next,
                    });
                  }}
                />
                <textarea
                  className="mt-1 min-h-[36px] w-full rounded border px-2 py-1 text-xs"
                  placeholder="Decision impact (what decision this enables)"
                  value={String(row.decisionImpact ?? "")}
                  onChange={(e) => {
                    const next = [...csItems];
                    next[i] = { ...row, decisionImpact: e.target.value };
                    setObj(setDraft, "enterpriseCaseStudies", {
                      ...cs,
                      items: next,
                    });
                  }}
                />
                <p className="mt-2 text-[10px] text-[var(--admin-muted)]">Metrics (one per line)</p>
                {metrics.map((m, mi) => (
                  <input
                    key={mi}
                    className="mt-1 w-full rounded border px-2 py-1 text-xs"
                    value={m}
                    onChange={(e) => {
                      const nextM = [...metrics];
                      nextM[mi] = e.target.value;
                      const next = [...csItems];
                      next[i] = { ...row, metrics: nextM };
                      setObj(setDraft, "enterpriseCaseStudies", {
                        ...cs,
                        items: next,
                      });
                    }}
                  />
                ))}
                <button
                  type="button"
                  className="mt-1 text-[10px]"
                  onClick={() => {
                    const next = [...csItems];
                    next[i] = { ...row, metrics: [...metrics, ""] };
                    setObj(setDraft, "enterpriseCaseStudies", {
                      ...cs,
                      items: next,
                    });
                  }}
                >
                  + metric line
                </button>
                {visualRow(
                  vis,
                  (nv) => {
                    const next = [...csItems];
                    next[i] = {
                      ...row,
                      imageUrl: nv.imageUrl,
                      imageAlt: nv.imageAlt,
                      imageMediaAssetId: nv.imageMediaAssetId,
                      visual: nv,
                    };
                    setObj(setDraft, "enterpriseCaseStudies", { ...cs, items: next });
                  },
                  () => requestMedia({ kind: "caseStudyItem", index: i }),
                )}
              </div>
            );
          })}
          <button
            type="button"
            className="rounded border bg-[var(--admin-row-header)] px-2 py-1 text-xs"
            onClick={() =>
              setObj(setDraft, "enterpriseCaseStudies", {
                ...cs,
                items: [
                  ...csItems,
                  {
                    kicker: "",
                    title: "",
                    problem: "",
                    systemBuilt: "",
                    outcome: "",
                    decisionImpact: "",
                    metrics: [],
                    visual: {},
                  },
                ],
              })
            }
          >
            Add case study
          </button>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
          ROI framing
        </p>
        <Hint>
          Qualitative framing only — do not publish fabricated numbers. Investment profile describes scope and variables, not fake ROI percentages.
        </Hint>
        <div className="mt-2 space-y-2">
          <input
            className="w-full rounded border px-2 py-1 text-xs"
            placeholder="Title"
            value={String(roi.title ?? "")}
            onChange={(e) =>
              setObj(setDraft, "enterpriseRoi", { ...roi, title: e.target.value })
            }
          />
          <textarea
            className="min-h-[48px] w-full rounded border px-2 py-1 text-xs"
            placeholder="Lead"
            value={String(roi.lead ?? "")}
            onChange={(e) =>
              setObj(setDraft, "enterpriseRoi", { ...roi, lead: e.target.value })
            }
          />
          <input
            className="w-full rounded border px-2 py-1 text-xs"
            placeholder="Investment profile — scope (paragraph)"
            value={String(inv.scope ?? "")}
            onChange={(e) =>
              setObj(setDraft, "enterpriseRoi", {
                ...roi,
                investmentProfile: { ...inv, scope: e.target.value, variables: roiVars },
              })
            }
          />
          <p className="text-[10px] text-[var(--admin-muted)]">Investment variables (lines)</p>
          {roiVars.map((line, vi) => (
            <div key={vi} className="flex gap-1">
              <input
                className="flex-1 rounded border px-2 py-1 text-xs"
                value={line}
                onChange={(e) => {
                  const nv = [...roiVars];
                  nv[vi] = e.target.value;
                  setObj(setDraft, "enterpriseRoi", {
                    ...roi,
                    investmentProfile: { ...inv, variables: nv, scope: String(inv.scope ?? "") },
                  });
                }}
              />
              <button
                type="button"
                className="text-[10px]"
                onClick={() => {
                  const nv = roiVars.filter((_, j) => j !== vi);
                  setObj(setDraft, "enterpriseRoi", {
                    ...roi,
                    investmentProfile: { ...inv, variables: nv, scope: String(inv.scope ?? "") },
                  });
                }}
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            className="text-[10px]"
            onClick={() =>
              setObj(setDraft, "enterpriseRoi", {
                ...roi,
                investmentProfile: {
                  ...inv,
                  variables: [...roiVars, ""],
                  scope: String(inv.scope ?? ""),
                },
              })
            }
          >
            + variable line
          </button>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
          Deal entry cards
        </p>
        <Hint>
          List what the client must already know or provide. Intent drives contact form prefill. CTA should read like “Start a scoped engagement”.
        </Hint>
        <input
          className="mt-2 w-full rounded border px-2 py-1 text-xs"
          placeholder="Section title"
          value={String(de.title ?? "")}
          onChange={(e) =>
            setObj(setDraft, "enterpriseDealEntry", { ...de, title: e.target.value })
          }
        />
        <textarea
          className="mt-1 min-h-[40px] w-full rounded border px-2 py-1 text-xs"
          placeholder="Lead"
          value={String(de.lead ?? "")}
          onChange={(e) =>
            setObj(setDraft, "enterpriseDealEntry", { ...de, lead: e.target.value })
          }
        />
        <div className="mt-2 space-y-3">
          {deItems.map((row, i) => {
            const qual = (row.qualification as Record<string, unknown>) ?? {};
            const req = Array.isArray(qual.required)
              ? (qual.required as string[]).map((c) =>
                  typeof c === "string" ? c : String(c),
                )
              : [];
            const opt = Array.isArray(qual.optional)
              ? (qual.optional as string[]).map((c) =>
                  typeof c === "string" ? c : String(c),
                )
              : [];
            const checklist = Array.isArray(row.checklist)
              ? (row.checklist as string[]).map((c) =>
                  typeof c === "string" ? c : String(c),
                )
              : [];
            return (
              <div key={i} className="rounded border p-3">
                <div className="flex justify-between">
                  <span className="text-[10px] font-mono">Card {i + 1}</span>
                  <button
                    type="button"
                    className="text-[10px] text-red-600"
                    onClick={() => {
                      const next = deItems.filter((_, j) => j !== i);
                      setObj(setDraft, "enterpriseDealEntry", {
                        ...de,
                        items: next,
                      });
                    }}
                  >
                    Remove
                  </button>
                </div>
                <input
                  className="mt-2 w-full rounded border px-2 py-1 text-xs"
                  placeholder="Card title"
                  value={String(row.title ?? "")}
                  onChange={(e) => {
                    const next = [...deItems];
                    next[i] = { ...row, title: e.target.value };
                    setObj(setDraft, "enterpriseDealEntry", { ...de, items: next });
                  }}
                />
                <textarea
                  className="mt-1 min-h-[48px] w-full rounded border px-2 py-1 text-xs"
                  placeholder="Body"
                  value={String(row.body ?? "")}
                  onChange={(e) => {
                    const next = [...deItems];
                    next[i] = { ...row, body: e.target.value };
                    setObj(setDraft, "enterpriseDealEntry", { ...de, items: next });
                  }}
                />
                <label className="mt-2 block text-[10px] text-[var(--admin-muted)]">
                  Intent (contact prefill)
                  <select
                    className="mt-0.5 w-full rounded border bg-[var(--admin-surface)] px-1 py-1 text-xs"
                    value={String(row.intent ?? "AUTOMATION")}
                    onChange={(e) => {
                      const next = [...deItems];
                      next[i] = { ...row, intent: e.target.value };
                      setObj(setDraft, "enterpriseDealEntry", { ...de, items: next });
                    }}
                  >
                    {INTENTS.map((x) => (
                      <option key={x} value={x}>
                        {x}
                      </option>
                    ))}
                  </select>
                </label>
                <input
                  className="mt-2 w-full rounded border px-2 py-1 text-xs"
                  placeholder="CTA label"
                  value={String(row.ctaLabel ?? "")}
                  onChange={(e) => {
                    const next = [...deItems];
                    next[i] = { ...row, ctaLabel: e.target.value };
                    setObj(setDraft, "enterpriseDealEntry", { ...de, items: next });
                  }}
                />
                <textarea
                  className="mt-1 min-h-[64px] w-full rounded border px-2 py-1 text-xs font-mono"
                  placeholder="messageTemplate (prefilled in contact)"
                  value={String(row.messageTemplate ?? "")}
                  onChange={(e) => {
                    const next = [...deItems];
                    next[i] = { ...row, messageTemplate: e.target.value };
                    setObj(setDraft, "enterpriseDealEntry", { ...de, items: next });
                  }}
                />
                <p className="mt-2 text-[10px]">Checklist (brief)</p>
                {checklist.map((c, ci) => (
                  <input
                    key={ci}
                    className="mt-1 w-full rounded border px-2 py-1 text-xs"
                    value={c}
                    onChange={(e) => {
                      const nc = [...checklist];
                      nc[ci] = e.target.value;
                      const next = [...deItems];
                      next[i] = { ...row, checklist: nc };
                      setObj(setDraft, "enterpriseDealEntry", {
                        ...de,
                        items: next,
                      });
                    }}
                  />
                ))}
                <button
                  type="button"
                  className="mt-1 text-[10px]"
                  onClick={() => {
                    const next = [...deItems];
                    next[i] = { ...row, checklist: [...checklist, ""] };
                    setObj(setDraft, "enterpriseDealEntry", {
                      ...de,
                      items: next,
                    });
                  }}
                >
                  + checklist line
                </button>
                <p className="mt-2 text-[10px]">qualification.required</p>
                {req.map((c, ci) => (
                  <input
                    key={ci}
                    className="mt-1 w-full rounded border px-2 py-1 text-xs"
                    value={c}
                    onChange={(e) => {
                      const nr = [...req];
                      nr[ci] = e.target.value;
                      const next = [...deItems];
                      next[i] = {
                        ...row,
                        qualification: { ...qual, required: nr, optional: opt },
                      };
                      setObj(setDraft, "enterpriseDealEntry", {
                        ...de,
                        items: next,
                      });
                    }}
                  />
                ))}
                <button
                  type="button"
                  className="mt-1 text-[10px]"
                  onClick={() => {
                    const next = [...deItems];
                    next[i] = {
                      ...row,
                      qualification: {
                        ...qual,
                        required: [...req, ""],
                        optional: opt,
                      },
                    };
                    setObj(setDraft, "enterpriseDealEntry", {
                      ...de,
                      items: next,
                    });
                  }}
                >
                  + required
                </button>
                <p className="mt-2 text-[10px]">qualification.optional</p>
                {opt.map((c, ci) => (
                  <input
                    key={ci}
                    className="mt-1 w-full rounded border px-2 py-1 text-xs"
                    value={c}
                    onChange={(e) => {
                      const no = [...opt];
                      no[ci] = e.target.value;
                      const next = [...deItems];
                      next[i] = {
                        ...row,
                        qualification: { ...qual, required: req, optional: no },
                      };
                      setObj(setDraft, "enterpriseDealEntry", {
                        ...de,
                        items: next,
                      });
                    }}
                  />
                ))}
                <button
                  type="button"
                  className="mt-1 text-[10px]"
                  onClick={() => {
                    const next = [...deItems];
                    next[i] = {
                      ...row,
                      qualification: {
                        ...qual,
                        required: req,
                        optional: [...opt, ""],
                      },
                    };
                    setObj(setDraft, "enterpriseDealEntry", {
                      ...de,
                      items: next,
                    });
                  }}
                >
                  + optional
                </button>
              </div>
            );
          })}
          <button
            type="button"
            className="rounded border bg-[var(--admin-row-header)] px-2 py-1 text-xs"
            onClick={() =>
              setObj(setDraft, "enterpriseDealEntry", {
                ...de,
                items: [
                  ...deItems,
                  {
                    title: "",
                    body: "",
                    intent: "AUTOMATION",
                    ctaLabel: "Start a scoped engagement",
                    messageTemplate: "",
                    checklist: [],
                    qualification: { required: [], optional: [] },
                  },
                ],
              })
            }
          >
            Add deal card
          </button>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
          System diagrams (structured list)
        </p>
        <Hint>
          Each diagram needs a title, type badge, and explanation shown on the public page. Add column labels/bodies or a single body fallback.
        </Hint>
        <input
          className="mt-2 w-full rounded border px-2 py-1 text-xs"
          placeholder="Section title"
          value={String(dg.title ?? "")}
          onChange={(e) =>
            setObj(setDraft, "enterpriseDiagrams", { ...dg, title: e.target.value })
          }
        />
        <textarea
          className="mt-1 min-h-[36px] w-full rounded border px-2 py-1 text-xs"
          placeholder="Section lead"
          value={String(dg.lead ?? "")}
          onChange={(e) =>
            setObj(setDraft, "enterpriseDiagrams", { ...dg, lead: e.target.value })
          }
        />
        <div className="mt-2 space-y-3">
          {dgItems.map((row, i) => {
            const cols = Array.isArray(row.columns)
              ? (row.columns as Record<string, unknown>[])
              : [];
            return (
              <div key={i} className="rounded border p-3">
                <div className="flex justify-between">
                  <span className="text-[10px] font-mono">Diagram {i + 1}</span>
                  <button
                    type="button"
                    className="text-[10px] text-red-600"
                    onClick={() => {
                      const next = dgItems.filter((_, j) => j !== i);
                      setObj(setDraft, "enterpriseDiagrams", {
                        ...dg,
                        items: next,
                      });
                    }}
                  >
                    Remove
                  </button>
                </div>
                <input
                  className="mt-2 w-full rounded border px-2 py-1 text-xs"
                  placeholder="Title"
                  value={String(row.title ?? "")}
                  onChange={(e) => {
                    const next = [...dgItems];
                    next[i] = { ...row, title: e.target.value };
                    setObj(setDraft, "enterpriseDiagrams", { ...dg, items: next });
                  }}
                />
                <label className="mt-2 block text-[10px]">
                  diagramType
                  <select
                    className="mt-0.5 w-full rounded border px-1 py-1 text-xs"
                    value={String(row.diagramType ?? "architecture")}
                    onChange={(e) => {
                      const next = [...dgItems];
                      next[i] = { ...row, diagramType: e.target.value };
                      setObj(setDraft, "enterpriseDiagrams", {
                        ...dg,
                        items: next,
                      });
                    }}
                  >
                    {DIAGRAM_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </label>
                <textarea
                  className="mt-2 min-h-[48px] w-full rounded border px-2 py-1 text-xs"
                  placeholder="Explanation (shown under title)"
                  value={String(row.explanation ?? row.body ?? "")}
                  onChange={(e) => {
                    const next = [...dgItems];
                    next[i] = { ...row, explanation: e.target.value };
                    setObj(setDraft, "enterpriseDiagrams", {
                      ...dg,
                      items: next,
                    });
                  }}
                />
                <textarea
                  className="mt-1 min-h-[36px] w-full rounded border px-2 py-1 text-xs"
                  placeholder="Footer (optional)"
                  value={String(row.footer ?? "")}
                  onChange={(e) => {
                    const next = [...dgItems];
                    next[i] = { ...row, footer: e.target.value };
                    setObj(setDraft, "enterpriseDiagrams", {
                      ...dg,
                      items: next,
                    });
                  }}
                />
                <p className="mt-2 text-[10px]">Columns</p>
                {cols.map((col, ci) => (
                  <div key={ci} className="mt-1 grid gap-1 sm:grid-cols-2">
                    <input
                      className="rounded border px-2 py-1 text-xs"
                      placeholder="Column label"
                      value={String(col.label ?? "")}
                      onChange={(e) => {
                        const nc = [...cols];
                        nc[ci] = { ...col, label: e.target.value };
                        const next = [...dgItems];
                        next[i] = { ...row, columns: nc };
                        setObj(setDraft, "enterpriseDiagrams", {
                          ...dg,
                          items: next,
                        });
                      }}
                    />
                    <input
                      className="rounded border px-2 py-1 text-xs"
                      placeholder="Column body"
                      value={String(col.body ?? "")}
                      onChange={(e) => {
                        const nc = [...cols];
                        nc[ci] = { ...col, body: e.target.value };
                        const next = [...dgItems];
                        next[i] = { ...row, columns: nc };
                        setObj(setDraft, "enterpriseDiagrams", {
                          ...dg,
                          items: next,
                        });
                      }}
                    />
                  </div>
                ))}
                <button
                  type="button"
                  className="mt-1 text-[10px]"
                  onClick={() => {
                    const next = [...dgItems];
                    next[i] = { ...row, columns: [...cols, { label: "", body: "" }] };
                    setObj(setDraft, "enterpriseDiagrams", {
                      ...dg,
                      items: next,
                    });
                  }}
                >
                  + column
                </button>
              </div>
            );
          })}
          <button
            type="button"
            className="rounded border px-2 py-1 text-xs"
            onClick={() =>
              setObj(setDraft, "enterpriseDiagrams", {
                ...dg,
                items: [
                  ...dgItems,
                  {
                    title: "",
                    diagramType: "architecture",
                    explanation: "",
                    columns: [],
                    footer: "",
                  },
                ],
              })
            }
          >
            Add diagram
          </button>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
          Practice blocks
        </p>
        <Hint>Three pillars with optional image per block. Uses the same merge path as CMS JSON.</Hint>
        <input
          className="mt-2 w-full rounded border px-2 py-1 text-xs"
          placeholder="Section title"
          value={String(pr.title ?? "")}
          onChange={(e) =>
            setObj(setDraft, "enterprisePractice", { ...pr, title: e.target.value })
          }
        />
        <textarea
          className="mt-1 w-full rounded border px-2 py-1 text-xs"
          placeholder="Lead"
          value={String(pr.lead ?? "")}
          onChange={(e) =>
            setObj(setDraft, "enterprisePractice", { ...pr, lead: e.target.value })
          }
        />
        {prBlocks.map((blk, i) => {
          const vis: CmsVisualDraft = {
            imageUrl: String(blk.imageUrl ?? ""),
            imageAlt: String(blk.imageAlt ?? ""),
            imageMediaAssetId: String(blk.imageMediaAssetId ?? ""),
            assetRole: blk.assetRole ? String(blk.assetRole) : undefined,
            assetPurpose: blk.assetPurpose ? String(blk.assetPurpose) : undefined,
            assetPriority: blk.assetPriority ? String(blk.assetPriority) : undefined,
          };
          return (
            <div key={i} className="mt-2 rounded border p-2">
              <p className="text-[10px] font-mono">Block {i + 1}</p>
              <input
                className="mt-1 w-full rounded border px-2 py-1 text-xs"
                placeholder="Title"
                value={String(blk.title ?? "")}
                onChange={(e) => {
                  const next = [...prBlocks];
                  next[i] = { ...blk, title: e.target.value };
                  setObj(setDraft, "enterprisePractice", {
                    ...pr,
                    blocks: next,
                  });
                }}
              />
              <textarea
                className="mt-1 w-full rounded border px-2 py-1 text-xs"
                placeholder="Body"
                value={String(blk.body ?? "")}
                onChange={(e) => {
                  const next = [...prBlocks];
                  next[i] = { ...blk, body: e.target.value };
                  setObj(setDraft, "enterprisePractice", {
                    ...pr,
                    blocks: next,
                  });
                }}
              />
              {visualRow(vis, (nv) => {
                const next = [...prBlocks];
                next[i] = {
                  ...blk,
                  ...nv,
                };
                setObj(setDraft, "enterprisePractice", {
                  ...pr,
                  blocks: next,
                });
              }, () => requestMedia({ kind: "practiceBlock", index: i }))}
            </div>
          );
        })}
        <button
          type="button"
          className="mt-2 rounded border px-2 py-1 text-xs"
          onClick={() =>
            setObj(setDraft, "enterprisePractice", {
              ...pr,
              blocks: [...prBlocks, { title: "", body: "" }],
            })
          }
        >
          Add practice block
        </button>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
          Legacy proof strip (optional)
        </p>
        <Hint>Falls back when proof engine rows are empty. Prefer proof engine for new content.</Hint>
        <input
          className="mt-2 w-full rounded border px-2 py-1 text-xs"
          placeholder="Title"
          value={String(legacy.title ?? "")}
          onChange={(e) =>
            setObj(setDraft, "enterpriseProof", { ...legacy, title: e.target.value })
          }
        />
        {legacyItems.map((row, i) => (
          <div key={i} className="mt-2 rounded border p-2">
            <input
              className="w-full rounded border px-2 py-1 text-xs"
              placeholder="Item title"
              value={String(row.title ?? "")}
              onChange={(e) => {
                const next = [...legacyItems];
                next[i] = { ...row, title: e.target.value };
                setObj(setDraft, "enterpriseProof", { ...legacy, items: next });
              }}
            />
            <textarea
              className="mt-1 w-full rounded border px-2 py-1 text-xs"
              placeholder="Item body"
              value={String(row.body ?? "")}
              onChange={(e) => {
                const next = [...legacyItems];
                next[i] = { ...row, body: e.target.value };
                setObj(setDraft, "enterpriseProof", { ...legacy, items: next });
              }}
            />
          </div>
        ))}
        <button
          type="button"
          className="mt-2 text-[10px]"
          onClick={() =>
            setObj(setDraft, "enterpriseProof", {
              ...legacy,
              items: [...legacyItems, { title: "", body: "" }],
            })
          }
        >
          + legacy item
        </button>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
          Advanced: merge JSON (power users)
        </p>
        <Hint>
          Parsed object is merged into the structured draft on "Apply JSON". Invalid JSON blocks save. Keys outside enterprise sections are ignored here - use page Advanced JSON for other keys. Flat case-study media also works here: imageUrl, imageAlt, optional imageMediaAssetId.
        </Hint>
        <textarea
          className="mt-2 min-h-[120px] w-full rounded border px-2 py-1 font-mono text-[10px]"
          placeholder={ENTERPRISE_JSON_PLACEHOLDER}
          value={rawJson}
          onChange={(e) => {
            setRawJson(e.target.value);
            setRawJsonError(null);
          }}
        />
        {rawJsonError ? (
          <p className="mt-1 text-xs text-red-600">{rawJsonError}</p>
        ) : null}
        <button
          type="button"
          className="mt-2 rounded border px-3 py-1.5 text-xs"
          onClick={() => {
            if (!rawJson.trim()) {
              setRawJsonError("Paste JSON first.");
              return;
            }
            try {
              const parsed = JSON.parse(rawJson) as unknown;
              if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
                setRawJsonError("Root must be an object.");
                return;
              }
              setDraft((d) => {
                const next = { ...d };
                for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
                  if (
                    (ENTERPRISE_PROOF_KEYS as readonly EnterpriseProofSectionKey[]).includes(
                      k as EnterpriseProofSectionKey,
                    )
                  ) {
                    next[k] = v;
                  }
                }
                return next;
              });
              setRawJsonError(null);
            } catch {
              setRawJsonError("Invalid JSON.");
            }
          }}
        >
          Apply JSON to structured sections
        </button>
      </div>
    </div>
  );
}

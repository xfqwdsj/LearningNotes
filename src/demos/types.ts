import { isMarkdownValue, type MarkdownValue } from "@/lib/markdown/types";
import { localizedValue } from "@/i18n/content";
export const demoIds = [
  "regression-diagnostics",
  "multiple-regression-prediction",
  "nested-regression",
  "multiple-coefficient",
  "multiple-regression-tests",
  "multiple-regression",
  "regression-prediction",
  "regression-slope-inference",
  "simple-regression",
  "anova-groups",
  "interval-estimation",
  "mean-confidence-interval",
  "variance-confidence-interval",
  "independent-mean-confidence-interval",
  "paired-mean-confidence-interval",
  "variance-ratio-confidence-interval",
  "wald-confidence-interval",

  "iterated-slices",
  "cartesian-region",
  "triple-slice",
  "cylindrical-volume",
  "spherical-volume",
  "one-mean-test",
  "one-variance-test",
  "two-mean-test",
  "paired-test",
  "variance-ratio-test",

  "quantile-tail",
  "chi-square",
  "t-construction",
  "f-ratio",
  "sampling-mean",

  "surface-section",
  "revolution-surface",
  "cylinder-surface",
  "quadric-section",
  "vector-addition",
  "space-line",
  "plane-point",
  "curve-projection",

  "dot-product",
  "mixed-product",

  "vector-function",
  "curve-tangent",
  "surface-tangent",

  "local-extrema",
  "global-extrema",
  "lagrange-multiplier",

  "partial-derivative",
  "total-differential",
  "multivariable-chain",
  "implicit-surface",

  "point-set",
  "multivariable-domain",
  "multivariable-limit",
  "multivariable-continuity",

  "directional-rate",
  "boundary-orientation",
  "green-circulation",
  "path-independent",
  "arc-integral",
  "vector-line",

  "double-sum",
  "polar-area",
  "triple-box",

  "partial-fractions",
  "element-sum",
  "between-curves",
  "solid-disk",
  "variable-work",

  "improper-p",
  "gamma-recurrence",

  "upper-integral",
  "newton-leibniz",

  "substitution-limits",
  "parts-boundary",
  "integral-symmetry",
  "wallis-integral",

  "ode-solution",
  "separable-ode",
  "homogeneous-ode",

  "sine-limit",
  "exponential-limit",

  "angle-sum",
  "trig-identity",
  "trig-reduction",

  "fermat-extremum",
  "rolle",
  "lagrange-mean",
  "cauchy-mean",

  "chain-rule",
  "differential-approx",
  "implicit-slope",
  "inverse-derivative",
  "parametric-slope",

  "discontinuity",
  "infinitesimal",
  "limit-cancellation",
  "power-exponential",

  "function-series",
  "power-series",

  "p-series-test",
  "alternating-series",
  "absolute-convergence",
  "cauchy-product",

  "geometric-series",
  "goodness-fit",
  "contingency",

  "test-decision",
  "test-errors",
  "p-value",

  "sample-independence",
  "sample-summary",
  "empirical-cdf",
  "order-statistics",

  "point-estimate",
  "moment-estimate",
  "likelihood-bernoulli",

  "estimator-bias",
  "estimator-mse",
  "estimator-consistency",

  "mips-branch",
  "file-position",

  "python-format",
  "python-power",
  "precedence-comparison",
  "c-pointer-precedence",
  "c-data-model",
  "c-printf-field",
  "c-scanf-space",

  "uniform-interval",
  "independence",
  "bernoulli-trials",
  "system-reliability",
  "total-probability",
  "random-variable-mapping",
  "distribution-function",
  "exponential-tail",
  "poisson-count",
  "hypergeometric",
  "joint-table",
  "joint-triangle",
  "mean-variance",
  "chebyshev-bound",
  "total-variance",
  "covariance",
  "sample-space-pairs",
  "classical-dice",
  "event-partition",
  "probability-addition",
  "conditional-dice",
  "conditional-distribution",
  "conditional-mean",
  "binomial-count",
  "geometric-wait",
  "density-area",
  "uniform-scale",
  "indicator-tosses",
  "discrete-mass",
  "variance-shift",
  "moment-asymmetry",
  "correlation-curve",
  "covariance-matrix",
  "marginal-ambiguity",
  "independent-variables",
  "joint-region",
  "large-numbers",
  "random-transform",
  "binary-sum",
  "random-vector-mapping",
  "normal-conditional",
  "joint-cdf",
  "recursion-tree",
  "greedy-change",
  "coin-dynamic",
  "fake-coin",
  "merge-step",
  "maze-backtrack",
  "radix-place",
  "binary-addition",
  "cpu-cycle",
  "scheduling",
  "process-state",
  "ipv4-prefix",
  "network-encapsulation",
  "multiplexing",
  "network-switching",
  "ipv4-ttl",
  "ip-routing",
  "ipv6-compression",
  "tcp-handshake",
  "udp-datagram",
  "transport-boundaries",
  "port-demux",
  "path-resolution",
  "python-open-mode",
  "c-update-stream",
  "privilege",
  "system-call-flow",
  "boot-stages",
  "interrupt-flow",
  "exception-cases",
  "python-builtins",
  "python-sort",
  "python-append",
  "python-range",
  "python-zip",
  "c-macro-grouping",
  "c-storage-duration",
  "event-operations",
  "continuity",
  "derivative",
  "riemann",
  "taylor",
  "normal",
  "float",
  "signed-integer",
  "python-slice",
  "python-mutability",
  "pointer-arithmetic",
  "bayes",
  "gradient",
  "recursion-stack",
  "vector-product",
  "central-limit",
  "unit-circle",
  "inverse-trig",
  "trig-derivative",
] as const;
export type DemoId = (typeof demoIds)[number];
export interface DemoComponentProps {
  title: MarkdownValue;
  locale: string;
  messages: Record<string, string>;
}
export interface DemoReference {
  title: MarkdownValue;
  href: string;
  private: boolean;
}
export interface DemoSummary {
  title: MarkdownValue;
  description: MarkdownValue;
  tags: MarkdownValue[];
}
export interface DemoTranslation extends DemoSummary {
  messages: Record<string, string>;
}
export interface DemoRecord extends DemoComponentProps, DemoSummary {
  version: 3;
  id: DemoId;
  subject: string;
  source?: DemoReference;
  references: DemoReference[];
}
export interface DemoResources {
  index: string;
  catalog: string;
}
export interface DemoManifest {
  version: 5;
  count: number;
  locales: Record<string, DemoResources>;
}
export interface DemoIndexEntry extends DemoSummary {
  id: DemoId;
  subject: string;
  subjectTitle: MarkdownValue;
  href: string;
}
export interface DemoIndex {
  version: 4;
  locale: string;
  count: number;
  entries: DemoIndexEntry[];
}
export function demoResources(manifest: DemoManifest, locale: string) {
  return localizedValue(manifest.locales, locale);
}
const isSummary = (value: unknown): value is DemoSummary => {
  if (!value || typeof value !== "object") return false;
  const summary = value as Partial<DemoSummary>;
  return (
    isMarkdownValue(summary.title) &&
    isMarkdownValue(summary.description) &&
    Array.isArray(summary.tags) &&
    summary.tags.every(isMarkdownValue)
  );
};
const isTranslation = (value: unknown): value is DemoTranslation => {
  if (!isSummary(value)) return false;
  const messages = (value as Partial<DemoTranslation>).messages;
  return (
    !!messages &&
    typeof messages === "object" &&
    !Array.isArray(messages) &&
    Object.values(messages).every((item) => typeof item === "string")
  );
};
function isDemoReference(value: unknown): value is DemoReference {
  if (!value || typeof value !== "object") return false;
  const reference = value as Partial<DemoReference>;
  return (
    isMarkdownValue(reference.title) &&
    typeof reference.href === "string" &&
    reference.href.startsWith("/") &&
    !reference.href.startsWith("//") &&
    typeof reference.private === "boolean"
  );
}
export function isDemoRecord(value: unknown): value is DemoRecord {
  if (!value || typeof value !== "object") return false;
  const r = value as Partial<DemoRecord>;
  return (
    r.version === 3 &&
    demoIds.some((id) => id === r.id) &&
    typeof r.subject === "string" &&
    isTranslation(value) &&
    typeof r.locale === "string" &&
    (() => {
      try {
        return Intl.getCanonicalLocales(r.locale)[0] === r.locale;
      } catch {
        return false;
      }
    })() &&
    (r.source === undefined || isDemoReference(r.source)) &&
    Array.isArray(r.references) &&
    r.references.every(isDemoReference) &&
    (!r.source || !r.references.some((ref) => ref.href === r.source?.href))
  );
}
export function demoLocations(record: DemoRecord): DemoReference[] {
  return [...(record.source ? [record.source] : []), ...record.references];
}

export interface DemoList {
  version: 3;
  entries: { id: DemoId; href: string }[];
}
export function isDemoList(value: unknown, prefix: string): value is DemoList {
  if (!value || typeof value !== "object") return false;
  const list = value as Partial<DemoList>;
  if (list.version !== 3 || !Array.isArray(list.entries)) return false;
  const ids = new Set<string>();
  return list.entries.every((entry) => {
    if (
      !entry ||
      typeof entry !== "object" ||
      !demoIds.some((id) => id === entry.id) ||
      ids.has(entry.id) ||
      typeof entry.href !== "string"
    )
      return false;
    ids.add(entry.id);
    const directory = `${prefix}/demos/${entry.id}/`;
    return (
      entry.href.startsWith(directory) &&
      /^[a-f0-9]{16}\.json$/.test(entry.href.slice(directory.length))
    );
  });
}
export function isDemoIndex(
  value: unknown,
  prefix: string,
): value is DemoIndex {
  if (!value || typeof value !== "object") return false;
  const index = value as Partial<DemoIndex>;
  if (
    index.version !== 4 ||
    typeof index.locale !== "string" ||
    typeof index.count !== "number" ||
    !Array.isArray(index.entries) ||
    index.entries.length !== index.count
  )
    return false;
  const ids = new Set<string>();
  return index.entries.every((entry) => {
    if (
      !entry ||
      typeof entry !== "object" ||
      !demoIds.some((id) => id === entry.id) ||
      ids.has(entry.id) ||
      !isSummary(entry) ||
      !isMarkdownValue(entry.subjectTitle) ||
      typeof entry.subject !== "string" ||
      typeof entry.href !== "string"
    )
      return false;
    ids.add(entry.id);
    const directory = `${prefix}/demos/${entry.id}/`;
    return (
      entry.href.startsWith(directory) &&
      /^[a-f0-9]{16}\.json$/.test(entry.href.slice(directory.length))
    );
  });
}

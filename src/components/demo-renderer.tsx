"use client";
import dynamic from "next/dynamic";
import {
  Component,
  createContext,
  useContext,
  type ComponentType,
  type ReactNode,
} from "react";
import { useTranslations } from "next-intl";
import type { DemoComponentProps, DemoId, DemoRecord } from "@/demos/types";
import { ClientReady } from "@/components/client-ready";
import { MarkdownText } from "@/components/markdown-text";
import { DemoPlaceholder } from "./demo-placeholder";
import { Button } from "./ui/button";
const components = {
  "regression-diagnostics": dynamic<DemoComponentProps>(
    () => import("@/demos/regression-diagnostics-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "multiple-regression-prediction": dynamic<DemoComponentProps>(
    () => import("@/demos/multiple-regression-prediction-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "nested-regression": dynamic<DemoComponentProps>(
    () => import("@/demos/nested-regression-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "multiple-coefficient": dynamic<DemoComponentProps>(
    () => import("@/demos/multiple-coefficient-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "multiple-regression-tests": dynamic<DemoComponentProps>(
    () => import("@/demos/multiple-regression-tests-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "multiple-regression": dynamic<DemoComponentProps>(
    () => import("@/demos/multiple-regression-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "regression-prediction": dynamic<DemoComponentProps>(
    () => import("@/demos/regression-prediction-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "regression-slope-inference": dynamic<DemoComponentProps>(
    () => import("@/demos/regression-slope-inference-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "simple-regression": dynamic<DemoComponentProps>(
    () => import("@/demos/simple-regression-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "anova-groups": dynamic<DemoComponentProps>(
    () => import("@/demos/anova-groups-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "interval-estimation": dynamic<DemoComponentProps>(
    () => import("@/demos/interval-estimation-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "mean-confidence-interval": dynamic<DemoComponentProps>(
    () => import("@/demos/mean-confidence-interval-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "variance-confidence-interval": dynamic<DemoComponentProps>(
    () => import("@/demos/variance-confidence-interval-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "independent-mean-confidence-interval": dynamic<DemoComponentProps>(
    () => import("@/demos/independent-mean-confidence-interval-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "paired-mean-confidence-interval": dynamic<DemoComponentProps>(
    () => import("@/demos/paired-mean-confidence-interval-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "variance-ratio-confidence-interval": dynamic<DemoComponentProps>(
    () => import("@/demos/variance-ratio-confidence-interval-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "wald-confidence-interval": dynamic<DemoComponentProps>(
    () => import("@/demos/wald-confidence-interval-demo"),
    { loading: () => <DemoLoading /> },
  ),

  "iterated-slices": dynamic<DemoComponentProps>(
    () => import("@/demos/iterated-slices-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "cartesian-region": dynamic<DemoComponentProps>(
    () => import("@/demos/cartesian-region-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "triple-slice": dynamic<DemoComponentProps>(
    () => import("@/demos/triple-slice-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "cylindrical-volume": dynamic<DemoComponentProps>(
    () => import("@/demos/cylindrical-volume-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "spherical-volume": dynamic<DemoComponentProps>(
    () => import("@/demos/spherical-volume-demo"),
    { loading: () => <DemoLoading /> },
  ),

  "one-mean-test": dynamic<DemoComponentProps>(
    () => import("@/demos/one-mean-test-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "one-variance-test": dynamic<DemoComponentProps>(
    () => import("@/demos/one-variance-test-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "two-mean-test": dynamic<DemoComponentProps>(
    () => import("@/demos/two-mean-test-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "paired-test": dynamic<DemoComponentProps>(
    () => import("@/demos/paired-test-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "variance-ratio-test": dynamic<DemoComponentProps>(
    () => import("@/demos/variance-ratio-test-demo"),
    { loading: () => <DemoLoading /> },
  ),

  "quantile-tail": dynamic<DemoComponentProps>(
    () => import("@/demos/quantile-tail-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "chi-square": dynamic<DemoComponentProps>(
    () => import("@/demos/chi-square-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "t-construction": dynamic<DemoComponentProps>(
    () => import("@/demos/t-construction-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "f-ratio": dynamic<DemoComponentProps>(() => import("@/demos/f-ratio-demo"), {
    loading: () => <DemoLoading />,
  }),
  "sampling-mean": dynamic<DemoComponentProps>(
    () => import("@/demos/sampling-mean-demo"),
    { loading: () => <DemoLoading /> },
  ),

  "surface-section": dynamic<DemoComponentProps>(
    () => import("@/demos/surface-section-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "revolution-surface": dynamic<DemoComponentProps>(
    () => import("@/demos/revolution-surface-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "cylinder-surface": dynamic<DemoComponentProps>(
    () => import("@/demos/cylinder-surface-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "quadric-section": dynamic<DemoComponentProps>(
    () => import("@/demos/quadric-section-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "vector-addition": dynamic<DemoComponentProps>(
    () => import("@/demos/vector-addition-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "space-line": dynamic<DemoComponentProps>(
    () => import("@/demos/space-line-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "plane-point": dynamic<DemoComponentProps>(
    () => import("@/demos/plane-point-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "curve-projection": dynamic<DemoComponentProps>(
    () => import("@/demos/curve-projection-demo"),
    { loading: () => <DemoLoading /> },
  ),

  "dot-product": dynamic<DemoComponentProps>(
    () => import("@/demos/dot-product-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "mixed-product": dynamic<DemoComponentProps>(
    () => import("@/demos/mixed-product-demo"),
    { loading: () => <DemoLoading /> },
  ),

  "vector-function": dynamic<DemoComponentProps>(
    () => import("@/demos/vector-function-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "curve-tangent": dynamic<DemoComponentProps>(
    () => import("@/demos/curve-tangent-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "surface-tangent": dynamic<DemoComponentProps>(
    () => import("@/demos/surface-tangent-demo"),
    { loading: () => <DemoLoading /> },
  ),

  "local-extrema": dynamic<DemoComponentProps>(
    () => import("@/demos/local-extrema-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "global-extrema": dynamic<DemoComponentProps>(
    () => import("@/demos/global-extrema-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "lagrange-multiplier": dynamic<DemoComponentProps>(
    () => import("@/demos/lagrange-multiplier-demo"),
    { loading: () => <DemoLoading /> },
  ),

  "partial-derivative": dynamic<DemoComponentProps>(
    () => import("@/demos/partial-derivative-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "total-differential": dynamic<DemoComponentProps>(
    () => import("@/demos/total-differential-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "multivariable-chain": dynamic<DemoComponentProps>(
    () => import("@/demos/multivariable-chain-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "implicit-surface": dynamic<DemoComponentProps>(
    () => import("@/demos/implicit-surface-demo"),
    { loading: () => <DemoLoading /> },
  ),

  "point-set": dynamic<DemoComponentProps>(
    () => import("@/demos/point-set-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "multivariable-domain": dynamic<DemoComponentProps>(
    () => import("@/demos/multivariable-domain-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "multivariable-limit": dynamic<DemoComponentProps>(
    () => import("@/demos/multivariable-limit-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "multivariable-continuity": dynamic<DemoComponentProps>(
    () => import("@/demos/multivariable-continuity-demo"),
    { loading: () => <DemoLoading /> },
  ),

  "directional-rate": dynamic<DemoComponentProps>(
    () => import("@/demos/directional-rate-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "boundary-orientation": dynamic<DemoComponentProps>(
    () => import("@/demos/boundary-orientation-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "green-circulation": dynamic<DemoComponentProps>(
    () => import("@/demos/green-circulation-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "path-independent": dynamic<DemoComponentProps>(
    () => import("@/demos/path-independent-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "arc-integral": dynamic<DemoComponentProps>(
    () => import("@/demos/arc-integral-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "vector-line": dynamic<DemoComponentProps>(
    () => import("@/demos/vector-line-demo"),
    { loading: () => <DemoLoading /> },
  ),

  "double-sum": dynamic<DemoComponentProps>(
    () => import("@/demos/double-sum-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "polar-area": dynamic<DemoComponentProps>(
    () => import("@/demos/polar-area-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "triple-box": dynamic<DemoComponentProps>(
    () => import("@/demos/triple-box-demo"),
    { loading: () => <DemoLoading /> },
  ),

  "partial-fractions": dynamic<DemoComponentProps>(
    () => import("@/demos/partial-fractions-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "element-sum": dynamic<DemoComponentProps>(
    () => import("@/demos/element-sum-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "between-curves": dynamic<DemoComponentProps>(
    () => import("@/demos/between-curves-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "solid-disk": dynamic<DemoComponentProps>(
    () => import("@/demos/solid-disk-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "variable-work": dynamic<DemoComponentProps>(
    () => import("@/demos/variable-work-demo"),
    { loading: () => <DemoLoading /> },
  ),

  "improper-p": dynamic<DemoComponentProps>(
    () => import("@/demos/improper-p-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "gamma-recurrence": dynamic<DemoComponentProps>(
    () => import("@/demos/gamma-recurrence-demo"),
    { loading: () => <DemoLoading /> },
  ),

  "upper-integral": dynamic<DemoComponentProps>(
    () => import("@/demos/upper-integral-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "newton-leibniz": dynamic<DemoComponentProps>(
    () => import("@/demos/newton-leibniz-demo"),
    { loading: () => <DemoLoading /> },
  ),

  "substitution-limits": dynamic<DemoComponentProps>(
    () => import("@/demos/substitution-limits-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "parts-boundary": dynamic<DemoComponentProps>(
    () => import("@/demos/parts-boundary-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "integral-symmetry": dynamic<DemoComponentProps>(
    () => import("@/demos/integral-symmetry-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "wallis-integral": dynamic<DemoComponentProps>(
    () => import("@/demos/wallis-integral-demo"),
    { loading: () => <DemoLoading /> },
  ),

  "ode-solution": dynamic<DemoComponentProps>(
    () => import("@/demos/ode-solution-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "separable-ode": dynamic<DemoComponentProps>(
    () => import("@/demos/separable-ode-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "homogeneous-ode": dynamic<DemoComponentProps>(
    () => import("@/demos/homogeneous-ode-demo"),
    { loading: () => <DemoLoading /> },
  ),

  "sine-limit": dynamic<DemoComponentProps>(
    () => import("@/demos/sine-limit-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "exponential-limit": dynamic<DemoComponentProps>(
    () => import("@/demos/exponential-limit-demo"),
    { loading: () => <DemoLoading /> },
  ),

  "angle-sum": dynamic<DemoComponentProps>(
    () => import("@/demos/angle-sum-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "trig-identity": dynamic<DemoComponentProps>(
    () => import("@/demos/trig-identity-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "trig-reduction": dynamic<DemoComponentProps>(
    () => import("@/demos/trig-reduction-demo"),
    { loading: () => <DemoLoading /> },
  ),

  "fermat-extremum": dynamic<DemoComponentProps>(
    () => import("@/demos/fermat-extremum-demo"),
    { loading: () => <DemoLoading /> },
  ),
  rolle: dynamic<DemoComponentProps>(() => import("@/demos/rolle-demo"), {
    loading: () => <DemoLoading />,
  }),
  "lagrange-mean": dynamic<DemoComponentProps>(
    () => import("@/demos/lagrange-mean-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "cauchy-mean": dynamic<DemoComponentProps>(
    () => import("@/demos/cauchy-mean-demo"),
    { loading: () => <DemoLoading /> },
  ),

  "chain-rule": dynamic<DemoComponentProps>(
    () => import("@/demos/chain-rule-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "differential-approx": dynamic<DemoComponentProps>(
    () => import("@/demos/differential-approx-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "implicit-slope": dynamic<DemoComponentProps>(
    () => import("@/demos/implicit-slope-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "inverse-derivative": dynamic<DemoComponentProps>(
    () => import("@/demos/inverse-derivative-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "parametric-slope": dynamic<DemoComponentProps>(
    () => import("@/demos/parametric-slope-demo"),
    { loading: () => <DemoLoading /> },
  ),

  discontinuity: dynamic<DemoComponentProps>(
    () => import("@/demos/discontinuity-demo"),
    { loading: () => <DemoLoading /> },
  ),
  infinitesimal: dynamic<DemoComponentProps>(
    () => import("@/demos/infinitesimal-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "limit-cancellation": dynamic<DemoComponentProps>(
    () => import("@/demos/limit-cancellation-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "power-exponential": dynamic<DemoComponentProps>(
    () => import("@/demos/power-exponential-demo"),
    { loading: () => <DemoLoading /> },
  ),

  "function-series": dynamic<DemoComponentProps>(
    () => import("@/demos/function-series-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "power-series": dynamic<DemoComponentProps>(
    () => import("@/demos/power-series-demo"),
    { loading: () => <DemoLoading /> },
  ),

  "p-series-test": dynamic<DemoComponentProps>(
    () => import("@/demos/p-series-test-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "alternating-series": dynamic<DemoComponentProps>(
    () => import("@/demos/alternating-series-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "absolute-convergence": dynamic<DemoComponentProps>(
    () => import("@/demos/absolute-convergence-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "cauchy-product": dynamic<DemoComponentProps>(
    () => import("@/demos/cauchy-product-demo"),
    { loading: () => <DemoLoading /> },
  ),

  "geometric-series": dynamic<DemoComponentProps>(
    () => import("@/demos/geometric-series-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "goodness-fit": dynamic<DemoComponentProps>(
    () => import("@/demos/goodness-fit-demo"),
    { loading: () => <DemoLoading /> },
  ),
  contingency: dynamic<DemoComponentProps>(
    () => import("@/demos/contingency-demo"),
    { loading: () => <DemoLoading /> },
  ),

  "test-decision": dynamic<DemoComponentProps>(
    () => import("@/demos/test-decision-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "test-errors": dynamic<DemoComponentProps>(
    () => import("@/demos/test-errors-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "p-value": dynamic<DemoComponentProps>(() => import("@/demos/p-value-demo"), {
    loading: () => <DemoLoading />,
  }),

  "sample-independence": dynamic<DemoComponentProps>(
    () => import("@/demos/sample-independence-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "sample-summary": dynamic<DemoComponentProps>(
    () => import("@/demos/sample-summary-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "empirical-cdf": dynamic<DemoComponentProps>(
    () => import("@/demos/empirical-cdf-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "order-statistics": dynamic<DemoComponentProps>(
    () => import("@/demos/order-statistics-demo"),
    { loading: () => <DemoLoading /> },
  ),

  "point-estimate": dynamic<DemoComponentProps>(
    () => import("@/demos/point-estimate-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "moment-estimate": dynamic<DemoComponentProps>(
    () => import("@/demos/moment-estimate-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "likelihood-bernoulli": dynamic<DemoComponentProps>(
    () => import("@/demos/likelihood-bernoulli-demo"),
    { loading: () => <DemoLoading /> },
  ),

  "estimator-bias": dynamic<DemoComponentProps>(
    () => import("@/demos/estimator-bias-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "estimator-mse": dynamic<DemoComponentProps>(
    () => import("@/demos/estimator-mse-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "estimator-consistency": dynamic<DemoComponentProps>(
    () => import("@/demos/estimator-consistency-demo"),
    { loading: () => <DemoLoading /> },
  ),

  "mips-branch": dynamic<DemoComponentProps>(
    () => import("@/demos/mips-branch-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "file-position": dynamic<DemoComponentProps>(
    () => import("@/demos/file-position-demo"),
    { loading: () => <DemoLoading /> },
  ),

  "python-format": dynamic<DemoComponentProps>(
    () => import("@/demos/python-format-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "python-power": dynamic<DemoComponentProps>(
    () => import("@/demos/python-power-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "precedence-comparison": dynamic<DemoComponentProps>(
    () => import("@/demos/precedence-comparison-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "c-pointer-precedence": dynamic<DemoComponentProps>(
    () => import("@/demos/c-pointer-precedence-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "c-data-model": dynamic<DemoComponentProps>(
    () => import("@/demos/c-data-model-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "c-printf-field": dynamic<DemoComponentProps>(
    () => import("@/demos/c-printf-field-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "c-scanf-space": dynamic<DemoComponentProps>(
    () => import("@/demos/c-scanf-space-demo"),
    { loading: () => <DemoLoading /> },
  ),

  "c-macro-grouping": dynamic<DemoComponentProps>(
    () => import("@/demos/c-macro-grouping-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "c-storage-duration": dynamic<DemoComponentProps>(
    () => import("@/demos/c-storage-duration-demo"),
    { loading: () => <DemoLoading /> },
  ),

  "python-builtins": dynamic<DemoComponentProps>(
    () => import("@/demos/python-builtins-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "python-sort": dynamic<DemoComponentProps>(
    () => import("@/demos/python-sort-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "python-append": dynamic<DemoComponentProps>(
    () => import("@/demos/python-append-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "python-range": dynamic<DemoComponentProps>(
    () => import("@/demos/python-range-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "python-zip": dynamic<DemoComponentProps>(
    () => import("@/demos/python-zip-demo"),
    { loading: () => <DemoLoading /> },
  ),

  "boot-stages": dynamic<DemoComponentProps>(
    () => import("@/demos/boot-stages-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "interrupt-flow": dynamic<DemoComponentProps>(
    () => import("@/demos/interrupt-flow-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "exception-cases": dynamic<DemoComponentProps>(
    () => import("@/demos/exception-cases-demo"),
    { loading: () => <DemoLoading /> },
  ),

  "path-resolution": dynamic<DemoComponentProps>(
    () => import("@/demos/path-resolution-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "python-open-mode": dynamic<DemoComponentProps>(
    () => import("@/demos/python-open-mode-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "c-update-stream": dynamic<DemoComponentProps>(
    () => import("@/demos/c-update-stream-demo"),
    { loading: () => <DemoLoading /> },
  ),
  privilege: dynamic<DemoComponentProps>(
    () => import("@/demos/privilege-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "system-call-flow": dynamic<DemoComponentProps>(
    () => import("@/demos/system-call-flow-demo"),
    { loading: () => <DemoLoading /> },
  ),

  "tcp-handshake": dynamic<DemoComponentProps>(
    () => import("@/demos/tcp-handshake-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "udp-datagram": dynamic<DemoComponentProps>(
    () => import("@/demos/udp-datagram-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "transport-boundaries": dynamic<DemoComponentProps>(
    () => import("@/demos/transport-boundaries-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "port-demux": dynamic<DemoComponentProps>(
    () => import("@/demos/port-demux-demo"),
    { loading: () => <DemoLoading /> },
  ),

  "ipv4-ttl": dynamic<DemoComponentProps>(
    () => import("@/demos/ipv4-ttl-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "ip-routing": dynamic<DemoComponentProps>(
    () => import("@/demos/ip-routing-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "ipv6-compression": dynamic<DemoComponentProps>(
    () => import("@/demos/ipv6-compression-demo"),
    { loading: () => <DemoLoading /> },
  ),

  "network-encapsulation": dynamic<DemoComponentProps>(
    () => import("@/demos/network-encapsulation-demo"),
    { loading: () => <DemoLoading /> },
  ),
  multiplexing: dynamic<DemoComponentProps>(
    () => import("@/demos/multiplexing-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "network-switching": dynamic<DemoComponentProps>(
    () => import("@/demos/network-switching-demo"),
    { loading: () => <DemoLoading /> },
  ),

  "cpu-cycle": dynamic<DemoComponentProps>(
    () => import("@/demos/cpu-cycle-demo"),
    { loading: () => <DemoLoading /> },
  ),
  scheduling: dynamic<DemoComponentProps>(
    () => import("@/demos/scheduling-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "process-state": dynamic<DemoComponentProps>(
    () => import("@/demos/process-state-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "ipv4-prefix": dynamic<DemoComponentProps>(
    () => import("@/demos/ipv4-prefix-demo"),
    { loading: () => <DemoLoading /> },
  ),

  "radix-place": dynamic<DemoComponentProps>(
    () => import("@/demos/radix-place-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "binary-addition": dynamic<DemoComponentProps>(
    () => import("@/demos/binary-addition-demo"),
    { loading: () => <DemoLoading /> },
  ),

  "fake-coin": dynamic<DemoComponentProps>(
    () => import("@/demos/fake-coin-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "merge-step": dynamic<DemoComponentProps>(
    () => import("@/demos/merge-step-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "maze-backtrack": dynamic<DemoComponentProps>(
    () => import("@/demos/maze-backtrack-demo"),
    { loading: () => <DemoLoading /> },
  ),

  "recursion-tree": dynamic<DemoComponentProps>(
    () => import("@/demos/recursion-tree-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "greedy-change": dynamic<DemoComponentProps>(
    () => import("@/demos/greedy-change-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "coin-dynamic": dynamic<DemoComponentProps>(
    () => import("@/demos/coin-dynamic-demo"),
    { loading: () => <DemoLoading /> },
  ),

  "large-numbers": dynamic<DemoComponentProps>(
    () => import("@/demos/large-numbers-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "random-transform": dynamic<DemoComponentProps>(
    () => import("@/demos/random-transform-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "binary-sum": dynamic<DemoComponentProps>(
    () => import("@/demos/binary-sum-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "random-vector-mapping": dynamic<DemoComponentProps>(
    () => import("@/demos/random-vector-mapping-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "normal-conditional": dynamic<DemoComponentProps>(
    () => import("@/demos/normal-conditional-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "joint-cdf": dynamic<DemoComponentProps>(
    () => import("@/demos/joint-cdf-demo"),
    { loading: () => <DemoLoading /> },
  ),

  "density-area": dynamic<DemoComponentProps>(
    () => import("@/demos/density-area-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "uniform-scale": dynamic<DemoComponentProps>(
    () => import("@/demos/uniform-scale-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "indicator-tosses": dynamic<DemoComponentProps>(
    () => import("@/demos/indicator-tosses-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "discrete-mass": dynamic<DemoComponentProps>(
    () => import("@/demos/discrete-mass-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "variance-shift": dynamic<DemoComponentProps>(
    () => import("@/demos/variance-shift-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "moment-asymmetry": dynamic<DemoComponentProps>(
    () => import("@/demos/moment-asymmetry-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "correlation-curve": dynamic<DemoComponentProps>(
    () => import("@/demos/correlation-curve-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "covariance-matrix": dynamic<DemoComponentProps>(
    () => import("@/demos/covariance-matrix-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "marginal-ambiguity": dynamic<DemoComponentProps>(
    () => import("@/demos/marginal-ambiguity-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "independent-variables": dynamic<DemoComponentProps>(
    () => import("@/demos/independent-variables-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "joint-region": dynamic<DemoComponentProps>(
    () => import("@/demos/joint-region-demo"),
    { loading: () => <DemoLoading /> },
  ),

  "conditional-dice": dynamic<DemoComponentProps>(
    () => import("@/demos/conditional-dice-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "conditional-distribution": dynamic<DemoComponentProps>(
    () => import("@/demos/conditional-distribution-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "conditional-mean": dynamic<DemoComponentProps>(
    () => import("@/demos/conditional-mean-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "binomial-count": dynamic<DemoComponentProps>(
    () => import("@/demos/binomial-count-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "geometric-wait": dynamic<DemoComponentProps>(
    () => import("@/demos/geometric-wait-demo"),
    { loading: () => <DemoLoading /> },
  ),

  "sample-space-pairs": dynamic<DemoComponentProps>(
    () => import("@/demos/sample-space-pairs-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "classical-dice": dynamic<DemoComponentProps>(
    () => import("@/demos/classical-dice-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "event-partition": dynamic<DemoComponentProps>(
    () => import("@/demos/event-partition-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "probability-addition": dynamic<DemoComponentProps>(
    () => import("@/demos/probability-addition-demo"),
    { loading: () => <DemoLoading /> },
  ),

  covariance: dynamic<DemoComponentProps>(
    () => import("@/demos/covariance-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "mean-variance": dynamic<DemoComponentProps>(
    () => import("@/demos/mean-variance-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "chebyshev-bound": dynamic<DemoComponentProps>(
    () => import("@/demos/chebyshev-bound-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "total-variance": dynamic<DemoComponentProps>(
    () => import("@/demos/total-variance-demo"),
    { loading: () => <DemoLoading /> },
  ),

  "joint-table": dynamic<DemoComponentProps>(
    () => import("@/demos/joint-table-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "joint-triangle": dynamic<DemoComponentProps>(
    () => import("@/demos/joint-triangle-demo"),
    { loading: () => <DemoLoading /> },
  ),

  "poisson-count": dynamic<DemoComponentProps>(
    () => import("@/demos/poisson-count-demo"),
    { loading: () => <DemoLoading /> },
  ),
  hypergeometric: dynamic<DemoComponentProps>(
    () => import("@/demos/hypergeometric-demo"),
    { loading: () => <DemoLoading /> },
  ),

  "exponential-tail": dynamic<DemoComponentProps>(
    () => import("@/demos/exponential-tail-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "random-variable-mapping": dynamic<DemoComponentProps>(
    () => import("@/demos/random-variable-mapping-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "distribution-function": dynamic<DemoComponentProps>(
    () => import("@/demos/distribution-function-demo"),
    { loading: () => <DemoLoading /> },
  ),

  "total-probability": dynamic<DemoComponentProps>(
    () => import("@/demos/total-probability-demo"),
    { loading: () => <DemoLoading /> },
  ),
  independence: dynamic<DemoComponentProps>(
    () => import("@/demos/independence-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "bernoulli-trials": dynamic<DemoComponentProps>(
    () => import("@/demos/bernoulli-trials-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "system-reliability": dynamic<DemoComponentProps>(
    () => import("@/demos/system-reliability-demo"),
    { loading: () => <DemoLoading /> },
  ),

  "uniform-interval": dynamic<DemoComponentProps>(
    () => import("@/demos/uniform-interval-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "event-operations": dynamic<DemoComponentProps>(
    () => import("@/demos/event-operations-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "central-limit": dynamic<DemoComponentProps>(
    () => import("@/demos/central-limit-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "vector-product": dynamic<DemoComponentProps>(
    () => import("@/demos/vector-product-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "recursion-stack": dynamic<DemoComponentProps>(
    () => import("@/demos/recursion-stack-demo"),
    { loading: () => <DemoLoading /> },
  ),
  continuity: dynamic<DemoComponentProps>(
    () => import("@/demos/continuity-demo"),
    { loading: () => <DemoLoading /> },
  ),
  derivative: dynamic<DemoComponentProps>(
    () => import("@/demos/derivative-demo"),
    { loading: () => <DemoLoading /> },
  ),
  riemann: dynamic<DemoComponentProps>(() => import("@/demos/riemann-demo"), {
    loading: () => <DemoLoading />,
  }),
  taylor: dynamic<DemoComponentProps>(() => import("@/demos/taylor-demo"), {
    loading: () => <DemoLoading />,
  }),
  normal: dynamic<DemoComponentProps>(() => import("@/demos/normal-demo"), {
    loading: () => <DemoLoading />,
  }),
  float: dynamic<DemoComponentProps>(() => import("@/demos/float-demo"), {
    loading: () => <DemoLoading />,
  }),
  "signed-integer": dynamic<DemoComponentProps>(
    () => import("@/demos/signed-integer-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "python-slice": dynamic<DemoComponentProps>(
    () => import("@/demos/python-slice-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "python-mutability": dynamic<DemoComponentProps>(
    () => import("@/demos/python-mutability-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "pointer-arithmetic": dynamic<DemoComponentProps>(
    () => import("@/demos/pointer-arithmetic-demo"),
    { loading: () => <DemoLoading /> },
  ),
  bayes: dynamic<DemoComponentProps>(() => import("@/demos/bayes-demo"), {
    loading: () => <DemoLoading />,
  }),
  gradient: dynamic<DemoComponentProps>(() => import("@/demos/gradient-demo"), {
    loading: () => <DemoLoading />,
  }),
  "unit-circle": dynamic<DemoComponentProps>(
    () => import("@/demos/unit-circle-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "inverse-trig": dynamic<DemoComponentProps>(
    () => import("@/demos/inverse-trig-demo"),
    { loading: () => <DemoLoading /> },
  ),
  "trig-derivative": dynamic<DemoComponentProps>(
    () => import("@/demos/trig-derivative-demo"),
    { loading: () => <DemoLoading /> },
  ),
} satisfies Record<DemoId, ComponentType<DemoComponentProps>>;
function DemoLoading() {
  return <DemoPlaceholder />;
}
function DemoFailure({ retry }: { retry: () => void }) {
  const t = useTranslations();
  return (
    <div className="demo-error" role="alert">
      <p>{t("demoUi.failed")}</p>
      <Button variant="outline" size="sm" onClick={retry}>
        {t("demoUi.retry")}
      </Button>
    </div>
  );
}
function DemoStaticFallback({ record }: { record: DemoRecord }) {
  return (
    <section
      lang={record.locale}
      className="interactive-demo demo-static-fallback"
      aria-label={record.title.text}
      data-demo-state="loading"
    >
      <div className="demo-header">
        <h3>
          <MarkdownText value={record.title} />
        </h3>
      </div>
      <MarkdownText
        as="div"
        className="demo-intro"
        value={record.description}
      />
      <DemoPlaceholder />
    </section>
  );
}
class DemoBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  override state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  override render() {
    return this.state.failed ? (
      <DemoFailure retry={() => this.setState({ failed: false })} />
    ) : (
      this.props.children
    );
  }
}
export function DemoRenderer({ record }: { record: DemoRecord }) {
  const Demo = components[record.id];
  return (
    <ClientReady fallback={<DemoStaticFallback record={record} />}>
      <DemoBoundary key={record.id}>
        <Demo
          title={record.title}
          locale={record.locale}
          messages={record.messages}
        />
      </DemoBoundary>
    </ClientReady>
  );
}
const Records = createContext<Record<string, DemoRecord>>({});
export function DemoProvider({
  records,
  children,
}: {
  records: Record<string, DemoRecord>;
  children: ReactNode;
}) {
  return <Records value={records}>{children}</Records>;
}
export function DemoMount({ id }: { id: string }) {
  const t = useTranslations();
  const records = useContext(Records);
  const record = records[id];
  return record ? (
    <DemoRenderer record={record} />
  ) : (
    <p role="status">{t("demoUi.missing")}</p>
  );
}

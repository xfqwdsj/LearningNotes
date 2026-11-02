import { defaultLocale } from "@/i18n/config";
import { selectTranslation } from "@/i18n/content";
import regression_diagnostics from "./metadata/regression-diagnostics.json" with { type: "json" };
import multiple_regression_prediction from "./metadata/multiple-regression-prediction.json" with { type: "json" };
import nested_regression from "./metadata/nested-regression.json" with { type: "json" };
import multiple_coefficient from "./metadata/multiple-coefficient.json" with { type: "json" };
import multiple_regression_tests from "./metadata/multiple-regression-tests.json" with { type: "json" };
import multiple_regression from "./metadata/multiple-regression.json" with { type: "json" };
import regression_prediction from "./metadata/regression-prediction.json" with { type: "json" };
import regression_slope_inference from "./metadata/regression-slope-inference.json" with { type: "json" };
import simple_regression from "./metadata/simple-regression.json" with { type: "json" };
import anova_groups from "./metadata/anova-groups.json" with { type: "json" };
import interval_estimation from "./metadata/interval-estimation.json" with { type: "json" };
import mean_confidence_interval from "./metadata/mean-confidence-interval.json" with { type: "json" };
import variance_confidence_interval from "./metadata/variance-confidence-interval.json" with { type: "json" };
import independent_mean_confidence_interval from "./metadata/independent-mean-confidence-interval.json" with { type: "json" };
import paired_mean_confidence_interval from "./metadata/paired-mean-confidence-interval.json" with { type: "json" };
import variance_ratio_confidence_interval from "./metadata/variance-ratio-confidence-interval.json" with { type: "json" };
import wald_confidence_interval from "./metadata/wald-confidence-interval.json" with { type: "json" };
import iterated_slices from "./metadata/iterated-slices.json" with { type: "json" };
import cartesian_region from "./metadata/cartesian-region.json" with { type: "json" };
import triple_slice from "./metadata/triple-slice.json" with { type: "json" };
import cylindrical_volume from "./metadata/cylindrical-volume.json" with { type: "json" };
import spherical_volume from "./metadata/spherical-volume.json" with { type: "json" };
import one_mean_test from "./metadata/one-mean-test.json" with { type: "json" };
import one_variance_test from "./metadata/one-variance-test.json" with { type: "json" };
import two_mean_test from "./metadata/two-mean-test.json" with { type: "json" };
import paired_test from "./metadata/paired-test.json" with { type: "json" };
import variance_ratio_test from "./metadata/variance-ratio-test.json" with { type: "json" };
import quantile_tail from "./metadata/quantile-tail.json" with { type: "json" };
import chi_square from "./metadata/chi-square.json" with { type: "json" };
import t_construction from "./metadata/t-construction.json" with { type: "json" };
import f_ratio from "./metadata/f-ratio.json" with { type: "json" };
import sampling_mean from "./metadata/sampling-mean.json" with { type: "json" };
import surface_section from "./metadata/surface-section.json" with { type: "json" };
import revolution_surface from "./metadata/revolution-surface.json" with { type: "json" };
import cylinder_surface from "./metadata/cylinder-surface.json" with { type: "json" };
import quadric_section from "./metadata/quadric-section.json" with { type: "json" };
import vector_addition from "./metadata/vector-addition.json" with { type: "json" };
import space_line from "./metadata/space-line.json" with { type: "json" };
import plane_point from "./metadata/plane-point.json" with { type: "json" };
import curve_projection from "./metadata/curve-projection.json" with { type: "json" };
import dot_product from "./metadata/dot-product.json" with { type: "json" };
import mixed_product from "./metadata/mixed-product.json" with { type: "json" };
import vector_function from "./metadata/vector-function.json" with { type: "json" };
import curve_tangent from "./metadata/curve-tangent.json" with { type: "json" };
import surface_tangent from "./metadata/surface-tangent.json" with { type: "json" };
import local_extrema from "./metadata/local-extrema.json" with { type: "json" };
import global_extrema from "./metadata/global-extrema.json" with { type: "json" };
import lagrange_multiplier from "./metadata/lagrange-multiplier.json" with { type: "json" };
import partial_derivative from "./metadata/partial-derivative.json" with { type: "json" };
import total_differential from "./metadata/total-differential.json" with { type: "json" };
import multivariable_chain from "./metadata/multivariable-chain.json" with { type: "json" };
import implicit_surface from "./metadata/implicit-surface.json" with { type: "json" };
import point_set from "./metadata/point-set.json" with { type: "json" };
import multivariable_domain from "./metadata/multivariable-domain.json" with { type: "json" };
import multivariable_limit from "./metadata/multivariable-limit.json" with { type: "json" };
import multivariable_continuity from "./metadata/multivariable-continuity.json" with { type: "json" };
import directional_rate from "./metadata/directional-rate.json" with { type: "json" };
import boundary_orientation from "./metadata/boundary-orientation.json" with { type: "json" };
import green_circulation from "./metadata/green-circulation.json" with { type: "json" };
import path_independent from "./metadata/path-independent.json" with { type: "json" };
import arc_integral from "./metadata/arc-integral.json" with { type: "json" };
import vector_line from "./metadata/vector-line.json" with { type: "json" };
import double_sum from "./metadata/double-sum.json" with { type: "json" };
import polar_area from "./metadata/polar-area.json" with { type: "json" };
import triple_box from "./metadata/triple-box.json" with { type: "json" };
import partial_fractions from "./metadata/partial-fractions.json" with { type: "json" };
import element_sum from "./metadata/element-sum.json" with { type: "json" };
import between_curves from "./metadata/between-curves.json" with { type: "json" };
import solid_disk from "./metadata/solid-disk.json" with { type: "json" };
import variable_work from "./metadata/variable-work.json" with { type: "json" };
import improper_p from "./metadata/improper-p.json" with { type: "json" };
import gamma_recurrence from "./metadata/gamma-recurrence.json" with { type: "json" };
import upper_integral from "./metadata/upper-integral.json" with { type: "json" };
import newton_leibniz from "./metadata/newton-leibniz.json" with { type: "json" };
import substitution_limits from "./metadata/substitution-limits.json" with { type: "json" };
import parts_boundary from "./metadata/parts-boundary.json" with { type: "json" };
import integral_symmetry from "./metadata/integral-symmetry.json" with { type: "json" };
import wallis_integral from "./metadata/wallis-integral.json" with { type: "json" };
import ode_solution from "./metadata/ode-solution.json" with { type: "json" };
import separable_ode from "./metadata/separable-ode.json" with { type: "json" };
import homogeneous_ode from "./metadata/homogeneous-ode.json" with { type: "json" };
import sine_limit from "./metadata/sine-limit.json" with { type: "json" };
import exponential_limit from "./metadata/exponential-limit.json" with { type: "json" };
import angle_sum from "./metadata/angle-sum.json" with { type: "json" };
import trig_identity from "./metadata/trig-identity.json" with { type: "json" };
import trig_reduction from "./metadata/trig-reduction.json" with { type: "json" };
import fermat_extremum from "./metadata/fermat-extremum.json" with { type: "json" };
import rolle from "./metadata/rolle.json" with { type: "json" };
import lagrange_mean from "./metadata/lagrange-mean.json" with { type: "json" };
import cauchy_mean from "./metadata/cauchy-mean.json" with { type: "json" };
import chain_rule from "./metadata/chain-rule.json" with { type: "json" };
import differential_approx from "./metadata/differential-approx.json" with { type: "json" };
import implicit_slope from "./metadata/implicit-slope.json" with { type: "json" };
import inverse_derivative from "./metadata/inverse-derivative.json" with { type: "json" };
import parametric_slope from "./metadata/parametric-slope.json" with { type: "json" };
import discontinuity from "./metadata/discontinuity.json" with { type: "json" };
import infinitesimal from "./metadata/infinitesimal.json" with { type: "json" };
import limit_cancellation from "./metadata/limit-cancellation.json" with { type: "json" };
import power_exponential from "./metadata/power-exponential.json" with { type: "json" };
import function_series from "./metadata/function-series.json" with { type: "json" };
import power_series from "./metadata/power-series.json" with { type: "json" };
import p_series_test from "./metadata/p-series-test.json" with { type: "json" };
import alternating_series from "./metadata/alternating-series.json" with { type: "json" };
import absolute_convergence from "./metadata/absolute-convergence.json" with { type: "json" };
import cauchy_product from "./metadata/cauchy-product.json" with { type: "json" };
import geometric_series from "./metadata/geometric-series.json" with { type: "json" };
import goodness_fit from "./metadata/goodness-fit.json" with { type: "json" };
import contingency from "./metadata/contingency.json" with { type: "json" };
import test_decision from "./metadata/test-decision.json" with { type: "json" };
import test_errors from "./metadata/test-errors.json" with { type: "json" };
import p_value from "./metadata/p-value.json" with { type: "json" };
import sample_independence from "./metadata/sample-independence.json" with { type: "json" };
import sample_summary from "./metadata/sample-summary.json" with { type: "json" };
import empirical_cdf from "./metadata/empirical-cdf.json" with { type: "json" };
import order_statistics from "./metadata/order-statistics.json" with { type: "json" };
import point_estimate from "./metadata/point-estimate.json" with { type: "json" };
import moment_estimate from "./metadata/moment-estimate.json" with { type: "json" };
import likelihood_bernoulli from "./metadata/likelihood-bernoulli.json" with { type: "json" };
import estimator_bias from "./metadata/estimator-bias.json" with { type: "json" };
import estimator_mse from "./metadata/estimator-mse.json" with { type: "json" };
import estimator_consistency from "./metadata/estimator-consistency.json" with { type: "json" };
import mips_branch from "./metadata/mips-branch.json" with { type: "json" };
import file_position from "./metadata/file-position.json" with { type: "json" };
import python_format from "./metadata/python-format.json" with { type: "json" };
import python_power from "./metadata/python-power.json" with { type: "json" };
import precedence_comparison from "./metadata/precedence-comparison.json" with { type: "json" };
import c_pointer_precedence from "./metadata/c-pointer-precedence.json" with { type: "json" };
import c_data_model from "./metadata/c-data-model.json" with { type: "json" };
import c_printf_field from "./metadata/c-printf-field.json" with { type: "json" };
import c_scanf_space from "./metadata/c-scanf-space.json" with { type: "json" };
import c_macro_grouping from "./metadata/c-macro-grouping.json" with { type: "json" };
import c_storage_duration from "./metadata/c-storage-duration.json" with { type: "json" };
import python_builtins from "./metadata/python-builtins.json" with { type: "json" };
import python_sort from "./metadata/python-sort.json" with { type: "json" };
import python_append from "./metadata/python-append.json" with { type: "json" };
import python_range from "./metadata/python-range.json" with { type: "json" };
import python_zip from "./metadata/python-zip.json" with { type: "json" };
import boot_stages from "./metadata/boot-stages.json" with { type: "json" };
import interrupt_flow from "./metadata/interrupt-flow.json" with { type: "json" };
import exception_cases from "./metadata/exception-cases.json" with { type: "json" };
import path_resolution from "./metadata/path-resolution.json" with { type: "json" };
import python_open_mode from "./metadata/python-open-mode.json" with { type: "json" };
import c_update_stream from "./metadata/c-update-stream.json" with { type: "json" };
import privilege from "./metadata/privilege.json" with { type: "json" };
import system_call_flow from "./metadata/system-call-flow.json" with { type: "json" };
import tcp_handshake from "./metadata/tcp-handshake.json" with { type: "json" };
import udp_datagram from "./metadata/udp-datagram.json" with { type: "json" };
import transport_boundaries from "./metadata/transport-boundaries.json" with { type: "json" };
import port_demux from "./metadata/port-demux.json" with { type: "json" };
import ipv4_ttl from "./metadata/ipv4-ttl.json" with { type: "json" };
import ip_routing from "./metadata/ip-routing.json" with { type: "json" };
import ipv6_compression from "./metadata/ipv6-compression.json" with { type: "json" };
import network_encapsulation from "./metadata/network-encapsulation.json" with { type: "json" };
import multiplexing from "./metadata/multiplexing.json" with { type: "json" };
import network_switching from "./metadata/network-switching.json" with { type: "json" };
import cpu_cycle from "./metadata/cpu-cycle.json" with { type: "json" };
import scheduling from "./metadata/scheduling.json" with { type: "json" };
import process_state from "./metadata/process-state.json" with { type: "json" };
import ipv4_prefix from "./metadata/ipv4-prefix.json" with { type: "json" };
import radix_place from "./metadata/radix-place.json" with { type: "json" };
import binary_addition from "./metadata/binary-addition.json" with { type: "json" };
import fake_coin from "./metadata/fake-coin.json" with { type: "json" };
import merge_step from "./metadata/merge-step.json" with { type: "json" };
import maze_backtrack from "./metadata/maze-backtrack.json" with { type: "json" };
import recursion_tree from "./metadata/recursion-tree.json" with { type: "json" };
import greedy_change from "./metadata/greedy-change.json" with { type: "json" };
import coin_dynamic from "./metadata/coin-dynamic.json" with { type: "json" };
import large_numbers from "./metadata/large-numbers.json" with { type: "json" };
import random_transform from "./metadata/random-transform.json" with { type: "json" };
import binary_sum from "./metadata/binary-sum.json" with { type: "json" };
import random_vector_mapping from "./metadata/random-vector-mapping.json" with { type: "json" };
import normal_conditional from "./metadata/normal-conditional.json" with { type: "json" };
import joint_cdf from "./metadata/joint-cdf.json" with { type: "json" };
import density_area from "./metadata/density-area.json" with { type: "json" };
import uniform_scale from "./metadata/uniform-scale.json" with { type: "json" };
import indicator_tosses from "./metadata/indicator-tosses.json" with { type: "json" };
import discrete_mass from "./metadata/discrete-mass.json" with { type: "json" };
import variance_shift from "./metadata/variance-shift.json" with { type: "json" };
import moment_asymmetry from "./metadata/moment-asymmetry.json" with { type: "json" };
import correlation_curve from "./metadata/correlation-curve.json" with { type: "json" };
import covariance_matrix from "./metadata/covariance-matrix.json" with { type: "json" };
import marginal_ambiguity from "./metadata/marginal-ambiguity.json" with { type: "json" };
import independent_variables from "./metadata/independent-variables.json" with { type: "json" };
import joint_region from "./metadata/joint-region.json" with { type: "json" };
import conditional_dice from "./metadata/conditional-dice.json" with { type: "json" };
import conditional_distribution from "./metadata/conditional-distribution.json" with { type: "json" };
import conditional_mean from "./metadata/conditional-mean.json" with { type: "json" };
import binomial_count from "./metadata/binomial-count.json" with { type: "json" };
import geometric_wait from "./metadata/geometric-wait.json" with { type: "json" };
import sample_space_pairs from "./metadata/sample-space-pairs.json" with { type: "json" };
import classical_dice from "./metadata/classical-dice.json" with { type: "json" };
import event_partition from "./metadata/event-partition.json" with { type: "json" };
import probability_addition from "./metadata/probability-addition.json" with { type: "json" };
import covariance from "./metadata/covariance.json" with { type: "json" };
import mean_variance from "./metadata/mean-variance.json" with { type: "json" };
import chebyshev_bound from "./metadata/chebyshev-bound.json" with { type: "json" };
import total_variance from "./metadata/total-variance.json" with { type: "json" };
import joint_table from "./metadata/joint-table.json" with { type: "json" };
import joint_triangle from "./metadata/joint-triangle.json" with { type: "json" };
import poisson_count from "./metadata/poisson-count.json" with { type: "json" };
import hypergeometric from "./metadata/hypergeometric.json" with { type: "json" };
import exponential_tail from "./metadata/exponential-tail.json" with { type: "json" };
import random_variable_mapping from "./metadata/random-variable-mapping.json" with { type: "json" };
import distribution_function from "./metadata/distribution-function.json" with { type: "json" };
import total_probability from "./metadata/total-probability.json" with { type: "json" };
import independence from "./metadata/independence.json" with { type: "json" };
import bernoulli_trials from "./metadata/bernoulli-trials.json" with { type: "json" };
import system_reliability from "./metadata/system-reliability.json" with { type: "json" };
import uniform_interval from "./metadata/uniform-interval.json" with { type: "json" };
import event_operations from "./metadata/event-operations.json" with { type: "json" };
import central_limit from "./metadata/central-limit.json" with { type: "json" };
import unit_circle from "./metadata/unit-circle.json" with { type: "json" };
import inverse_trig from "./metadata/inverse-trig.json" with { type: "json" };
import trig_derivative from "./metadata/trig-derivative.json" with { type: "json" };
import vector_product from "./metadata/vector-product.json" with { type: "json" };
import recursion_stack from "./metadata/recursion-stack.json" with { type: "json" };
import signed_integer from "./metadata/signed-integer.json" with { type: "json" };
import python_slice from "./metadata/python-slice.json" with { type: "json" };
import python_mutability from "./metadata/python-mutability.json" with { type: "json" };
import pointer_arithmetic from "./metadata/pointer-arithmetic.json" with { type: "json" };
import bayes from "./metadata/bayes.json" with { type: "json" };
import gradient from "./metadata/gradient.json" with { type: "json" };
import continuity from "./metadata/continuity.json" with { type: "json" };
import derivative from "./metadata/derivative.json" with { type: "json" };
import riemann from "./metadata/riemann.json" with { type: "json" };
import taylor from "./metadata/taylor.json" with { type: "json" };
import normal from "./metadata/normal.json" with { type: "json" };
import float from "./metadata/float.json" with { type: "json" };
import type { DemoId, DemoRecord, DemoReference } from "./types";
import { prepareDemoDefinition } from "./definition";
function describe(id: DemoId, definition: unknown) {
  return {
    ...prepareDemoDefinition(definition),
    importPath: `@/demos/${id}-demo`,
  };
}
export const demoCatalog = {
  "regression-diagnostics": describe(
    "regression-diagnostics",
    regression_diagnostics,
  ),
  "multiple-regression-prediction": describe(
    "multiple-regression-prediction",
    multiple_regression_prediction,
  ),
  "nested-regression": describe("nested-regression", nested_regression),
  "multiple-coefficient": describe(
    "multiple-coefficient",
    multiple_coefficient,
  ),
  "multiple-regression-tests": describe(
    "multiple-regression-tests",
    multiple_regression_tests,
  ),
  "multiple-regression": describe("multiple-regression", multiple_regression),
  "regression-prediction": describe(
    "regression-prediction",
    regression_prediction,
  ),
  "regression-slope-inference": describe(
    "regression-slope-inference",
    regression_slope_inference,
  ),
  "simple-regression": describe("simple-regression", simple_regression),
  "anova-groups": describe("anova-groups", anova_groups),
  "interval-estimation": describe("interval-estimation", interval_estimation),
  "mean-confidence-interval": describe(
    "mean-confidence-interval",
    mean_confidence_interval,
  ),
  "variance-confidence-interval": describe(
    "variance-confidence-interval",
    variance_confidence_interval,
  ),
  "independent-mean-confidence-interval": describe(
    "independent-mean-confidence-interval",
    independent_mean_confidence_interval,
  ),
  "paired-mean-confidence-interval": describe(
    "paired-mean-confidence-interval",
    paired_mean_confidence_interval,
  ),
  "variance-ratio-confidence-interval": describe(
    "variance-ratio-confidence-interval",
    variance_ratio_confidence_interval,
  ),
  "wald-confidence-interval": describe(
    "wald-confidence-interval",
    wald_confidence_interval,
  ),

  "iterated-slices": describe("iterated-slices", iterated_slices),
  "cartesian-region": describe("cartesian-region", cartesian_region),
  "triple-slice": describe("triple-slice", triple_slice),
  "cylindrical-volume": describe("cylindrical-volume", cylindrical_volume),
  "spherical-volume": describe("spherical-volume", spherical_volume),

  "python-format": describe("python-format", python_format),
  "python-power": describe("python-power", python_power),
  "precedence-comparison": describe(
    "precedence-comparison",
    precedence_comparison,
  ),
  "c-pointer-precedence": describe(
    "c-pointer-precedence",
    c_pointer_precedence,
  ),
  "c-data-model": describe("c-data-model", c_data_model),
  "c-printf-field": describe("c-printf-field", c_printf_field),
  "c-scanf-space": describe("c-scanf-space", c_scanf_space),
  "mips-branch": describe("mips-branch", mips_branch),
  "file-position": describe("file-position", file_position),
  "estimator-bias": describe("estimator-bias", estimator_bias),
  "estimator-mse": describe("estimator-mse", estimator_mse),
  "estimator-consistency": describe(
    "estimator-consistency",
    estimator_consistency,
  ),
  "point-estimate": describe("point-estimate", point_estimate),
  "moment-estimate": describe("moment-estimate", moment_estimate),
  "likelihood-bernoulli": describe(
    "likelihood-bernoulli",
    likelihood_bernoulli,
  ),
  "sample-independence": describe("sample-independence", sample_independence),
  "sample-summary": describe("sample-summary", sample_summary),
  "empirical-cdf": describe("empirical-cdf", empirical_cdf),
  "order-statistics": describe("order-statistics", order_statistics),
  "test-decision": describe("test-decision", test_decision),
  "test-errors": describe("test-errors", test_errors),
  "p-value": describe("p-value", p_value),
  "goodness-fit": describe("goodness-fit", goodness_fit),
  contingency: describe("contingency", contingency),
  "geometric-series": describe("geometric-series", geometric_series),
  "p-series-test": describe("p-series-test", p_series_test),
  "alternating-series": describe("alternating-series", alternating_series),
  "absolute-convergence": describe(
    "absolute-convergence",
    absolute_convergence,
  ),
  "cauchy-product": describe("cauchy-product", cauchy_product),
  "function-series": describe("function-series", function_series),
  "power-series": describe("power-series", power_series),
  discontinuity: describe("discontinuity", discontinuity),
  infinitesimal: describe("infinitesimal", infinitesimal),
  "limit-cancellation": describe("limit-cancellation", limit_cancellation),
  "power-exponential": describe("power-exponential", power_exponential),
  "chain-rule": describe("chain-rule", chain_rule),
  "differential-approx": describe("differential-approx", differential_approx),
  "implicit-slope": describe("implicit-slope", implicit_slope),
  "inverse-derivative": describe("inverse-derivative", inverse_derivative),
  "parametric-slope": describe("parametric-slope", parametric_slope),
  "fermat-extremum": describe("fermat-extremum", fermat_extremum),
  rolle: describe("rolle", rolle),
  "lagrange-mean": describe("lagrange-mean", lagrange_mean),
  "cauchy-mean": describe("cauchy-mean", cauchy_mean),
  "trig-identity": describe("trig-identity", trig_identity),
  "trig-reduction": describe("trig-reduction", trig_reduction),
  "angle-sum": describe("angle-sum", angle_sum),
  "sine-limit": describe("sine-limit", sine_limit),
  "exponential-limit": describe("exponential-limit", exponential_limit),
  "ode-solution": describe("ode-solution", ode_solution),
  "separable-ode": describe("separable-ode", separable_ode),
  "homogeneous-ode": describe("homogeneous-ode", homogeneous_ode),
  "substitution-limits": describe("substitution-limits", substitution_limits),
  "parts-boundary": describe("parts-boundary", parts_boundary),
  "integral-symmetry": describe("integral-symmetry", integral_symmetry),
  "wallis-integral": describe("wallis-integral", wallis_integral),
  "upper-integral": describe("upper-integral", upper_integral),
  "newton-leibniz": describe("newton-leibniz", newton_leibniz),
  "improper-p": describe("improper-p", improper_p),
  "gamma-recurrence": describe("gamma-recurrence", gamma_recurrence),
  "element-sum": describe("element-sum", element_sum),
  "between-curves": describe("between-curves", between_curves),
  "solid-disk": describe("solid-disk", solid_disk),
  "variable-work": describe("variable-work", variable_work),
  "partial-fractions": describe("partial-fractions", partial_fractions),
  "double-sum": describe("double-sum", double_sum),
  "polar-area": describe("polar-area", polar_area),
  "triple-box": describe("triple-box", triple_box),
  "green-circulation": describe("green-circulation", green_circulation),
  "path-independent": describe("path-independent", path_independent),
  "arc-integral": describe("arc-integral", arc_integral),
  "vector-line": describe("vector-line", vector_line),
  "boundary-orientation": describe(
    "boundary-orientation",
    boundary_orientation,
  ),
  "directional-rate": describe("directional-rate", directional_rate),
  "point-set": describe("point-set", point_set),
  "multivariable-domain": describe(
    "multivariable-domain",
    multivariable_domain,
  ),
  "multivariable-limit": describe("multivariable-limit", multivariable_limit),
  "multivariable-continuity": describe(
    "multivariable-continuity",
    multivariable_continuity,
  ),
  "partial-derivative": describe("partial-derivative", partial_derivative),
  "total-differential": describe("total-differential", total_differential),
  "multivariable-chain": describe("multivariable-chain", multivariable_chain),
  "implicit-surface": describe("implicit-surface", implicit_surface),
  "local-extrema": describe("local-extrema", local_extrema),
  "global-extrema": describe("global-extrema", global_extrema),
  "lagrange-multiplier": describe("lagrange-multiplier", lagrange_multiplier),
  "vector-function": describe("vector-function", vector_function),
  "curve-tangent": describe("curve-tangent", curve_tangent),
  "surface-tangent": describe("surface-tangent", surface_tangent),
  "dot-product": describe("dot-product", dot_product),
  "mixed-product": describe("mixed-product", mixed_product),
  "surface-section": describe("surface-section", surface_section),
  "revolution-surface": describe("revolution-surface", revolution_surface),
  "cylinder-surface": describe("cylinder-surface", cylinder_surface),
  "quadric-section": describe("quadric-section", quadric_section),
  "vector-addition": describe("vector-addition", vector_addition),
  "space-line": describe("space-line", space_line),
  "plane-point": describe("plane-point", plane_point),
  "curve-projection": describe("curve-projection", curve_projection),
  "quantile-tail": describe("quantile-tail", quantile_tail),
  "chi-square": describe("chi-square", chi_square),
  "t-construction": describe("t-construction", t_construction),
  "f-ratio": describe("f-ratio", f_ratio),
  "sampling-mean": describe("sampling-mean", sampling_mean),
  "one-mean-test": describe("one-mean-test", one_mean_test),
  "one-variance-test": describe("one-variance-test", one_variance_test),
  "two-mean-test": describe("two-mean-test", two_mean_test),
  "paired-test": describe("paired-test", paired_test),
  "variance-ratio-test": describe("variance-ratio-test", variance_ratio_test),
  "c-macro-grouping": describe("c-macro-grouping", c_macro_grouping),
  "c-storage-duration": describe("c-storage-duration", c_storage_duration),

  "python-builtins": describe("python-builtins", python_builtins),
  "python-sort": describe("python-sort", python_sort),
  "python-append": describe("python-append", python_append),
  "python-range": describe("python-range", python_range),
  "python-zip": describe("python-zip", python_zip),

  "boot-stages": describe("boot-stages", boot_stages),
  "interrupt-flow": describe("interrupt-flow", interrupt_flow),
  "exception-cases": describe("exception-cases", exception_cases),

  "path-resolution": describe("path-resolution", path_resolution),
  "python-open-mode": describe("python-open-mode", python_open_mode),
  "c-update-stream": describe("c-update-stream", c_update_stream),
  privilege: describe("privilege", privilege),
  "system-call-flow": describe("system-call-flow", system_call_flow),

  "tcp-handshake": describe("tcp-handshake", tcp_handshake),
  "udp-datagram": describe("udp-datagram", udp_datagram),
  "transport-boundaries": describe(
    "transport-boundaries",
    transport_boundaries,
  ),
  "port-demux": describe("port-demux", port_demux),

  "ipv4-ttl": describe("ipv4-ttl", ipv4_ttl),
  "ip-routing": describe("ip-routing", ip_routing),
  "ipv6-compression": describe("ipv6-compression", ipv6_compression),

  "network-encapsulation": describe(
    "network-encapsulation",
    network_encapsulation,
  ),
  multiplexing: describe("multiplexing", multiplexing),
  "network-switching": describe("network-switching", network_switching),

  "cpu-cycle": describe("cpu-cycle", cpu_cycle),
  scheduling: describe("scheduling", scheduling),
  "process-state": describe("process-state", process_state),
  "ipv4-prefix": describe("ipv4-prefix", ipv4_prefix),

  "radix-place": describe("radix-place", radix_place),
  "binary-addition": describe("binary-addition", binary_addition),

  "fake-coin": describe("fake-coin", fake_coin),
  "merge-step": describe("merge-step", merge_step),
  "maze-backtrack": describe("maze-backtrack", maze_backtrack),

  "recursion-tree": describe("recursion-tree", recursion_tree),
  "greedy-change": describe("greedy-change", greedy_change),
  "coin-dynamic": describe("coin-dynamic", coin_dynamic),

  "large-numbers": describe("large-numbers", large_numbers),
  "random-transform": describe("random-transform", random_transform),
  "binary-sum": describe("binary-sum", binary_sum),
  "random-vector-mapping": describe(
    "random-vector-mapping",
    random_vector_mapping,
  ),
  "normal-conditional": describe("normal-conditional", normal_conditional),
  "joint-cdf": describe("joint-cdf", joint_cdf),

  "density-area": describe("density-area", density_area),
  "uniform-scale": describe("uniform-scale", uniform_scale),
  "indicator-tosses": describe("indicator-tosses", indicator_tosses),
  "discrete-mass": describe("discrete-mass", discrete_mass),
  "variance-shift": describe("variance-shift", variance_shift),
  "moment-asymmetry": describe("moment-asymmetry", moment_asymmetry),
  "correlation-curve": describe("correlation-curve", correlation_curve),
  "covariance-matrix": describe("covariance-matrix", covariance_matrix),
  "marginal-ambiguity": describe("marginal-ambiguity", marginal_ambiguity),
  "independent-variables": describe(
    "independent-variables",
    independent_variables,
  ),
  "joint-region": describe("joint-region", joint_region),

  "conditional-dice": describe("conditional-dice", conditional_dice),
  "conditional-distribution": describe(
    "conditional-distribution",
    conditional_distribution,
  ),
  "conditional-mean": describe("conditional-mean", conditional_mean),
  "binomial-count": describe("binomial-count", binomial_count),
  "geometric-wait": describe("geometric-wait", geometric_wait),

  "sample-space-pairs": describe("sample-space-pairs", sample_space_pairs),
  "classical-dice": describe("classical-dice", classical_dice),
  "event-partition": describe("event-partition", event_partition),
  "probability-addition": describe(
    "probability-addition",
    probability_addition,
  ),

  covariance: describe("covariance", covariance),
  "mean-variance": describe("mean-variance", mean_variance),
  "chebyshev-bound": describe("chebyshev-bound", chebyshev_bound),
  "total-variance": describe("total-variance", total_variance),

  "joint-table": describe("joint-table", joint_table),
  "joint-triangle": describe("joint-triangle", joint_triangle),

  "poisson-count": describe("poisson-count", poisson_count),
  hypergeometric: describe("hypergeometric", hypergeometric),

  "exponential-tail": describe("exponential-tail", exponential_tail),
  "random-variable-mapping": describe(
    "random-variable-mapping",
    random_variable_mapping,
  ),
  "distribution-function": describe(
    "distribution-function",
    distribution_function,
  ),

  "total-probability": describe("total-probability", total_probability),
  independence: describe("independence", independence),
  "bernoulli-trials": describe("bernoulli-trials", bernoulli_trials),
  "system-reliability": describe("system-reliability", system_reliability),

  "uniform-interval": describe("uniform-interval", uniform_interval),
  "event-operations": describe("event-operations", event_operations),
  continuity: describe("continuity", continuity),
  derivative: describe("derivative", derivative),
  riemann: describe("riemann", riemann),
  taylor: describe("taylor", taylor),
  normal: describe("normal", normal),
  float: describe("float", float),
  "signed-integer": describe("signed-integer", signed_integer),
  "python-slice": describe("python-slice", python_slice),
  "python-mutability": describe("python-mutability", python_mutability),
  "pointer-arithmetic": describe("pointer-arithmetic", pointer_arithmetic),
  bayes: describe("bayes", bayes),
  "recursion-stack": describe("recursion-stack", recursion_stack),
  "vector-product": describe("vector-product", vector_product),
  "central-limit": describe("central-limit", central_limit),
  gradient: describe("gradient", gradient),
  "unit-circle": describe("unit-circle", unit_circle),
  "inverse-trig": describe("inverse-trig", inverse_trig),
  "trig-derivative": describe("trig-derivative", trig_derivative),
} satisfies Record<DemoId, ReturnType<typeof describe>>;
export type DemoName = DemoId;
export function demoRecord(
  id: DemoId,
  references: DemoRecord["references"] = [],
  source?: DemoReference,
  locale: string = defaultLocale,
): DemoRecord {
  const { subject, translations } = demoCatalog[id];
  const translation = selectTranslation(translations, locale);
  return {
    version: 3,
    id,
    subject,
    ...translation.value,
    locale: translation.locale,
    ...(source ? { source } : {}),
    references,
  };
}

export const SVG_NUMBER_DIGITS = 3;

/**
 * Quantize a computed SVG coordinate before it becomes markup.
 *
 * Math transcendental functions are implementation-approximated, so their
 * results may differ in the last bits between Node and the browser. Rounding
 * at the presentation boundary makes those differences overwhelmingly unlikely
 * to reach SVG attributes. It is not a bit-for-bit cross-platform guarantee.
 */
export function roundSvgNumber(value: number): number {
  const rounded = Number(value.toFixed(SVG_NUMBER_DIGITS));
  return Object.is(rounded, -0) ? 0 : rounded;
}

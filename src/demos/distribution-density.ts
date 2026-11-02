function gammaHalfInteger(value: number): number {
  if (value === 0.5) return Math.sqrt(Math.PI);
  if (value === 1) return 1;
  return (value - 1) * gammaHalfInteger(value - 1);
}

/** F density for positive integer degrees of freedom and positive x. */
export function fDensity(x: number, n: number, m: number): number {
  const a = n / 2;
  const b = m / 2;
  const beta =
    (gammaHalfInteger(a) * gammaHalfInteger(b)) / gammaHalfInteger(a + b);
  return ((n / m) ** a * x ** (a - 1)) / (beta * (1 + (n / m) * x) ** (a + b));
}

/** Chi-square density for positive integer degrees of freedom and positive x. */
export function chiSquareDensity(x: number, degrees: number): number {
  const a = degrees / 2;
  return (x ** (a - 1) * Math.exp(-x / 2)) / (2 ** a * gammaHalfInteger(a));
}

/** Student t density for positive integer degrees of freedom. */
export function tDensity(x: number, degrees: number): number {
  return (
    (gammaHalfInteger((degrees + 1) / 2) /
      (Math.sqrt(degrees * Math.PI) * gammaHalfInteger(degrees / 2))) *
    (1 + (x * x) / degrees) ** (-(degrees + 1) / 2)
  );
}

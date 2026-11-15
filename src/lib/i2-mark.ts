/**
 * Geometry of the "i2" mark, the one source for every place it is drawn: the
 * SVG logo (components/icons/i2-logo.tsx), the favicon and Open Graph images,
 * and the particle scene, which paints these paths onto a canvas.
 *
 * Coordinates are on a square of `size` units starting at (`x`, `y`). The
 * shapes were traced from the original raster logo: a round dot, a stem with
 * one rounded corner, and a "2" drawn as one thick stroke.
 */
export const I2_MARK = {
  x: 170,
  y: 160,
  size: 330,
  dot: { cx: 215, cy: 207, r: 32 },
  stem: "M185 268H245V470H215A30 30 0 0 1 185 440Z",
  two: "M300 290A75 75 0 1 1 438 330L300 441H452",
  twoWidth: 58,
} as const;

export const I2_VIEWBOX = `${I2_MARK.x} ${I2_MARK.y} ${I2_MARK.size} ${I2_MARK.size}`;

/**
 * The mark as a standalone SVG data URL in one colour, for places that take
 * an image rather than markup — the generated favicon and Open Graph images.
 */
export function i2DataUrl(fill: string): string {
  const { dot, stem, two, twoWidth } = I2_MARK;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${I2_VIEWBOX}">` +
    `<circle cx="${dot.cx}" cy="${dot.cy}" r="${dot.r}" fill="${fill}"/>` +
    `<path d="${stem}" fill="${fill}"/>` +
    `<path d="${two}" fill="none" stroke="${fill}" stroke-width="${twoWidth}" stroke-linejoin="round"/>` +
    `</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

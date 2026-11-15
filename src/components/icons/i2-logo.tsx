import type { SVGProps } from "react";
import { I2_MARK, I2_VIEWBOX } from "@/lib/i2-mark";

/** The mark's shapes in one paint, for use inside an <svg> on I2_VIEWBOX. */
export function I2Shapes({ fill }: { fill: string }) {
  const { dot, stem, two, twoWidth } = I2_MARK;

  return (
    <>
      <circle cx={dot.cx} cy={dot.cy} r={dot.r} fill={fill} />
      <path d={stem} fill={fill} />
      <path
        d={two}
        fill="none"
        stroke={fill}
        strokeWidth={twoWidth}
        strokeLinejoin="round"
      />
    </>
  );
}

/** The "i2" mark in the current text colour. Decorative: label the link. */
export function I2Logo(props: Omit<SVGProps<SVGSVGElement>, "children">) {
  return (
    <svg viewBox={I2_VIEWBOX} aria-hidden="true" focusable="false" {...props}>
      <I2Shapes fill="currentColor" />
    </svg>
  );
}

import { ImageResponse } from "next/og";
import { i2DataUrl } from "@/lib/i2-mark";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

// The original badge: the mark in charcoal on a cream disc, which reads on
// both light and dark browser chrome.
export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
        background: "#f4efe8",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- rendered to a PNG, not a page */}
      <img src={i2DataUrl("#2a2d31")} width={46} height={46} alt="" />
    </div>,
    size,
  );
}

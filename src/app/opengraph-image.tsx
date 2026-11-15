import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";
import { site } from "@/config/site";
import { i2DataUrl } from "@/lib/i2-mark";

export const alt = site.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const t = await getTranslations("HomePage");

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 80,
        background: "#0f0f0f",
        color: "#fafafa",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- rendered to a PNG, not a page */}
      <img src={i2DataUrl("#fafafa")} width={120} height={120} alt="" />
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ fontSize: 72, lineHeight: 1.1 }}>{site.name}</div>
        <div style={{ fontSize: 34, color: "#a1a1a1" }}>{t("role")}</div>
      </div>
    </div>,
    size,
  );
}

import { ImageResponse } from "next/og";
import { site } from "@/config/site";
import { getNote, getNotes } from "@/lib/notes";

export const alt = site.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return getNotes().map((note) => ({ slug: note.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const note = getNote(slug);

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
      <div style={{ fontSize: 56, lineHeight: 1.2 }}>
        {note?.title ?? site.name}
      </div>
      <div style={{ display: "flex", fontSize: 28, color: "#a1a1a1" }}>
        {site.name}
      </div>
    </div>,
    size,
  );
}

import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { getNotes } from "@/lib/notes";

export default function sitemap(): MetadataRoute.Sitemap {
  const notes = getNotes();

  return [
    { url: site.url, lastModified: new Date() },
    // The listing is not linked anywhere until it has a note in it, so it
    // is not advertised before then either (docs/adr/0006).
    ...(notes.length > 0
      ? [{ url: `${site.url}/notes`, lastModified: new Date() }]
      : []),
    ...notes.map((note) => ({
      url: `${site.url}/notes/${note.slug}`,
      lastModified: new Date(note.date),
    })),
  ];
}

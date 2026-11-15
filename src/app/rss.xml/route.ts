import { Feed } from "feed";
import { getTranslations } from "next-intl/server";
import { site } from "@/config/site";
import { getNotes } from "@/lib/notes";

// Nothing here depends on the request, so the feed is written at build time.
export const dynamic = "force-static";

export async function GET() {
  const t = await getTranslations("Site");

  // One feed for the whole site. A note written in Uzbek appears in it like
  // any other; the feed language describes the site, not each item, because
  // RSS 2.0 has no per-item language and `feed` emits none.
  const feed = new Feed({
    id: site.url,
    link: site.url,
    title: site.name,
    description: t("description"),
    language: site.locale,
    copyright: `© ${new Date().getFullYear()} ${site.name}`,
    feedLinks: { rss2: `${site.url}/rss.xml` },
    author: { name: site.name, link: site.url },
  });

  for (const note of getNotes()) {
    const url = `${site.url}/notes/${note.slug}`;

    feed.addItem({
      id: url,
      link: url,
      title: note.title,
      description: note.description,
      date: new Date(note.date),
      category: note.tags.map((tag) => ({ name: tag })),
    });
  }

  return new Response(feed.rss2(), {
    headers: { "content-type": "application/rss+xml; charset=utf-8" },
  });
}

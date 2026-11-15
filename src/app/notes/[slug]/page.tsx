import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXContent } from "@content-collections/mdx/react";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { Comments } from "@/components/notes/comments";
import { NoteMeta } from "@/components/notes/note-meta";
import { mdxComponents } from "@/components/mdx/mdx-components";
import { site } from "@/config/site";
import { alternates } from "@/lib/alternates";
import { getNote, getNotes } from "@/lib/notes";

export function generateStaticParams() {
  return getNotes().map((note) => ({ slug: note.slug }));
}

export async function generateMetadata(
  props: PageProps<"/notes/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const note = getNote(slug);

  if (!note) {
    return {};
  }

  return {
    title: note.title,
    description: note.description,
    alternates: alternates(`/notes/${slug}`),
    openGraph: {
      type: "article",
      siteName: site.name,
      locale: note.language,
      title: note.title,
      description: note.description,
      publishedTime: note.date,
      tags: note.tags,
    },
  };
}

export default async function NotePage({ params }: PageProps<"/notes/[slug]">) {
  const { slug } = await params;
  const note = getNote(slug);

  if (!note) {
    notFound();
  }

  // The interface is English, but a note may be written in Uzbek. `lang` on
  // the article is what tells a screen reader which voice to use and a search
  // engine what it is indexing; nothing about it is visible.
  return (
    <Container className="py-12">
      <article lang={note.language} className="flex flex-col gap-6">
        <header className="flex flex-col gap-3">
          <h1 className="text-2xl font-medium">{note.title}</h1>
          <NoteMeta date={note.date} readingTime={note.readingTime} />
          {note.tags.length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {note.tags.map((tag) => (
                <li key={tag}>
                  <Badge variant="secondary">{tag}</Badge>
                </li>
              ))}
            </ul>
          ) : null}
        </header>
        <div className="prose max-w-none prose-neutral dark:prose-invert">
          <MDXContent code={note.body} components={mdxComponents} />
        </div>
        <section className="mt-8 border-t border-border pt-8">
          <Comments />
        </section>
      </article>
    </Container>
  );
}

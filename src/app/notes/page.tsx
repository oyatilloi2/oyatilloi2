import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/layout/container";
import { NoteCard } from "@/components/notes/note-card";
import { alternates } from "@/lib/alternates";
import { getNotes, groupByYear } from "@/lib/notes";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Notes");

  return {
    title: t("title"),
    description: t("description"),
    alternates: alternates("/notes"),
  };
}

export default async function NotesPage() {
  const t = await getTranslations("Notes");
  const years = groupByYear(getNotes());

  return (
    <Container className="flex flex-col gap-10 py-12">
      <h1 className="text-2xl font-medium">{t("title")}</h1>
      {years.length === 0 ? (
        <p className="text-muted-foreground">{t("empty")}</p>
      ) : (
        years.map(({ year, notes }) => (
          <section key={year} className="flex flex-col gap-4">
            <h2 className="text-sm font-medium text-muted-foreground tabular-nums">
              {year}
            </h2>
            <div className="flex flex-col gap-4">
              {notes.map((note) => (
                <NoteCard key={note.slug} note={note} />
              ))}
            </div>
          </section>
        ))
      )}
    </Container>
  );
}

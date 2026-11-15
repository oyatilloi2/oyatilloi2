import { allNotes, type Note } from "content-collections";

/**
 * Languages a note may be written in. The interface is English only, so this
 * is not a site locale: it is metadata about the article, used for the `lang`
 * attribute on the page and nowhere else. Notes of every language share one
 * listing and one feed.
 */
export const noteLanguages = ["en", "uz"] as const;

export type NoteLanguage = (typeof noteLanguages)[number];

const isNoteLanguage = (value: string): value is NoteLanguage =>
  (noteLanguages as readonly string[]).includes(value);

// The language comes from the filename (`<slug>.<language>.mdx`), which no
// schema can validate. Fail the build loudly rather than dropping a note
// silently. The slug alone identifies a note now that every language shares
// one listing, so a slug reused in two languages is a collision, not a
// translation: `/notes/<slug>` could only ever serve one of them.
const seen = new Map<string, string>();

for (const note of allNotes) {
  if (!isNoteLanguage(note.language)) {
    throw new Error(
      `Note "${note._meta.filePath}" is missing a valid language suffix. ` +
        `Expected <slug>.(${noteLanguages.join("|")}).mdx`,
    );
  }

  const duplicate = seen.get(note.slug);

  if (duplicate) {
    throw new Error(
      `Notes "${duplicate}" and "${note._meta.filePath}" share the slug ` +
        `"${note.slug}". Slugs must be unique across every language.`,
    );
  }

  seen.set(note.slug, note._meta.filePath);
}

// Drafts are visible while writing and hidden everywhere else.
const isVisible = (note: Note) =>
  process.env.NODE_ENV === "development" || !note.draft;

const byNewestFirst = (a: Note, b: Note) => b.date.localeCompare(a.date);

export function getNotes(): Note[] {
  return allNotes.filter(isVisible).sort(byNewestFirst);
}

export function getNote(slug: string): Note | undefined {
  return allNotes.find((note) => note.slug === slug && isVisible(note));
}

/** Notes bucketed by publication year, newest year first, order preserved. */
export function groupByYear(notes: Note[]): { year: string; notes: Note[] }[] {
  const groups = new Map<string, Note[]>();

  for (const note of notes) {
    const year = note.date.slice(0, 4);
    groups.set(year, [...(groups.get(year) ?? []), note]);
  }

  return [...groups].map(([year, notes]) => ({ year, notes }));
}

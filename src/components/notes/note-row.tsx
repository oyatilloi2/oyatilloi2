import type { Note } from "content-collections";
import { ArrowRightIcon } from "lucide-react";
import { getFormatter } from "next-intl/server";
import Link from "next/link";

/** Compact title-and-date row used for the latest notes on the home page. */
export async function NoteRow({ note }: { note: Note }) {
  const format = await getFormatter();

  return (
    <li className="group flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
      <Link
        href={`/notes/${note.slug}`}
        lang={note.language}
        className="inline-flex items-center gap-1.5 link transition-transform duration-200 group-hover:translate-x-1"
      >
        {note.title}
        <ArrowRightIcon
          aria-hidden="true"
          className="size-3.5 shrink-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        />
      </Link>
      <time
        dateTime={note.date}
        className="shrink-0 text-sm text-muted-foreground tabular-nums"
      >
        {format.dateTime(new Date(note.date), {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </time>
    </li>
  );
}

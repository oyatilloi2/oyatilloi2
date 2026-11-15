import Link from "next/link";
import { ArrowUpRightIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { site } from "@/config/site";
import { I2Logo } from "@/components/icons/i2-logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { getNotes } from "@/lib/notes";

const navLink =
  "flex items-center gap-0.5 rounded-full px-3 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2";

export async function Header() {
  const t = await getTranslations("Nav");
  // A section joins the bar once it has something in it (docs/adr/0006).
  const hasNotes = getNotes().length > 0;

  // A detached pill rather than a full-width bar. The strip around it lets
  // clicks through, so it never blocks the page underneath.
  return (
    <header className="pointer-events-none sticky top-0 z-40 flex justify-center px-4 pt-4">
      <nav
        aria-label={t("label")}
        className="pointer-events-auto flex items-center gap-1 rounded-full border border-border bg-background/70 py-1 pr-1 pl-3 shadow-sm backdrop-blur-md"
      >
        <Link
          href="/"
          aria-label={t("home")}
          className="flex items-center gap-2 rounded-full pr-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <I2Logo className="size-5" />
          <span className="hidden sm:inline">{site.name.split(" ")[0]}</span>
        </Link>
        <span aria-hidden="true" className="h-4 w-px bg-border" />
        {hasNotes ? (
          <Link href="/notes" className={navLink}>
            {t("notes")}
          </Link>
        ) : null}
        <a
          href={site.resume}
          target="_blank"
          rel="noopener"
          className={navLink}
        >
          {t("resume")}
          <ArrowUpRightIcon aria-hidden="true" className="size-3.5" />
        </a>
        <ThemeToggle />
      </nav>
    </header>
  );
}

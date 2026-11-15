import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/layout/container";
import { NoteRow } from "@/components/notes/note-row";
import { Profile } from "@/components/home/profile";
import { getNotes } from "@/lib/notes";
import avatar from "@/assets/avatar.webp";
import { site } from "@/config/site";

const LATEST_COUNT = 3;

/**
 * Who the site is about, for search engines: the person, their role and
 * profiles, and the site as theirs. Rendered on the home page only, which
 * is the page that answers "who is this".
 */
function PersonJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${site.url}/#person`,
        name: site.name,
        givenName: "Oyatillo",
        familyName: "Abdishukurov",
        jobTitle: site.role,
        url: site.url,
        image: `${site.url}${avatar.src}`,
        address: {
          "@type": "PostalAddress",
          addressLocality: site.city,
          addressCountry: "UZ",
        },
        sameAs: Object.values(site.social),
      },
      {
        "@type": "WebSite",
        "@id": `${site.url}/#website`,
        url: site.url,
        name: site.name,
        inLanguage: site.locale,
        author: { "@id": `${site.url}/#person` },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      // `<` escaped so no string in the payload can close the script tag.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
      }}
    />
  );
}

export default async function HomePage() {
  const t = await getTranslations("HomePage");
  const notes = getNotes().slice(0, LATEST_COUNT);

  return (
    <Container className="flex max-w-5xl flex-col gap-16 py-12 sm:px-8">
      <PersonJsonLd />
      <Profile />

      {notes.length > 0 ? (
        <section
          className="reveal flex flex-col gap-4"
          style={{ "--reveal-delay": "320ms" } as React.CSSProperties}
        >
          <h2 className="text-sm font-medium text-muted-foreground">
            {t("latest")}
          </h2>
          <ul className="flex flex-col gap-3">
            {notes.map((note) => (
              <NoteRow key={note.slug} note={note} />
            ))}
          </ul>
          <p>
            <Link href="/notes" className="text-sm link">
              {t("viewAll")}
            </Link>
          </p>
        </section>
      ) : null}
    </Container>
  );
}

import { getTranslations } from "next-intl/server";
import { site } from "@/config/site";
import { HeroScene } from "@/components/home/hero-scene";
import { SocialLinks } from "@/components/home/social-links";

const delay = (ms: number) =>
  ({ "--reveal-delay": `${ms}ms` }) as React.CSSProperties;

export async function Profile() {
  const t = await getTranslations("HomePage");

  // Text on one side, the particle mark on the other — side by side, never
  // overlapping, so no copy is drawn over the moving particles. On a phone
  // the mark stacks above the text. The text blocks arrive in reading
  // order; `.reveal` (globals.css) disappears under prefers-reduced-motion.
  return (
    <section className="grid items-center gap-8 sm:min-h-[calc(100dvh-12rem)] sm:grid-cols-[1fr_auto] sm:gap-12">
      <div className="order-2 flex flex-col gap-5 sm:order-1">
        <p
          className="reveal font-mono text-xs tracking-wide text-muted-foreground uppercase"
          style={delay(0)}
        >
          {t("role")}
        </p>
        <h1
          className="reveal text-4xl font-semibold tracking-tight text-balance sm:text-6xl"
          style={delay(80)}
        >
          {site.name}
        </h1>
        <p
          className="reveal max-w-md text-pretty text-muted-foreground"
          style={delay(160)}
        >
          {t("about")}
        </p>
        <div className="reveal -ml-2" style={delay(240)}>
          <SocialLinks />
        </div>
      </div>
      <HeroScene className="order-1 w-56 justify-self-center sm:order-2 sm:w-80 lg:w-96" />
    </section>
  );
}

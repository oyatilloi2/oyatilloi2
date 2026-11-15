import { site } from "@/config/site";

export function Footer() {
  return (
    <footer className="py-8 text-center text-xs text-muted-foreground">
      &copy; {new Date().getFullYear()} {site.name}
    </footer>
  );
}

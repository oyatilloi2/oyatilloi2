export const site = {
  name: "Oyatillo Abdishukurov",
  // The canonical origin, fixed in code: every canonical link, the sitemap,
  // robots.txt and Open Graph URLs are built from it, and an environment
  // variable left at a placeholder once pointed all of them at example.com.
  // Must match the primary domain on the host (apex; www redirects to it).
  url:
    process.env.NODE_ENV === "production"
      ? "https://oyatillo.uz"
      : "http://localhost:3000",
  locale: "en",
  role: "Software Engineer",
  city: "Tashkent",
  resume: "/Oyatillo_Abdishukurov_resume.pdf",
  social: {
    github: "https://github.com/oyatilloi2",
    linkedin: "https://www.linkedin.com/in/oyatillo",
    telegram: "https://t.me/Oyatilloi2",
    instagram: "https://www.instagram.com/oyatilloi2",
    x: "https://x.com/oyatilloi2",
  },
} as const;

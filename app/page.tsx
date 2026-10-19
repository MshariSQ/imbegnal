import { courses } from "@/lib/catalog";
import { getCourseOutline } from "@/lib/catalog-server";
import { pathSummaries } from "@/lib/career-paths-server";
import { SITE_URL, GITHUB_REPO } from "@/lib/site";
import Home, { type HomeCourse } from "@/components/home/Home";

/** Career paths featured on the home page (one per area; all of them are at /roadmaps/). */
const HOME_PATHS = ["soc-analyst", "full-stack-developer", "ai-engineer"];

export default async function HomePage() {
  const outlines = await Promise.all(courses.map((c) => getCourseOutline(c.id)));
  const paths = (await pathSummaries()).filter((p) => HOME_PATHS.includes(p.id));
  const data: HomeCourse[] = courses.map((c, i) => ({
    id: c.id,
    icon: c.roadmap.icon,
    accent: c.roadmap.accent,
    level: c.roadmap.level,
    lessonCount: outlines[i].length,
    minutes: outlines[i].reduce((s, l) => s + l.minutes, 0),
  }));
  const totals = {
    lessons: outlines.reduce((s, o) => s + o.length, 0),
    exercises: outlines.reduce((s, o) => s + o.reduce((n, l) => n + l.exercises, 0), 0),
  };

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "IMBEGNAL",
      url: SITE_URL,
      inLanguage: ["en", "ar"],
      potentialAction: { "@type": "SearchAction", target: `${SITE_URL}/learn/?q={search_term_string}`, "query-input": "required name=search_term_string" },
    },
    { "@context": "https://schema.org", "@type": "EducationalOrganization", name: "IMBEGNAL", url: SITE_URL, sameAs: [GITHUB_REPO] },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Home courses={data} totals={totals} paths={paths} />
    </>
  );
}

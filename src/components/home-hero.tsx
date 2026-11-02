"use client";
import { useTranslations } from "next-intl";
import { ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Button } from "./ui/button";
import { KnowledgeOrbit, type OrbitTargets } from "./knowledge-orbit";
export function HomeHero({
  count,
  primaryHref,
  hasDemo,
  orbitTargets,
  base,
}: {
  count: number;
  primaryHref: string | null;
  hasDemo: boolean;
  orbitTargets: OrbitTargets;
  base: string;
}) {
  const t = useTranslations();

  const reduced = useReducedMotion();
  return (
    <section className="home-hero">
      <div className="hero-atmosphere" aria-hidden="true" />
      <motion.div
        className="hero-copy"
        initial={reduced ? false : { opacity: 0, y: 18, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="eyebrow">
          <span className="status-dot" />
          {t("hero.eyebrow")}
        </p>
        <h1>
          {t.rich("hero.title", {
            br: () => <br />,
            connect: (chunks) => (
              <span className="hero-title-connect">{chunks}</span>
            ),
          })}
        </h1>
        <p className="hero-description">
          {t.rich("hero.description", { br: () => <br /> })}
        </p>
        <div className="flex flex-wrap gap-3">
          {primaryHref && (
            <Button asChild>
              <a href={primaryHref}>
                {t("hero.read")}
                <ArrowUpRight className="size-4" />
              </a>
            </Button>
          )}
          {hasDemo && (
            <Button variant="outline" asChild>
              <a href={`${base}/demos/`}>
                {t("hero.explore")}
                <ArrowUpRight className="size-3.5" />
              </a>
            </Button>
          )}
        </div>
        <div className="hero-meta">
          <span>{t("hero.recordCount", { count })}</span>
          <span>{t("hero.topics")}</span>
        </div>
      </motion.div>
      {count > 0 && <KnowledgeOrbit targets={orbitTargets} base={base} />}
    </section>
  );
}

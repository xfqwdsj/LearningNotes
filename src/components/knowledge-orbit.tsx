"use client";
import { useTranslations } from "next-intl";
import type { UiTranslator } from "@/i18n/translate";
import { useId, useState } from "react";
import { ScopedLink } from "./scoped-link";
import { Badge } from "./ui/badge";
import { ArrowUpRight } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
  useTransform,
} from "motion/react";
export interface OrbitTargets {
  knowledge?: string;
  properties?: string;
  exploration?: string;
  tasks?: string;
  courses?: string;
}
const getNodes = (t: UiTranslator, targets: OrbitTargets) =>
  [
    {
      x: 110,
      y: 105,
      label: t("common.definition"),
      note: t("orbit.definitionNote"),
      href: targets.knowledge,
      action: t("orbit.explore"),
    },
    {
      x: 400,
      y: 100,
      label: t("common.properties"),
      note: t("orbit.propertiesNote"),
      href: targets.properties,
      action: t("orbit.connections"),
    },
    {
      x: 440,
      y: 280,
      label: t("common.application"),
      note: t("orbit.applicationNote"),
      href: targets.exploration,
      action: t("orbit.demo"),
    },
    {
      x: 270,
      y: 360,
      label: t("common.exercise"),
      note: t("orbit.exerciseNote"),
      href: targets.tasks,
      action: t("orbit.tasks"),
    },
    {
      x: 70,
      y: 280,
      label: t("common.review"),
      note: t("orbit.reviewNote"),
      href: targets.courses,
      action: t("orbit.courses"),
    },
  ].flatMap((node) => (node.href ? [{ ...node, href: node.href }] : []));
export function KnowledgeOrbit({
  targets,
  base,
}: {
  targets: OrbitTargets;
  base: string;
}) {
  const t = useTranslations();
  const nodes = getNodes(t, targets);

  const [active, setActive] = useState(0);
  const reduced = useReducedMotion();
  const id = useId().replaceAll(":", "");
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const x = useSpring(pointerX, { stiffness: 90, damping: 25 });
  const y = useSpring(pointerY, { stiffness: 90, damping: 25 });
  const rotateX = useTransform(y, [-1, 1], [5, -5]);
  const rotateY = useTransform(x, [-1, 1], [-6, 6]);
  if (!nodes.length) return null;
  const current = nodes[active] ?? nodes[0]!;
  return (
    <div
      className="knowledge-orbit"
      aria-label={t("orbit.label")}
      onPointerMove={(event) => {
        if (reduced || event.pointerType !== "mouse") return;
        const rect = event.currentTarget.getBoundingClientRect();
        pointerX.set(((event.clientX - rect.left) / rect.width) * 2 - 1);
        pointerY.set(((event.clientY - rect.top) / rect.height) * 2 - 1);
      }}
      onPointerLeave={() => {
        pointerX.set(0);
        pointerY.set(0);
      }}
    >
      <div className="orbit-frame">
        <span>{t("orbit.frame")}</span>
        <span className="orbit-coordinate">
          {String(active + 1).padStart(2, "0")} —{" "}
          {String(nodes.length).padStart(2, "0")}
        </span>
      </div>
      <motion.div
        className="orbit-field"
        style={reduced ? {} : { rotateX, rotateY }}
        aria-hidden="true"
      >
        <div className="orbit-field-grid" />
        <div className="orbit-field-ring" />
        <div className="orbit-field-ring orbit-field-ring-second" />
      </motion.div>
      <svg
        viewBox="0 0 520 440"
        className="orbit-connections"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`${id}-beam`}>
            <stop stopColor="currentColor" stopOpacity=".05" />
            <stop offset=".5" stopColor="currentColor" stopOpacity=".75" />
            <stop offset="1" stopColor="currentColor" stopOpacity=".2" />
          </linearGradient>
        </defs>
        {nodes.map((node, i) => {
          const line = `M260 215 Q${node.x} 215 ${node.x} ${node.y}`;
          return (
            <g key={node.label}>
              <path
                d={line}
                fill="none"
                stroke="currentColor"
                strokeOpacity=".08"
              />
              <motion.path
                d={line}
                fill="none"
                stroke={`url(#${id}-beam)`}
                strokeWidth="1.3"
                initial={false}
                animate={{
                  pathLength: active === i ? 1 : 0,
                  opacity: active === i ? 1 : 0,
                }}
                transition={{
                  duration: reduced ? 0 : 0.65,
                  ease: [0.22, 1, 0.36, 1],
                }}
              />
              {active === i && !reduced && (
                <circle r="2.5" fill="currentColor">
                  <animateMotion
                    path={line}
                    dur="2.8s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}
            </g>
          );
        })}
        <circle
          cx="260"
          cy="215"
          r="45"
          fill="var(--background)"
          stroke="currentColor"
          strokeOpacity=".14"
        />
        <circle
          cx="260"
          cy="215"
          r="52"
          fill="none"
          stroke="currentColor"
          strokeOpacity=".06"
        />
        <text
          x="260"
          y="221"
          textAnchor="middle"
          fontSize="17"
          fill="currentColor"
        >
          {t("orbit.center")}
        </text>
      </svg>
      {nodes.map((node, i) => (
        <div
          key={node.label}
          className="orbit-anchor"
          style={{ left: `${node.x / 5.2}%`, top: `${node.y / 4.4}%` }}
        >
          <motion.button
            className={`orbit-node ${active === i ? "active" : ""}`}
            onPointerEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            onClick={() => setActive(i)}
            aria-pressed={active === i}
            whileHover={reduced ? {} : { scale: 1.06 }}
            whileTap={reduced ? {} : { scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
          >
            <span className="orbit-node-dot" />
            {node.label}
          </motion.button>
        </div>
      ))}
      <div className="orbit-detail">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={active}
            initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduced ? 0 : -5 }}
            transition={{ duration: 0.16 }}
          >
            <p>{current.note}</p>
            <ScopedLink base={base} href={current.href}>
              {current.action}
              {base &&
                current.href.startsWith("/") &&
                !current.href.startsWith(`${base}/`) && (
                  <Badge variant="outline">{t("common.publicSite")}</Badge>
                )}
              <ArrowUpRight className="size-3" />
            </ScopedLink>
          </motion.div>
        </AnimatePresence>
      </div>
      <p className="orbit-hint">{t("orbit.hint")}</p>
    </div>
  );
}

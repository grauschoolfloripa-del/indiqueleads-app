import { useEffect, useId, useState } from "react";
import { Particles, ParticlesProvider, useParticlesProvider } from "@tsparticles/react";
import type { Container, Engine } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";
import { motion, useAnimation } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Campo de partículas ("sparkles") decorativo para heros.
 *
 * Adaptações em relação ao snippet de referência (que era da v3 do
 * `@tsparticles/react` e do Next.js):
 *  - a v4 removeu `initParticlesEngine`; a inicialização agora é feita pelo
 *    `<ParticlesProvider init={...}>`, com `useParticlesProvider()` expondo
 *    `loaded`. `<Sparkles>` encapsula esse provider para o consumidor não
 *    precisar saber disso;
 *  - importa de `motion/react` (convenção do projeto) em vez de
 *    `framer-motion` — `motion` reexporta a mesma API, então evitamos duas
 *    cópias da lib no bundle;
 *  - sem `"use client"` (isso é Next.js; aqui é TanStack Start). É seguro em
 *    SSR porque nada renderiza antes de `loaded`, que só vira true no cliente;
 *  - respeita `prefers-reduced-motion`: o efeito é puramente decorativo, então
 *    para quem pediu menos animação simplesmente não renderizamos o canvas;
 *  - `aria-hidden`: decoração não deve chegar a leitores de tela.
 */

export interface SparklesProps {
  id?: string;
  className?: string;
  background?: string;
  minSize?: number;
  maxSize?: number;
  speed?: number;
  particleColor?: string;
  particleDensity?: number;
}

const registerEngine = async (engine: Engine) => {
  await loadSlim(engine);
};

function SparklesCanvas({
  id,
  className,
  background,
  minSize,
  maxSize,
  speed,
  particleColor,
  particleDensity,
}: SparklesProps) {
  const { loaded } = useParticlesProvider();
  const controls = useAnimation();
  const generatedId = useId();

  const particlesLoaded = (container?: Container) => {
    if (container) {
      void controls.start({ opacity: 1, transition: { duration: 1 } });
    }
  };

  return (
    <motion.div aria-hidden animate={controls} className={cn("opacity-0", className)}>
      {loaded && (
        <Particles
          id={id || `sparkles-${generatedId.replace(/:/g, "")}`}
          className="h-full w-full"
          particlesLoaded={particlesLoaded}
          options={{
            background: { color: { value: background || "transparent" } },
            fullScreen: { enable: false, zIndex: 1 },
            fpsLimit: 120,
            detectRetina: true,
            interactivity: {
              events: {
                onClick: { enable: false, mode: "push" },
                onHover: { enable: false, mode: "repulse" },
                resize: { enable: true },
              },
            },
            particles: {
              color: { value: particleColor || "#ffffff" },
              move: {
                enable: true,
                direction: "none",
                speed: { min: 0.1, max: 1 },
                straight: false,
                outModes: { default: "out" },
              },
              number: {
                density: { enable: true, width: 400, height: 400 },
                value: particleDensity ?? 120,
              },
              opacity: {
                value: { min: 0.1, max: 1 },
                animation: {
                  enable: true,
                  speed: speed ?? 4,
                  sync: false,
                  mode: "auto",
                  startValue: "random",
                },
              },
              shape: { type: "circle" },
              size: { value: { min: minSize ?? 1, max: maxSize ?? 3 } },
            },
          }}
        />
      )}
    </motion.div>
  );
}

export function Sparkles(props: SparklesProps) {
  const [reduceMotion, setReduceMotion] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  if (reduceMotion) return null;

  return (
    <ParticlesProvider init={registerEngine}>
      <SparklesCanvas {...props} />
    </ParticlesProvider>
  );
}

/** Alias mantendo o nome usado no snippet de referência. */
export const SparklesCore = Sparkles;

export default Sparkles;

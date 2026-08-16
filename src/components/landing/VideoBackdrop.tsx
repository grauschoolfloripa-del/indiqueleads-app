import { useEffect, useRef, useState } from "react";

/**
 * Fundo em vídeo por seção — mesma anatomia usada no site da Mídia Eco, que
 * serviu de referência:
 *
 *   <div absolute inset-0 bg-surface>
 *     <div absolute inset-0 will-change-transform>  <video object-cover scale(1.08)>
 *     <div absolute inset-0>                        gradiente escuro por cima
 *
 * Detalhes que importam:
 *  - `scale(1.08)`: o vídeo é levemente ampliado para nunca aparecer borda
 *    branca por arredondamento de subpixel;
 *  - `poster` + `preload="metadata"`: a primeira pintura mostra o frame
 *    estático, sem esperar o vídeo baixar;
 *  - play só quando a seção entra no viewport (IntersectionObserver) e pause
 *    ao sair — evita 5 vídeos decodificando ao mesmo tempo, que é o que faz
 *    esse tipo de página travar em celular;
 *  - `prefers-reduced-motion`: não carrega vídeo nenhum, fica só o poster.
 */

export interface VideoBackdropProps {
  /** Nome base do arquivo em /public/videos (sem extensão). Ex.: "hero" -> /videos/hero.mp4 */
  name: string;
  /**
   * Se existir uma versão vertical (9:16) para celular, passe `mobile`.
   * Isso importa muito: com `object-cover`, um vídeo 16:9 numa tela de
   * 390x844 tem as laterais cortadas e sobra só a faixa central da imagem —
   * o que estava enquadrado bonito no desktop simplesmente some no celular.
   * Ex.: mobile="hero-9x16" -> /videos/hero-9x16.mp4
   */
  mobile?: string;
  /** Gradiente de leitura por cima do vídeo. */
  overlay?: "default" | "strong" | "soft";
  className?: string;
}

const OVERLAYS: Record<string, string> = {
  // Escurecimento progressivo: topo mais leve, base bem fechada, para o
  // conteúdo da próxima seção emendar sem costura visível.
  default:
    "linear-gradient(to bottom, rgba(8,9,11,0.55) 0%, rgba(8,9,11,0.72) 55%, rgba(8,9,11,0.92) 100%)",
  strong:
    "linear-gradient(to bottom, rgba(8,9,11,0.72) 0%, rgba(8,9,11,0.85) 55%, rgba(8,9,11,0.96) 100%)",
  soft: "linear-gradient(to bottom, rgba(8,9,11,0.40) 0%, rgba(8,9,11,0.62) 55%, rgba(8,9,11,0.88) 100%)",
};

export function VideoBackdrop({
  name,
  mobile,
  overlay = "default",
  className,
}: VideoBackdropProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reduceMotion, setReduceMotion] = useState(true);
  const [isNarrow, setIsNarrow] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // `<source media>` em <video> é mal suportado pelos browsers, então a
  // escolha do arquivo é feita aqui em JS.
  useEffect(() => {
    if (!mobile) return;
    const mq = window.matchMedia("(max-width: 767px)");
    setIsNarrow(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsNarrow(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [mobile]);

  const asset = mobile && isNarrow ? mobile : name;

  useEffect(() => {
    if (reduceMotion) return;
    const host = hostRef.current;
    if (!host) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        const v = videoRef.current;
        if (!v) return;
        if (entry.isIntersecting) {
          // play() rejeita se o browser bloquear autoplay; silenciar é ok,
          // o poster continua visível nesse caso.
          void v.play().catch(() => {});
        } else {
          v.pause();
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(host);
    return () => io.disconnect();
  }, [reduceMotion]);

  return (
    <div
      ref={hostRef}
      aria-hidden
      className={`absolute inset-0 overflow-hidden bg-ink-950 ${className ?? ""}`}
    >
      {reduceMotion ? (
        <img
          src={`/videos/${asset}_poster.jpg`}
          alt=""
          className="h-full w-full object-cover"
          style={{ transform: "scale(1.08)" }}
        />
      ) : (
        <div className="absolute inset-0 will-change-transform">
          <video
            key={asset}
            ref={videoRef}
            className="h-full w-full object-cover"
            style={{ transform: "scale(1.08)" }}
            poster={`/videos/${asset}_poster.jpg`}
            preload="metadata"
            loop
            muted
            playsInline
          >
            <source src={`/videos/${asset}.mp4`} type="video/mp4" />
          </video>
        </div>
      )}
      <div className="absolute inset-0" style={{ background: OVERLAYS[overlay] }} />
    </div>
  );
}

export default VideoBackdrop;

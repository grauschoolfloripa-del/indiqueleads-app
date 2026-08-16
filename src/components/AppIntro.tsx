import { useEffect, useRef, useState } from "react";

/**
 * Abertura do aplicativo.
 *
 * Cobre a tela enquanto a animação da marca roda, e sai com um fade. O app
 * carrega por baixo durante esses segundos — a espera de dados acontece atrás
 * da cortina, em vez de virar tela em branco.
 *
 * Regra que atravessa o componente: **a abertura nunca pode prender ninguém**.
 * Se o vídeo falhar, demorar ou o aparelho recusar o autoplay, a tela sai
 * sozinha. Um splash travado é pior que splash nenhum — a pessoa acha que o
 * app quebrou e desinstala.
 */

/** Se o vídeo não terminar sozinho até aqui, saímos assim mesmo. */
const LIMITE_SEGURANCA_MS = 9000;
/** Antes disso o botão de pular não aparece — senão ninguém vê a animação. */
const PULAR_APOS_MS = 2000;

export default function AppIntro({ onDone }: { onDone: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [saindo, setSaindo] = useState(false);
  const [podePular, setPodePular] = useState(false);
  const encerrado = useRef(false);

  useEffect(() => {
    /** Fecha uma vez só: `ended`, erro e limite de segurança podem coincidir. */
    const encerrar = (imediato = false) => {
      if (encerrado.current) return;
      encerrado.current = true;
      if (imediato) {
        onDone();
        return;
      }
      setSaindo(true);
      setTimeout(onDone, 450); // acompanha a duração do fade no CSS
    };

    // Quem pediu menos movimento não deve levar 6 segundos de animação.
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      encerrar(true);
      return;
    }

    const v = videoRef.current;
    if (!v) {
      encerrar(true);
      return;
    }

    const aoTerminar = () => encerrar();
    const aoFalhar = () => encerrar(true);
    v.addEventListener("ended", aoTerminar);
    v.addEventListener("error", aoFalhar);

    // Autoplay pode ser recusado mesmo com muted (economia de bateria, política
    // do sistema). Se for, não insistimos: entramos direto no app.
    void v.play().catch(aoFalhar);

    const limite = setTimeout(() => encerrar(), LIMITE_SEGURANCA_MS);
    const liberaPular = setTimeout(() => setPodePular(true), PULAR_APOS_MS);

    return () => {
      v.removeEventListener("ended", aoTerminar);
      v.removeEventListener("error", aoFalhar);
      clearTimeout(limite);
      clearTimeout(liberaPular);
    };
  }, [onDone]);

  return (
    <div
      className={`fixed inset-0 z-[100] grid place-items-center bg-[#0a1420] transition-opacity duration-[450ms] ${
        saindo ? "opacity-0" : "opacity-100"
      }`}
      // A abertura é decorativa: leitor de tela deve pular direto para o app.
      aria-hidden="true"
    >
      <video
        ref={videoRef}
        src="/videos/intro.mp4"
        poster="/videos/intro-poster.jpg"
        muted
        playsInline
        preload="auto"
        /* object-cover preenche qualquer proporção de tela sem barra preta —
           o vídeo é 9:16 e os aparelhos variam bastante. */
        className="h-full w-full object-cover"
      />

      {podePular && !saindo && (
        <button
          onClick={() => {
            setSaindo(true);
            setTimeout(onDone, 450);
          }}
          className="absolute bottom-10 right-6 cursor-pointer rounded-full bg-white/10 px-4 py-2 text-xs font-bold text-white/80 backdrop-blur-sm transition-colors hover:bg-white/20 hover:text-white"
        >
          Pular
        </button>
      )}
    </div>
  );
}

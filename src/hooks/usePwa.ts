import { useEffect, useState } from "react";
import {
  canPromptInstall,
  getPlatform,
  isIosSafari,
  isStandalone,
  onInstallAvailabilityChange,
  type Platform,
} from "@/lib/pwa";

/**
 * True quando a pessoa abriu pelo ícone da tela inicial em vez do navegador.
 *
 * É o que sustenta a regra de app exclusivo: aprovado no cadastro, o indicador
 * só vê a Academy e a vitrine rodando como app instalado.
 */
export function useIsStandalone(): boolean {
  const [standalone, setStandalone] = useState<boolean>(() => isStandalone());

  useEffect(() => {
    const mq = window.matchMedia?.("(display-mode: standalone)");
    if (!mq) return;
    const onChange = () => setStandalone(isStandalone());
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return standalone;
}

/** Se o Android já ofereceu o diálogo nativo de instalação. */
export function useInstallAvailable(): boolean {
  const [available, setAvailable] = useState<boolean>(() => canPromptInstall());
  useEffect(() => onInstallAvailabilityChange(setAvailable), []);
  return available;
}

export function usePlatform(): { platform: Platform; iosSafari: boolean } {
  const [info] = useState(() => ({ platform: getPlatform(), iosSafari: isIosSafari() }));
  return info;
}

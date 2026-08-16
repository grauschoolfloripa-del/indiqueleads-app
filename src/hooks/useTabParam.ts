import { useCallback } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";

/**
 * Guarda a aba ativa no endereço (`?aba=carteira`) em vez da memória.
 *
 * Existe para o app instalado: sem endereço de verdade não há como o toque
 * numa notificação abrir a tela certa, nem como o gesto de voltar do celular
 * devolver a aba anterior. Também é o que faz os atalhos do manifest
 * funcionarem.
 *
 * A assinatura é igual à do `useState` que substitui, então trocar um pelo
 * outro é uma linha em cada painel.
 *
 * Só a aba vai para o endereço — nunca o papel do usuário. Papel vem do
 * Supabase Auth; se viesse da URL, bastaria digitar `?painel=admin`.
 */
export function useTabParam<T extends string>(
  valid: readonly T[],
  fallback: T,
): readonly [T, (tab: T) => void] {
  const navigate = useNavigate();

  const search = useRouterState().location.search as Record<string, unknown>;
  const raw = typeof search.aba === "string" ? search.aba : undefined;

  const current = raw !== undefined && valid.includes(raw as T) ? (raw as T) : fallback;

  const setTab = useCallback(
    (tab: T) => {
      void navigate({
        to: "/",
        // Espalha o que já estava lá: `?ref=` e `?p=` são o coração do produto
        // e não podem sumir ao trocar de aba.
        search: (prev: Record<string, unknown>) => ({ ...prev, aba: tab }),
      });
    },
    [navigate],
  );

  return [current, setTab] as const;
}

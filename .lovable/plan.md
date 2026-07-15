
## Objetivo

Consertar os 10 bugs remanescentes do último merge que quebraram o chat entre anunciante e cliente, travam o visitante em spinner quando o produto do link não existe mais e geram warnings/estados inconsistentes no painel do indicador.

## Correções em `src/App.tsx`

1. **Spinner infinito quando produto do link não existe** — no callback de `fetchProductById(prodParam)` (linhas ~291-301): quando `prod` vier `null`, além do `addNotification`, sair do modo visitante — `setLockedToSharedProduct(false)`, `setActiveProductId(null)` e voltar para landing/role anterior. Isso destrava a tela.
2. **Cleanup do import assíncrono** — envolver o `void import("./lib/cloudSync")...` com uma flag `cancelled` local ao `useEffect` de bootstrap (e `return () => { cancelled = true; }`) para não chamar `setProducts`/`setCurrentRole` em componente desmontado.
3. **Guard extra do render** — na linha 1319, tratar explicitamente o caso `currentRole === "visitante" && !activeProductForVisitor`: se `lockedToSharedProduct`, renderizar mensagem "Anúncio não disponível" com botão para voltar à landing (em vez de cair no spinner/branch vazio).
4. **`addNotification` fora da TDZ** — mover a declaração de `addNotification` (linha 594) para antes do primeiro `useEffect` que a referencia (o de bootstrap na ~280), eliminando dependência de hoisting.
5. **Fallback do chat do cliente** — em `handleSendChatMessage` (linha 902-905), quando `senderRole === "client"` e o lead não estiver em `leads`, chamar `getVisitorLeadChatsFn` com o `lookup` conhecido do estado do VisitorView antes de lançar erro; se ainda assim não achar, aí sim mostrar erro.
6. **`productId` explícito no submit do visitante** — mudar assinatura de `handleSubmitLeadFromVisitor` para receber `productId` no payload em vez de ler `activeProductId` da closure; atualizar chamada em `VisitorView`.

## Correções em `src/components/VisitorView.tsx`

7. **Aceitar `product: Product | null`** — mudar a interface e adicionar guard no topo do componente: se `product` é `null`, retornar um fallback simples ("Anúncio indisponível"). Elimina crashes em `product.coverImage`/`product.id`.
8. **`referralId` opcional** — mudar prop para `referralId?: string | null` para casar com o `undefined` que o App pode passar.
9. **`activeLead` em `useState` + `useEffect`** — trocar o cálculo inline por `const [activeLead, setActiveLead] = useState<Lead | null>(null)` sincronizado num `useEffect` que roda em `[leads, product?.id, clientEmail, clientName]`. Elimina a janela em que `submitted === true` mas `activeLead === undefined`, que atualmente esconde o chat após envio do lead.
10. **Reset de `activeImage` em `useEffect`** — remover o `setState` durante render (`if (product.id !== prevProductId)...`); substituir por `useEffect(() => { setActiveImage(product.coverImage); }, [product?.id])`. Elimina warning do React e potenciais loops.
11. **Passar `productId` no `onSubmitLead`** — incluir `productId: product.id` no payload enviado ao App (par do item 6).

## Correções em `src/components/AffiliateDashboard.tsx`

12. **`onAddNotification` com 3 argumentos** — nas duas chamadas afetadas, remover o argumento extra e manter apenas `(mensagem, tipo)` conforme a assinatura.
13. **Botão duplicado de compartilhar** — remover a `<a>` antiga; manter apenas o `<button>` com o fluxo Web Share atual.
14. **`setTimeout` órfão do kit** — remover o `setTimeout(() => setDownloadingKit(false), 1200)` residual; o `finally { setDownloadingKit(false) }` já cobre o reset.

## Verificação

- Build TS deve passar (VisitorView aceita nullable, App satisfaz assinatura).
- Fluxo manual: (a) abrir link de produto inexistente → ver mensagem, não spinner; (b) cliente cadastra lead → chat aparece imediatamente após submit; (c) cliente envia msg logo em seguida → entrega sem "Atendimento não encontrado"; (d) anunciante responde → cliente vê no chat via realtime/refetch já existente.

## Arquivos alterados

- `src/App.tsx`
- `src/components/VisitorView.tsx`
- `src/components/AffiliateDashboard.tsx`

Sem migrações novas — o backend/RLS/functions já estão corretos das rodadas anteriores.

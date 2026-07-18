## Diagnóstico

Confirmado por análise direta do banco: **as mensagens do chat enviadas pelo cliente/visitante (sem login) não estão sendo persistidas no Supabase**. Por isso, quando o anunciante acessa em outro dispositivo, nada chega — o Realtime só entrega o que está no banco.

Evidência: no anúncio novo de 17/07 (`93e63817…` — "Nissan marchn"), existem 3 leads gravados corretamente, mas **zero linhas em `chat_messages` para esses leads**. Antes de 14/07, quando o teste era feito logado como indicador, o chat funcionava porque caía em outra policy de INSERT (`chat_insert_related`, exige autenticação). Agora, no celular, o visitante não está autenticado (anon), então cai na policy `chat_public_insert_for_client_messages`.

### Causa raiz

A policy `chat_public_insert_for_client_messages` (INSERT `TO anon, authenticated`) tem no `WITH CHECK`:

```sql
EXISTS (SELECT 1 FROM leads l WHERE l.id = chat_messages.lead_id)
```

Esse `EXISTS` roda sob a RLS do papel atual. A tabela `leads` só tem policies de SELECT para `authenticated` (`leads_advertiser_read`, `leads_indicator_read`). O papel `anon` **não tem nenhuma policy de SELECT em `leads`**, então o `EXISTS` retorna falso para o visitante anônimo, o INSERT é rejeitado por RLS, e o `pushChatMessage` em `src/lib/cloudSync.ts` apenas loga o erro no console e segue adiante — por isso o app parece funcionar, mas a mensagem nunca chega ao outro lado.

Quando o teste é feito no mesmo computador do anunciante, a "conversa" aparece porque ambos os lados leem do mesmo `localStorage` — nada trafega pelo banco.

## Correção

Migração enxuta em `chat_messages`, sem tocar em nada de leads/indicadores/produtos:

1. `DROP POLICY chat_public_insert_for_client_messages ON public.chat_messages`.
2. Recriar a policy sem o `EXISTS` sobre `leads`. O FK `chat_messages.lead_id → leads.id` já garante integridade física; a existência do lead não precisa (e não deve) ser verificada via RLS de outra tabela. Mantemos as demais restrições que evitam abuso por anon:
   - `sender_id IS NULL`
   - `sender_role IN ('client','system')`
   - `length(btrim(text)) BETWEEN 1 AND 4000`
3. Manter `chat_insert_related` (authenticated) e `chat_read_related` (SELECT) como estão — a leitura via Realtime para o anunciante continua correta, pois ele é autenticado e tem SELECT em `leads`.

Depois da migração:
- Cliente/visitante anônimo consegue inserir a mensagem inicial de sistema, as notas do formulário e mensagens subsequentes no chat.
- O anunciante autenticado recebe via Realtime (`subscribeChatMessagesAll` em `cloudSync.ts`) porque a policy de SELECT `chat_read_related` continua satisfeita.
- Cross-device passa a funcionar: mobile → banco → desktop, e vice-versa.

## Endurecimento leve (mesmo turno)

Para nunca mais um erro desses passar silencioso:

- Em `src/lib/cloudSync.ts`, `pushChatMessage` deixa de engolir o erro: propaga (throw) e o chamador em `src/App.tsx` (`handleSendChatMessage`, `handleSubmitLeadFromVisitor`) captura e exibe um `addNotification("Falha ao enviar mensagem — tente novamente", "info")`. Isso não altera nenhuma tela; só torna qualquer regressão futura de RLS imediatamente visível ao invés de silenciosa.

## Verificação

1. Rodar a migração.
2. Playwright headless em `http://localhost:8080`: abrir link do produto sem sessão, submeter lead com nota, digitar mensagem — confirmar via `supabase--read_query` que a linha entrou em `chat_messages` (`sender_role='client'`, `sender_id IS NULL`).
3. Confirmar que o build permanece verde (nenhum arquivo do lado do cliente muda de forma).

## Detalhes técnicos

- Arquivos alterados: 1 migração nova + `src/lib/cloudSync.ts` (uma função) + `src/App.tsx` (dois try/catch curtos ao redor de `pushChatMessage`).
- Nenhuma mudança em UI, tipos, rotas, `types.ts` gerado, ou fluxos de auth.
- Realtime já está com `chat_messages` na publicação `supabase_realtime` (verificado).
- Não há grant faltando em `chat_messages` (verificado em `pg_class.relacl`).
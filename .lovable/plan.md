## Diagnóstico

O problema está concentrado no fluxo de persistência/sincronização do chat:

- A criação inicial do lead e da primeira mensagem está funcionando.
- Mensagens posteriores do cliente aparecem no banco, mas dependem de sincronização frágil no painel do anunciante.
- A resposta do anunciante para o lead `contato@bolinha.com` não foi salva no banco, o que indica falha no envio/persistência da mensagem do anunciante, provavelmente por regra de acesso ou por envio “best-effort” sem feedback de erro.
- O chat hoje mistura estado local (`localStorage`) com banco, então em celular/cache limpo a UI pode parecer atualizada localmente sem garantir que a mensagem realmente foi salva e entregue ao outro lado.

## Plano de correção

1. **Tornar o envio de mensagens confiável**
   - Alterar o envio do chat para aguardar a gravação no banco antes de confirmar sucesso.
   - Se a gravação falhar, mostrar erro claro ao usuário e não fingir que a mensagem foi entregue.
   - Manter atualização otimista apenas quando houver persistência garantida ou rollback em caso de falha.

2. **Corrigir autorização do chat para os dois lados**
   - Revisar e ajustar as regras do banco para permitir:
     - Cliente/lead enviar mensagens apenas no próprio atendimento.
     - Anunciante responder apenas aos leads dos seus anúncios.
     - Indicador continuar acompanhando apenas os leads atribuídos a ele.
   - Preservar o bloqueio de dados de outros clientes.

3. **Criar uma função segura para enviar mensagens do cliente visitante**
   - Em vez de depender de inserção direta anônima ampla, criar um fluxo controlado: o cliente informa e-mail/telefone + lead, e o servidor valida que aquele lead pertence àquele cliente antes de salvar a mensagem.
   - Isso mantém privacidade e resolve o caso do cliente em celular/cache limpo.

4. **Forçar ressincronização após cada mensagem**
   - Após anunciante ou cliente enviar uma mensagem, recarregar as mensagens daquele lead do banco.
   - No portal do cliente, manter polling curto enquanto o chat estiver aberto para receber respostas do anunciante.
   - No painel do anunciante, recarregar chats quando abrir o dossiê do lead e ao voltar o foco no celular.

5. **Auditar o caso real do bolinha**
   - Usar o lead `contato@bolinha.com` como teste de regressão.
   - Confirmar que a resposta do anunciante passa a ser gravada e aparece no portal do cliente.
   - Confirmar que nova mensagem do cliente aparece no dossiê do anunciante.

6. **Ajuste mobile mínimo relacionado ao chat**
   - Garantir que o modal/dossiê do lead e a janela de chat no celular tenham rolagem correta, largura estável e input visível.
   - Sem redesenhar o painel inteiro nesta etapa, focando no fluxo quebrado.

## Arquivos que serão alterados

- `src/App.tsx`
- `src/lib/cloudSync.ts`
- `src/lib/visitor-chat.functions.ts`
- `src/components/VisitorView.tsx`
- `src/components/AdvertiserDashboard.tsx`
- Migração do banco para regras/funções de chat, se necessário

## Resultado esperado

Depois da correção, o chat ficará realmente bidirecional:

```text
Cliente lead envia mensagem
        ↓
Mensagem salva no banco
        ↓
Anunciante vê no dossiê do lead
        ↓
Anunciante responde
        ↓
Resposta salva no banco
        ↓
Cliente vê no portal pelo mesmo e-mail/telefone
```

E nenhuma conversa de outro cliente será exibida no portal do lead.
# IndiqueLeads

Plataforma multivertical que conecta **anunciantes** (lojas, imobiliárias,
concessionárias) a uma rede de **indicadores autônomos**, com links rastreáveis
e comissionamento por evento pago via PIX.

## Como o dinheiro funciona

Toda comissão é um evento no ledger `commissions` — nunca um campo solto numa
linha de lead. Um mesmo negócio pode gerar mais de um evento:

| Evento | Quando nasce | Quem confirma |
|---|---|---|
| `lead` | visita confirmada | anunciante |
| `venda` (lead) | venda marcada como fechada | anunciante |
| `venda` (financiamento) | simulação de crédito concluída | anunciante |

Estados: `pending` → `available` → `paid`. Quem move para `paid` é o anunciante,
registrando o PIX que fez fora da plataforma. O saldo do indicador
(`indicators.balance_*`) é espelho do ledger, mantido por trigger.

**Princípio de confiança:** ninguém libera o próprio dinheiro. O indicador
sinaliza (ex.: "Cheguei na Loja"), o anunciante confirma. Isso é garantido por
RLS e por funções `SECURITY DEFINER`, não por checagem no front.

## Stack

- **React 19** + **TanStack Start** (SSR) + **Vite** + **Tailwind v4**
- **Supabase**: Postgres com RLS, Auth, Edge Functions
- Dados sempre via `src/lib/repositories.ts` → `src/hooks/queries.ts`
  (React Query). Nenhum componente importa `supabase` direto para CRUD.

## Desenvolvimento

```bash
npm install
npm run dev      # http://localhost:8080
npm run build    # gera .vercel/output (Build Output API v3)
```

Variáveis em `.env` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`,
`VITE_SUPABASE_PROJECT_ID` e equivalentes sem prefixo para o SSR).

## Banco de dados

```bash
npx supabase db push --db-url "postgresql://postgres.<ref>:<senha>@aws-0-sa-east-1.pooler.supabase.com:5432/postgres"
```

Migrations em `supabase/migrations/`. Se alguma for aplicada à mão pelo SQL
Editor, registre no histórico para o `db push` não tentar reaplicá-la:

```bash
npx supabase migration repair --status applied <versao> --db-url "..."
```

## O aplicativo (PWA)

O app é o próprio site instalado — **não existe na App Store nem na Play
Store, de propósito**. A Apple não permite baixar app do site do desenvolvedor
(nem depois da abertura do CADE: no iOS o app precisa vir da App Store ou de
uma loja alternativa autorizada), e no Android o APK direto passou a exigir
verificação de desenvolvedor. O PWA entrega a instalação pelo site nos dois
aparelhos, sem loja e sem revisão.

**App exclusivo:** aprovada a candidatura, o indicador só vê a Academy e a
vitrine rodando como app instalado (`display-mode: standalone`). Antes da
aprovação ele segue no navegador — é onde preenche o cadastro. Anunciante,
admin e visitante nunca são travados; a vitrine pública precisa abrir para
qualquer um.

Peças: `public/manifest.webmanifest`, `public/sw.js`, `src/lib/pwa.ts`,
`src/components/InstallApp.tsx`. Ícones são gerados do logo:

```bash
python3 scripts/gen-icons.py
```

Para testar as telas do app instalado sem instalar, em desenvolvimento:
`http://localhost:8080/?simular-app=1`. O bloco é removido pelo bundler em
produção — não é uma brecha no ar.

### Regras do service worker

Errar aqui prende o usuário numa versão velha, então: nunca interceptar nada
além de GET; nunca tocar em chamada do Supabase; navegação sempre
network-first; só `/assets/` (nome com hash) pode ser cache-first.

### Central de mensagens (admin)

Aba **Mensagens Push**. O admin compõe (título, corpo, imagem, botão,
destino), escolhe o público e dispara. Para indicadores há filtro por nicho
certificado.

Três travas, porque o disparo é irreversível e chega em gente real:

1. O alcance é calculado **antes**, pela mesma `push_audience_users` que o
   envio usa. Duas consultas diferentes deixariam a prévia dizer 40 e o
   disparo pegar 400.
2. "Enviar teste só para mim" antes do disparo real.
3. Confirmação com o número de pessoas na frente.

O destino precisa ser caminho interno — `admin_send_push_campaign` recusa URL
externa. Push com link para fora é vetor de phishing, e quem clica confia na
marca.

Entrega em lote: **uma** chamada à Edge Function por campanha. É para isso que
existe `notifications.campaign_id` — o trigger individual pula essas linhas,
senão 500 destinatários virariam 500 requisições HTTP.

### Push

`notifications` ganhou um trigger que chama a Edge Function `send-push`. O
trigger engole a própria exceção **de propósito** — push é um extra e não pode
derrubar o registro de uma comissão.

⚠️ Edge Function publicada sem `--no-verify-jwt` fica atrás do gateway do
Supabase, que exige um `Authorization` válido. Por isso `app_private.push_config`
guarda também a chave `anon` — o trigger a envia como Bearer. Ela não é segredo
(já vai no bundle do navegador); quem autoriza de fato é o `shared_secret`,
conferido dentro da função. Sem esse cabeçalho o push morre com
`UNAUTHORIZED_NO_AUTH_HEADER` e **em silêncio**, porque o trigger engole erro.

Configuração já feita neste projeto. Para recriar em outro ambiente:

```bash
SUPABASE_ACCESS_TOKEN=<seu-token> npx supabase secrets set --project-ref ichydxicjootuaokhgkz VAPID_PUBLIC_KEY=... VAPID_PRIVATE_KEY=... PUSH_SHARED_SECRET=... VAPID_SUBJECT=mailto:contato@midiaeco.com
```

```bash
SUPABASE_ACCESS_TOKEN=<seu-token> npx supabase functions deploy send-push --project-ref ichydxicjootuaokhgkz
```

## Deploy (Vercel)

O build usa o preset `vercel` do Nitro (definido em `vite.config.ts`) e escreve
em `.vercel/output`. **Sem isso o Nitro gera saída para Cloudflare Workers**, que
a Vercel não sabe executar — foi a causa de uma tela de erro genérica no passado.

⚠️ **Deploy `Blocked` (não `Error`) não é falha de build.** No plano Hobby a
Vercel recusa o deploy quando o autor do commit não é reconhecido como dono do
projeto. Duas causas, que se somam:

1. **Repositório privado** — Hobby não suporta colaboração em repo privado.
   Solução: manter público durante o desenvolvimento, ou assinar o Pro.
2. **Autor do commit divergente** — este repo pertence à conta
   `grauschoolfloripa-del`, mas commits assinados com o e-mail pessoal
   (`midiaecopublicidade@gmail.com`) são atribuídos pelo GitHub a outra conta
   (`Fabriciocufo`), e a Vercel bloqueia. Por isso o `user.email` do repositório
   é fixado no *noreply* da conta dona:

```bash
git config user.name  "grauschoolfloripa-del"
git config user.email "238873711+grauschoolfloripa-del@users.noreply.github.com"
```

Tornar o repositório público **não desbloqueia deploys antigos** — a Vercel
avalia no momento em que o commit chega e não reavalia sozinha. É preciso um
commit novo ou um *Redeploy* manual.

Existe apenas **um** projeto Vercel válido para este repo
(`indiqueleads-app-qfnp` → `indiqueleads.vercel.app`). Dois projetos apontando
para o mesmo repositório disputam deploy e confundem o diagnóstico.

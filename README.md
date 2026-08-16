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

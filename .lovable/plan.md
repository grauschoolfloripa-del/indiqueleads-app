## Diagnóstico

Existem **dois sistemas de cadastro paralelos e incompatíveis** convivendo hoje, e é isso que gera todos os problemas relatados:

### Sistema 1 — Legado (LandingPage → "Cadastre-se agora")
Arquivo: `src/App.tsx` (`handleRegisterIndicator`, `handleRegisterAdvertiser`, `handleLoginIndicator`, `handleLoginAdvertiser`, `handleLoginAdmin`).
- Grava apenas em `localStorage` (`indica_indicators`, `indica_advertisers`).
- **Nunca chama o Supabase.** Nenhum usuário real é criado, nenhuma role é gravada em `user_roles`.
- Login admin é hardcoded para `admin@indicaaqui.com / admin123` — **não tem relação nenhuma com `contato@midiaeco.com`**.
- Some quando o usuário limpa o navegador ou muda de dispositivo.

### Sistema 2 — Real (`/auth`)
Arquivo: `src/routes/auth.tsx` + `src/hooks/useAuth.ts`.
- Usa `supabase.auth.signUp` / `signInWithPassword`.
- Trigger `handle_new_user()` grava perfil e role em `user_roles`.
- É o **único** que persiste de verdade.

### Consequências observadas
1. Usuário clica "Cadastre-se agora" na landing → acha que criou conta, mas na verdade só salvou um objeto no localStorage do próprio navegador. Nada foi para o banco.
2. Admin `contato@midiaeco.com` não consegue logar novamente porque:
   - O login admin da landing só aceita `admin@indicaaqui.com`.
   - Se a sessão do Supabase expirou e o e-mail exige confirmação (default do Supabase), o `signInWithPassword` no `/auth` falha silenciosamente.
3. O `AuthBar` (Supabase) e o `loggedUser` (localStorage) podem ficar dessincronizados, causando "logado no preview / deslogado no publicado".

---

## Plano de correção (4 fases)

### Fase 1 — Unificar autenticação no Supabase (fonte única da verdade)
- Remover da `LandingPage` os formulários de cadastro/login legados (`Cadastre-se agora`, `Entrar` de indicador/anunciante/admin) e substituir por **um único botão "Entrar / Criar conta"** que leva a `/auth`.
- Manter em `/auth` a escolha "Eu sou: Indicador / Anunciante / Visitante" (já existe) — o admin **nunca** é opção no cadastro público.
- Remover de `src/App.tsx` os handlers `handleLoginIndicator`, `handleRegisterIndicator`, `handleLoginAdvertiser`, `handleRegisterAdvertiser`, `handleLoginAdmin` e suas props na `LandingPage`.
- Atualizar `handleLogout` para chamar apenas `supabaseSignOut()` (o bridge já limpa o `loggedUser`).

### Fase 2 — Garantir acesso do admin `contato@midiaeco.com`
- Ativar `auto_confirm_email = true` via `supabase--configure_auth` para eliminar o passo de confirmação por e-mail (que é o motivo mais provável do login estar falhando após criar a conta).
- Confirmar manualmente no banco o e-mail do usuário `contato@midiaeco.com` (UPDATE em `auth.users.email_confirmed_at`) via `supabase--insert`, caso a conta já exista mas esteja não-confirmada.
- Garantir via SQL que `contato@midiaeco.com` tem role `admin` em `user_roles` (idempotente: INSERT ... ON CONFLICT DO NOTHING).
- Reforçar no trigger `handle_new_user()` a regra: qualquer signup diferente de `contato@midiaeco.com` **nunca** recebe admin, mesmo que seja o primeiro usuário. Só `contato@midiaeco.com` pode ser admin via signup direto; demais admins só via painel.

### Fase 3 — Criação de admin apenas pelo painel
- No `AdminPanel`, adicionar seção "Novo Usuário Admin" que chama uma server function (`createServerFn` + `requireSupabaseAuth` + checagem `has_role('admin')`) que usa `supabaseAdmin.auth.admin.createUser` + `admin_set_user_role(_, 'admin', true)`.
- Isso substitui qualquer necessidade de rota pública de criação de admin.

### Fase 4 — Limpeza de estado legado
- No bootstrap do `App.tsx`, remover a leitura inicial de `indica_logged_user` do `useState` (a fonte da verdade passa a ser 100% o hook `useAuth`).
- Manter o `loggedUser` derivado exclusivamente do bridge Supabase → estado local.
- Limpar chaves obsoletas de localStorage no primeiro carregamento (`indica_logged_user` legada de sessões antigas).

---

## Detalhes técnicos

**Migrações SQL (Fase 2):**
```sql
-- Confirma e-mail do admin se já existir
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, now())
WHERE email = 'contato@midiaeco.com';

-- Garante role admin
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users WHERE email = 'contato@midiaeco.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Restringe trigger: só contato@midiaeco.com pode ser admin via signup
CREATE OR REPLACE FUNCTION public.handle_new_user() ...
  -- lógica: se NEW.email = 'contato@midiaeco.com' AND não há admin ainda → admin
  -- caso contrário → role solicitado (nunca admin)
```

**Server function (Fase 3):** `src/lib/admin-users.functions.ts` com `createServerFn` + middleware de auth + carga dinâmica de `client.server` dentro do handler (obrigatório pelas regras do TanStack).

**Arquivos afetados:**
- `src/App.tsx` (remover handlers legados, simplificar bootstrap)
- `src/components/LandingPage.tsx` (remover modal de auth, botão único → `/auth`)
- `src/components/AdminPanel.tsx` (nova seção criar admin)
- `src/lib/admin-users.functions.ts` (novo)
- 1 migração SQL + 1 configuração de auth

## Resultado esperado
- Um único fluxo de cadastro/login (`/auth`), persistente e real.
- `contato@midiaeco.com` como único admin, com login garantido após e-mail confirmado automaticamente.
- Novos admins criados exclusivamente pelo painel administrativo.
- Sem mais divergência entre preview e site publicado.

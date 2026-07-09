# Plano de Expansão Multi-Vertical (3 Ondas)

## Verticais a adicionar

| Slug | Label | Funil | Modelo comissão |
|---|---|---|---|
| `saude` | Saúde, Bem-Estar & Estética | customizado | presencial (avaliação) + digital (tratamento) |
| `energia_solar` | Energia Solar | customizado | digital (contrato assinado), gatilho opcional na visita técnica |
| `educacao` | Educação Premium | padrão adaptado | digital (matrícula efetivada) |
| `turismo` | Turismo de Luxo & Eventos | padrão adaptado | digital (pacote fechado) |
| `seguros` | Seguros | recorrente | % sobre prêmio, recorrente |
| `franquias` | Franquias | customizado | digital (contrato de franquia) |
| `veiculos_pesados` | Veículos Pesados & Máquinas | padrão | presencial + digital |
| `imoveis_comerciais_locacao` | Imóveis Comerciais (Locação) | padrão adaptado | digital (contrato de locação = 1 aluguel) |

Somam-se aos 5 atuais (`imovel`, `carro`, `moto`, `barco`, `jetski`) → **13 categorias**.

---

## Onda 1 — Infraestrutura multi-vertical

**Objetivo:** um único lugar para descrever cada vertical; resto do código consome.

1. **Migração SQL**
   - Ampliar coluna `category` em `products` para aceitar todos os slugs novos (converter para `text` com CHECK, ou ampliar enum se existir).
   - Ampliar `lead_status` (enum ou text + CHECK) com novos status usados pelos funis customizados: `triagem`, `avaliacao_agendada`, `avaliacao_confirmada`, `orcamento_emitido`, `tratamento_iniciado`, `visita_tecnica_agendada`, `visita_tecnica_realizada`, `projeto_aprovado`, `contrato_assinado`, `matricula_efetivada`, `pacote_fechado`, `apolice_emitida`, `contrato_franquia`, `locacao_assinada`.
   - Adicionar `vertical_meta jsonb` em `products` e `leads` (atributos livres por vertical).
   - Adicionar `commission_model text` em `products` (`presencial_digital` | `digital` | `recorrente`).
   - GRANTs mantidos como estão (só ALTER, nenhuma tabela nova).

2. **`src/lib/verticals.ts` (novo)** — fonte única:
   ```ts
   export const VERTICALS: Record<Category, VerticalConfig> = {
     saude: { label, icon, color, attributes: ZodSchema, statusFlow: [...], commissionModel, disclaimer? },
     energia_solar: {...},
     ...
   }
   ```
   Inclui: label PT-BR, ícone lucide, cor Tailwind semântica, schema Zod dos atributos específicos, array ordenado de status do funil, modelo de comissão, disclaimer opcional (Saúde: "agendamento de avaliação, não venda de procedimento").

3. **`src/types.ts`** — ampliar `Category` e `LeadStatus` com todos os novos slugs; manter compat com os 5 atuais.

4. **Refactor de consumo** — trocar `switch(category)` espalhados por `VERTICALS[category].xxx` em: `ProductCard`, `VisitorView` (filtros), `AffiliateDashboard`, `AdminPanel`.

---

## Onda 2 — Formulários e funis customizados

1. **`ProductForm` dinâmico:** ao escolher categoria, renderiza campos a partir de `VERTICALS[cat].attributes` (Zod → react-hook-form). Exemplos:
   - Saúde: procedimento, duração estimada, requer avaliação presencial (bool), faixa etária.
   - Energia Solar: potência estimada (kWp), tipo de imóvel, upload conta de luz (bucket `product-images` ou novo `attachments`).
   - Educação: modalidade (presencial/online/híbrido), carga horária, próxima turma.
   - Turismo: destino, datas, nº pessoas.
   - Seguros: tipo (vida/patrimonial/saúde-empresarial), % comissão recorrente.
   - Franquias: investimento inicial, faturamento médio, prazo de retorno.
   - Veículos Pesados: tipo, ano, horímetro, capacidade.
   - Locação Comercial: metragem, tipo (sala/galpão/loja), valor mensal.

2. **`LeadForm`:** campos adicionais por vertical (Saúde: melhor horário; Energia Solar: anexo conta de luz; Educação: interesse/curso; Seguros: bens a segurar).

3. **Kanban / status:** `LeadPipeline` lê `statusFlow` da vertical. Transições permitidas seguem a ordem. Regras de comissão:
   - Saúde: libera parcial em `avaliacao_confirmada`, final em `tratamento_iniciado`.
   - Energia Solar: gatilho opcional em `visita_tecnica_realizada`, final em `contrato_assinado`.
   - Seguros: cria registro recorrente em `apolice_emitida` (marca comissão recorrente no `payouts`).
   - Demais: mantêm liberação única no status terminal.

4. **Conformidade Saúde (mínima nesta onda):** banner obrigatório no formulário e no card ("Este anúncio destina-se ao agendamento de avaliação clínica..."), termos aceitos no cadastro de anunciante Saúde. LGPD reforçada fica para depois, conforme pedido.

---

## Onda 3 — Ativação comercial

1. **LandingPage:** nova seção "Verticais atendidas" — grid de 13 cards (ícone + label + micro-copy) gerado a partir de `VERTICALS`.
2. **`VisitorView`:** filtro por vertical (chips), busca respeita a categoria selecionada, ordenação por comissão/ticket.
3. **Onboarding do anunciante:** primeiro passo escolhe vertical → formulário seguinte já mostra só campos daquela vertical.
4. **AdminPanel:** aba "Verticais" com métricas por categoria — nº anúncios ativos, leads gerados, conversão, comissão paga; tabela ordenável.
5. **AffiliateDashboard:** filtro por vertical no catálogo de ofertas + tag visual da vertical em cada lead.

---

## Detalhes técnicos

**Ordem de execução:** Onda 1 → migração SQL primeiro (aprovação do usuário), depois `verticals.ts` + `types.ts` + refactors. Onda 2 depende da Onda 1. Onda 3 depende da Onda 2.

**Arquivos novos:**
- `supabase/migrations/<timestamp>_expand_verticals.sql`
- `src/lib/verticals.ts`
- `src/components/product/DynamicAttributesFields.tsx`
- `src/components/lead/DynamicLeadFields.tsx`
- `src/components/admin/VerticalMetrics.tsx`

**Arquivos alterados:**
- `src/types.ts`, `src/App.tsx`, `src/components/LandingPage.tsx`, `src/components/VisitorView.tsx`, `src/components/AffiliateDashboard.tsx`, `src/components/AdminPanel.tsx`
- Formulários de produto/lead existentes
- `src/lib/repositories.ts` (helpers de consulta por vertical)

**Compatibilidade:** dados existentes (categorias atuais) continuam válidos — nada é removido, só ampliado. Nenhuma quebra em anúncios ou leads já cadastrados.

**Ícones:** lucide-react — Heart (saúde), Sun (solar), GraduationCap (educação), Plane (turismo), Shield (seguros), Store (franquias), Truck (pesados), Building2 (locação comercial).

## Resultado esperado
- 13 verticais operacionais, cada uma com seus atributos, funil e regras de comissão próprios.
- Cadastro de produto/lead adaptável sem código duplicado (tudo dirigido por `verticals.ts`).
- Landing e catálogo comunicando o portfólio completo.
- Base pronta para receber LGPD reforçada de Saúde em fase futura.

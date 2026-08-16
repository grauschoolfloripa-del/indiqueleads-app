import { useMemo, useState } from "react";
import {
  AlertTriangle,
  BellRing,
  Check,
  ImageIcon,
  Link2,
  Loader2,
  Search,
  Send,
  Users,
} from "lucide-react";

import { usePushCampaigns, usePushReach, useSendPushCampaign } from "@/hooks/queries";
import { VERTICALS, VERTICALS_ORDER } from "@/lib/verticals";
import type { Advertiser, Category, Indicator, Product, PushAudience } from "@/types";

/**
 * Central de mensagens do admin.
 *
 * Enviar push é irreversível e chega no bolso de gente real, então a tela é
 * construída em torno de três garantias:
 *
 *  1. O alcance é mostrado antes, calculado pela mesma função que o envio usa.
 *  2. Dá para mandar só para você antes de mandar para a base.
 *  3. Disparo pede confirmação com o número na frente.
 *
 * O destino pode ser uma tela do app ou um endereço https. `http://` é
 * recusado pelo banco: mandar gente para página sem criptografia a partir de
 * uma notificação da plataforma não tem caso de uso que compense.
 */

/** Sentinelas do seletor — não são URL, marcam "monte o destino comigo". */
const LINK_PERSONALIZADO = "__personalizado__";
const ANUNCIO_ESPECIFICO = "__anuncio__";

const DESTINOS: Array<{ url: string; label: string }> = [
  { url: "/?fonte=app", label: "Abrir o app" },
  { url: "/?aba=vitrine&fonte=app", label: "Vitrine de produtos" },
  { url: "/?aba=carteira&fonte=app", label: "Carteira / PIX" },
  { url: "/?aba=desempenho&fonte=app", label: "Meu desempenho" },
  { url: "/?aba=financiamentos&fonte=app", label: "Financiamentos" },
  { url: ANUNCIO_ESPECIFICO, label: "Um anúncio específico…" },
  { url: LINK_PERSONALIZADO, label: "Link personalizado…" },
];

const PUBLICOS: Array<{ id: PushAudience; label: string; hint: string }> = [
  { id: "todos", label: "Todos", hint: "Indicadores e anunciantes" },
  { id: "indicadores", label: "Indicadores", hint: "Quem divulga e recebe comissão" },
  { id: "anunciantes", label: "Anunciantes", hint: "Quem cadastra os bens" },
  { id: "especificos", label: "Escolher pessoas", hint: "Seleção manual" },
];

interface Props {
  indicators: Indicator[];
  advertisers: Advertiser[];
  /** Catálogo, para montar o link do anúncio sem ninguém digitar id na mão. */
  products: Product[];
  onAddNotification: (msg: string, type: "success" | "info") => void;
  /** Id do admin logado — usado no envio de teste só para ele. */
  adminUserId: string;
}

export default function PushCenter({
  indicators,
  advertisers,
  products,
  onAddNotification,
  adminUserId,
}: Props) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [destino, setDestino] = useState(DESTINOS[0].url);
  const [linkProprio, setLinkProprio] = useState("");
  const [produtoId, setProdutoId] = useState("");
  const [actionLabel, setActionLabel] = useState("");

  const [audience, setAudience] = useState<PushAudience>("indicadores");
  const [categories, setCategories] = useState<Category[]>([]);
  const [userIds, setUserIds] = useState<string[]>([]);
  const [busca, setBusca] = useState("");
  const [confirmando, setConfirmando] = useState(false);

  const enviar = useSendPushCampaign();
  const campanhas = usePushCampaigns(true);

  const usaLinkProprio = destino === LINK_PERSONALIZADO;
  const usaAnuncio = destino === ANUNCIO_ESPECIFICO;
  const targetUrl = usaLinkProprio
    ? linkProprio.trim()
    : usaAnuncio
      ? produtoId
        ? `/?p=${produtoId}&fonte=app`
        : ""
      : destino;

  /**
   * Mesma regra do banco, aplicada aqui só para avisar antes de errar: caminho
   * interno ou https. A validação que vale é a do servidor.
   */
  const linkValido = targetUrl.startsWith("/") || /^https:\/\/\S+$/i.test(targetUrl);
  const linkExterno = /^https:\/\//i.test(targetUrl);
  const linkInseguro = /^http:\/\//i.test(linkProprio.trim());

  const preenchido = title.trim().length > 0 && body.trim().length > 0 && linkValido;
  const publicoValido = audience !== "especificos" || userIds.length > 0;

  const reach = usePushReach(audience, userIds, categories, publicoValido);

  const pessoas = useMemo(
    () =>
      [
        ...indicators.map((i) => ({ id: i.id, nome: i.name, email: i.email, papel: "Indicador" })),
        ...advertisers.map((a) => ({
          id: a.id,
          nome: a.name,
          email: a.email,
          papel: "Anunciante",
        })),
      ].filter((p) => {
        if (!busca.trim()) return true;
        const q = busca.toLowerCase();
        return p.nome.toLowerCase().includes(q) || p.email.toLowerCase().includes(q);
      }),
    [indicators, advertisers, busca],
  );

  const disparar = async (somenteEu: boolean) => {
    try {
      const campanha = await enviar.mutateAsync({
        title: title.trim(),
        body: body.trim(),
        audience: somenteEu ? "especificos" : audience,
        userIds: somenteEu ? [adminUserId] : userIds,
        categories: somenteEu ? [] : categories,
        imageUrl: imageUrl.trim() || null,
        targetUrl,
        actionLabel: actionLabel.trim() || null,
      });
      onAddNotification(
        somenteEu
          ? "Teste enviado para você. Confira o celular."
          : `Enviado para ${campanha.recipients} ${campanha.recipients === 1 ? "pessoa" : "pessoas"}.`,
        "success",
      );
      setConfirmando(false);
      if (!somenteEu) {
        setTitle("");
        setBody("");
        setImageUrl("");
        setActionLabel("");
      }
    } catch (e) {
      onAddNotification(e instanceof Error ? e.message : "Falha ao enviar.", "info");
      setConfirmando(false);
    }
  };

  const toggle = <T,>(lista: T[], item: T): T[] =>
    lista.includes(item) ? lista.filter((x) => x !== item) : [...lista, item];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* ---------------------------------------------- composição ---- */}
        <div className="space-y-5 lg:col-span-3">
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="flex items-center gap-2 font-display text-base font-bold text-slate-900">
              <BellRing className="h-5 w-5 text-sea-700" />
              Nova mensagem
            </h3>

            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-1 flex items-center justify-between text-xs font-bold uppercase text-slate-700">
                  Título
                  <span className="font-mono text-[10px] font-normal text-slate-400">
                    {title.length}/80
                  </span>
                </label>
                <input
                  value={title}
                  maxLength={80}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Oportunidade na sua região 🚗"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sea-500"
                />
              </div>

              <div>
                <label className="mb-1 flex items-center justify-between text-xs font-bold uppercase text-slate-700">
                  Mensagem
                  <span className="font-mono text-[10px] font-normal text-slate-400">
                    {body.length}/300
                  </span>
                </label>
                <textarea
                  value={body}
                  maxLength={300}
                  rows={3}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Diga o que a pessoa ganha ao abrir. Seja específico: valor, prazo, local."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sea-500"
                />
                <p className="mt-1 text-[11px] text-slate-500">
                  O Android mostra cerca de 2 linhas fechado. O essencial vem primeiro.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase text-slate-700">
                    <Link2 className="h-3.5 w-3.5" /> Ao tocar, abrir
                  </label>
                  <select
                    value={destino}
                    onChange={(e) => setDestino(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sea-500"
                  >
                    {DESTINOS.map((d) => (
                      <option key={d.url} value={d.url}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 text-xs font-bold uppercase text-slate-700">
                    Botão (opcional)
                  </label>
                  <input
                    value={actionLabel}
                    maxLength={24}
                    onChange={(e) => setActionLabel(e.target.value)}
                    placeholder="Ver agora"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sea-500"
                  />
                </div>
              </div>

              {usaAnuncio && (
                <div>
                  <label className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase text-slate-700">
                    <Link2 className="h-3.5 w-3.5" /> Qual anúncio
                  </label>
                  <select
                    value={produtoId}
                    onChange={(e) => setProdutoId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sea-500"
                  >
                    <option value="">Escolha um anúncio…</option>
                    {products
                      .filter((p) => p.status === "ativo" || p.status === "reservado")
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {VERTICALS[p.category]?.emoji} {p.title} —{" "}
                          {p.price.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                            maximumFractionDigits: 0,
                          })}
                        </option>
                      ))}
                  </select>
                  {produtoId ? (
                    <p className="mt-1.5 break-all font-mono text-[11px] text-slate-500">
                      {targetUrl}
                    </p>
                  ) : (
                    <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500">
                      Leva direto ao anúncio, com o rastreio de indicação funcionando. Só aparecem
                      anúncios ativos ou reservados.
                    </p>
                  )}
                </div>
              )}

              {usaLinkProprio && (
                <div>
                  <label className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase text-slate-700">
                    <Link2 className="h-3.5 w-3.5" /> Endereço da página
                  </label>
                  <input
                    value={linkProprio}
                    onChange={(e) => setLinkProprio(e.target.value)}
                    placeholder="https://indiqueleads.vercel.app/?p=id-do-anuncio"
                    className={`w-full rounded-xl border bg-slate-50 px-4 py-2.5 font-mono text-xs focus:outline-none focus:ring-2 ${
                      linkProprio.trim() && !linkValido
                        ? "border-red-300 focus:ring-red-400"
                        : "border-slate-200 focus:ring-sea-500"
                    }`}
                  />

                  {linkInseguro ? (
                    <p className="mt-1.5 text-[11px] leading-relaxed text-red-700">
                      Endereços <code className="font-mono">http://</code> não são aceitos. Use{" "}
                      <code className="font-mono">https://</code> — mandar alguém para uma página
                      sem criptografia a partir de um aviso da plataforma expõe quem confiou nela.
                    </p>
                  ) : linkProprio.trim() && !linkValido ? (
                    <p className="mt-1.5 text-[11px] leading-relaxed text-red-700">
                      Use um caminho interno começando com <code className="font-mono">/</code> ou
                      um endereço <code className="font-mono">https://</code> completo.
                    </p>
                  ) : (
                    <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500">
                      Uma tela do app (ex.: <code className="font-mono">/?p=id-do-anuncio</code>) ou
                      um endereço https completo.
                    </p>
                  )}

                  {linkExterno && (
                    <p className="mt-2 flex items-start gap-1.5 rounded-xl bg-amber-50 px-3 py-2 text-[11px] leading-relaxed text-amber-900">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      Este link sai do aplicativo e abre no navegador. Quem toca está confiando na
                      IndiqueLeads — confira o endereço antes de disparar.
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase text-slate-700">
                  <ImageIcon className="h-3.5 w-3.5" /> Imagem (opcional)
                </label>
                <input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://…/foto-do-carro.jpg"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-sea-500"
                />
                <p className="mt-1 text-[11px] text-slate-500">
                  Aparece no Android ao expandir o aviso. O iPhone ignora, sem quebrar nada.
                </p>
              </div>
            </div>
          </div>

          {/* ------------------------------------------------ público ---- */}
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="flex items-center gap-2 font-display text-base font-bold text-slate-900">
              <Users className="h-5 w-5 text-sea-700" />
              Quem recebe
            </h3>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {PUBLICOS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setAudience(p.id)}
                  className={`rounded-xl border p-3 text-left transition-colors ${
                    audience === p.id
                      ? "border-sea-700 bg-sea-700/5"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <span className="block text-xs font-bold text-slate-900">{p.label}</span>
                  <span className="mt-0.5 block text-[10px] leading-tight text-slate-500">
                    {p.hint}
                  </span>
                </button>
              ))}
            </div>

            {audience === "indicadores" && (
              <div className="mt-4">
                <p className="text-xs font-bold uppercase text-slate-700">
                  Só quem liberou estes nichos{" "}
                  <span className="font-normal normal-case text-slate-400">
                    (vazio = todos os indicadores)
                  </span>
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {VERTICALS_ORDER.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategories((c) => toggle(c, cat))}
                      className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${
                        categories.includes(cat)
                          ? "border-sea-700 bg-sea-700 text-white"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {VERTICALS[cat].emoji} {VERTICALS[cat].shortLabel}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
                  Mandar oportunidade de carro para quem não pode indicar carro gera frustração — a
                  pessoa abre e não encontra nada na vitrine.
                </p>
              </div>
            )}

            {audience === "especificos" && (
              <div className="mt-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <input
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    placeholder="Buscar por nome ou e-mail"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-sea-500"
                  />
                </div>
                <div className="mt-2 max-h-52 space-y-1 overflow-y-auto">
                  {pessoas.map((p) => {
                    const marcado = userIds.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        onClick={() => setUserIds((u) => toggle(u, p.id))}
                        className={`flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-left transition-colors ${
                          marcado
                            ? "border-sea-700 bg-sea-700/5"
                            : "border-slate-100 hover:bg-slate-50"
                        }`}
                      >
                        <span
                          className={`grid h-4 w-4 shrink-0 place-items-center rounded ${
                            marcado ? "bg-sea-700 text-white" : "bg-slate-100"
                          }`}
                        >
                          {marcado && <Check className="h-2.5 w-2.5" />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-xs font-semibold text-slate-900">
                            {p.nome}
                          </span>
                          <span className="block truncate text-[10px] text-slate-500">
                            {p.email}
                          </span>
                        </span>
                        <span className="shrink-0 text-[9px] font-bold uppercase text-slate-400">
                          {p.papel}
                        </span>
                      </button>
                    );
                  })}
                  {pessoas.length === 0 && (
                    <p className="py-6 text-center text-xs text-slate-400">Ninguém encontrado.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ------------------------------------------------- prévia ---- */}
        <div className="space-y-5 lg:col-span-2">
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="font-display text-base font-bold text-slate-900">Como vai chegar</h3>

            <div className="mt-4 rounded-2xl bg-slate-900 p-3">
              <div className="rounded-xl bg-white p-3 shadow-lg">
                <div className="flex items-start gap-2">
                  <img
                    src="/icons/icon-192.png"
                    alt=""
                    className="h-6 w-6 shrink-0 rounded"
                    width={24}
                    height={24}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold text-slate-500">IndiqueLeads · agora</p>
                    <p className="mt-0.5 break-words text-[13px] font-bold leading-snug text-slate-900">
                      {title.trim() || "Título da mensagem"}
                    </p>
                    <p className="mt-0.5 break-words text-[12px] leading-snug text-slate-600">
                      {body.trim() || "O corpo da mensagem aparece aqui."}
                    </p>
                  </div>
                </div>

                {imageUrl.trim() && (
                  <img
                    src={imageUrl.trim()}
                    alt=""
                    className="mt-2 h-24 w-full rounded-lg object-cover"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                )}

                {actionLabel.trim() && (
                  <p className="mt-2 border-t border-slate-100 pt-2 text-center text-[11px] font-bold uppercase text-sea-700">
                    {actionLabel.trim()}
                  </p>
                )}
              </div>
            </div>

            {/* ------------------------------------------ alcance ---- */}
            <div className="mt-5 rounded-2xl bg-slate-50 p-4">
              {reach.isLoading ? (
                <p className="text-xs text-slate-400">Calculando alcance…</p>
              ) : (
                <div className="flex items-center justify-around text-center font-mono">
                  <div>
                    <span className="block text-2xl font-bold text-slate-900">
                      {reach.data?.pessoas ?? 0}
                    </span>
                    <span className="text-[10px] font-bold uppercase text-slate-500">pessoas</span>
                  </div>
                  <div>
                    <span className="block text-2xl font-bold text-brand-600">
                      {reach.data?.aparelhos ?? 0}
                    </span>
                    <span className="text-[10px] font-bold uppercase text-slate-500">
                      aparelhos
                    </span>
                  </div>
                </div>
              )}
              <p className="mt-2 text-center text-[11px] leading-relaxed text-slate-500">
                Todas recebem o aviso dentro do app. Só quem tem aparelho registrado recebe no
                celular.
              </p>
            </div>

            {/* -------------------------------------------- envio ---- */}
            <div className="mt-5 space-y-2">
              <button
                onClick={() => void disparar(true)}
                disabled={!preenchido || enviar.isPending}
                className="w-full cursor-pointer rounded-xl border border-sea-700 py-2.5 text-xs font-bold text-sea-700 transition-colors hover:bg-sea-700/5 disabled:opacity-40"
              >
                Enviar teste só para mim
              </button>

              {!confirmando ? (
                <button
                  onClick={() => setConfirmando(true)}
                  disabled={!preenchido || !publicoValido || enviar.isPending}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-sea-700 py-3 text-sm font-bold text-white transition-colors hover:bg-sea-600 disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                  Enviar para {reach.data?.pessoas ?? 0}
                </button>
              ) : (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                  <p className="flex items-start gap-1.5 text-xs font-semibold text-amber-900">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    Vai para {reach.data?.pessoas ?? 0} pessoas e não tem como voltar atrás.
                  </p>
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => void disparar(false)}
                      disabled={enviar.isPending}
                      className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-amber-600 py-2 text-xs font-bold text-white hover:bg-amber-700 disabled:opacity-60"
                    >
                      {enviar.isPending && <Loader2 className="h-3 w-3 animate-spin" />}
                      Confirmar envio
                    </button>
                    <button
                      onClick={() => setConfirmando(false)}
                      className="cursor-pointer rounded-lg px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------- histórico ---- */}
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <h3 className="font-display text-base font-bold text-slate-900">Mensagens enviadas</h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Toda campanha fica registrada com autor, público e resultado.
        </p>

        {(campanhas.data ?? []).length === 0 ? (
          <p className="py-10 text-center text-xs text-slate-400">
            Nenhuma mensagem enviada ainda.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-bold uppercase text-slate-400">
                  <th className="px-3 py-2.5">Mensagem</th>
                  <th className="px-3 py-2.5">Público</th>
                  <th className="px-3 py-2.5 text-right">Pessoas</th>
                  <th className="px-3 py-2.5 text-right">Aparelhos</th>
                  <th className="px-3 py-2.5">Quando</th>
                </tr>
              </thead>
              <tbody>
                {(campanhas.data ?? []).map((c) => (
                  <tr key={c.id} className="border-b border-slate-50">
                    <td className="max-w-[220px] px-3 py-3">
                      <span className="block truncate font-bold text-slate-900">{c.title}</span>
                      <span className="block truncate text-[11px] text-slate-500">{c.body}</span>
                    </td>
                    <td className="px-3 py-3 capitalize text-slate-600">{c.audience}</td>
                    <td className="px-3 py-3 text-right font-mono text-slate-700">
                      {c.recipients}
                    </td>
                    <td className="px-3 py-3 text-right font-mono">
                      {c.devicesSent === null ? (
                        <span className="text-slate-400">enviando…</span>
                      ) : (
                        <span className="text-brand-600">
                          {c.devicesSent}
                          {c.devicesFailed ? (
                            <span className="text-red-500"> / {c.devicesFailed} falhou</span>
                          ) : null}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 font-mono text-[11px] text-slate-500">
                      {new Date(c.createdAt).toLocaleString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

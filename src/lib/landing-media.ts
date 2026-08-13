/**
 * Imagens de apoio da landing page.
 *
 * Hospedadas na CDN do Unsplash (licença livre para uso comercial, sem
 * atribuição obrigatória) e servidas já redimensionadas via query params —
 * assim não carregamos um JPEG de 4000px para preencher um card de 400px.
 *
 * Cada id abaixo foi conferido visualmente antes de entrar aqui: o que a foto
 * mostra corresponde ao contexto em que ela é usada.
 */

const UNSPLASH = "https://images.unsplash.com";

/** Monta a URL com largura/qualidade/crop — `auto=format` entrega AVIF/WebP quando o browser suporta. */
export function photo(id: string, width = 1200, quality = 70): string {
  return `${UNSPLASH}/${id}?auto=format&fit=crop&w=${width}&q=${quality}`;
}

export const MEDIA = {
  /** Casa moderna com piscina — vertical imóveis. */
  imovel: "photo-1600596542815-ffad4c1539a9",
  /** Villa contemporânea — usada no bloco do anunciante. */
  villa: "photo-1613977257363-707ba9348227",
  /** Esportivo escuro em movimento — vertical carros. */
  carro: "photo-1503376780353-7e6692767b70",
  /** Iate de luxo atracado — vertical náutica. */
  barco: "photo-1567899378494-47b22a2ae96a",
  /** Motociclista na estrada — vertical motos. */
  moto: "photo-1558981806-ec527fa84c39",
  /** Mãos no volante ao entardecer — visita/test drive. */
  volante: "photo-1449965408869-eaa3f722e40d",
  /** Aperto de mãos — parceria/fechamento com o anunciante. */
  parceria: "photo-1521791136064-7986c2920216",
  /** Celular na mão — o indicador compartilhando o link. */
  celular: "photo-1512941937669-90a1b58e7e9c",
  /** Usina fotovoltaica — vertical energia solar. */
  solar: "photo-1509391366360-2e959784a276",
  /** Caminhão em rodovia — vertical pesados. */
  pesados: "photo-1601584115197-04ecc0da31d7",
  /** Interior corporativo — vertical locação comercial. */
  comercial: "photo-1497366216548-37526070297c",
} as const;

/**
 * Foto de destaque por vertical — as chaves são os ids reais de
 * `lib/verticals.ts`. Verticais sem foto caem no emoji do card, que já é o
 * comportamento padrão.
 */
export const VERTICAL_PHOTO: Record<string, string> = {
  imovel: MEDIA.imovel,
  carro: MEDIA.carro,
  moto: MEDIA.moto,
  barco: MEDIA.barco,
  veiculos_pesados: MEDIA.pesados,
  imoveis_comerciais_locacao: MEDIA.comercial,
  energia_solar: MEDIA.solar,
};

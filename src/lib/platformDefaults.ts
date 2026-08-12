import type { Category } from "@/types";

/**
 * Valor mínimo de comissão aceitável por vertical — regra de negócio estática,
 * não persistida no banco (a tabela `platform_config` só guarda `fee_percent`
 * e `fee_per_lead`). Ajustar aqui exige deploy, não uma edição de admin.
 */
export const MIN_COMMISSION_VALUE: Record<Category, number> = {
  imovel: 5000,
  carro: 1000,
  moto: 400,
  barco: 3000,
  jetski: 800,
  saude: 300,
  energia_solar: 500,
  educacao: 200,
  turismo: 400,
  seguros: 100,
  franquias: 2000,
  veiculos_pesados: 2500,
  imoveis_comerciais_locacao: 3000,
};

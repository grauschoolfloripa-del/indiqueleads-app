/**
 * Sanitização de mensagens de chat — cópia server-side (Deno) da lógica em
 * `src/lib/chatSecurity.ts`. Precisam ficar em sync: qualquer mudança nas
 * regras de detecção deve ser replicada nos dois arquivos.
 *
 * Esta é a cópia que decide de verdade (roda dentro da Edge Function, antes
 * da gravação no banco). A versão do cliente é só feedback instantâneo de UX
 * — o cliente pode ser adulterado, então nunca é a fonte de verdade.
 */

const LEAKAGE_KEYWORDS = [
  "whatsapp",
  "whats",
  "wpp",
  "zap",
  "zapp",
  "celular",
  "telefone",
  "telefones",
  "contato",
  "contatos",
  "meu numero",
  "meu número",
  "me liga",
  "ligar",
  "me chama",
  "chama no",
  "chama lá",
  "me adiciona",
  "me add",
  "insta",
  "instagram",
  "facebook",
  "fb",
  "email",
  "e-mail",
  "passa o numero",
  "passa o número",
  "seu número",
  "seu numero",
  "meu fone",
  "seu fone",
  "fone",
  "tel",
  "wats",
];

const PHONE_REGEX =
  /(\+?55\s?)?(\(?0?\d{2}\)?[-.\s]?)?(9[-.\s]?\d{4}[-.\s]?\d{4}|\d{4}[-.\s]?\d{4})/g;

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;

const LINK_REGEX =
  /(https?:\/\/)?(www\.)?(wa\.me|api\.whatsapp\.com|t\.me|instagram\.com|facebook\.com|bit\.ly)[^\s]*/gi;

export type BlockedInfoType = "phone" | "email" | "link" | "keyword";

export interface CleanMessageResult {
  cleanText: string;
  hasLeakage: boolean;
  blockedInfoType: BlockedInfoType[];
}

export function sanitizeChatMessage(text: string): CleanMessageResult {
  let cleanText = text;
  let hasLeakage = false;
  const blockedInfoType: BlockedInfoType[] = [];

  if (LINK_REGEX.test(cleanText)) {
    hasLeakage = true;
    blockedInfoType.push("link");
    cleanText = cleanText.replace(LINK_REGEX, "[link externo ocultado por segurança]");
  }

  if (EMAIL_REGEX.test(cleanText)) {
    hasLeakage = true;
    blockedInfoType.push("email");
    cleanText = cleanText.replace(EMAIL_REGEX, "[e-mail ocultado por política da plataforma]");
  }

  const phoneMatches = cleanText.match(PHONE_REGEX);
  if (phoneMatches) {
    let replacedPhone = false;
    for (const match of phoneMatches) {
      const digits = match.replace(/\D/g, "");
      if (digits.length >= 8 && digits.length <= 13) {
        if (digits.length === 8 && digits.endsWith("0000")) continue;
        if (digits.length === 9 && digits.endsWith("00000")) continue;
        cleanText = cleanText.replace(match, "[telefone ocultado por política da plataforma]");
        replacedPhone = true;
      }
    }
    if (replacedPhone) {
      hasLeakage = true;
      blockedInfoType.push("phone");
    }
  }

  const lowerText = cleanText.toLowerCase();
  let foundKeyword = false;
  for (const keyword of LEAKAGE_KEYWORDS) {
    const escapedKeyword = keyword.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
    const keywordRegex = new RegExp(`\\b${escapedKeyword}\\b`, "gi");
    if (keywordRegex.test(lowerText)) {
      foundKeyword = true;
      cleanText = cleanText.replace(keywordRegex, () => `[termo proibido: *]`);
    }
  }
  if (foundKeyword) {
    hasLeakage = true;
    blockedInfoType.push("keyword");
  }

  return { cleanText, hasLeakage, blockedInfoType };
}

export function getSecurityWarningMessage(types: BlockedInfoType[]): string {
  const list: string[] = [];
  if (types.includes("phone")) list.push("números de telefone");
  if (types.includes("email")) list.push("endereços de e-mail");
  if (types.includes("link")) list.push("links externos (WhatsApp/redes sociais)");
  if (types.includes("keyword")) list.push("termos de redirecionamento de contato");

  return `⚠️ AVISO DE SEGURANÇA: Identificamos uma tentativa de compartilhar ${list.join(", ")}. Conforme as políticas de uso da plataforma, a troca de contatos externos é bloqueada para garantir a rastreabilidade da indicação e a comissão do parceiro. Por favor, continue a conversa por aqui.`;
}

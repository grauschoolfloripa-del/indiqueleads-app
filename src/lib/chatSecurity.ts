/**
 * Chat Security Helpers
 * Protects affiliate commissions by preventing contact leakage (phone numbers, emails, whatsapp, social media)
 */

const LEAKAGE_KEYWORDS = [
  'whatsapp', 'whats', 'wpp', 'zap', 'zapp', 'celular', 'telefone', 'telefones', 
  'contato', 'contatos', 'meu numero', 'meu número', 'me liga', 'ligar', 'me chama', 
  'chama no', 'chama lá', 'me adiciona', 'me add', 'insta', 'instagram', 'facebook', 
  'fb', 'email', 'e-mail', 'passa o numero', 'passa o número', 'seu número', 'seu numero',
  'meu fone', 'seu fone', 'fone', 'tel', 'wats'
];

// Brazilian Phone Regex (e.g., (11) 99122-3344, 11991223344, 99122-3344, etc.)
// Designed to avoid matching prices (e.g. 12500000, 940000, 3180) by checking for typical length of 8-11 digits
const PHONE_REGEX = /(\+?55\s?)?(\(?0?\d{2}\)?[-.\s]?)?(9[-.\s]?\d{4}[-.\s]?\d{4}|\d{4}[-.\s]?\d{4})/g;

// Email Regex (RFC 5322 compliant simplified)
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;

// URL Regex to block external chat/whatsapp links (e.g. wa.me, api.whatsapp.com, t.me)
const LINK_REGEX = /(https?:\/\/)?(www\.)?(wa\.me|api\.whatsapp\.com|t\.me|instagram\.com|facebook\.com|bit\.ly)[^\s]*/gi;

export interface CleanMessageResult {
  cleanText: string;
  hasLeakage: boolean;
  blockedInfoType: ('phone' | 'email' | 'link' | 'keyword')[];
}

/**
 * Scans message content for contact information and masks it if found.
 */
export function sanitizeChatMessage(text: string): CleanMessageResult {
  let cleanText = text;
  let hasLeakage = false;
  const blockedInfoType: ('phone' | 'email' | 'link' | 'keyword')[] = [];

  // 1. Scan and replace WhatsApp / Social Links
  if (LINK_REGEX.test(cleanText)) {
    hasLeakage = true;
    blockedInfoType.push('link');
    cleanText = cleanText.replace(LINK_REGEX, '[link externo ocultado por segurança]');
  }

  // 2. Scan and replace Emails
  if (EMAIL_REGEX.test(cleanText)) {
    hasLeakage = true;
    blockedInfoType.push('email');
    cleanText = cleanText.replace(EMAIL_REGEX, '[e-mail ocultado por política da plataforma]');
  }

  // 3. Scan and replace Brazilian Phone numbers (taking care not to match prices)
  // We do a check on individual matches to ensure they look like phone numbers (not prices/years)
  const phoneMatches = cleanText.match(PHONE_REGEX);
  if (phoneMatches) {
    let replacedPhone = false;
    for (const match of phoneMatches) {
      // Clean non-digits
      const digits = match.replace(/\D/g, '');
      // Brazilian phones usually have 8 to 11 digits (e.g. 991223344 is 9, 11991223344 is 11)
      // Prices like 12.500.000 (8 digits) could match, but we look for context or avoid digits starting with double zeros
      // Let's filter out numbers that don't make sense as phones (e.g. length of 8 and ends with 0000, which usually represents a price)
      if (digits.length >= 8 && digits.length <= 13) {
        if (digits.length === 8 && digits.endsWith('0000')) {
          continue; // Likely a price or standard round number
        }
        if (digits.length === 9 && digits.endsWith('00000')) {
          continue; // Likely a price
        }
        cleanText = cleanText.replace(match, '[telefone ocultado por política da plataforma]');
        replacedPhone = true;
      }
    }
    if (replacedPhone) {
      hasLeakage = true;
      blockedInfoType.push('phone');
    }
  }

  // 4. Scan for critical bypass keywords in combinations
  const lowerText = cleanText.toLowerCase();
  let foundKeyword = false;
  
  for (const keyword of LEAKAGE_KEYWORDS) {
    // Look for keyword in text, ensuring word boundary or specific bypass phrases
    const escapedKeyword = keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const keywordRegex = new RegExp(`\\b${escapedKeyword}\\b`, 'gi');
    if (keywordRegex.test(lowerText)) {
      foundKeyword = true;
      // Mask the keyword lightly to show it was caught
      cleanText = cleanText.replace(keywordRegex, (match) => `[termo proibido: *]`);
    }
  }

  if (foundKeyword) {
    hasLeakage = true;
    blockedInfoType.push('keyword');
  }

  return {
    cleanText,
    hasLeakage,
    blockedInfoType
  };
}

/**
 * Returns a secure notification template or warning for the user when a violation is caught
 */
export function getSecurityWarningMessage(types: ('phone' | 'email' | 'link' | 'keyword')[]): string {
  const list = [];
  if (types.includes('phone')) list.push('números de telefone');
  if (types.includes('email')) list.push('endereços de e-mail');
  if (types.includes('link')) list.push('links externos (WhatsApp/redes sociais)');
  if (types.includes('keyword')) list.push('termos de redirecionamento de contato');

  return `⚠️ AVISO DE SEGURANÇA: Identificamos uma tentativa de compartilhar ${list.join(', ')}. Conforme as políticas de uso da plataforma, a troca de contatos externos é bloqueada para garantir a rastreabilidade da indicação e a comissão do parceiro. Por favor, continue a conversa por aqui.`;
}

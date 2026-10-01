const CURRENCY_SYMBOLS: Record<string, { symbol: string; locale: string }> = {
  XOF: { symbol: 'CFA', locale: 'fr-SN' }, // Franc CFA (Afrique de l'Ouest)
  XAF: { symbol: 'CFA', locale: 'fr-CM' }, // Franc CFA (Afrique centrale)
  CDF: { symbol: 'FC', locale: 'fr-CD' }, // Franc congolais
  USD: { symbol: '$', locale: 'en-US' },
  EUR: { symbol: '€', locale: 'fr-FR' },
  GBP: { symbol: '£', locale: 'en-GB' },
  CAD: { symbol: '$', locale: 'en-CA' },
  AUD: { symbol: '$', locale: 'en-AU' },
  CHF: { symbol: 'CHF', locale: 'fr-CH' },
  MAD: { symbol: 'د.م.', locale: 'ar-MA' }, // Dirham marocain
  DZD: { symbol: 'د.ج', locale: 'ar-DZ' }, // Dinar algérien
  TND: { symbol: 'د.ت', locale: 'ar-TN' }, // Dinar tunisien
  NGN: { symbol: '₦', locale: 'en-NG' }, // Naira nigérian
  GHS: { symbol: '₵', locale: 'en-GH' }, // Cedi ghanéen
  KES: { symbol: 'KSh', locale: 'en-KE' }, // Shilling kenyan
  ZAR: { symbol: 'R', locale: 'en-ZA' }, // Rand sud-africain
};

/**
 * Format cents to currency string with real symbol and locale
 * @param cents Amount in cents (100 = 1 unit)
 * @param currency ISO currency code (e.g., 'XOF', 'USD')
 * @returns Formatted currency string (e.g., '550 CFA', '$5.50')
 */
export function formatCurrency(cents: number, currency: string): string {
  const config = CURRENCY_SYMBOLS[currency] || { symbol: currency, locale: 'fr-FR' };
  const amount = cents / 100;

  try {
    const formatted = new Intl.NumberFormat(config.locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);

    return `${formatted} ${config.symbol}`;
  } catch {
    return `${amount.toFixed(2)} ${config.symbol}`;
  }
}

/**
 * Parse currency string back to cents
 * @param value Formatted currency string
 * @param currency ISO currency code
 * @returns Amount in cents
 */
export function parseCurrency(value: string, currency: string): number {
  const numStr = value.replace(/[^0-9.,]/g, '').replace(/,/g, '.');
  const amount = parseFloat(numStr) || 0;
  return Math.round(amount * 100);
}

// Currency formatting utilities

// Format a number to a currency string based on the currency code
export function formatCurrency(amount: number, currencyCode: string = 'USD'): string {
  const formatter = new Intl.NumberFormat(getCurrencyLocale(currencyCode), {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  return formatter.format(amount);
}

// Get the locale for a currency code to use in formatting
function getCurrencyLocale(currencyCode: string): string {
  const currencyLocaleMap: Record<string, string> = {
    'USD': 'en-US',
    'EUR': 'de-DE',
    'GBP': 'en-GB',
    'INR': 'en-IN',
    'JPY': 'ja-JP',
    'CAD': 'en-CA',
    'AUD': 'en-AU',
  };
  
  return currencyLocaleMap[currencyCode] || 'en-US';
}

// Get currency symbol for a currency code
export function getCurrencySymbol(currencyCode: string = 'USD'): string {
  const currencySymbolMap: Record<string, string> = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'INR': '₹',
    'JPY': '¥',
    'CAD': 'C$',
    'AUD': 'A$',
  };
  
  return currencySymbolMap[currencyCode] || '$';
}
// Currency formatting utilities

// Format a number to a currency string based on the currency code
export function formatCurrency(amount: number, currencyCode: string = 'INR'): string {
  // Default to INR if no currency code provided
  const codeToUse = currencyCode || 'INR';
  
  // Special case for INR to ensure proper formatting (₹ symbol shows correctly)
  if (codeToUse === 'INR') {
    // Manually format INR with ₹ symbol and Indian number formatting
    const formatter = new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0, // Allow no decimal places for whole numbers
    });
    return '₹' + formatter.format(amount);
  }
  
  const formatter = new Intl.NumberFormat(getCurrencyLocale(codeToUse), {
    style: 'currency',
    currency: codeToUse,
    minimumFractionDigits: 0, // Allow no decimal places for whole numbers
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
export function getCurrencySymbol(currencyCode: string = 'INR'): string {
  // Default to INR if no currency code provided
  const codeToUse = currencyCode || 'INR';
  
  const currencySymbolMap: Record<string, string> = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'INR': '₹',
    'JPY': '¥',
    'CAD': 'C$',
    'AUD': 'A$',
  };
  
  return currencySymbolMap[codeToUse] || '₹';
}

// Parse a currency string to a number
export function parseCurrencyString(value: string, currencyCode: string = 'INR'): number {
  if (!value) return 0;
  
  // Handle potential numbers that are already in numeric form
  if (typeof value === 'number') return value;
  
  // Remove all non-numeric characters except for the decimal point
  // This handles currency symbols, commas, spaces, etc.
  const cleanedValue = value.replace(/[^\d.-]/g, '');
  
  // Parse the cleaned string to a number
  const parsedValue = parseFloat(cleanedValue);
  
  // Return 0 if parsing failed
  return isNaN(parsedValue) ? 0 : parsedValue;
}
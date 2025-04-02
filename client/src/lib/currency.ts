// Currency formatting utilities

// Format a number to a currency string (always as INR)
export function formatCurrency(amount: number, currencyCode: string = 'INR'): string {
  // Always use INR formatting regardless of provided currency code
  // Manually format INR with ₹ symbol and Indian number formatting
  // For Indian Rupee, show whole numbers without decimals
  const formatter = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0, // No decimal places for INR
    minimumFractionDigits: 0,
  });
  return '₹' + formatter.format(amount);
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

// Get currency symbol (always returns ₹ for INR)
export function getCurrencySymbol(currencyCode: string = 'INR'): string {
  // Always return the Indian Rupee symbol regardless of the currency code provided
  return '₹';
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
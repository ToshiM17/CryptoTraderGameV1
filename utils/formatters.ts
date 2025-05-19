// Format currency values
export const formatCurrency = (amount: number, currency = 'USD') => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  return formatter.format(amount);
};

// Format percentage values
export const formatPercentage = (value: number) => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  return formatter.format(value / 100);
};

// Format crypto amounts (with correct decimal places)
export const formatCrypto = (amount: number) => {
  // For low value cryptos (like DOGE), we need more decimal places
  if (amount < 0.01) {
    return amount.toFixed(8);
  }
  // For mid-value cryptos (like XRP)
  else if (amount < 1) {
    return amount.toFixed(6);
  }
  // For regular cryptos (like ETH)
  else if (amount < 1000) {
    return amount.toFixed(4);
  }
  // For high value cryptos (like BTC)
  else {
    return amount.toFixed(2);
  }
};

// Format date for transaction history
export const formatDate = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
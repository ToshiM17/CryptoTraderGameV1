import axios from 'axios';

// Sample crypto symbols to track
const CRYPTO_SYMBOLS = [
  'BTCUSDT',
  'ETHUSDT',
  'BNBUSDT',
  'XRPUSDT',
  'ADAUSDT',
  'DOGEUSDT',
  'SOLUSDT',
  'DOTUSDT',
  'MATICUSDT',
  'LINKUSDT',
];

// Map for conversion rates (simplified for demo)
const CURRENCY_RATES = {
  USD: 1,
  EUR: 0.91,
  PLN: 3.94,
};

// Crypto metadata
const CRYPTO_METADATA = {
  'BTCUSDT': { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC' },
  'ETHUSDT': { id: 'ethereum', name: 'Ethereum', symbol: 'ETH' },
  'BNBUSDT': { id: 'binancecoin', name: 'Binance Coin', symbol: 'BNB' },
  'XRPUSDT': { id: 'ripple', name: 'XRP', symbol: 'XRP' },
  'ADAUSDT': { id: 'cardano', name: 'Cardano', symbol: 'ADA' },
  'DOGEUSDT': { id: 'dogecoin', name: 'Dogecoin', symbol: 'DOGE' },
  'SOLUSDT': { id: 'solana', name: 'Solana', symbol: 'SOL' },
  'DOTUSDT': { id: 'polkadot', name: 'Polkadot', symbol: 'DOT' },
  'MATICUSDT': { id: 'polygon', name: 'Polygon', symbol: 'MATIC' },
  'LINKUSDT': { id: 'chainlink', name: 'Chainlink', symbol: 'LINK' },
};

// Function to get crypto prices from Binance API
export const getCryptoData = async (currency = 'USD') => {
  try {
    // For real implementation, use Binance API:
    // const response = await axios.get('https://api.binance.com/api/v3/ticker/24hr');
    
    // For demonstration purposes (to avoid API rate limits), we'll simulate the data:
    const simulatedData = simulateCryptoData();
    
    // Convert prices to selected currency
    const rate = CURRENCY_RATES[currency as keyof typeof CURRENCY_RATES] || 1;
    
    return simulatedData.map(crypto => ({
      ...crypto,
      price: crypto.price * rate,
    }));
  } catch (error) {
    console.error('Error fetching crypto data:', error);
    return [];
  }
};

// Function to get historical data for a specific crypto
export const getHistoricalData = async (cryptoId: string, timeframe = '1d', currency = 'USD') => {
  try {
    // For real implementation, use Binance API:
    // const response = await axios.get(`https://api.binance.com/api/v3/klines`, {
    //   params: {
    //     symbol: `${cryptoId.toUpperCase()}USDT`,
    //     interval: timeframe === '1d' ? '1h' : timeframe === '1w' ? '4h' : timeframe === '1m' ? '1d' : '1w',
    //     limit: 500,
    //   }
    // });
    
    // For demonstration purposes, we'll simulate the data:
    const simulatedData = simulateHistoricalData(cryptoId, timeframe);
    
    // Convert prices to selected currency
    const rate = CURRENCY_RATES[currency as keyof typeof CURRENCY_RATES] || 1;
    
    return simulatedData.map(dataPoint => ({
      ...dataPoint,
      price: dataPoint.price * rate,
    }));
  } catch (error) {
    console.error('Error fetching historical data:', error);
    return [];
  }
};

// Simulate crypto data for demonstration
function simulateCryptoData() {
  return CRYPTO_SYMBOLS.map(symbol => {
    const metadata = CRYPTO_METADATA[symbol as keyof typeof CRYPTO_METADATA];
    const basePrice = getBasePrice(symbol);
    const priceChange = (Math.random() * 10) - 5; // Random change between -5% and +5%
    const priceChangePercent = priceChange;
    
    return {
      id: metadata.id,
      symbol: metadata.symbol,
      name: metadata.name,
      price: basePrice * (1 + (priceChange / 100)),
      priceChangePercent,
    };
  });
}

// Get base price for each crypto
function getBasePrice(symbol: string) {
  switch (symbol) {
    case 'BTCUSDT': return 65000 + (Math.random() * 2000 - 1000);
    case 'ETHUSDT': return 3500 + (Math.random() * 200 - 100);
    case 'BNBUSDT': return 580 + (Math.random() * 40 - 20);
    case 'XRPUSDT': return 0.6 + (Math.random() * 0.1 - 0.05);
    case 'ADAUSDT': return 0.45 + (Math.random() * 0.05 - 0.025);
    case 'DOGEUSDT': return 0.12 + (Math.random() * 0.02 - 0.01);
    case 'SOLUSDT': return 150 + (Math.random() * 20 - 10);
    case 'DOTUSDT': return 6.5 + (Math.random() * 1 - 0.5);
    case 'MATICUSDT': return 0.7 + (Math.random() * 0.1 - 0.05);
    case 'LINKUSDT': return 15 + (Math.random() * 2 - 1);
    default: return 100;
  }
}

// Simulate historical data for demonstration
function simulateHistoricalData(cryptoId: string, timeframe: string) {
  const now = new Date();
  const data = [];
  const symbol = Object.entries(CRYPTO_METADATA).find(([_, meta]) => meta.id === cryptoId)?.[0];
  const basePrice = getBasePrice(symbol || 'BTCUSDT');
  
  let periods = 24; // 24 hours for 1d
  let intervalMs = 60 * 60 * 1000; // 1 hour in ms
  
  if (timeframe === '1w') {
    periods = 7 * 24; // 7 days
    intervalMs = 60 * 60 * 1000; // 1 hour in ms
  } else if (timeframe === '1m') {
    periods = 30; // 30 days
    intervalMs = 24 * 60 * 60 * 1000; // 1 day in ms
  } else if (timeframe === '1y') {
    periods = 52; // 52 weeks
    intervalMs = 7 * 24 * 60 * 60 * 1000; // 1 week in ms
  }
  
  // Generate random price movement that trends in one direction
  const trend = Math.random() > 0.5 ? 1 : -1; // Random trend direction
  const volatility = basePrice * 0.02; // 2% of base price
  let lastPrice = basePrice;
  
  for (let i = periods; i >= 0; i--) {
    const timestamp = now.getTime() - (i * intervalMs);
    // Each price has a tendency to follow the trend but with randomness
    const randomChange = (Math.random() - 0.5) * volatility;
    const trendChange = trend * (Math.random() * volatility * 0.5);
    lastPrice = lastPrice + randomChange + trendChange;
    
    // Ensure price doesn't go below certain threshold
    if (lastPrice < basePrice * 0.7) {
      lastPrice = basePrice * 0.7 + Math.random() * basePrice * 0.05;
    }
    
    if (lastPrice > basePrice * 1.3) {
      lastPrice = basePrice * 1.3 - Math.random() * basePrice * 0.05;
    }
    
    data.push({
      timestamp,
      price: lastPrice,
    });
  }
  
  return data;
}